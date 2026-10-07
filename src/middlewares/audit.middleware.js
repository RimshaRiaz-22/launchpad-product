// src/middlewares/audit.middleware.js — Centralized audit logger middleware and helper
'use strict';

const auditLogsService = require('../services/auditLogs.service');

/**
 * Direct helper to record an audit log event from an active request.
 *
 * @param {object} params
 * @param {import('express').Request} [params.req]
 * @param {string} [params.userId]
 * @param {string} params.action - e.g. 'project.delete', 'billing.checkout'
 * @param {string} [params.resourceType]
 * @param {string} [params.resourceId]
 * @param {'info'|'warning'|'critical'} [params.severity='info']
 * @param {object} [params.metadata]
 * @returns {Promise<object|null>}
 */
const recordAudit = async ({
  req,
  userId,
  action,
  resourceType,
  resourceId,
  severity = 'info',
  metadata,
}) => {
  const user_id = userId || req?.user?.id || null;
  const ip_address = req?.ip || req?.headers?.['x-forwarded-for'] || null;
  const user_agent = req?.headers?.['user-agent'] || null;

  return auditLogsService.logEvent({
    user_id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    ip_address,
    user_agent,
    severity,
    metadata,
  });
};

/**
 * Express middleware that automatically captures an audit log event upon
 * successful completion (status < 400) of the request.
 *
 * @param {string} action - e.g. 'project.create'
 * @param {object} [options]
 * @param {string} [options.resourceType]
 * @param {(req: import('express').Request, res: import('express').Response) => string} [options.getResourceId]
 * @param {'info'|'warning'|'critical'} [options.severity='info']
 * @param {(req: import('express').Request, res: import('express').Response) => object} [options.getMetadata]
 * @param {boolean} [options.logErrors=false]
 */
const auditLog = (action, options = {}) => {
  return (req, res, next) => {
    res.on('finish', () => {
      const isError = res.statusCode >= 400;
      if (isError && !options.logErrors) return;

      const severity = isError
        ? res.statusCode >= 500
          ? 'critical'
          : 'warning'
        : options.severity || 'info';

      const resourceId = options.getResourceId
        ? options.getResourceId(req, res)
        : req.params?.id || req.params?.projectId || req.params?.assetId || req.params?.userId || null;

      const metadata = options.getMetadata ? options.getMetadata(req, res) : undefined;

      recordAudit({
        req,
        action,
        resourceType: options.resourceType,
        resourceId,
        severity,
        metadata: {
          statusCode: res.statusCode,
          method: req.method,
          path: req.originalUrl,
          ...metadata,
        },
      }).catch(() => {});
    });

    next();
  };
};

module.exports = {
  recordAudit,
  auditLog,
};
