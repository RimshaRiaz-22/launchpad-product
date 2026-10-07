// src/api/v1/routes/assetCategories.routes.js — Asset category & subcategory management routes
'use strict';

const { Router } = require('express');
const ctrl = require('../../../controllers/assetCategories.controller');
const { authenticate, optionalAuthenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { httpCache } = require('../../../middlewares/httpCache.middleware');

const router = Router();

// ── Public / optional-auth endpoints (cached for 60s) ──────────────────────────
// GET /asset-categories?type=mockup&tree=true
router.get('/', httpCache(60, 180), optionalAuthenticate, ctrl.listCategories);

// GET /asset-categories/:categoryId
router.get('/:categoryId', httpCache(60, 180), optionalAuthenticate, ctrl.getCategory);

// GET /asset-categories/:categoryId/subcategories
router.get('/:categoryId/subcategories', httpCache(60, 180), optionalAuthenticate, ctrl.listSubcategories);

// ── Admin-only endpoints ───────────────────────────────────────────────────────
router.use(authenticate, authorize('admin'));

// Category CRUD
router.post('/', ctrl.createCategory);
router.patch('/:categoryId', ctrl.updateCategory);
router.delete('/:categoryId', ctrl.deleteCategory);
router.post('/:categoryId/reorder', ctrl.reorderCategory);

// Subcategory CRUD
router.post('/:categoryId/subcategories', ctrl.createSubcategory);
router.patch('/:categoryId/subcategories/:subId', ctrl.updateSubcategory);
router.delete('/:categoryId/subcategories/:subId', ctrl.deleteSubcategory);
router.post('/:categoryId/subcategories/:subId/reorder', ctrl.reorderSubcategory);

module.exports = router;
