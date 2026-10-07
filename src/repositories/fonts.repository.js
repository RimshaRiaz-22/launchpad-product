// src/repositories/fonts.repository.js — Data access for fonts table
'use strict';

const db = require('../database/knex');
const { applySearch, normalizePaginationAndSort } = require('../utils/filterHelper');

const TABLE = 'fonts';

const findById = async (id) => {
  return db(TABLE).where({ id }).first();
};

const create = async (data) => {
  const [font] = await db(TABLE).insert(data).returning('*');
  return font;
};

const remove = async (id) => {
  return db(TABLE).where({ id }).delete();
};

const findMany = async (filters = {}) => {
  const allowedSortFields = ['name', 'category', 'created_at'];
  const requestedLimit = parseInt(filters.limit, 10) || 600;
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(1000, Math.max(1, requestedLimit));
  const offset = (page - 1) * limit;

  let sortBy = filters.sort_by || filters.sortBy || 'name';
  if (!allowedSortFields.includes(sortBy)) {
    sortBy = 'name';
  }
  const rawOrder = (filters.sort_order || filters.sortOrder || 'asc').toLowerCase();
  const sortOrder = ['asc', 'desc'].includes(rawOrder) ? rawOrder : 'asc';

  const query = db(TABLE);

  if (filters.category) query.where('category', filters.category);
  if (filters.is_builtin !== undefined) query.where('is_builtin', filters.is_builtin);

  if (filters.user_id) {
    query.where((builder) => {
      builder.where('is_builtin', true).orWhere('user_id', filters.user_id);
    });
  }

  const search = filters.search || filters.q;
  applySearch(query, ['name', 'family', 'category'], search);

  const countQuery = query.clone().clearSelect().count('id as count').first();

  const [{ count }, data] = await Promise.all([
    countQuery,
    query
      .clone()
      .select('*')
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset(offset),
  ]);

  const total = parseInt(count || 0, 10);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

const getCategories = async () => {
  return db(TABLE)
    .select('category')
    .count('id as count')
    .groupBy('category')
    .orderBy('category', 'asc');
};

module.exports = {
  findById,
  create,
  remove,
  findMany,
  getCategories,
};
