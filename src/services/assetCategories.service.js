// src/services/assetCategories.service.js — Business logic for asset categories & subcategories
'use strict';

const repo = require('../repositories/assetCategories.repository');
const ApiError = require('../utils/ApiError');
const memoryCache = require('../utils/memoryCache');

const CACHE_PREFIX = 'asset:categories';

const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ─── Categories ──────────────────────────────────────────────────────────────

/**
 * List active (or all) categories, optionally filtered by asset type, with live counts.
 */
const listCategories = async (assetType = null, includeInactive = false) => {
  const cacheKey = `${CACHE_PREFIX}:list:${assetType || 'all'}:${includeInactive}`;
  return memoryCache.wrap(cacheKey, 300, () =>
    repo.getCategoriesWithCounts(assetType, includeInactive)
  );
};

const getCategory = async (id) => {
  const cat = await repo.findCategoryById(id);
  if (!cat) throw ApiError.notFound('Category not found', 'CATEGORY_NOT_FOUND');
  return cat;
};

const createCategory = async (data) => {
  const id = data.id || slugify(data.name);
  const existing = await repo.findCategoryById(id);
  if (existing) throw ApiError.conflict('A category with this ID/slug already exists', 'CATEGORY_EXISTS');

  // Determine max sort_order for the asset_type
  const existing_cats = await repo.findAllCategories(data.asset_type, true);
  const maxOrder = existing_cats.reduce((m, c) => Math.max(m, c.sort_order), -1);

  const created = await repo.createCategory({
    id,
    name: data.name,
    label: data.label || data.name,
    asset_type: data.asset_type,
    description: data.description || null,
    icon: data.icon || null,
    color: data.color || null,
    sort_order: data.sort_order !== undefined ? data.sort_order : maxOrder + 1,
    is_active: data.is_active !== undefined ? data.is_active : true,
  });
  memoryCache.delPrefix(CACHE_PREFIX);
  return created;
};

const updateCategory = async (id, data) => {
  const cat = await repo.findCategoryById(id);
  if (!cat) throw ApiError.notFound('Category not found', 'CATEGORY_NOT_FOUND');
  const updates = {};
  if (data.name !== undefined)        updates.name = data.name;
  if (data.label !== undefined)       updates.label = data.label;
  if (data.asset_type !== undefined)  updates.asset_type = data.asset_type;
  if (data.description !== undefined) updates.description = data.description;
  if (data.icon !== undefined)        updates.icon = data.icon;
  if (data.color !== undefined)       updates.color = data.color;
  if (data.sort_order !== undefined)  updates.sort_order = data.sort_order;
  if (data.is_active !== undefined)   updates.is_active = data.is_active;
  const updated = await repo.updateCategory(id, updates);
  memoryCache.delPrefix(CACHE_PREFIX);
  return updated;
};

const deleteCategory = async (id) => {
  const cat = await repo.findCategoryById(id);
  if (!cat) throw ApiError.notFound('Category not found', 'CATEGORY_NOT_FOUND');
  // Subcategories cascade automatically (FK ON DELETE CASCADE)
  await repo.deleteCategory(id);
  memoryCache.delPrefix(CACHE_PREFIX);
};

const reorderCategory = async (id, direction) => {
  const cat = await repo.findCategoryById(id);
  if (!cat) throw ApiError.notFound('Category not found', 'CATEGORY_NOT_FOUND');
  if (!['up', 'down'].includes(direction)) {
    throw ApiError.badRequest('direction must be "up" or "down"', 'INVALID_DIRECTION');
  }
  await repo.reorderCategory(id, direction);
  memoryCache.delPrefix(CACHE_PREFIX);
};

// ─── Subcategories ────────────────────────────────────────────────────────────

const listSubcategories = async (categoryId, includeInactive = false) => {
  const cat = await repo.findCategoryById(categoryId);
  if (!cat) throw ApiError.notFound('Category not found', 'CATEGORY_NOT_FOUND');
  const cacheKey = `${CACHE_PREFIX}:subs:${categoryId}:${includeInactive}`;
  return memoryCache.wrap(cacheKey, 300, () =>
    repo.getSubcategoriesWithCounts(categoryId, includeInactive)
  );
};

