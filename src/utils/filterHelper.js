// src/utils/filterHelper.js — Reusable query filtering, date ranges, and sorting
'use strict';

/**
 * Apply start_date and end_date filtering on a Knex query builder.
 * Accepts ISO-8601 strings or YYYY-MM-DD format.
 *
 * @param {import('knex').Knex.QueryBuilder} query
 * @param {string} column - e.g. 'created_at' or 'projects.created_at'
 * @param {string|Date} [startDate]
 * @param {string|Date} [endDate]
 */
const applyDateRange = (query, column, startDate, endDate) => {
  if (startDate) {
    const start = new Date(startDate);
    if (!isNaN(start.getTime())) {
      query.where(column, '>=', start.toISOString());
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (!isNaN(end.getTime())) {
      // If end date is YYYY-MM-DD without time, set to end of day 23:59:59.999
      if (typeof endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) {
        end.setUTCHours(23, 59, 59, 999);
      }
      query.where(column, '<=', end.toISOString());
    }
  }
  return query;
};

/**
 * Apply case-insensitive ILIKE search across one or multiple columns.
 *
 * @param {import('knex').Knex.QueryBuilder} query
 * @param {string[]} columns - e.g. ['name', 'description']
 * @param {string} [search]
 */
const applySearch = (query, columns, search) => {
  if (!search || !search.trim()) return query;

  const term = `%${search.trim()}%`;
  query.where((qb) => {
    columns.forEach((col, idx) => {
      if (idx === 0) {
        qb.whereILike(col, term);
      } else {
        qb.orWhereILike(col, term);
      }
    });
  });
  return query;
};

/**
 * Normalise pagination and sorting parameters.
 *
 * @param {object} params
 * @param {string[]} allowedSortFields
 * @param {string} defaultSort
 * @param {string} defaultOrder
 */
const normalizePaginationAndSort = (params = {}, allowedSortFields = [], defaultSort = 'created_at', defaultOrder = 'desc') => {
  const page = Math.max(1, parseInt(params.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit, 10) || 20));
  const offset = (page - 1) * limit;

  let sortBy = params.sort_by || params.sortBy || defaultSort;
  if (!allowedSortFields.includes(sortBy)) {
    sortBy = defaultSort;
  }

  const rawOrder = (params.sort_order || params.sortOrder || defaultOrder).toLowerCase();
  const sortOrder = ['asc', 'desc'].includes(rawOrder) ? rawOrder : defaultOrder;

  return { page, limit, offset, sortBy, sortOrder };
};

module.exports = {
  applyDateRange,
  applySearch,
  normalizePaginationAndSort,
};
