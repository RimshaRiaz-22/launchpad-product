// src/middlewares/entitlements.middleware.js — Unified, Dynamic & Highly Scalable Plan Entitlements & Limits
'use strict';

const db = require('../database/knex');
const subscriptionPlansRepo = require('../repositories/subscriptionPlans.repository');
const billingRepo = require('../repositories/billing.repository');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger.config');

/**
 * Resolve user's active plan details with database fallback
 */
const resolveUserPlan = async (userId) => {
  if (!userId) return null;

  if (!/^[0-9a-fA-F-]{36}$/.test(userId)) {
    const freePlan = await subscriptionPlansRepo.findById('free');
    return freePlan || {
      id: 'free',
      name: 'Free Starter',
      design_limit: 3,
      storage_limit_mb: 100,
      max_seats: 1,
      can_export_4k: false,
      has_brand_kits: false,
      has_priority_support: false,
      features: ['3 active design projects', 'Standard export up to 1080p', '100 MB storage'],
    };
  }

  try {
    const subscription = await billingRepo.findByUserId(userId);
    const planId = subscription?.plan || subscription?.subscription_plan_id || 'free';
    const plan = await subscriptionPlansRepo.findById(planId);

    if (plan) return plan;

    // Fallback default starter tier if plan ID is unknown
    return {
      id: 'free',
      name: 'Free Starter',
      design_limit: 3,
      storage_limit_mb: 100,
      max_seats: 1,
      can_export_4k: false,
      has_brand_kits: false,
      has_priority_support: false,
      features: ['3 active design projects', 'Standard export up to 1080p', '100 MB storage'],
    };
  } catch (err) {
    logger.warn('Failed resolving user plan entitlements, falling back to free:', { error: err.message, userId });
    return {
      id: 'free',
      name: 'Free Starter',
      design_limit: 3,
      storage_limit_mb: 100,
      max_seats: 1,
      can_export_4k: false,
      has_brand_kits: false,
      has_priority_support: false,
      features: [],
    };
  }
};

/**
 * Attach live plan details and entitlement helpers to req.userPlan and req.entitlements
 */
