// src/services/auditLogs.service.js — Business logic for audit trail operations
'use strict';

const auditLogsRepo = require('../repositories/auditLogs.repository');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger.config');

/**
 * Safely records an audit event without interrupting the caller if logging fails.
 *
 * @param {object} event
 * @param {string} [event.user_id]
 * @param {string} event.action - e.g. 'project.create', 'billing.checkout'
 * @param {string} [event.resource_type] - e.g. 'project', 'user', 'subscription'
 * @param {string} [event.resource_id] - UUID of the target resource
 * @param {string} [event.ip_address]
 * @param {string} [event.user_agent]
 * @param {'info'|'warning'|'critical'} [event.severity='info']
 * @param {object} [event.metadata]
 * @returns {Promise<object|null>} The created log entry or null if error caught
 */
const logEvent = async (event) => {
  try {
    if (!event || !event.action) {
      logger.warn('[AuditLogsService] logEvent called without an action');
      return null;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const rawResourceId = event.resource_id || event.resourceId || null;
    const validResourceId = rawResourceId && uuidRegex.test(String(rawResourceId)) ? String(rawResourceId) : null;
    const rawUserId = event.user_id || event.userId || null;
    const validUserId = rawUserId && uuidRegex.test(String(rawUserId)) ? String(rawUserId) : null;

    const metadata = event.metadata ? { ...event.metadata } : {};
    if (rawResourceId && !validResourceId) {
      metadata.resource_slug = String(rawResourceId);
    }
    if (rawUserId && !validUserId) {
      metadata.actor_slug = String(rawUserId);
    }

    const record = await auditLogsRepo.create({
      user_id: validUserId,
      action: event.action,
      resource_type: event.resource_type || event.resourceType || null,
      resource_id: validResourceId,
      ip_address: event.ip_address || event.ipAddress || null,
      user_agent: event.user_agent || event.userAgent || null,
      severity: event.severity || 'info',
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
    });

    return record;
  } catch (err) {
    // Non-blocking: log the error, but do not throw to break main user action
    logger.error('[AuditLogsService] Failed to record audit log', {
      error: err.message,
      action: event?.action,
    });
    return null;
  }
};

/**
 * Paginated and filtered query of audit logs (Admin only).
 * @param {object} query
 * @returns {Promise<{ logs: Array, pagination: object }>}
 */
const listLogs = async (query = {}) => {
  const result = await auditLogsRepo.findMany(query);
  return {
    logs: result.data,
    pagination: result.meta,
  };
};

/**
 * Get a single audit log entry by ID (Admin only).
 * @param {string} id - UUID
 * @returns {Promise<object>}
 */
const getLogById = async (id) => {
  const log = await auditLogsRepo.findById(id);
  if (!log) {
    throw ApiError.notFound('Audit log entry not found', 'AUDIT_LOG_NOT_FOUND');
  }
  return log;
};

/**
 * Get aggregate audit statistics.
 * @returns {Promise<object>}
 */
const getStats = async () => {
  return auditLogsRepo.getStats();
};

module.exports = {
  logEvent,
  listLogs,
  getLogById,
  getStats,
};
