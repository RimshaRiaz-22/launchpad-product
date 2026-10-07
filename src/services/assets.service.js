// src/services/assets.service.js — Unified asset management (user uploads + built-in library)
'use strict';

const path = require('path');
const fs = require('fs');
const assetsRepo = require('../repositories/assets.repository');
const auditLogsService = require('./auditLogs.service');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination.utils');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger.config');
const config = require('../config/app.config');
const cloudinaryService = require('./cloudinary.service');

// Storage quota per plan
const STORAGE_LIMITS = {
  free: 100 * 1024 * 1024,        // 100 MB
  pro: 5 * 1024 * 1024 * 1024,   // 5 GB
  team: 20 * 1024 * 1024 * 1024, // 20 GB
  enterprise: Infinity,
};

// All valid asset types across the unified system
const ASSET_TYPES = ['image', 'illustration', 'icon', 'mockup', 'shape', 'svg', 'badge', 'sticker', 'video', 'font', 'json', 'other'];

/**
 * Upload and register a new user asset.
 */
const uploadAsset = async (userId, userPlan, file, extraData = {}) => {
  const used = await assetsRepo.getUserStorageUsed(userId);
  const limit = STORAGE_LIMITS[userPlan] || STORAGE_LIMITS.free;

  if (used + (file.size || 0) > limit) {
    throw ApiError.badRequest('Storage quota exceeded. Please upgrade your plan.', 'STORAGE_QUOTA_EXCEEDED');
  }

  if (!cloudinaryService.isCloudinaryConfigured()) {
    throw ApiError.internal('Cloud storage service (Cloudinary) is not configured', 'STORAGE_SERVICE_UNAVAILABLE');
  }

  let cRes;
  try {
    cRes = await cloudinaryService.uploadMedia(file, {
      folder: `${config.cloudinary.folder || 'launchpad'}/users/${userId}`,
      tags: ['user_upload', `user_${userId}`],
      resource_type: 'auto',
    });
  } catch (cErr) {
    logger.error('Cloudinary upload failed for user asset', { error: cErr.message, userId });
    throw ApiError.badRequest(`Failed to upload to Cloudinary: ${cErr.message}`, 'CLOUDINARY_UPLOAD_FAILED');
  }

  const fileUrl = cRes.secure_url || cRes.url;
  const cloudinaryPublicId = cRes.public_id;

  const asset = await assetsRepo.create({
    user_id: userId,
    name: extraData.name || file.originalname,
    type: extraData.type || deriveAssetType(file.mimetype),
    file_path: null,
    file_url: fileUrl,
    file_size: file.size || cRes.bytes || 0,
    mime_type: file.mimetype,
    is_builtin: false,
    category: extraData.category || 'User Uploads',
    metadata: {
      originalName: file.originalname,
      fieldName: file.fieldname,
      cloudinary_public_id: cloudinaryPublicId,
      width: cRes.width || null,
      height: cRes.height || null,
      source: 'user_upload',
      ...extraData.metadata,
    },
  });

  logger.info('Asset uploaded to Cloudinary', { assetId: asset.id, userId, size: file.size, publicId: cloudinaryPublicId });

  auditLogsService.logEvent({
    user_id: userId,
    action: 'asset.upload',
    resource_type: 'asset',
    resource_id: asset.id,
    metadata: {
      name: asset.name,
      file_size: file.size,
      mime_type: file.mimetype,
      type: asset.type,
      file_url: fileUrl,
      cloudinary: true,
      cloudinary_public_id: cloudinaryPublicId,
    },
  }).catch(() => {});

  return asset;
};

/**
 * Get a single asset (owner only).
 */
const getAsset = async (assetId, userId) => {
  const asset = await assetsRepo.findByIdAndUser(assetId, userId);
  if (!asset) throw ApiError.notFound('Asset not found', 'ASSET_NOT_FOUND');
  return asset;
};

/**
 * Update asset name / metadata.
 */
const updateAsset = async (assetId, userId, data) => {
  const asset = await assetsRepo.findByIdAndUser(assetId, userId);
  if (!asset) throw ApiError.notFound('Asset not found', 'ASSET_NOT_FOUND');
  return assetsRepo.update(assetId, userId, data);
};