const attachEntitlements = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return next();
  }

  try {
    const plan = await resolveUserPlan(req.user.id);
    req.userPlan = plan;
    req.entitlements = {
      planId: plan.id,
      planName: plan.name,
      limits: {
        design_limit: plan.design_limit,
        storage_limit_mb: plan.storage_limit_mb,
        max_seats: plan.max_seats,
      },
      features: {
        can_export_4k: Boolean(plan.can_export_4k),
        has_brand_kits: Boolean(plan.has_brand_kits),
        has_priority_support: Boolean(plan.has_priority_support),
        list: plan.features || [],
      },
      isUnlimited: (key) => plan[key] === -1,
      hasFeature: (featureKey) => {
        if (String(req.user?.role || '').toLowerCase() === 'admin') return true;
        if (plan[featureKey] === true) return true;
        if (Array.isArray(plan.features)) {
          return plan.features.some((f) =>
            typeof f === 'string' && f.toLowerCase().includes(featureKey.toLowerCase().replace(/_/g, ' '))
          );
        }
        return false;
      },
    };
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Quota Gate: Verify active design project count against plan.design_limit
 * Admins bypass this check. -1 = unlimited projects.
 */
const checkProjectLimit = () => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return next(ApiError.unauthorized('Authentication required'));
      }

      // Platform admins bypass quotas
      if (String(req.user?.role || '').toLowerCase() === 'admin') {
        return next();
      }

      const plan = req.userPlan || (await resolveUserPlan(req.user.id));
      const limit = plan?.design_limit !== undefined ? Number(plan.design_limit) : 3;

      // -1 represents unlimited projects
      if (limit === -1) {
        return next();
      }

      const countRow = await db('projects')
        .where({ user_id: req.user.id })
        .count('id as count')
        .first();

      const currentCount = parseInt(countRow?.count || '0', 10); // ← was missing, caused ReferenceError

      if (currentCount >= limit) {
        const auditLogsService = require('../services/auditLogs.service');
        auditLogsService.logEvent({
          user_id: req.user.id,
          action: 'security.project_limit_exceeded',
          resource_type: 'project',
          severity: 'warning',
          ip_address: req.ip || req.headers?.['x-forwarded-for'],
          user_agent: req.headers?.['user-agent'],
          metadata: {
            currentCount,
            limit,
            plan: plan.id,
            planName: plan.name,
            endpoint: req.originalUrl,
          },
        }).catch(() => {});

        return res.status(403).json({
          success: false,
          error: {
            code: 'PLAN_PROJECT_LIMIT_EXCEEDED',
            message: `You have reached your limit of ${limit} active project${limit === 1 ? '' : 's'} on the ${plan.name} tier. Please upgrade to Pro Designer for unlimited projects.`,
            current: currentCount,
            limit,
            plan: plan.id,
            upgradeRequired: true,
          },
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Quota Gate: Verify uploaded asset storage size against plan.storage_limit_mb
 * Admins bypass this check. -1 = unlimited storage.
 */
const checkStorageLimit = () => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return next(ApiError.unauthorized('Authentication required'));
      }

      if (String(req.user?.role || '').toLowerCase() === 'admin') {
        return next();
      }

      const plan = req.userPlan || (await resolveUserPlan(req.user.id));
      const limitMb = plan?.storage_limit_mb !== undefined ? Number(plan.storage_limit_mb) : 100;

      if (limitMb === -1) {
        return next();
      }

      const maxBytes = limitMb * 1024 * 1024;

      const sumRow = await db('assets')
        .where({ user_id: req.user.id })
        .sum('file_size as total_bytes')
        .first();

      const currentBytes = parseInt(sumRow?.total_bytes || '0', 10);
      const incomingBytes = req.file?.size || parseInt(req.headers['content-length'] || '0', 10);

      if (currentBytes + incomingBytes > maxBytes) {
        const usedMb = (currentBytes / (1024 * 1024)).toFixed(1);
        const auditLogsService = require('../services/auditLogs.service');
        auditLogsService.logEvent({
          user_id: req.user.id,
          action: 'security.storage_limit_exceeded',
          resource_type: 'asset',
          severity: 'warning',
          ip_address: req.ip || req.headers?.['x-forwarded-for'],
          user_agent: req.headers?.['user-agent'],
          metadata: {
            currentBytes,
            incomingBytes,
            limitMb,
            usedMb,
            plan: plan.id,
            planName: plan.name,
          },
        }).catch(() => {});

        return res.status(403).json({
          success: false,
          error: {
            code: 'STORAGE_LIMIT_EXCEEDED',
            message: `Storage limit exceeded (${usedMb} MB of ${limitMb} MB used on ${plan.name}). Please upgrade your plan or remove old assets to free up space.`,
            currentBytes,
            limitMb,
            plan: plan.id,
            upgradeRequired: true,
          },
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Feature Gate: Enforce boolean capability or feature in plan.features
 * Admins bypass this check.
 */
const requireFeature = (featureKey) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return next(ApiError.unauthorized('Authentication required'));
      }

      if (String(req.user?.role || '').toLowerCase() === 'admin') {
        return next();
      }

      const plan = req.userPlan || (await resolveUserPlan(req.user.id));

      let hasAccess = false;
      if (plan && plan[featureKey] === true) {
        hasAccess = true;
      } else if (plan && Array.isArray(plan.features)) {
        hasAccess = plan.features.some((f) =>
          typeof f === 'string' && f.toLowerCase().includes(featureKey.toLowerCase().replace(/_/g, ' '))
        );
      }

      if (!hasAccess) {
        const auditLogsService = require('../services/auditLogs.service');
        auditLogsService.logEvent({
          user_id: req.user.id,
          action: 'security.feature_locked',
          resource_type: 'feature',
          severity: 'warning',
          ip_address: req.ip || req.headers?.['x-forwarded-for'],
          user_agent: req.headers?.['user-agent'],
          metadata: {
            feature: featureKey,
            plan: plan?.id || 'free',
            planName: plan?.name || 'Free Starter',
            endpoint: req.originalUrl,
          },
        }).catch(() => {});

        return res.status(403).json({
          success: false,
          error: {
            code: 'FEATURE_LOCKED',
            message: `This feature (${featureKey}) is locked on your current ${plan?.name || 'current'} plan. Please upgrade to Pro Designer to unlock this feature.`,
            feature: featureKey,
            plan: plan?.id || 'free',
            upgradeRequired: true,
          },
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  resolveUserPlan,
  attachEntitlements,
  checkProjectLimit,
  checkStorageLimit,
  requireFeature,
};
