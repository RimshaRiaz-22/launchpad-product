// src/services/auth.service.js — Authentication business logic
'use strict';

const crypto = require('crypto');
const db = require('../database/knex');
const usersRepo = require('../repositories/users.repository');
const { hashPassword, comparePassword } = require('../utils/hash.utils');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, hashToken } = require('../utils/jwt.utils');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger.config');
const config = require('../config/app.config');
const auditLogsService = require('./auditLogs.service');
const emailService = require('./email.service');

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const getRefreshTokenExpiry = () => {
  // 7 days from now
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
};

const storeRefreshToken = async (userId, rawToken, req) => {
  const tokenHash = hashToken(rawToken);
  await db('refresh_tokens').insert({
    user_id: userId,
    token_hash: tokenHash,
    user_agent: req.headers['user-agent']?.slice(0, 500) || null,
    ip_address: req.ip || null,
    expires_at: getRefreshTokenExpiry(),
  });
};

// ─────────────────────────────────────────────────────────────
// Service methods
// ─────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ name, email, password }} data
 * @param {import('express').Request} req
 * @returns {{ user, accessToken, refreshToken }}
 */
const register = async (data, req) => {
  const { name, email, password } = data;

  // 0. Check platform registration policy
  const settingsService = require('./settings.service');
  const sysSettings = await settingsService.getSettings();
  if (sysSettings.general && sysSettings.general.allowPublicSignups === false) {
    throw ApiError.forbidden('Public registrations are currently closed by the administrator', 'REGISTRATIONS_CLOSED');
  }

  // 1. Check uniqueness
  const exists = await usersRepo.emailExists(email);
  if (exists) {
    throw ApiError.conflict('An account with this email already exists', 'EMAIL_TAKEN');
  }

  // 2. Hash password & generate verification token
  const password_hash = await hashPassword(password);
  const verification_token = crypto.randomBytes(32).toString('hex');

  const defaultPlan = sysSettings.general?.defaultUserPlan || 'free';

  // 3. Create user in a transaction
  const user = await db.transaction(async (trx) => {
    // Resolve default user role from roles table (case-insensitive)
    const userRole = await trx('roles')
      .whereRaw('LOWER(name) = ?', ['user'])
      .first();

    const [newUser] = await trx('users')
      .insert({
        name,
        email: email.toLowerCase(),
        password_hash,
        role: userRole ? userRole.name.toLowerCase() : 'user',
        role_id: userRole ? userRole.id : null,
        plan: defaultPlan,
        subscription_plan_id: defaultPlan,
        is_verified: false,
        verification_token,
      })
      .returning(['id', 'email', 'name', 'avatar_url', 'role_id', 'role', 'plan', 'is_verified', 'created_at']);

    // Create subscription matching configured default plan
    await trx('subscriptions').insert({
      user_id: newUser.id,
      plan: defaultPlan,
      subscription_plan_id: defaultPlan,
      status: 'active',
    });

    // Audit log
    await trx('audit_logs').insert({
      user_id: newUser.id,
      action: 'user.register',
      resource_type: 'user',
      resource_id: newUser.id,
      ip_address: req.ip,
      user_agent: req.headers?.['user-agent']?.slice(0, 500) || null,
      severity: 'info',
      metadata: JSON.stringify({ email: newUser.email, name: newUser.name, plan: defaultPlan, role: newUser.role, role_id: newUser.role_id }),
    });

    return newUser;
  });

  // 4. Issue tokens
  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role, role_id: user.role_id });
  const refreshToken = generateRefreshToken({ id: user.id });

  await storeRefreshToken(user.id, refreshToken, req);

  // Send verification email (non-blocking)
  emailService
    .sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationToken: verification_token,
    })
    .catch((err) => {
      logger.error('Failed to dispatch registration verification email', { error: err.message });
    });

  // Dispatch in-app welcome notification to the new user's inbox
  try {
    const notificationsRepo = require('../repositories/notifications.repository');
    notificationsRepo
      .create({
        title: `Welcome to Launchpad, ${user.name || 'Creator'}! 👋`,
        body: 'Explore studio presets, high-res 3D device mockups, and start building captivating visuals today.',
        type: 'marketing',
        audience: 'user',
        channel: 'in_app',
        action_url: '/projects',
        metadata: { category: 'onboarding', userId: user.id },
      })
      .then((record) => {
        return notificationsRepo.linkNotificationToUsers({
          notificationId: record.id,
          userIds: [user.id],
        });
      })
      .catch((notifErr) => {
        logger.warn('Failed delivering welcome notification:', notifErr.message);
      });
  } catch (err) {
    logger.warn('Failed initializing welcome notification:', err.message);
  }

  logger.info('User registered', { userId: user.id, email: user.email });

  return { user, accessToken, refreshToken };
};

