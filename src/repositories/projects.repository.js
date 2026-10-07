// src/repositories/projects.repository.js — Data access for projects table
'use strict';

const db = require('../database/knex');
const { applyDateRange, applySearch, normalizePaginationAndSort } = require('../utils/filterHelper');

const TABLE = 'projects';

/**
 * Find a project by ID (with owner info joined).
 */
const findById = async (id) => {
  return db(TABLE)
    .where(`${TABLE}.id`, id)
    .join('users', 'users.id', `${TABLE}.user_id`)
    .select(
      `${TABLE}.*`,
      'users.name as owner_name',
      'users.avatar_url as owner_avatar'
    )
    .first();
};

/**
 * Find a project by ID belonging to a specific user.
 */
const findByIdAndUser = async (id, userId) => {
  return db(TABLE).where({ id, user_id: userId }).first();
};

/**
 * Create a new project.
 */
const create = async (data) => {
  const [project] = await db(TABLE).insert(data).returning('*');
  return project;
};

/**
 * Update a project.
 */
const update = async (id, userId, data) => {
  const [project] = await db(TABLE)
    .where({ id, user_id: userId })
    .update({ ...data, updated_at: db.fn.now() })
    .returning('*');
  return project;
};

/**
 * Delete a project (hard delete).
 */
const remove = async (id, userId) => {
  return db(TABLE).where({ id, user_id: userId }).delete();
};

/**
 * Paginated and filtered list of projects for a user.
 * Supports: startDate, endDate, updatedStartDate, updatedEndDate, status, is_public,
 * search (name, description), tag, dimension ranges, sorting, and pagination.
 */
const findManyByUser = async (userId, filters = {}) => {
  const allowedSortFields = ['created_at', 'updated_at', 'name', 'width', 'height'];
  const { page, limit, offset, sortBy, sortOrder } = normalizePaginationAndSort(
    filters,
    allowedSortFields,
    'updated_at',
    'desc'
  );

  const query = db(TABLE).where({ user_id: userId });

  // Status & Visibility
  if (filters.status) query.where('status', filters.status);
  if (filters.is_public !== undefined) query.where('is_public', filters.is_public);

  // Date range filters for created_at
  const startDate = filters.startDate || filters.start_date;
  const endDate = filters.endDate || filters.end_date;
  applyDateRange(query, 'created_at', startDate, endDate);

  // Date range filters for updated_at
  const updatedStartDate = filters.updatedStartDate || filters.updated_start_date;
  const updatedEndDate = filters.updatedEndDate || filters.updated_end_date;
  applyDateRange(query, 'updated_at', updatedStartDate, updatedEndDate);

  // Search filter across name and description
  const search = filters.search || filters.q;
  applySearch(query, ['name', 'description'], search);

  // Tag filter
  if (filters.tag) {
    query.whereRaw('? = ANY(tags)', [filters.tag]);
  }

  // Dimensions
  if (filters.minWidth) query.where('width', '>=', filters.minWidth);
  if (filters.maxWidth) query.where('width', '<=', filters.maxWidth);
  if (filters.minHeight) query.where('height', '>=', filters.minHeight);
  if (filters.maxHeight) query.where('height', '<=', filters.maxHeight);

  const PROJECT_LIST_COLUMNS = [
    'id',
    'user_id',
    'name',
    'description',
    'thumbnail_url',
    'width',
    'height',
    'is_public',
    'status',
    'tags',
    'created_at',
    'updated_at',
  ];

  // Count query
  const countQuery = query.clone().clearSelect().count('id as count').first();

  const [{ count }, data] = await Promise.all([
    countQuery,
    query
      .clone()
      .select(filters.include_canvas ? '*' : PROJECT_LIST_COLUMNS)
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

/**
 * Find public projects (gallery/explore) with date ranges, search and sorting.
 */
const findPublic = async (filters = {}) => {
  const allowedSortFields = ['created_at', 'updated_at', 'name'];
  const { page, limit, offset, sortBy, sortOrder } = normalizePaginationAndSort(
    filters,
    allowedSortFields,
    'created_at',
    'desc'
  );

  const query = db(TABLE)
    .where({ is_public: true, status: 'published' })
    .join('users', 'users.id', `${TABLE}.user_id`)
    .select(
      `${TABLE}.id`,
      `${TABLE}.name`,
      `${TABLE}.description`,
      `${TABLE}.thumbnail_url`,
      `${TABLE}.width`,
      `${TABLE}.height`,
      `${TABLE}.tags`,
      `${TABLE}.created_at`,
      `${TABLE}.updated_at`,
      'users.name as owner_name',
      'users.avatar_url as owner_avatar'
    );

  // Date range filters
  const startDate = filters.startDate || filters.start_date;
  const endDate = filters.endDate || filters.end_date;
  applyDateRange(query, `${TABLE}.created_at`, startDate, endDate);

  // Search filter
  const search = filters.search || filters.q;
  applySearch(query, [`${TABLE}.name`, `${TABLE}.description`], search);

  if (filters.tag) {
    query.whereRaw(`? = ANY(${TABLE}.tags)`, [filters.tag]);
  }

  const countQuery = db(TABLE)
    .where({ is_public: true, status: 'published' });
  applyDateRange(countQuery, 'created_at', startDate, endDate);
  applySearch(countQuery, ['name', 'description'], search);
  if (filters.tag) {
    countQuery.whereRaw('? = ANY(tags)', [filters.tag]);
  }

  const [{ count }, data] = await Promise.all([
    countQuery.count('id as count').first(),
    query
      .orderBy(`${TABLE}.${sortBy}`, sortOrder)
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

module.exports = {
  findById,
  findByIdAndUser,
  create,
  update,
  remove,
  findManyByUser,
  findPublic,
};
