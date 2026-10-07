// src/repositories/assets.repository.js — Unified data access for the assets table
'use strict';

const db = require('../database/knex');
const { applyDateRange, applySearch, normalizePaginationAndSort } = require('../utils/filterHelper');

const TABLE = 'assets';

const findById = async (id) => {
  return db(TABLE).where({ id }).first();
};

const findByIdAndUser = async (id, userId) => {
  return db(TABLE).where({ id, user_id: userId }).first();
};

const create = async (data) => {
  const [asset] = await db(TABLE).insert(data).returning('*');
  return asset;
};

const update = async (id, userId, data) => {
  const [asset] = await db(TABLE)
    .where({ id, user_id: userId })
    .update(data)
    .returning('*');
  return asset;
};

const remove = async (id, userId) => {
  return db(TABLE).where({ id, user_id: userId }).delete();
};

/**
 * Filtered, paginated list of a user's own assets.
 * Supports: startDate, endDate, type, mime_type, min_size, max_size, search, sorting, pagination.
 */
const findManyByUser = async (userId, filters = {}) => {
  const allowedSortFields = ['created_at', 'name', 'file_size', 'type'];
  const { page, limit, offset, sortBy, sortOrder } = normalizePaginationAndSort(
    filters,
    allowedSortFields,
    'created_at',
    'desc'
  );

  const query = db(TABLE).where({ user_id: userId });

  if (filters.type) query.where('type', filters.type);

  const mimeType = filters.mime_type || filters.mimeType;
  if (mimeType) query.where('mime_type', mimeType);

  const minSize = filters.min_size !== undefined ? filters.min_size : filters.minSize;
  const maxSize = filters.max_size !== undefined ? filters.max_size : filters.maxSize;
  if (minSize !== undefined) query.where('file_size', '>=', minSize);
  if (maxSize !== undefined) query.where('file_size', '<=', maxSize);

  const startDate = filters.startDate || filters.start_date;
  const endDate = filters.endDate || filters.end_date;
  applyDateRange(query, 'created_at', startDate, endDate);

  const search = filters.search || filters.q;
  applySearch(query, ['name', 'file_path'], search);

  const countQuery = query.clone().clearSelect().count('id as count').first();

  const [{ count }, data] = await Promise.all([
    countQuery,
    query.clone().select('*').orderBy(sortBy, sortOrder).limit(limit).offset(offset),
  ]);

  const total = parseInt(count || 0, 10);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  };
};

/**
 * List built-in (is_builtin = true) assets PLUS any user-owned assets of a given type.
 * Used for panel tabs: devices, shapes, images, illustrations, icons.
 */
const findPublicByType = async (type, userId, filters = {}) => {
  const allowedSortFields = ['created_at', 'name', 'use_count', 'category'];
  const requestedLimit = parseInt(filters.limit, 10) || 500;
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(1000, Math.max(1, requestedLimit));
  const offset = (page - 1) * limit;

  let sortBy = filters.sort_by || filters.sortBy || 'use_count';
  if (!allowedSortFields.includes(sortBy)) {
    sortBy = 'use_count';
  }
  const rawOrder = (filters.sort_order || filters.sortOrder || 'desc').toLowerCase();
  const sortOrder = ['asc', 'desc'].includes(rawOrder) ? rawOrder : 'desc';


  const query = db(TABLE).where('type', type).where((builder) => {
    builder.where('is_builtin', true);
    if (userId) builder.orWhere('user_id', userId);
  });

  // Category filter
  if (filters.category && filters.category !== 'All') {
    query.where('category', filters.category);
  }

  // Subcategory filter
  if (filters.subcategory && filters.subcategory !== 'all') {
    query.where('subcategory', filters.subcategory);
  }

  // Tier / Premium filter
  if (filters.is_premium !== undefined && filters.is_premium !== null && filters.is_premium !== '') {
    const isPrem = filters.is_premium === true || filters.is_premium === 'true';
    query.where('is_premium', isPrem);
  }

  // Search filter across name and category
  const search = filters.search || filters.q;
  applySearch(query, ['name', 'category'], search);

  const countQuery = query.clone().clearSelect().count('id as count').first();

  const [{ count }, data] = await Promise.all([
    countQuery,
    query.clone().select('*').orderBy(sortBy, sortOrder).limit(limit).offset(offset),
  ]);

  const total = parseInt(count || 0, 10);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  };
};

/**
 * Fetch all built-in assets of a given type, grouped by their group_id / group_label.
 * Used for the Shapes tab (and any future grouped panel).
 */
const getGroupedByType = async (type) => {
  const rows = await db(TABLE)
    .where({ type, is_builtin: true })
    .select('*')
    .orderBy('created_at', 'asc');

  const groupMap = new Map();
  rows.forEach((row) => {
    const gid = row.group_id || 'default';
    const glabel = row.group_label || 'General';
    if (!groupMap.has(gid)) groupMap.set(gid, { id: gid, label: glabel, items: [] });
    groupMap.get(gid).items.push(row);
  });

  return Array.from(groupMap.values());
};