const getSubcategory = async (id) => {
  const sub = await repo.findSubcategoryById(id);
  if (!sub) throw ApiError.notFound('Subcategory not found', 'SUBCATEGORY_NOT_FOUND');
  return sub;
};

const createSubcategory = async (categoryId, data) => {
  const cat = await repo.findCategoryById(categoryId);
  if (!cat) throw ApiError.notFound('Category not found', 'CATEGORY_NOT_FOUND');

  const id = data.id || `${categoryId}-${slugify(data.name)}`;
  const existing = await repo.findSubcategoryById(id);
  if (existing) throw ApiError.conflict('A subcategory with this ID already exists', 'SUBCATEGORY_EXISTS');

  const existingSubs = await repo.findSubcategories(categoryId, true);
  const maxOrder = existingSubs.reduce((m, s) => Math.max(m, s.sort_order), -1);

  const created = await repo.createSubcategory({
    id,
    category_id: categoryId,
    name: data.name,
    label: data.label || data.name,
    description: data.description || null,
    sort_order: data.sort_order !== undefined ? data.sort_order : maxOrder + 1,
    is_active: data.is_active !== undefined ? data.is_active : true,
  });
  memoryCache.delPrefix(CACHE_PREFIX);
  return created;
};

const updateSubcategory = async (categoryId, subId, data) => {
  const sub = await repo.findSubcategoryById(subId);
  if (!sub || sub.category_id !== categoryId) {
    throw ApiError.notFound('Subcategory not found', 'SUBCATEGORY_NOT_FOUND');
  }
  const updates = {};
  if (data.name !== undefined)        updates.name = data.name;
  if (data.label !== undefined)       updates.label = data.label;
  if (data.description !== undefined) updates.description = data.description;
  if (data.sort_order !== undefined)  updates.sort_order = data.sort_order;
  if (data.is_active !== undefined)   updates.is_active = data.is_active;
  const updated = await repo.updateSubcategory(subId, updates);
  memoryCache.delPrefix(CACHE_PREFIX);
  return updated;
};

const deleteSubcategory = async (categoryId, subId) => {
  const sub = await repo.findSubcategoryById(subId);
  if (!sub || sub.category_id !== categoryId) {
    throw ApiError.notFound('Subcategory not found', 'SUBCATEGORY_NOT_FOUND');
  }
  await repo.deleteSubcategory(subId);
  memoryCache.delPrefix(CACHE_PREFIX);
};

const reorderSubcategory = async (categoryId, subId, direction) => {
  const sub = await repo.findSubcategoryById(subId);
  if (!sub || sub.category_id !== categoryId) {
    throw ApiError.notFound('Subcategory not found', 'SUBCATEGORY_NOT_FOUND');
  }
  if (!['up', 'down'].includes(direction)) {
    throw ApiError.badRequest('direction must be "up" or "down"', 'INVALID_DIRECTION');
  }
  await repo.reorderSubcategory(subId, direction);
  memoryCache.delPrefix(CACHE_PREFIX);
};

/**
 * Return all categories + their subcategories in a single nested structure.
 * Useful for the frontend to build a full category tree in one request.
 */
const getCategoryTree = async (assetType = null, includeInactive = false) => {
  const cacheKey = `${CACHE_PREFIX}:tree:${assetType || 'all'}:${includeInactive}`;
  return memoryCache.wrap(cacheKey, 300, async () => {
    const cats = await repo.getCategoriesWithCounts(assetType, includeInactive);
    const subs = await repo.findAllSubcategories(assetType, includeInactive);

    const subMap = {};
    subs.forEach((s) => {
      if (!subMap[s.category_id]) subMap[s.category_id] = [];
      subMap[s.category_id].push(s);
    });

    return cats.map((c) => ({ ...c, subcategories: subMap[c.id] || [] }));
  });
};

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategory,
  listSubcategories,
  getSubcategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  reorderSubcategory,
  getCategoryTree,
};
