// src/repositories/templateCategories.repository.js — Template categories data access
"use strict";

const db = require("../database/knex");

const TABLE = "template_categories";

const findAll = async (includeInactive = false) => {
  const q = db(TABLE).orderBy("sort_order", "asc").orderBy("name", "asc");
  if (!includeInactive) q.where({ is_active: true });
  return q;
};

const findById = async (id) => db(TABLE).where({ id }).first();
const findBySlug = async (slug) => db(TABLE).where({ slug }).first();

const create = async (data) => {
  const [cat] = await db(TABLE).insert(data).returning("*");
  return cat;
};

const update = async (id, data) => {
  const [cat] = await db(TABLE)
    .where({ id })
    .update({ ...data, updated_at: db.fn.now() })
    .returning("*");
  return cat;
};

const remove = async (id) => db(TABLE).where({ id }).delete();

const getCategoriesWithCounts = async () => {
  const cats = await db(TABLE)
    .where({ is_active: true })
    .orderBy("sort_order", "asc")
    .orderBy("name", "asc");

  const counts = await db("templates")
    .select("category")
    .count("id as count")
    .groupBy("category")
    .whereNotNull("category");

  const countMap = Object.fromEntries(counts.map((r) => [r.category, Number(r.count)]));
  return cats.map((c) => ({ ...c, template_count: countMap[c.name] || 0 }));
};

const reorder = async (id, direction) => {
  const cat = await findById(id);
  if (!cat) return;
  const neighbour = await db(TABLE)
    .where("sort_order", direction === "up" ? "<" : ">", cat.sort_order)
    .orderBy("sort_order", direction === "up" ? "desc" : "asc")
    .first();
  if (!neighbour) return;
  await db(TABLE).where({ id }).update({ sort_order: neighbour.sort_order });
  await db(TABLE).where({ id: neighbour.id }).update({ sort_order: cat.sort_order });
};

module.exports = { findAll, findById, findBySlug, create, update, remove, getCategoriesWithCounts, reorder };
