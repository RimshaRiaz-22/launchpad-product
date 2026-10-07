// src/controllers/adminAnalytics.controller.js — Admin analytics & command center handlers
'use strict';

const adminAnalyticsService = require('../services/adminAnalytics.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/v1/admin/analytics/overview — Aggregated dashboard metrics with filters */
const getOverview = asyncHandler(async (req, res) => {
  const data = await adminAnalyticsService.getOverviewMetrics(req.query);
  return ApiResponse.success(res, data, 'Admin overview metrics retrieved successfully');
});

/** POST /api/v1/admin/analytics/broadcast — Global notification broadcast */
const dispatchBroadcast = asyncHandler(async (req, res) => {
  const result = await adminAnalyticsService.dispatchBroadcast(req.body, req.user?.id);
  return ApiResponse.success(res, result, 'Global announcement broadcast dispatched');
});

/** GET /api/v1/admin/analytics/reports/financial — CSV financial export */
const exportFinancialReport = asyncHandler(async (req, res) => {
  const csvData = await adminAnalyticsService.generateFinancialReport(req.query.range);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="launchpad-financial-report-${req.query.range || '12m'}-${new Date().toISOString().slice(0, 10)}.csv"`
  );
  return res.status(200).send(csvData);
});

module.exports = {
  getOverview,
  dispatchBroadcast,
  exportFinancialReport,
};