/**
 * Login with email + password.
 * @param {{ email, password }} data
 * @param {import('express').Request} req
 * @returns {{ user, accessToken, refreshToken }}
 */
const login = async (data, req) => {
  const { email, password } = data;

  // 1. Find user (includes password_hash)
  const fullUser = await usersRepo.findByEmail(email);

  if (!fullUser) {
    auditLogsService.logEvent({
      action: 'security.login_failed',
      resource_type: 'auth',
      severity: 'warning',
      ip_address: req?.ip,
      user_agent: req?.headers?.['user-agent']?.slice(0, 500),
      metadata: { attemptedEmail: email, reason: 'user_not_found' },
    }).catch(() => {});
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (!fullUser.is_active) {
    auditLogsService.logEvent({
      user_id: fullUser.id,
      action: 'security.login_blocked',
      resource_type: 'user',
      resource_id: fullUser.id,
      severity: 'warning',
      ip_address: req?.ip,
      user_agent: req?.headers?.['user-agent']?.slice(0, 500),
      metadata: { email, reason: 'account_deactivated' },
    }).catch(() => {});
    throw ApiError.forbidden('Your account has been deactivated', 'ACCOUNT_DEACTIVATED');
  }

  // 1b. Check platform maintenance mode
  const settingsService = require('./settings.service');
  const sysSettings = await settingsService.getSettings();
  if (sysSettings.general && sysSettings.general.maintenanceMode === true && String(fullUser.role || '').toLowerCase() !== 'admin') {
    throw ApiError.forbidden('The platform is currently in maintenance mode. Only administrators may log in.', 'MAINTENANCE_MODE');
  }

  // 2. Compare password
  const isMatch = await comparePassword(password, fullUser.password_hash);
  if (!isMatch) {
    auditLogsService.logEvent({
      user_id: fullUser.id,
      action: 'security.login_failed',
      resource_type: 'user',
      resource_id: fullUser.id,
      severity: 'warning',
      ip_address: req?.ip,
      user_agent: req?.headers?.['user-agent']?.slice(0, 500),
      metadata: { email, reason: 'wrong_password' },
    }).catch(() => {});

    if (sysSettings.alerts && sysSettings.alerts.notifyOnSuspiciousLogin) {
      try {
        const notificationsRepo = require('../repositories/notifications.repository');
        notificationsRepo
          .createBroadcast({
            title: '🔒 Suspicious Login Attempt Detected',
            body: `Failed login attempt for account ${email} from IP address ${req.ip || 'unknown'}.`,
            type: 'urgent',
            audience: 'admins',
            channel: 'in_app',
            metadata: { email, ip: req.ip, timestamp: new Date().toISOString() },
          })
          .catch((err) => logger.warn('Failed dispatching suspicious login alert:', err.message));
      } catch (alertErr) {
        logger.warn('Failed dispatching suspicious login notification:', alertErr.message);
      }
    }
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // 3. Update last_login_at
  await usersRepo.update(fullUser.id, { last_login_at: new Date() });

  // 4. Issue tokens
  const user = await usersRepo.findById(fullUser.id);
  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role, role_id: user.role_id });
  const refreshToken = generateRefreshToken({ id: user.id });

  await storeRefreshToken(user.id, refreshToken, req);

  // Audit log with rich metadata
  auditLogsService.logEvent({
    user_id: user.id,
    action: 'user.login',
    resource_type: 'user',
    resource_id: user.id,
    ip_address: req.ip,
    user_agent: req.headers?.['user-agent']?.slice(0, 500),
    severity: 'info',
    metadata: { email: user.email, role: user.role, plan: user.plan },
  }).catch(() => {});

  logger.info('User logged in', { userId: user.id });

  return { user, accessToken, refreshToken };
};

/**
 * Rotate refresh token — verify old, issue new pair.
 * @param {string} rawRefreshToken
 * @param {import('express').Request} req
 * @returns {{ accessToken, refreshToken }}
 */
