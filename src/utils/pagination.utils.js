// src/utils/pagination.utils.js — Offset-based pagination helpers
'use strict';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse and normalise pagination query params from a request.
 *
 * @param {object} query - req.query
 * @returns {{ page: number, limit: number, offset: number }}
 */
const parsePagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Build pagination metadata from query results.
 *
 * @param {number} total  - Total record count
 * @param {number} page
 * @param {number} limit
 * @returns {{ page, limit, total, totalPages }}
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Apply pagination to a Knex query builder.
 *
 * @param {import('knex').Knex.QueryBuilder} qb
 * @param {number} limit
 * @param {number} offset
 * @returns {import('knex').Knex.QueryBuilder}
 */
const applyPagination = (qb, limit, offset) => {
  return qb.limit(limit).offset(offset);
};

module.exports = {
  parsePagination,
  buildPaginationMeta,
  applyPagination,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
