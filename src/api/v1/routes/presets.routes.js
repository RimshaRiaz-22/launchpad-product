// src/api/v1/routes/presets.routes.js — Showcase formats & device preset sizes routes
'use strict';

const { Router } = require('express');
const presetsController = require('../../../controllers/presets.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const { httpCache } = require('../../../middlewares/httpCache.middleware');

const router = Router();

/* ── Public routes (Client & Viewer, cached for 60s) ────────────────────────── */

router.get('/public', httpCache(60, 180), presetsController.getPublicPresets);
router.get('/formats', httpCache(60, 180), presetsController.listFormats);
router.get('/sizes', httpCache(60, 180), presetsController.listPresets);
router.get('/formats/:id', httpCache(60, 180), presetsController.getFormat);
router.get('/sizes/:id', httpCache(60, 180), presetsController.getPreset);

/* ── Admin-only CRUD routes ─────────────────────────────────────────────────── */

router.use(authenticate, authorize('admin'));

// Showcase Formats
router.post('/formats', presetsController.createFormat);
router.put('/formats/:id', presetsController.updateFormat);
router.patch('/formats/:id', presetsController.updateFormat);
router.delete('/formats/:id', presetsController.deleteFormat);
router.post('/formats/:id/reorder', presetsController.reorderFormat);

// Device Preset Sizes
router.post('/sizes', presetsController.createPreset);
router.put('/sizes/:id', presetsController.updatePreset);
router.patch('/sizes/:id', presetsController.updatePreset);
router.delete('/sizes/:id', presetsController.deletePreset);
router.post('/sizes/:id/reorder', presetsController.reorderPreset);

module.exports = router;
