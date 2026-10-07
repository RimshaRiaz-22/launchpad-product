// src/controllers/assets.controller.js — Unified asset request handlers
'use strict';

const assetsService = require('../services/assets.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/** POST /api/v1/assets — Upload a new user asset */
const uploadAsset = asyncHandler(async (req, res) => {
  if (!req.file) {
    const ApiError = require('../utils/ApiError');
    throw ApiError.badRequest('No file provided', 'NO_FILE');
  }

  const asset = await assetsService.uploadAsset(
    req.user.id,
    req.user.plan || 'free',
    req.file,
    { type: req.body.type, metadata: req.body.metadata ? JSON.parse(req.body.metadata) : undefined }
  );
  return ApiResponse.created(res, { asset }, 'Asset uploaded successfully');
});

/** GET /api/v1/assets — List the authenticated user's own assets */
const listAssets = asyncHandler(async (req, res) => {
  const result = await assetsService.listAssets(req.user.id, req.query);
  const { assets, pagination, storage } = result;

  return res.status(200).json({
    success: true,
    message: 'Assets retrieved successfully',
    data: assets,
    meta: { pagination, storage },
  });
});

/** GET /api/v1/assets/public?type=mockup — Built-in + user assets for a given type */
const listPublicAssets = asyncHandler(async (req, res) => {
  const { type, ...rest } = req.query;
  if (!type) {
    const ApiError = require('../utils/ApiError');
    throw ApiError.badRequest('Query param "type" is required', 'TYPE_REQUIRED');
  }

  const result = await assetsService.listPublicAssets(type, req.user?.id, rest);
  return ApiResponse.paginated(res, result.assets, result.pagination, `${type} assets retrieved successfully`);
});

/** GET /api/v1/assets/groups?type=shape — Grouped assets (for Shapes panel) */
const getGroupedAssets = asyncHandler(async (req, res) => {
  const { type = 'shape' } = req.query;
  const groups = await assetsService.getGroupedAssets(type);
  return ApiResponse.success(res, { groups }, 'Asset groups retrieved successfully');
});

/** GET /api/v1/assets/categories?type=mockup — Distinct categories for built-in assets */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await assetsService.getCategories(req.query.type);
  return ApiResponse.success(res, { categories }, 'Asset categories retrieved successfully');
});

/** GET /api/v1/assets/:assetId — Get a single asset */
const getAsset = asyncHandler(async (req, res) => {
  const asset = await assetsService.getAsset(req.params.assetId, req.user.id);
  return ApiResponse.success(res, { asset }, 'Asset retrieved successfully');
});

/** PATCH /api/v1/assets/:assetId — Update asset name / metadata */
const updateAsset = asyncHandler(async (req, res) => {
  const asset = await assetsService.updateAsset(req.params.assetId, req.user.id, req.body);
  return ApiResponse.success(res, { asset }, 'Asset updated successfully');
});

/** DELETE /api/v1/assets/:assetId — Delete an asset */
const deleteAsset = asyncHandler(async (req, res) => {
  await assetsService.deleteAsset(req.params.assetId, req.user.id);
  return ApiResponse.noContent(res);
});

// ─── Admin handlers ───────────────────────────────────────────────────────────

/** GET /api/v1/assets/admin — Admin list all assets (any type, any user) */
const adminListAssets = asyncHandler(async (req, res) => {
  const result = await assetsService.adminListAssets(req.query);
  return res.status(200).json({
    success: true,
    message: 'Admin assets retrieved successfully',
    data: result.assets,
    meta: { pagination: result.pagination },
  });
});

/** POST /api/v1/assets/admin — Admin create a built-in asset (JSON body, no file needed) */
const adminCreateAsset = asyncHandler(async (req, res) => {
  const asset = await assetsService.adminCreateAsset(req.body);
  return ApiResponse.created(res, { asset }, 'Built-in asset created successfully');
});

/** POST /api/v1/assets/admin/upload — Admin upload a file as a built-in asset */
const adminUploadAsset = asyncHandler(async (req, res) => {
  if (!req.file) {
    const ApiError = require('../utils/ApiError');
    throw ApiError.badRequest('No file provided', 'NO_FILE');
  }
  let extraData = {};
  try {
    extraData = req.body.data ? JSON.parse(req.body.data) : req.body;
  } catch { extraData = req.body; }

  const asset = await assetsService.adminUploadAsset(req.file, extraData);
  return ApiResponse.created(res, { asset }, 'Asset uploaded successfully');
});

/** PATCH /api/v1/assets/admin/:assetId — Admin update any asset */
const adminUpdateAsset = asyncHandler(async (req, res) => {
  const asset = await assetsService.adminUpdateAsset(req.params.assetId, req.body);
  return ApiResponse.success(res, { asset }, 'Asset updated successfully');
});

/** DELETE /api/v1/assets/admin/:assetId — Admin delete any asset */
const adminDeleteAsset = asyncHandler(async (req, res) => {
  await assetsService.adminDeleteAsset(req.params.assetId);
  return ApiResponse.noContent(res);
});

/** POST /api/v1/assets/admin/bulk-upload — Admin upload multiple files in bulk */
const adminBulkUploadAssets = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files.length) {
    const ApiError = require('../utils/ApiError');
    throw ApiError.badRequest('No files provided', 'NO_FILES');
  }
  let extraData = {};
  try {
    extraData = req.body.data ? JSON.parse(req.body.data) : req.body;
  } catch { extraData = req.body; }

  const assets = await assetsService.adminBulkUploadAssets(files, extraData);
  return ApiResponse.created(res, { assets, count: assets.length }, `Successfully uploaded ${assets.length} assets`);
});

/** POST /api/v1/assets/admin/bulk-delete — Admin bulk delete assets */
const adminBulkDeleteAssets = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  const result = await assetsService.adminBulkDeleteAssets(ids);
  return ApiResponse.success(res, result, 'Assets deleted successfully');
});

/** GET /api/v1/assets/cloudinary-config — Get safe client config for Cloudinary */
const getCloudinaryConfig = asyncHandler(async (req, res) => {
  const cloudinaryService = require('../services/cloudinary.service');
  return ApiResponse.success(res, cloudinaryService.getClientConfig(), 'Cloudinary configuration retrieved');
});

/** POST /api/v1/assets/cloudinary-signature — Generate signature for direct signed client uploads */
const getCloudinarySignature = asyncHandler(async (req, res) => {
  const cloudinaryService = require('../services/cloudinary.service');
  const signatureData = cloudinaryService.generateSignature(req.body);
  return ApiResponse.success(res, signatureData, 'Cloudinary signature generated');
});

module.exports = {
  uploadAsset,
  listAssets,
  listPublicAssets,
  getGroupedAssets,
  getCategories,
  getAsset,
  updateAsset,
  deleteAsset,
  adminListAssets,
  adminCreateAsset,
  adminUploadAsset,
  adminBulkUploadAssets,
  adminUpdateAsset,
  adminDeleteAsset,
  adminBulkDeleteAssets,
  getCloudinaryConfig,
  getCloudinarySignature,
};
