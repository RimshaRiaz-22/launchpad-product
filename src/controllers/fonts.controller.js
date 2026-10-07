// src/controllers/fonts.controller.js — Font request handlers
'use strict';

const fontsService = require('../services/fonts.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const listFonts = asyncHandler(async (req, res) => {
  const filters = { ...req.query, user_id: req.user?.id };
  const result = await fontsService.listFonts(filters);
  return ApiResponse.paginated(res, result.data, result.meta, 'Fonts retrieved successfully');
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await fontsService.getCategories();
  return ApiResponse.success(res, { categories }, 'Font categories retrieved successfully');
});

const getFont = asyncHandler(async (req, res) => {
  const font = await fontsService.getFontById(req.params.fontId);
  return ApiResponse.success(res, { font }, 'Font retrieved successfully');
});

const createFont = asyncHandler(async (req, res) => {
  const font = await fontsService.createFont(req.user.id, req.body);
  return ApiResponse.created(res, { font }, 'Font registered successfully');
});

const deleteFont = asyncHandler(async (req, res) => {
  await fontsService.deleteFont(req.params.fontId, req.user.id, req.user.role);
  return ApiResponse.noContent(res);
});

module.exports = {
  listFonts,
  getCategories,
  getFont,
  createFont,
  deleteFont,
};
