// src/repositories/fontCategories.repository.js — Data access for font_categories table
'use strict';

const db = require('../database/knex');

const TABLE = 'font_categories';
const FONTS_TABLE = 'fonts';

const findAll = async (includeInactive = false) => {
  const q = db(TABLE).orderBy('sort_order', 'asc').orderBy('name', 'asc');
  if (!includeInactive) q.where({ is_active: true });
  return q;
};

const findById = async (id) => db(TABLE).where({ id }).first();

const create = async (data) => {
  const [cat] = await db(TABLE).insert(data).returning('*');
  return cat;
};

const update = async (id, data) => {
  const [cat] = await db(TABLE)
    .where({ id })
    .update({ ...data, updated_at: db.fn.now() })
    .returning('*');
  return cat;
};

const remove = async (id) => db(TABLE).where({ id }).delete();

const reorder = async (id, direction) => {
  const cat = await findById(id);
  if (!cat) return;
  const neighbour = await db(TABLE)
    .where('sort_order', direction === 'up' ? '<' : '>', cat.sort_order)
    .orderBy('sort_order', direction === 'up' ? 'desc' : 'asc')
    .first();
  if (!neighbour) return;
  await db(TABLE).where({ id }).update({ sort_order: neighbour.sort_order, updated_at: db.fn.now() });
  await db(TABLE).where({ id: neighbour.id }).update({ sort_order: cat.sort_order, updated_at: db.fn.now() });
};

/**
 * Fetch all categories with live font counts from the fonts table.
 */
const findAllWithCounts = async (includeInactive = false) => {
  const q = db(TABLE).orderBy('sort_order', 'asc').orderBy('name', 'asc');
  if (!includeInactive) q.where({ is_active: true });
  const cats = await q;

  // Live counts from fonts table (case-insensitive match on category field)
  const counts = await db(FONTS_TABLE)
    .select(db.raw('LOWER(category) as category_key'))
    .count('id as count')
    .groupBy(db.raw('LOWER(category)'));

  const countMap = {};
  counts.forEach((r) => { countMap[r.category_key] = Number(r.count); });

  return cats.map((c) => ({
    ...c,
    font_count: countMap[c.id.toLowerCase()] || 0,
  }));
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  reorder,
  findAllWithCounts,
};
