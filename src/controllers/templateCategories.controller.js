// src/controllers/templateCategories.controller.js — Template categories handlers
"use strict";

const categoriesService = require("../services/templateCategories.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const listCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.query.include_inactive === "true";
  const categories = await categoriesService.listCategories(includeInactive);
  return ApiResponse.success(res, { categories }, "Categories retrieved successfully");
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.createCategory(req.body);
  return ApiResponse.created(res, { category }, "Category created successfully");
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.updateCategory(req.params.categoryId, req.body);
  return ApiResponse.success(res, { category }, "Category updated successfully");
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoriesService.deleteCategory(req.params.categoryId, req.body.reassign_to || req.query.reassign_to);
  return ApiResponse.noContent(res);
});

const reorderCategory = asyncHandler(async (req, res) => {
  await categoriesService.reorderCategory(req.params.categoryId, req.body.direction);
  return ApiResponse.success(res, {}, "Category reordered");
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory, reorderCategory };
