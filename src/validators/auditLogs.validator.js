// src/validators/auditLogs.validator.js — Joi schemas for audit logs routes
'use strict';

const Joi = require('joi');

const listAuditLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(0).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  user_id: Joi.string().uuid(),
  userId: Joi.string().uuid(),
  action: Joi.string().max(100).trim(),
  resource_type: Joi.string().max(100).trim(),
  resourceType: Joi.string().max(100).trim(),
  resource_id: Joi.string().uuid(),
  resourceId: Joi.string().uuid(),
  severity: Joi.alternatives().try(
    Joi.string().valid('info', 'warning', 'critical'),
    Joi.array().items(Joi.string().valid('info', 'warning', 'critical'))
  ),
  ip_address: Joi.string().max(45).trim(),
  ipAddress: Joi.string().max(45).trim(),
  search: Joi.string().max(100).trim(),
  q: Joi.string().max(100).trim(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
  sort_by: Joi.string().valid('created_at', 'action', 'severity', 'resource_type', 'user_id').default('created_at'),
  sortBy: Joi.string().valid('created_at', 'action', 'severity', 'resource_type', 'user_id'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc'),
  sortOrder: Joi.string().valid('asc', 'desc'),
});

const auditLogIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

module.exports = {
  listAuditLogsQuerySchema,
  auditLogIdParamSchema,
};
