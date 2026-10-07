// src/api/v1/routes/fontCategories.routes.js — Font category management routes
'use strict';

const { Router } = require('express');
const ctrl = require('../../../controllers/fontCategories.controller');
const { authenticate, optionalAuthenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { httpCache } = require('../../../middlewares/httpCache.middleware');

const router = Router();

// ── Public / optional-auth endpoints (cached for 60s) ──────────────────────────
// GET /font-categories
router.get('/', httpCache(60, 180), optionalAuthenticate, ctrl.listCategories);

// GET /font-categories/:categoryId
router.get('/:categoryId', httpCache(60, 180), optionalAuthenticate, ctrl.getCategory);

// ── Admin-only endpoints ───────────────────────────────────────────────────────
router.use(authenticate, authorize('admin'));

// POST /font-categories
router.post('/', ctrl.createCategory);

// PATCH /font-categories/:categoryId
router.patch('/:categoryId', ctrl.updateCategory);

// DELETE /font-categories/:categoryId
router.delete('/:categoryId', ctrl.deleteCategory);

// POST /font-categories/:categoryId/reorder
router.post('/:categoryId/reorder', ctrl.reorderCategory);

module.exports = router;