/**
 * Delete an asset and its physical file.
 */
const deleteAsset = async (assetId, userId) => {
  const asset = await assetsRepo.findByIdAndUser(assetId, userId);
  if (!asset) throw ApiError.notFound('Asset not found', 'ASSET_NOT_FOUND');

  await assetsRepo.remove(assetId, userId);

  // Cloudinary cleanup
  let meta = asset.metadata;
  if (typeof meta === 'string') {
    try { meta = JSON.parse(meta); } catch (_) {}
  }
  const cPublicId = meta?.cloudinary_public_id;
  if (cPublicId) {
    const resourceType = asset.type === 'video' ? 'video' : (['font', 'json', 'other'].includes(asset.type) ? 'raw' : 'image');
    cloudinaryService.deleteFile(cPublicId, { resource_type: resourceType }).catch(() => {});
  }

  if (asset.file_path && fs.existsSync(asset.file_path)) {
    fs.unlink(asset.file_path, () => {});
  }

  logger.info('Asset deleted', { assetId, userId });

  auditLogsService.logEvent({
    user_id: userId,
    action: 'asset.delete',
    resource_type: 'asset',
    resource_id: assetId,
    severity: 'warning',
    metadata: {
      name: asset.name,
      type: asset.type,
      file_size: asset.file_size,
    },
  }).catch(() => {});
};

/**
 * List the current user's own uploaded assets (filtered, paginated).
 */
const listAssets = async (userId, query) => {
  const result = await assetsRepo.findManyByUser(userId, query);
  const storageUsed = await assetsRepo.getUserStorageUsed(userId);

  return {
    assets: result.data,
    pagination: result.meta,
    storage: {
      used: storageUsed,
      usedMb: (storageUsed / (1024 * 1024)).toFixed(2),
    },
  };
};

/**
 * List public (built-in) assets of a given type PLUS any user-uploaded ones.
 * Used by panel tabs: devices, shapes (flat), images, illustrations, icons.
 */
const listPublicAssets = async (type, userId, query = {}) => {
  if (!ASSET_TYPES.includes(type)) {
    throw ApiError.badRequest(`Invalid asset type "${type}"`, 'INVALID_ASSET_TYPE');
  }
  const result = await assetsRepo.findPublicByType(type, userId, query);
  return {
    assets: result.data,
    pagination: result.meta,
  };
};

/**
 * Return assets of a given type grouped by group_id / group_label.
 * Used for the Shapes tab which renders categorised groups.
 */
const getGroupedAssets = async (type) => {
  if (!ASSET_TYPES.includes(type)) {
    throw ApiError.badRequest(`Invalid asset type "${type}"`, 'INVALID_ASSET_TYPE');
  }
  return assetsRepo.getGroupedByType(type);
};

/**
 * Return distinct categories for built-in assets, optionally filtered by type.
 */
const getCategories = async (type) => {
  if (type && !ASSET_TYPES.includes(type)) {
    throw ApiError.badRequest(`Invalid asset type "${type}"`, 'INVALID_ASSET_TYPE');
  }
  return assetsRepo.getCategories(type);
};

// ─────────────────────────────────────────────────────────────────
// Admin — bypass user restrictions
// ─────────────────────────────────────────────────────────────────

/**
 * Admin: paginated list of all assets (no user restriction).
 */
const adminListAssets = async (query = {}) => {
  const result = await assetsRepo.adminFindMany(query);
  return { assets: result.data, pagination: result.meta };
};

/**
 * Admin: create a built-in platform asset (SVG data-URI, external URL, or local path).
 * Does not require a file upload — the URL/data can be passed directly as file_url.
 */
