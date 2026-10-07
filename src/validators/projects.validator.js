// src/validators/projects.validator.js — Joi schemas for project routes
'use strict';

const Joi = require('joi');

const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(255).trim().required(),
  description: Joi.string().max(1000).trim().allow(null, ''),
  canvas_data: Joi.object().unknown(true).allow(null),   // .unknown(true) preserves frames/layers
  thumbnail_url: Joi.string().allow(null, ''),
  width: Joi.number().integer().min(1).max(10000).default(1920),
  height: Joi.number().integer().min(1).max(10000).default(1080),
  is_public: Joi.boolean().default(false),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  tags: Joi.array().items(Joi.string().max(50)).max(20),
  template_id: Joi.string().max(100).allow(null),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(255).trim(),
  description: Joi.string().max(1000).trim().allow(null, ''),
  canvas_data: Joi.object().unknown(true).allow(null),   // .unknown(true) preserves frames/layers
  thumbnail_url: Joi.string().allow(null, ''),
  width: Joi.number().integer().min(1).max(10000),
  height: Joi.number().integer().min(1).max(10000),
  is_public: Joi.boolean(),
  status: Joi.string().valid('draft', 'published', 'archived'),
  tags: Joi.array().items(Joi.string().max(50)).max(20),
}).min(1);

const listProjectsQuerySchema = Joi.object({
  page: Joi.number().integer().min(0).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('draft', 'published', 'archived'),
  is_public: Joi.boolean(),
  search: Joi.string().max(100).trim(),
  q: Joi.string().max(100).trim(),
  tag: Joi.string().max(50).trim(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
  updatedStartDate: Joi.date().iso(),
  updatedEndDate: Joi.date().iso(),
  updated_start_date: Joi.date().iso(),
  updated_end_date: Joi.date().iso(),
  minWidth: Joi.number().integer().min(1),
  maxWidth: Joi.number().integer().min(1),
  minHeight: Joi.number().integer().min(1),
  maxHeight: Joi.number().integer().min(1),
  sort_by: Joi.string().valid('created_at', 'updated_at', 'name', 'width', 'height'),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'name', 'width', 'height'),
  sort_order: Joi.string().valid('asc', 'desc'),
  sortOrder: Joi.string().valid('asc', 'desc'),
});

const listPublicProjectsQuerySchema = Joi.object({
  page: Joi.number().integer().min(0).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(100).trim(),
  q: Joi.string().max(100).trim(),
  tag: Joi.string().max(50).trim(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
  sort_by: Joi.string().valid('created_at', 'updated_at', 'name').default('created_at'),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'name'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc'),
  sortOrder: Joi.string().valid('asc', 'desc'),
});

const projectIdParamSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
  listPublicProjectsQuerySchema,
  projectIdParamSchema,
};
