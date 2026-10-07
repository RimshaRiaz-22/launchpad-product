// src/api/v1/routes/auditLogs.routes.js — Admin audit trail routes
'use strict';

const { Router } = require('express');
const auditLogsController = require('../../../controllers/auditLogs.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const validate = require('../../../middlewares/validate.middleware');
const {
  listAuditLogsQuerySchema,
  auditLogIdParamSchema,
} = require('../../../validators/auditLogs.validator');

const router = Router();

// All audit log routes require authentication and admin (owner) privileges
router.use(authenticate);
router.use(authorize('admin'));

// GET /api/v1/audit-logs/stats — Summary statistics
router.get(
  '/stats',
  auditLogsController.getStats
);

// GET /api/v1/audit-logs — Paginated list with filtering & sorting
router.get(
  '/',
  validate({ query: listAuditLogsQuerySchema }),
  auditLogsController.listLogs
);

// GET /api/v1/audit-logs/:id — Single audit log detail
router.get(
  '/:id',
  validate({ params: auditLogIdParamSchema }),
  auditLogsController.getLogById
);

module.exports = router;
