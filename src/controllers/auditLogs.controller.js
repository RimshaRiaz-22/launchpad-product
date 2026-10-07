// src/controllers/auditLogs.controller.js — Request handlers for audit log endpoints
'use strict';

const auditLogsService = require('../services/auditLogs.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/audit-logs — Admin: list and filter audit logs
 */
const listLogs = asyncHandler(async (req, res) => {
  const result = await auditLogsService.listLogs(req.query);
  return ApiResponse.paginated(res, result.logs, result.pagination, 'Audit logs retrieved successfully');
});

/**
 * GET /api/v1/audit-logs/stats — Admin: get aggregate audit statistics
 */
const getStats = asyncHandler(async (_req, res) => {
  const stats = await auditLogsService.getStats();
  return ApiResponse.success(res, { stats }, 'Audit statistics retrieved successfully');
});

/**
 * GET /api/v1/audit-logs/:id — Admin: get a single audit log entry
 */
const getLogById = asyncHandler(async (req, res) => {
  const log = await auditLogsService.getLogById(req.params.id);
  return ApiResponse.success(res, { log }, 'Audit log retrieved successfully');
});

module.exports = {
  listLogs,
  getStats,
  getLogById,
};
