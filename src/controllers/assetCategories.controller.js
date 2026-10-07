// src/controllers/assetCategories.controller.js — HTTP handlers for asset categories & subcategories
'use strict';

const assetCategoriesService = require('../services/assetCategories.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─── Category handlers ────────────────────────────────────────────────────────

/**
 * GET /api/v1/asset-categories
 * Query: type?, include_inactive?, tree?
 */
const listCategories = asyncHandler(async (req, res) => {
  const assetType = req.query.type || null;
  const includeInactive = req.query.include_inactive === 'true';
  const tree = req.query.tree === 'true';

  const data = tree
    ? await assetCategoriesService.getCategoryTree(assetType, includeInactive)
    : await assetCategoriesService.listCategories(assetType, includeInactive);

  return ApiResponse.success(res, { categories: data }, 'Asset categories retrieved successfully');
});

/**
 * GET /api/v1/asset-categories/:categoryId
 */
const getCategory = asyncHandler(async (req, res) => {
  const cat = await assetCategoriesService.getCategory(req.params.categoryId);
  return ApiResponse.success(res, { category: cat }, 'Category retrieved successfully');
});

/**
 * POST /api/v1/asset-categories (admin)
 */
const createCategory = asyncHandler(async (req, res) => {
  const cat = await assetCategoriesService.createCategory(req.body);
  return ApiResponse.created(res, { category: cat }, 'Category created successfully');
});

/**
 * PATCH /api/v1/asset-categories/:categoryId (admin)
 */
const updateCategory = asyncHandler(async (req, res) => {
  const cat = await assetCategoriesService.updateCategory(req.params.categoryId, req.body);
  return ApiResponse.success(res, { category: cat }, 'Category updated successfully');
});

/**
 * DELETE /api/v1/asset-categories/:categoryId (admin)
 */
const deleteCategory = asyncHandler(async (req, res) => {
  await assetCategoriesService.deleteCategory(req.params.categoryId);
  return ApiResponse.noContent(res);
});

/**
 * POST /api/v1/asset-categories/:categoryId/reorder (admin)
 * Body: { direction: 'up' | 'down' }
 */
const reorderCategory = asyncHandler(async (req, res) => {
  await assetCategoriesService.reorderCategory(req.params.categoryId, req.body.direction);
  return ApiResponse.success(res, null, 'Category reordered successfully');
});

// ─── Subcategory handlers ─────────────────────────────────────────────────────

/**
 * GET /api/v1/asset-categories/:categoryId/subcategories
 * Query: include_inactive?
 */
const listSubcategories = asyncHandler(async (req, res) => {
  const includeInactive = req.query.include_inactive === 'true';
  const subs = await assetCategoriesService.listSubcategories(req.params.categoryId, includeInactive);
  return ApiResponse.success(res, { subcategories: subs }, 'Subcategories retrieved successfully');
});

/**
 * POST /api/v1/asset-categories/:categoryId/subcategories (admin)
 */
const createSubcategory = asyncHandler(async (req, res) => {
  const sub = await assetCategoriesService.createSubcategory(req.params.categoryId, req.body);
  return ApiResponse.created(res, { subcategory: sub }, 'Subcategory created successfully');
});

/**
 * PATCH /api/v1/asset-categories/:categoryId/subcategories/:subId (admin)
 */
const updateSubcategory = asyncHandler(async (req, res) => {
  const sub = await assetCategoriesService.updateSubcategory(
    req.params.categoryId,
    req.params.subId,
    req.body
  );
  return ApiResponse.success(res, { subcategory: sub }, 'Subcategory updated successfully');
});

/**
 * DELETE /api/v1/asset-categories/:categoryId/subcategories/:subId (admin)
 */
const deleteSubcategory = asyncHandler(async (req, res) => {
  await assetCategoriesService.deleteSubcategory(req.params.categoryId, req.params.subId);
  return ApiResponse.noContent(res);
});

/**
 * POST /api/v1/asset-categories/:categoryId/subcategories/:subId/reorder (admin)
 * Body: { direction: 'up' | 'down' }
 */
const reorderSubcategory = asyncHandler(async (req, res) => {
  await assetCategoriesService.reorderSubcategory(
    req.params.categoryId,
    req.params.subId,
    req.body.direction
  );
  return ApiResponse.success(res, null, 'Subcategory reordered successfully');
});

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategory,
  listSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  reorderSubcategory,
};
