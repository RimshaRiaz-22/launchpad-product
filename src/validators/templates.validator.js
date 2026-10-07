// src/validators/templates.validator.js — Joi schemas for template routes
"use strict";

const Joi = require("joi");

const createTemplateSchema = Joi.object({
  name: Joi.string().min(1).max(255).trim().required(),
  description: Joi.string().max(1000).trim().allow(null, ""),
  category: Joi.string().max(100).default("general"),
  canvas_data: Joi.object().required(),
  thumbnail_url: Joi.string().allow(null, ""),
  is_public: Joi.boolean().default(true),
  is_premium: Joi.boolean().default(false),
  is_featured: Joi.boolean().default(false),
  source: Joi.string().valid("admin", "user").default("admin"),
  width: Joi.number().integer().min(1).max(10000).default(1920),
  height: Joi.number().integer().min(1).max(10000).default(1080),
  tags: Joi.array().items(Joi.string().max(50)).max(20),
});

const updateTemplateSchema = Joi.object({
  name: Joi.string().min(1).max(255).trim(),
  description: Joi.string().max(1000).trim().allow(null, ""),
  category: Joi.string().max(100),
  canvas_data: Joi.object(),
  thumbnail_url: Joi.string().allow(null, ""),
  is_public: Joi.boolean(),
  is_premium: Joi.boolean(),
  is_featured: Joi.boolean(),
  source: Joi.string().valid("admin", "user"),
  width: Joi.number().integer().min(1).max(10000),
  height: Joi.number().integer().min(1).max(10000),
  tags: Joi.array().items(Joi.string().max(50)).max(20),
}).min(1);

const listTemplatesQuerySchema = Joi.object({
  page: Joi.number().integer().min(0).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
  category: Joi.string().max(100).trim(),
  is_premium: Joi.boolean(),
  is_public: Joi.boolean(),
  is_featured: Joi.boolean(),
  source: Joi.string().valid("admin", "user"),
  search: Joi.string().max(100).trim(),
  q: Joi.string().max(100).trim(),
  tag: Joi.string().max(50).trim(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
  min_screens: Joi.number().integer().min(1),
  max_screens: Joi.number().integer().min(1),
  sort_by: Joi.string().valid("created_at", "updated_at", "use_count", "name", "category").default("use_count"),
  sortBy: Joi.string().valid("created_at", "updated_at", "use_count", "name", "category"),
  sort_order: Joi.string().valid("asc", "desc").default("desc"),
  sortOrder: Joi.string().valid("asc", "desc"),
});

const templateIdParamSchema = Joi.object({
  templateId: Joi.string().max(100).required(),
});

const moveCategorySchema = Joi.object({
  category: Joi.string().min(1).max(100).required(),
});

// Template Categories
const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().required(),
  slug: Joi.string().max(100).lowercase().trim(),
  description: Joi.string().max(500).trim().allow(null, ""),
  icon: Joi.string().max(50).allow(null, ""),
  color: Joi.string().max(20).allow(null, ""),
  sort_order: Joi.number().integer().min(0).default(0),
  is_active: Joi.boolean().default(true),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).trim(),
  description: Joi.string().max(500).trim().allow(null, ""),
  icon: Joi.string().max(50).allow(null, ""),
  color: Joi.string().max(20).allow(null, ""),
  sort_order: Joi.number().integer().min(0),
  is_active: Joi.boolean(),
}).min(1);

const categoryIdParamSchema = Joi.object({
  categoryId: Joi.string().max(100).required(),
});

const deleteCategorySchema = Joi.object({
  reassign_to: Joi.string().max(100).allow(null, ""),
});

const reorderCategorySchema = Joi.object({
  direction: Joi.string().valid("up", "down").required(),
});

module.exports = {
  createTemplateSchema,
  updateTemplateSchema,
  listTemplatesQuerySchema,
  templateIdParamSchema,
  moveCategorySchema,
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  deleteCategorySchema,
  reorderCategorySchema,
};