const adminCreateAsset = async (data) => {
  if (!data.name) throw ApiError.badRequest('name is required', 'NAME_REQUIRED');
  if (!data.type || !ASSET_TYPES.includes(data.type)) {
    throw ApiError.badRequest(`Invalid asset type. Must be one of: ${ASSET_TYPES.join(', ')}`, 'INVALID_ASSET_TYPE');
  }

  const slug = require('../utils/slugify')(data.name);
  const id = data.id || `${data.type}-${slug}-${Date.now().toString(36)}`;

  let fileUrl = data.file_url || null;
  let mimeType = data.mime_type || (data.type === 'mockup' || data.type === 'badge' || data.type === 'icon' || data.type === 'shape' ? 'image/svg+xml' : 'application/octet-stream');

  // If raw SVG code is provided, convert directly to SVG data-URI
  if (data.svg_code && typeof data.svg_code === 'string' && data.svg_code.trim()) {
    fileUrl = `data:image/svg+xml;utf8,${encodeURIComponent(data.svg_code.trim())}`;
    mimeType = 'image/svg+xml';
  }

  const asset = await assetsRepo.adminCreate({
    id,
    name: data.name,
    type: data.type,
    category: data.category || 'General',
    subcategory: data.subcategory || null,
    file_url: fileUrl,
    file_path: data.file_path || null,
    file_size: data.file_size || (fileUrl ? fileUrl.length : 0),
    mime_type: mimeType,
    width: data.width || null,
    height: data.height || null,
    is_builtin: data.is_builtin !== undefined ? data.is_builtin : true,
    is_premium: data.is_premium !== undefined ? data.is_premium : false,
    use_count: data.use_count || 0,
    group_id: data.group_id || null,
    group_label: data.group_label || null,
    spec: data.spec ? (typeof data.spec === 'string' ? data.spec : JSON.stringify(data.spec)) : null,
    metadata: data.metadata ? (typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata)) : null,
  });

  logger.info('Admin asset created', { assetId: asset.id, type: data.type });
  return asset;
};

/**
 * Admin: update any asset regardless of owner.
 */
const adminUpdateAsset = async (assetId, data) => {
  const asset = await assetsRepo.findById(assetId);
  if (!asset) throw ApiError.notFound('Asset not found', 'ASSET_NOT_FOUND');

  const allowed = ['name', 'type', 'category', 'subcategory', 'file_url', 'svg_code', 'width', 'height',
    'is_premium', 'is_builtin', 'use_count', 'group_id', 'group_label', 'spec', 'metadata'];
  const updates = {};
  allowed.forEach((k) => { if (data[k] !== undefined) updates[k] = data[k]; });
  if (data.spec && typeof data.spec === 'object') updates.spec = JSON.stringify(data.spec);
  if (data.metadata && typeof data.metadata === 'object') updates.metadata = JSON.stringify(data.metadata);

  return assetsRepo.adminUpdate(assetId, updates);
};

/**
 * Admin: delete any asset (including built-ins).
 * Attempts to clean up physical file if file_path exists.
 */
const adminDeleteAsset = async (assetId) => {
  const asset = await assetsRepo.findById(assetId);
  if (!asset) throw ApiError.notFound('Asset not found', 'ASSET_NOT_FOUND');
  await assetsRepo.adminRemove(assetId);

  // Cloudinary cleanup
  let meta = asset.metadata;
  if (typeof meta === 'string') {
    try { meta = JSON.parse(meta); } catch (_) {}
  }
  const cPublicId = meta?.cloudinary_public_id;
  if (cPublicId) {
    const resourceType = asset.type === 'video' ? 'video' : (['font', 'json', 'other'].includes(asset.type) ? 'raw' : 'image');
    cloudinaryService.deleteFile(cPublicId, { resource_type: resourceType }).catch(() => {});
  }

  if (asset.file_path && fs.existsSync(asset.file_path)) {
    fs.unlink(asset.file_path, () => {});
  }
  logger.info('Admin asset deleted', { assetId });
};

/**
 * Admin: bulk delete assets by IDs.
 */