const refreshTokens = async (rawRefreshToken, req) => {
  // 1. Verify JWT signature & expiry
  const decoded = verifyRefreshToken(rawRefreshToken);

  // 2. Look up in DB
  const tokenHash = hashToken(rawRefreshToken);
  const storedToken = await db('refresh_tokens')
    .where({ token_hash: tokenHash, is_revoked: false })
    .where('expires_at', '>', new Date())
    .first();

  if (!storedToken) {
    throw ApiError.unauthorized('Refresh token is invalid or expired', 'REFRESH_TOKEN_INVALID');
  }

  // 3. Revoke old token (rotation)
  await db('refresh_tokens').where({ id: storedToken.id }).update({ is_revoked: true });

  // 4. Get user
  const user = await usersRepo.findById(decoded.sub);
  if (!user || !user.is_active) {
    throw ApiError.unauthorized('User not found or inactive', 'USER_INACTIVE');
  }

  // 5. Issue new pair
  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role, role_id: user.role_id });
  const newRefreshToken = generateRefreshToken({ id: user.id });

  await storeRefreshToken(user.id, newRefreshToken, req);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      role: user.role,
      role_id: user.role_id,
      role_name: user.role_name,
      plan: user.plan,
      is_verified: user.is_verified,
    },
  };
};

/**
 * Logout — revoke all refresh tokens for the user.
 * @param {string} userId
 * @param {string} [rawRefreshToken] - If provided, revoke only this token
 * @param {string} [preserveRefreshToken] - If provided, revoke all OTHER tokens, preserving this active session
 */
const logout = async (userId, rawRefreshToken = null, preserveRefreshToken = null) => {
  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await db('refresh_tokens')
      .where({ user_id: userId, token_hash: tokenHash })
      .update({ is_revoked: true });
  } else if (preserveRefreshToken) {
    const preserveHash = hashToken(preserveRefreshToken);
    await db('refresh_tokens')
      .where({ user_id: userId })
      .whereNot({ token_hash: preserveHash })
      .update({ is_revoked: true });
  } else {
    // Revoke all sessions (logout everywhere)
    await db('refresh_tokens').where({ user_id: userId }).update({ is_revoked: true });
  }

  logger.info('User logged out', { userId });

  auditLogsService.logEvent({
    user_id: userId,
    action: 'user.logout',
    resource_type: 'user',
    resource_id: userId,
    severity: 'info',
  }).catch(() => {});
};

/**
 * Change password — requires current password.
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const fullUser = await db('users').where({ id: userId }).first();

  const isMatch = await comparePassword(currentPassword, fullUser.password_hash);
  if (!isMatch) {
    throw ApiError.unauthorized('Current password is incorrect', 'WRONG_PASSWORD');
  }

  const password_hash = await hashPassword(newPassword);
  await usersRepo.update(userId, { password_hash });

  // Revoke all refresh tokens (force re-login on other devices)
  await db('refresh_tokens').where({ user_id: userId }).update({ is_revoked: true });

  logger.info('Password changed', { userId });

  auditLogsService.logEvent({
    user_id: userId,
    action: 'user.password_change',
    resource_type: 'user',
    resource_id: userId,
    severity: 'warning',
  }).catch(() => {});
};

/**
 * Get current user's profile.
 */
const getMe = async (userId) => {
  const user = await usersRepo.findById(userId);
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  return user;
};

/**
 * Initiate password reset workflow.
 * Generates secure time-limited token and sends reset email.
 * Always returns standard success message to prevent user enumeration.
 *
 * @param {string} email
 * @param {import('express').Request} req
 */
const forgotPassword = async (email, req) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await usersRepo.findByEmail(normalizedEmail);

  if (!user) {
    logger.info('Password reset requested for non-existent email', { email: normalizedEmail });
    return {
      message: 'If that email address exists in our database, we will send a password reset link.',
    };
  }

  // Generate secure 32-byte hex token and set 1-hour expiration
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await usersRepo.setPasswordResetToken(user.id, resetToken, expiresAt);

  // Send password reset email (non-blocking)
  emailService
    .sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetToken,
    })
    .catch((err) => {
      logger.error('Failed to send password reset email', { userId: user.id, error: err.message });
    });

  auditLogsService
    .logEvent({
      user_id: user.id,
      action: 'auth.forgot_password',
      resource_type: 'user',
      resource_id: user.id,
      severity: 'info',
      ip_address: req?.ip,
      user_agent: req?.headers?.['user-agent']?.slice(0, 500),
    })
    .catch(() => {});

  logger.info('Password reset token generated and email dispatched', { userId: user.id });

  return {
    message: 'If that email address exists in our database, we will send a password reset link.',
  };
};

