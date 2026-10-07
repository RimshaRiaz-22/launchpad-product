// src/controllers/fontCategories.controller.js — HTTP handlers for font category management
'use strict';

const fontCategoriesService = require('../services/fontCategories.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/font-categories
 * Query: include_inactive?
 */
const listCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.query.include_inactive === 'true';
  const categories = await fontCategoriesService.listCategories(includeInactive);
  return ApiResponse.success(res, { categories }, 'Font categories retrieved successfully');
});

/**
 * GET /api/v1/font-categories/:categoryId
 */
const getCategory = asyncHandler(async (req, res) => {
  const cat = await fontCategoriesService.getCategory(req.params.categoryId);
  return ApiResponse.success(res, { category: cat }, 'Font category retrieved successfully');
});

/**
 * POST /api/v1/font-categories (admin)
 */
const createCategory = asyncHandler(async (req, res) => {
  const cat = await fontCategoriesService.createCategory(req.body);
  return ApiResponse.created(res, { category: cat }, 'Font category created successfully');
});

/**
 * PATCH /api/v1/font-categories/:categoryId (admin)
 */
const updateCategory = asyncHandler(async (req, res) => {
  const cat = await fontCategoriesService.updateCategory(req.params.categoryId, req.body);
  return ApiResponse.success(res, { category: cat }, 'Font category updated successfully');
});

/**
 * DELETE /api/v1/font-categories/:categoryId (admin)
 */
const deleteCategory = asyncHandler(async (req, res) => {
  await fontCategoriesService.deleteCategory(req.params.categoryId);
  return ApiResponse.noContent(res);
});

/**
 * POST /api/v1/font-categories/:categoryId/reorder (admin)
 * Body: { direction: 'up' | 'down' }
 */
const reorderCategory = asyncHandler(async (req, res) => {
  await fontCategoriesService.reorderCategory(req.params.categoryId, req.body.direction);
  return ApiResponse.success(res, null, 'Font category reordered successfully');
});

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategory,
};
