// src/validators/assets.validator.js — Joi schemas for asset routes
'use strict';

const Joi = require('joi');

const listAssetsQuerySchema = Joi.object({
  page: Joi.number().integer().min(0).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid('image', 'illustration', 'icon', 'mockup', 'shape', 'svg', 'badge', 'sticker', 'video', 'font', 'json', 'other'),
  category: Joi.string().max(100).trim(),
  is_premium: Joi.boolean(),
  mime_type: Joi.string().max(100).trim(),
  mimeType: Joi.string().max(100).trim(),
  search: Joi.string().max(100).trim(),
  q: Joi.string().max(100).trim(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
  min_size: Joi.number().integer().min(0),
  minSize: Joi.number().integer().min(0),
  max_size: Joi.number().integer().min(0),
  maxSize: Joi.number().integer().min(0),
  sort_by: Joi.string().valid('created_at', 'name', 'file_size', 'type', 'use_count').default('created_at'),
  sortBy: Joi.string().valid('created_at', 'name', 'file_size', 'type', 'use_count'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc'),
  sortOrder: Joi.string().valid('asc', 'desc'),
});

const assetIdParamSchema = Joi.object({
  assetId: Joi.string().uuid().required(),
});

const updateAssetSchema = Joi.object({
  name: Joi.string().min(1).max(255).trim(),
}).min(1);

module.exports = {
  listAssetsQuerySchema,
  assetIdParamSchema,
  updateAssetSchema,
};
