// src/repositories/assetCategories.repository.js — Data access for asset_categories and asset_subcategories
'use strict';

const db = require('../database/knex');

const CAT_TABLE = 'asset_categories';
const SUB_TABLE = 'asset_subcategories';
const ASSETS_TABLE = 'assets';

// ─── Category CRUD ───────────────────────────────────────────────────────────

const findAllCategories = async (assetType = null, includeInactive = false) => {
  const q = db(CAT_TABLE).orderBy('sort_order', 'asc').orderBy('name', 'asc');
  if (!includeInactive) q.where({ is_active: true });
  if (assetType) q.where('asset_type', assetType);
  return q;
};

const findCategoryById = async (id) => db(CAT_TABLE).where({ id }).first();
const findCategoryBySlug = async (slug) => db(CAT_TABLE).where({ id: slug }).first();

const createCategory = async (data) => {
  const [cat] = await db(CAT_TABLE).insert(data).returning('*');
  return cat;
};

const updateCategory = async (id, data) => {
  const [cat] = await db(CAT_TABLE)
    .where({ id })
    .update({ ...data, updated_at: db.fn.now() })
    .returning('*');
  return cat;
};

const deleteCategory = async (id) => db(CAT_TABLE).where({ id }).delete();

const reorderCategory = async (id, direction) => {
  const cat = await findCategoryById(id);
  if (!cat) return;
  const neighbour = await db(CAT_TABLE)
    .where('asset_type', cat.asset_type)
    .where('sort_order', direction === 'up' ? '<' : '>', cat.sort_order)
    .orderBy('sort_order', direction === 'up' ? 'desc' : 'asc')
    .first();
  if (!neighbour) return;
  await db(CAT_TABLE).where({ id }).update({ sort_order: neighbour.sort_order, updated_at: db.fn.now() });
  await db(CAT_TABLE).where({ id: neighbour.id }).update({ sort_order: cat.sort_order, updated_at: db.fn.now() });
};

/**
 * Fetch categories with live counts from the assets table.
 * Optionally filter by asset type (e.g. 'mockup').
 */
const getCategoriesWithCounts = async (assetType = null, includeInactive = false) => {
  const q = db(CAT_TABLE).orderBy('sort_order', 'asc').orderBy('name', 'asc');
  if (!includeInactive) q.where({ is_active: true });
  if (assetType) q.where('asset_type', assetType);
  const cats = await q;

  // Build live counts from assets table
  const countQuery = db(ASSETS_TABLE)
    .select('category')
    .count('id as count')
    .where({ is_builtin: true })
    .groupBy('category');
  if (assetType) countQuery.where('type', assetType);
  const counts = await countQuery;

  const countMap = {};
  counts.forEach((r) => { countMap[r.category] = Number(r.count); });

  return cats.map((c) => ({
    ...c,
    asset_count: countMap[c.name] || 0,
  }));
};

// ─── Subcategory CRUD ─────────────────────────────────────────────────────────

const findSubcategories = async (categoryId, includeInactive = false) => {
  const q = db(SUB_TABLE)
    .where({ category_id: categoryId })
    .orderBy('sort_order', 'asc')
    .orderBy('name', 'asc');
  if (!includeInactive) q.where({ is_active: true });
  return q;
};

const findAllSubcategories = async (assetType = null, includeInactive = false) => {
  const q = db(SUB_TABLE)
    .join(CAT_TABLE, `${SUB_TABLE}.category_id`, '=', `${CAT_TABLE}.id`)
    .select(`${SUB_TABLE}.*`, `${CAT_TABLE}.asset_type`)
    .orderBy(`${SUB_TABLE}.sort_order`, 'asc');
  if (!includeInactive) q.where(`${SUB_TABLE}.is_active`, true);
  if (assetType) q.where(`${CAT_TABLE}.asset_type`, assetType);
  return q;
};

const findSubcategoryById = async (id) => db(SUB_TABLE).where({ id }).first();

const createSubcategory = async (data) => {
  const [sub] = await db(SUB_TABLE).insert(data).returning('*');
  return sub;
};

const updateSubcategory = async (id, data) => {
  const [sub] = await db(SUB_TABLE)
    .where({ id })
    .update({ ...data, updated_at: db.fn.now() })
    .returning('*');
  return sub;
};

const deleteSubcategory = async (id) => db(SUB_TABLE).where({ id }).delete();

const reorderSubcategory = async (id, direction) => {
  const sub = await findSubcategoryById(id);
  if (!sub) return;
  const neighbour = await db(SUB_TABLE)
    .where('category_id', sub.category_id)
    .where('sort_order', direction === 'up' ? '<' : '>', sub.sort_order)
    .orderBy('sort_order', direction === 'up' ? 'desc' : 'asc')
    .first();
  if (!neighbour) return;
  await db(SUB_TABLE).where({ id }).update({ sort_order: neighbour.sort_order, updated_at: db.fn.now() });
  await db(SUB_TABLE).where({ id: neighbour.id }).update({ sort_order: sub.sort_order, updated_at: db.fn.now() });
};

/**
 * Fetch subcategories with live asset counts from the assets table.
 */
const getSubcategoriesWithCounts = async (categoryId, includeInactive = false) => {
  const subs = await findSubcategories(categoryId, includeInactive);

  const counts = await db(ASSETS_TABLE)
    .select('subcategory')
    .count('id as count')
    .whereNotNull('subcategory')
    .where({ is_builtin: true })
    .groupBy('subcategory');

  const countMap = {};
  counts.forEach((r) => { countMap[r.subcategory] = Number(r.count); });

  return subs.map((s) => ({ ...s, asset_count: countMap[s.id] || 0 }));
};

module.exports = {
  // Categories
  findAllCategories,
  findCategoryById,
  findCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategory,
  getCategoriesWithCounts,
  // Subcategories
  findSubcategories,
  findAllSubcategories,
  findSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  reorderSubcategory,
  getSubcategoriesWithCounts,
};
