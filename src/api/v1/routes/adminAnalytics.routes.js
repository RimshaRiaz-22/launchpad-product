// src/api/v1/routes/adminAnalytics.routes.js — Admin analytics and overview routes
'use strict';

const { Router } = require('express');
const adminAnalyticsController = require('../../../controllers/adminAnalytics.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const validate = require('../../../middlewares/validate.middleware');
const {
  overviewQuerySchema,
  broadcastBodySchema,
  reportQuerySchema,
} = require('../../../validators/adminAnalytics.validator');

const router = Router();

// All analytics routes require authentication and admin (owner) privileges
router.use(authenticate);
router.use(authorize('admin'));

// GET /api/v1/admin/analytics/overview — Aggregated metrics with dynamic range, env, and plan filters
router.get(
  '/overview',
  validate({ query: overviewQuerySchema }),
  adminAnalyticsController.getOverview
);

// POST /api/v1/admin/analytics/broadcast — Global notification announcement
router.post(
  '/broadcast',
  validate({ body: broadcastBodySchema }),
  adminAnalyticsController.dispatchBroadcast
);

// GET /api/v1/admin/analytics/reports/financial — CSV analytics download
router.get(
  '/reports/financial',
  validate({ query: reportQuerySchema }),
  adminAnalyticsController.exportFinancialReport
);

module.exports = router;
