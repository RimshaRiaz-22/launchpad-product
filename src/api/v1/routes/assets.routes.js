// src/api/v1/routes/assets.routes.js — Unified asset routes (user uploads + library + admin)
'use strict';

const { Router } = require('express');
const assetsController = require('../../../controllers/assets.controller');
const { authenticate, optionalAuthenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { attachEntitlements, checkStorageLimit } = require('../../../middlewares/entitlements.middleware');
const validate = require('../../../middlewares/validate.middleware');
const { uploadSingle, uploadMultiple } = require('../../../middlewares/upload.middleware');
const { uploadLimiter } = require('../../../middlewares/rateLimiter.middleware');
const {
  listAssetsQuerySchema,
  assetIdParamSchema,
  updateAssetSchema,
} = require('../../../validators/assets.validator');

const router = Router();

// ── Library / panel endpoints (public or optional auth) ───────
// GET /assets/public?type=mockup  → built-in + user assets of a type
router.get('/public', optionalAuthenticate, assetsController.listPublicAssets);

// GET /assets/groups?type=shape   → grouped built-in assets (shapes panel)
router.get('/groups', optionalAuthenticate, assetsController.getGroupedAssets);

// GET /assets/categories?type=mockup → distinct categories for an asset type
router.get('/categories', optionalAuthenticate, assetsController.getCategories);

// GET /assets/cloudinary-config → safe public client config for Cloudinary
router.get('/cloudinary-config', optionalAuthenticate, assetsController.getCloudinaryConfig);

// POST /assets/cloudinary-signature → generate signature for signed direct uploads
router.post('/cloudinary-signature', authenticate, assetsController.getCloudinarySignature);

// ── Admin-only asset CRUD endpoints ──────────────────────────
// These must come BEFORE authenticate so /admin routes aren't matched by /:assetId
const adminRouter = Router();
adminRouter.use(authenticate, authorize('admin'));

// GET  /assets/admin?type=mockup&category=Phones → admin list all assets
adminRouter.get('/', assetsController.adminListAssets);

// POST /assets/admin → admin create a built-in asset (JSON body)
adminRouter.post('/', assetsController.adminCreateAsset);

// POST /assets/admin/upload → admin upload a file as a built-in asset
adminRouter.post('/upload', uploadSingle('file'), assetsController.adminUploadAsset);

// POST /assets/admin/bulk-upload → admin upload multiple files in bulk
adminRouter.post('/bulk-upload', uploadMultiple('files', 100), assetsController.adminBulkUploadAssets);

// POST /assets/admin/bulk-delete → admin bulk delete assets
adminRouter.post('/bulk-delete', assetsController.adminBulkDeleteAssets);
adminRouter.delete('/bulk', assetsController.adminBulkDeleteAssets);

// PATCH /assets/admin/:assetId → admin update any asset
adminRouter.patch('/:assetId', assetsController.adminUpdateAsset);

// DELETE /assets/admin/:assetId → admin delete any asset
adminRouter.delete('/:assetId', assetsController.adminDeleteAsset);

router.use('/admin', adminRouter);

// ── Authenticated user-upload endpoints ───────────────────────
router.use(authenticate, attachEntitlements);

router.get('/',
  validate({ query: listAssetsQuerySchema }),
  assetsController.listAssets
);

router.post('/',
  uploadLimiter,
  uploadSingle('file'),
  checkStorageLimit(),
  assetsController.uploadAsset
);

router.get('/:assetId',
  validate({ params: assetIdParamSchema }),
  assetsController.getAsset
);

router.patch('/:assetId',
  validate({ params: assetIdParamSchema, body: updateAssetSchema }),
  assetsController.updateAsset
);

router.delete('/:assetId',
  validate({ params: assetIdParamSchema }),
  assetsController.deleteAsset
);

module.exports = router;