const adminBulkDeleteAssets = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw ApiError.badRequest('ids array is required', 'IDS_REQUIRED');
  }

  // Attempt to cleanup Cloudinary files where possible
  for (const id of ids) {
    try {
      const asset = await assetsRepo.findById(id);
      if (asset) {
        let meta = asset.metadata;
        if (typeof meta === 'string') {
          try { meta = JSON.parse(meta); } catch (_) {}
        }
        if (meta?.cloudinary_public_id) {
          const resourceType = asset.type === 'video' ? 'video' : (['font', 'json', 'other'].includes(asset.type) ? 'raw' : 'image');
          cloudinaryService.deleteFile(meta.cloudinary_public_id, { resource_type: resourceType }).catch(() => {});
        }
        if (asset.file_path && fs.existsSync(asset.file_path)) {
          fs.unlink(asset.file_path, () => {});
        }
      }
    } catch (_) {}
  }

  const count = await assetsRepo.adminBulkRemove(ids);
  logger.info('Admin bulk assets deleted', { count, idsCount: ids.length });
  return { count };
};

/**
 * Admin: upload a file and register it as an asset (built-in or user-uploaded).
 */
const adminUploadAsset = async (file, extraData = {}) => {
  if (!cloudinaryService.isCloudinaryConfigured()) {
    throw ApiError.internal('Cloud storage service (Cloudinary) is not configured', 'STORAGE_SERVICE_UNAVAILABLE');
  }

  let cRes;
  try {
    cRes = await cloudinaryService.uploadMedia(file, {
      folder: `${config.cloudinary.folder || 'launchpad'}/admin`,
      tags: ['admin_asset', extraData.category || 'general'],
      resource_type: 'auto',
    });
  } catch (cErr) {
    logger.error('Cloudinary upload failed for admin asset', { error: cErr.message });
    throw ApiError.badRequest(`Failed to upload to Cloudinary: ${cErr.message}`, 'CLOUDINARY_UPLOAD_FAILED');
  }

  const fileUrl = cRes.secure_url || cRes.url;
  const cloudinaryPublicId = cRes.public_id;

  const type = extraData.type || deriveAssetType(file.mimetype);
  const slug = require('../utils/slugify')(file.originalname.replace(/\.[^.]+$/, ''));
  const id = extraData.id || `${type}-${slug}-${Date.now().toString(36)}`;

  const asset = await assetsRepo.adminCreate({
    id,
    name: extraData.name || file.originalname,
    type,
    category: extraData.category || 'General',
    subcategory: extraData.subcategory || null,
    file_path: null,
    file_url: fileUrl,
    file_size: file.size || cRes.bytes || 0,
    mime_type: file.mimetype,
    is_builtin: extraData.is_builtin !== undefined ? extraData.is_builtin : true,
    is_premium: extraData.is_premium !== undefined ? extraData.is_premium : false,
    width: extraData.width ? Number(extraData.width) : (cRes.width || null),
    height: extraData.height ? Number(extraData.height) : (cRes.height || null),
    spec: extraData.spec ? (typeof extraData.spec === 'string' ? extraData.spec : JSON.stringify(extraData.spec)) : null,
    metadata: JSON.stringify({
      originalName: file.originalname,
      cloudinary_public_id: cloudinaryPublicId,
      width: cRes.width || null,
      height: cRes.height || null,
      ...extraData.metadata,
    }),
  });

  logger.info('Admin asset uploaded to Cloudinary', { assetId: asset.id, type, publicId: cloudinaryPublicId });
  return asset;
};

/**
 * Admin: upload multiple files and register each as an asset.
 * @param {Array<File>} files
 * @param {Object} extraData
 */
const adminBulkUploadAssets = async (files = [], extraData = {}) => {
  const results = [];
  for (const file of files) {
    const cleanName = path.parse(file.originalname).name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const assetData = {
      ...extraData,
      name: cleanName || extraData.name || 'Asset',
    };
    const asset = await adminUploadAsset(file, assetData);
    results.push(asset);
  }
  return results;
};

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────
const deriveAssetType = (mimeType) => {
  if (mimeType.startsWith('image/svg')) return 'svg';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/json') return 'json';
  if (mimeType.startsWith('font/') || mimeType.includes('font')) return 'font';
  return 'other';
};

module.exports = {
  uploadAsset,
  getAsset,
  updateAsset,
  deleteAsset,
  listAssets,
  listPublicAssets,
  getGroupedAssets,
  getCategories,
  adminListAssets,
  adminCreateAsset,
  adminUpdateAsset,
  adminDeleteAsset,
  adminBulkDeleteAssets,
  adminUploadAsset,
  adminBulkUploadAssets,
};
