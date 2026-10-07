// src/controllers/auth.controller.js — Authentication request handlers
'use strict';

const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/v1/auth/register
 * Register a new user account.
 */
const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body, req);

  return ApiResponse.created(res, { user, accessToken, refreshToken }, 'Registration successful');
});

/**
 * POST /api/v1/auth/login
 * Login with email + password.
 */
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, req);

  return ApiResponse.success(res, { user, accessToken, refreshToken }, 'Login successful');
});

/**
 * POST /api/v1/auth/refresh
 * Rotate refresh token — issue new access + refresh token pair.
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken: rawRefreshToken } = req.body;
  const tokens = await authService.refreshTokens(rawRefreshToken, req);

  return ApiResponse.success(res, tokens, 'Tokens refreshed successfully');
});

/**
 * POST /api/v1/auth/logout
 * Revoke the current refresh token (or all sessions).
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(req.user.id, refreshToken || null);

  return ApiResponse.success(res, null, 'Logged out successfully');
});

/**
 * POST /api/v1/auth/logout-all
 * Revoke all refresh tokens for this user (logout all devices).
 */
const logoutAll = asyncHandler(async (req, res) => {
  const { currentRefreshToken } = req.body || {};
  await authService.logout(req.user.id, null, currentRefreshToken || null);

  return ApiResponse.success(res, null, 'Logged out from all other devices successfully');
});

/**
 * POST /api/v1/auth/change-password
 * Change password — requires authentication.
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);

  return ApiResponse.success(res, null, 'Password changed successfully');
});

/**
 * GET /api/v1/auth/me
 * Get the currently authenticated user's profile.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);

  return ApiResponse.success(res, { user }, 'Profile retrieved successfully');
});

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset link.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email, req);

  return ApiResponse.success(res, null, result.message);
});

/**
 * POST /api/v1/auth/reset-password
 * Reset password using verification token.
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password, req);

  return ApiResponse.success(res, null, result.message);
});

/**
 * GET /api/v1/auth/verify-email
 * Verify user's email via token.
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const token = req.query.token || req.body?.token;
  const result = await authService.verifyEmail(token, req);

  return ApiResponse.success(res, result.user, result.message);
});

/**
 * POST /api/v1/auth/resend-verification
 * Resend verification email to user.
 */
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendVerification(email, req);

  return ApiResponse.success(res, null, result.message);
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  changePassword,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};

