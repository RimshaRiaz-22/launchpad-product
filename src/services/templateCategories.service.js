// src/services/templateCategories.service.js — Template categories business logic
"use strict";

const categoriesRepo = require("../repositories/templateCategories.repository");
const ApiError = require("../utils/ApiError");
const memoryCache = require("../utils/memoryCache");

const CACHE_KEY = "template:categories";

/** Slugify a string for use as a URL-safe identifier */
const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const listCategories = async (includeInactive = false) => {
  return memoryCache.wrap(CACHE_KEY, 300, () => categoriesRepo.getCategoriesWithCounts());
};

const createCategory = async (data) => {
  const slug = data.slug || slugify(data.name);
  // Unique check
  const existing = await categoriesRepo.findBySlug(slug);
  if (existing) throw ApiError.conflict("A category with this name/slug already exists", "CATEGORY_EXISTS");
  const created = await categoriesRepo.create({ ...data, slug });
  memoryCache.del(CACHE_KEY);
  return created;
};

const updateCategory = async (id, data) => {
  const cat = await categoriesRepo.findById(id);
  if (!cat) throw ApiError.notFound("Category not found", "CATEGORY_NOT_FOUND");
  if (data.name && data.name !== cat.name) {
    data.slug = slugify(data.name);
  }
  const updated = await categoriesRepo.update(id, data);
  memoryCache.del(CACHE_KEY);
  return updated;
};

const deleteCategory = async (id, reassignTo = null) => {
  const cat = await categoriesRepo.findById(id);
  if (!cat) throw ApiError.notFound("Category not found", "CATEGORY_NOT_FOUND");

  const db = require("../database/knex");
  if (reassignTo && String(reassignTo).trim()) {
    const target = String(reassignTo).trim();
    await db("templates")
      .where(function () {
        this.where({ category: cat.name }).orWhere({ category: cat.slug });
      })
      .update({ category: target });
  } else {
    // Automatically delete all templates under this category as requested
    await db("templates")
      .where(function () {
        this.where({ category: cat.name }).orWhere({ category: cat.slug });
      })
      .delete();
  }
  const removed = await categoriesRepo.remove(id);
  memoryCache.del(CACHE_KEY);
  return removed;
};

const reorderCategory = async (id, direction) => {
  const result = await categoriesRepo.reorder(id, direction);
  memoryCache.del(CACHE_KEY);
  return result;
};

module.exports = { listCategories, createCategory, updateCategory, deleteCategory, reorderCategory };
