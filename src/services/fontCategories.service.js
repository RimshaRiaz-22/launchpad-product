// src/services/fontCategories.service.js — Business logic for font categories
"use strict";

const repo = require("../repositories/fontCategories.repository");
const ApiError = require("../utils/ApiError");
const memoryCache = require("../utils/memoryCache");

const CACHE_KEY = "fonts:categories";

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const listCategories = async (includeInactive = false) => {
  return memoryCache.wrap(`${CACHE_KEY}:${includeInactive}`, 300, () =>
    repo.findAllWithCounts(includeInactive),
  );
};

const getCategory = async (id) => {
  const cat = await repo.findById(id);
  if (!cat)
    throw ApiError.notFound(
      "Font category not found",
      "FONT_CATEGORY_NOT_FOUND",
    );
  return cat;
};

const createCategory = async (data) => {
  const id = data.id || slugify(data.name);
  const existing = await repo.findById(id);
  if (existing)
    throw ApiError.conflict(
      "A font category with this ID already exists",
      "FONT_CATEGORY_EXISTS",
    );

  const all = await repo.findAll(true);
  const maxOrder = all.reduce((m, c) => Math.max(m, c.sort_order), -1);

  const created = await repo.create({
    id,
    name: data.name,
    label: data.label || data.name,
    description: data.description || null,
    color: data.color || null,
    sort_order: data.sort_order !== undefined ? data.sort_order : maxOrder + 1,
    is_active: data.is_active !== undefined ? data.is_active : true,
  });
  memoryCache.delPrefix(CACHE_KEY);
  return created;
};

const updateCategory = async (id, data) => {
  const cat = await repo.findById(id);
  if (!cat)
    throw ApiError.notFound(
      "Font category not found",
      "FONT_CATEGORY_NOT_FOUND",
    );

  const updates = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.label !== undefined) updates.label = data.label;
  if (data.description !== undefined) updates.description = data.description;
  if (data.color !== undefined) updates.color = data.color;
  if (data.sort_order !== undefined) updates.sort_order = data.sort_order;
  if (data.is_active !== undefined) updates.is_active = data.is_active;

  const updated = await repo.update(id, updates);
  memoryCache.delPrefix(CACHE_KEY);
  return updated;
};

const deleteCategory = async (id) => {
  const cat = await repo.findById(id);
  if (!cat)
    throw ApiError.notFound(
      "Font category not found",
      "FONT_CATEGORY_NOT_FOUND",
    );
  await repo.remove(id);
  memoryCache.delPrefix(CACHE_KEY);
};

const reorderCategory = async (id, direction) => {
  const cat = await repo.findById(id);
  if (!cat)
    throw ApiError.notFound(
      "Font category not found",
      "FONT_CATEGORY_NOT_FOUND",
    );
  if (!["up", "down"].includes(direction)) {
    throw ApiError.badRequest(
      'direction must be "up" or "down"',
      "INVALID_DIRECTION",
    );
  }
  await repo.reorder(id, direction);
  memoryCache.delPrefix(CACHE_KEY);
};

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategory,
};