/**
 * Verify reset token and set a new password.
 * Revokes all existing refresh tokens upon successful reset.
 *
 * @param {string} token
 * @param {string} newPassword
 * @param {import('express').Request} req
 */
const resetPassword = async (token, newPassword, req) => {
  if (!token) {
    throw ApiError.badRequest('Password reset token is required', 'TOKEN_REQUIRED');
  }

  const user = await usersRepo.findByResetToken(token);
  if (!user) {
    throw ApiError.badRequest(
      'Password reset link is invalid or has expired',
      'RESET_TOKEN_INVALID'
    );
  }

  // Hash new password and update user
  const password_hash = await hashPassword(newPassword);
  await usersRepo.resetPasswordWithToken(user.id, password_hash);

  // Invalidate all active sessions for security
  await db('refresh_tokens').where({ user_id: user.id }).update({ is_revoked: true });

  auditLogsService
    .logEvent({
      user_id: user.id,
      action: 'auth.reset_password',
      resource_type: 'user',
      resource_id: user.id,
      severity: 'warning',
      ip_address: req?.ip,
      user_agent: req?.headers?.['user-agent']?.slice(0, 500),
    })
    .catch(() => {});

  logger.info('User password successfully reset via token', { userId: user.id });

  return {
    message: 'Your password has been reset successfully. You can now log in with your new password.',
  };
};

/**
 * Verify user's email address using token.
 * Automatically marks account verified and sends Welcome Email.
 *
 * @param {string} token
 * @param {import('express').Request} req
 */
const verifyEmail = async (token, req) => {
  if (!token) {
    throw ApiError.badRequest('Verification token is required', 'TOKEN_REQUIRED');
  }

  const user = await usersRepo.findByVerificationToken(token);
  if (!user) {
    throw ApiError.badRequest(
      'Email verification link is invalid or has expired',
      'VERIFICATION_TOKEN_INVALID'
    );
  }

  if (user.is_verified) {
    return {
      verified: true,
      message: 'Your email address is already verified.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_verified: true,
      },
    };
  }

  const verifiedUser = await usersRepo.markEmailVerified(user.id);

  // Send Welcome Email upon successful email verification
  emailService
    .sendWelcomeEmail({
      to: verifiedUser.email,
      name: verifiedUser.name,
    })
    .catch((err) => {
      logger.error('Failed to dispatch welcome email after verification', {
        userId: user.id,
        error: err.message,
      });
    });

  auditLogsService
    .logEvent({
      user_id: user.id,
      action: 'auth.verify_email',
      resource_type: 'user',
      resource_id: user.id,
      severity: 'info',
      ip_address: req?.ip,
      user_agent: req?.headers?.['user-agent']?.slice(0, 500),
    })
    .catch(() => {});

  logger.info('User email address verified', { userId: user.id });

  return {
    verified: true,
    message: 'Email address verified successfully.',
    user: verifiedUser,
  };
};

/**
 * Resend email verification link.
 *
 * @param {string} email
 * @param {import('express').Request} req
 */
const resendVerification = async (email, req) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await usersRepo.findByEmail(normalizedEmail);

  if (!user) {
    return {
      message: 'If that email address exists in our database, a verification email will be sent.',
    };
  }

  if (user.is_verified) {
    return {
      message: 'This email address has already been verified.',
    };
  }

  const verification_token = crypto.randomBytes(32).toString('hex');
  await usersRepo.setVerificationToken(user.id, verification_token);

  emailService
    .sendVerificationEmail({
      to: user.email,
      name: user.name,
      verificationToken: verification_token,
    })
    .catch((err) => {
      logger.error('Failed to resend verification email', { userId: user.id, error: err.message });
    });

  auditLogsService
    .logEvent({
      user_id: user.id,
      action: 'auth.resend_verification',
      resource_type: 'user',
      resource_id: user.id,
      severity: 'info',
      ip_address: req?.ip,
      user_agent: req?.headers?.['user-agent']?.slice(0, 500),
    })
    .catch(() => {});

  logger.info('Email verification resent', { userId: user.id });

  return {
    message: 'A fresh verification email has been dispatched.',
  };
};

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
  changePassword,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};