/**
 * Get distinct categories for built-in assets, optionally filtered by asset type.
 */
const getCategories = async (type) => {
  let query = db(TABLE)
    .distinct('category')
    .whereNotNull('category')
    .whereNot('category', '')
    .where({ is_builtin: true });

  if (type) {
    query = query.where('type', type);
  }

  const rows = await query.orderBy('category', 'asc');
  return rows.map((r) => r.category);
};

/**
 * Get total storage used by a user (in bytes).
 */
const getUserStorageUsed = async (userId) => {
  const result = await db(TABLE).where({ user_id: userId }).sum('file_size as total').first();
  return parseInt(result.total || 0, 10);
};

// ─── Admin CRUD (no user_id restriction) ─────────────────────────────────────

/**
 * List all assets for admin (any type, any user, with full filters).
 */
const adminFindMany = async (filters = {}) => {
  const allowedSortFields = ['created_at', 'name', 'use_count', 'category', 'type', 'file_size'];
  const { page, offset, sortBy, sortOrder } = normalizePaginationAndSort(
    filters,
    allowedSortFields,
    'created_at',
    'desc'
  );
  // Allow admins to load up to 500 assets per request (frontend requests 300)
  const limit = Math.min(500, Math.max(1, parseInt(filters.limit, 10) || 100));

  const query = db(TABLE)
    .leftJoin('users', 'assets.user_id', 'users.id');

  if (filters.type) {
    if (filters.type === 'user_upload') {
      query.where('assets.is_builtin', false);
    } else {
      query.where('assets.type', filters.type);
    }
  }

  if (filters.source === 'user' || filters.source === 'user_upload' || filters.source === 'user_uploaded') {
    query.where('assets.is_builtin', false);
  } else if (filters.source === 'builtin') {
    query.where('assets.is_builtin', true);
  }

  if (filters.category && filters.category !== 'All' && filters.category !== 'All Categories') {
    query.where('assets.category', filters.category);
  }
  if (filters.subcategory && filters.subcategory !== 'all') {
    query.where('assets.subcategory', filters.subcategory);
  }
  if (filters.is_builtin !== undefined && filters.is_builtin !== '') {
    query.where('assets.is_builtin', filters.is_builtin === 'true' || filters.is_builtin === true);
  }
  if (filters.is_premium !== undefined && filters.is_premium !== '') {
    query.where('assets.is_premium', filters.is_premium === 'true' || filters.is_premium === true);
  }

  const search = filters.search || filters.q;
  applySearch(query, ['assets.name', 'assets.category', 'assets.subcategory', 'users.email', 'users.name'], search);

  const countQuery = query.clone().clearSelect().clearOrder().count('assets.id as count').first();
  const sortCol = sortBy.includes('.') ? sortBy : `assets.${sortBy}`;

  const [{ count }, data] = await Promise.all([
    countQuery,
    query
      .clone()
      .select('assets.*', 'users.name as user_name', 'users.email as user_email')
      .orderBy(sortCol, sortOrder)
      .limit(limit)
      .offset(offset),
  ]);

  const total = parseInt(count || 0, 10);
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    data,
    meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  };
};

/**
 * Admin create — no user_id required (for built-in platform assets).
 */
const adminCreate = async (data) => {
  const [asset] = await db(TABLE).insert(data).returning('*');
  return asset;
};

/**
 * Admin update any asset regardless of owner.
 */
const adminUpdate = async (id, data) => {
  const [asset] = await db(TABLE)
    .where({ id })
    .update({ ...data, updated_at: db.fn.now() })
    .returning('*');
  return asset;
};

const adminRemove = async (id) => {
  const count = await db(TABLE).where({ id }).delete();
  const hasMockups = await db.schema.hasTable('mockups');
  if (hasMockups) {
    await db('mockups').where({ id }).delete();
  }
  return count;
};

/**
 * Admin bulk delete assets by ID array.
 */
const adminBulkRemove = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  const count = await db(TABLE).whereIn('id', ids).delete();
  const hasMockups = await db.schema.hasTable('mockups');
  if (hasMockups) {
    await db('mockups').whereIn('id', ids).delete();
  }
  return count;
};

/**
 * Increment use_count for an asset.
 */
const incrementUseCount = async (id) => {
  await db(TABLE).where({ id }).increment('use_count', 1);
};

module.exports = {
  findById,
  findByIdAndUser,
  create,
  update,
  remove,
  findManyByUser,
  findPublicByType,
  getGroupedByType,
  getCategories,
  getUserStorageUsed,
  adminFindMany,
  adminCreate,
  adminUpdate,
  adminRemove,
  adminBulkRemove,
  incrementUseCount,
};
