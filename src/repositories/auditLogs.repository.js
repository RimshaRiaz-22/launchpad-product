// src/repositories/auditLogs.repository.js — Data access for audit_logs table
'use strict';

const db = require('../database/knex');
const { applyDateRange, applySearch, normalizePaginationAndSort } = require('../utils/filterHelper');

const TABLE = 'audit_logs';

/**
 * Columns to select when querying audit logs.
 */
const SELECT_COLUMNS = [
  `${TABLE}.id`,
  `${TABLE}.user_id`,
  `${TABLE}.action`,
  `${TABLE}.resource_type`,
  `${TABLE}.resource_id`,
  `${TABLE}.ip_address`,
  `${TABLE}.user_agent`,
  `${TABLE}.severity`,
  `${TABLE}.metadata`,
  `${TABLE}.created_at`,
  'users.name as user_name',
  'users.email as user_email',
  'users.avatar_url as user_avatar',
  'users.role as user_role',
];

/**
 * Insert a new audit log record.
 * @param {object} data
 * @returns {Promise<object>} Created record
 */
const create = async (data) => {
  const [record] = await db(TABLE)
    .insert({
      user_id: data.user_id || null,
      action: data.action,
      resource_type: data.resource_type || null,
      resource_id: data.resource_id || null,
      ip_address: data.ip_address || null,
      user_agent: data.user_agent ? String(data.user_agent).slice(0, 500) : null,
      severity: data.severity || 'info',
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    })
    .returning('*');
  return record;
};

/**
 * Find an audit log record by ID with joined user info.
 * @param {string} id - UUID
 * @returns {Promise<object|undefined>}
 */
const findById = async (id) => {
  return db(TABLE)
    .leftJoin('users', 'users.id', `${TABLE}.user_id`)
    .where(`${TABLE}.id`, id)
    .select(SELECT_COLUMNS)
    .first();
};

/**
 * Paginated and filtered query of audit logs.
 * Supports:
 *   - user_id: UUID
 *   - action: exact action or wildcard prefix (e.g. "project.*")
 *   - resource_type: e.g. "project", "user", "subscription"
 *   - resource_id: UUID
 *   - severity: "info" | "warning" | "critical"
 *   - ip_address: string
 *   - search / q: ILIKE search across action, resource_type, user name, user email
 *   - startDate / endDate: date range filtering on created_at
 *   - pagination (page, limit)
 *   - sorting (created_at, action, severity, resource_type)
 *
 * @param {object} filters
 * @returns {Promise<{ data: Array, meta: object }>}
 */
const findMany = async (filters = {}) => {
  const allowedSortFields = ['created_at', 'action', 'severity', 'resource_type', 'user_id'];
  const { page, limit, offset, sortBy, sortOrder } = normalizePaginationAndSort(
    filters,
    allowedSortFields,
    'created_at',
    'desc'
  );

  const query = db(TABLE)
    .leftJoin('users', 'users.id', `${TABLE}.user_id`);

  // Filter by user ID
  if (filters.user_id || filters.userId) {
    query.where(`${TABLE}.user_id`, filters.user_id || filters.userId);
  }

  // Filter by action (supports exact match or prefix like "user.*" / "billing.%")
  const actionFilter = filters.action;
  if (actionFilter) {
    if (actionFilter.includes('*')) {
      query.where(`${TABLE}.action`, 'ILIKE', actionFilter.replace(/\*/g, '%'));
    } else {
      query.where(`${TABLE}.action`, actionFilter);
    }
  }

  // Filter by resource type and resource ID
  if (filters.resource_type || filters.resourceType) {
    query.where(`${TABLE}.resource_type`, filters.resource_type || filters.resourceType);
  }
  if (filters.resource_id || filters.resourceId) {
    query.where(`${TABLE}.resource_id`, filters.resource_id || filters.resourceId);
  }

  // Filter by severity
  if (filters.severity) {
    const severities = Array.isArray(filters.severity) ? filters.severity : [filters.severity];
    query.whereIn(`${TABLE}.severity`, severities);
  }

  // Filter by IP Address
  if (filters.ip_address || filters.ipAddress) {
    query.where(`${TABLE}.ip_address`, filters.ip_address || filters.ipAddress);
  }

  // Date range filters for created_at
  const startDate = filters.startDate || filters.start_date;
  const endDate = filters.endDate || filters.end_date;
  applyDateRange(query, `${TABLE}.created_at`, startDate, endDate);

  // Search filter across action, resource_type, users.name, users.email
  const search = filters.search || filters.q;
  if (search && search.trim()) {
    applySearch(query, [`${TABLE}.action`, `${TABLE}.resource_type`, 'users.name', 'users.email'], search);
  }

  // Count total matching records
  const countQuery = query.clone().clearSelect().count(`${TABLE}.id as count`).first();

  // Query severity breakdown when scoped to a user
  let userSeverityPromise = Promise.resolve(null);
  if (filters.user_id || filters.userId) {
    const userQuery = db(TABLE).where(`${TABLE}.user_id`, filters.user_id || filters.userId);
    userSeverityPromise = Promise.all([
      userQuery.clone().groupBy('severity').select('severity', db.raw('COUNT(id) as count')),
      userQuery.clone().count('id as count').first(),
    ]).then(([sevRows, totalRow]) => {
      const counts = { all: parseInt(totalRow?.count || 0, 10), info: 0, warning: 0, critical: 0 };
      sevRows.forEach((r) => {
        if (r.severity && counts[r.severity] !== undefined) {
          counts[r.severity] = parseInt(r.count, 10);
        }
      });
      return counts;
    }).catch(() => null);
  }

  const [{ count }, data, severityCounts] = await Promise.all([
    countQuery,
    query
      .clone()
      .select(SELECT_COLUMNS)
      .orderBy(`${TABLE}.${sortBy}`, sortOrder)
      .limit(limit)
      .offset(offset),
    userSeverityPromise,
  ]);

  const total = parseInt(count || 0, 10);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      ...(severityCounts ? { severityCounts } : {}),
    },
  };
};

/**
 * Get aggregate audit statistics for overview/dashboard.
 * @returns {Promise<object>}
 */
const getStats = async () => {
  const now = new Date();
  const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalResult,
    last24hResult,
    last7dResult,
    severityResult,
    topActionsResult,
  ] = await Promise.all([
    db(TABLE).count('id as count').first(),
    db(TABLE).where('created_at', '>=', past24Hours).count('id as count').first(),
    db(TABLE).where('created_at', '>=', past7Days).count('id as count').first(),
    db(TABLE).groupBy('severity').select('severity', db.raw('COUNT(id) as count')),
    db(TABLE)
      .where('created_at', '>=', past7Days)
      .groupBy('action')
      .select('action', db.raw('COUNT(id) as count'))
      .orderBy('count', 'desc')
      .limit(8),
  ]);

  const severityCounts = {
    info: 0,
    warning: 0,
    critical: 0,
  };
  severityResult.forEach((row) => {
    if (row.severity && severityCounts[row.severity] !== undefined) {
      severityCounts[row.severity] = parseInt(row.count, 10);
    }
  });

  return {
    totalLogs: parseInt(totalResult?.count || 0, 10),
    logsLast24Hours: parseInt(last24hResult?.count || 0, 10),
    logsLast7Days: parseInt(last7dResult?.count || 0, 10),
    severityBreakdown: severityCounts,
    topActionsPast7Days: topActionsResult.map((r) => ({
      action: r.action,
      count: parseInt(r.count, 10),
    })),
  };
};

module.exports = {
  create,
  findById,
  findMany,
  getStats,
};
