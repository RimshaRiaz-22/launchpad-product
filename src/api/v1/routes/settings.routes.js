// src/api/v1/routes/settings.routes.js — Administrative system & platform settings routes
"use strict";

const { Router } = require("express");
const settingsController = require("../../../controllers/settings.controller");
const { authenticate, optionalAuthenticate } = require("../../../middlewares/auth.middleware");
const { authorize } = require("../../../middlewares/rbac.middleware");
const { httpCache } = require("../../../middlewares/httpCache.middleware");

const router = Router();

// GET /api/v1/settings — Retrieve global platform settings (publicly readable with optional auth, cached for 60s)
router.get("/", httpCache(60, 180), optionalAuthenticate, settingsController.getSettings);

// PUT /api/v1/settings — Update global platform settings (Admin only)
router.put("/", authenticate, authorize("admin"), settingsController.updateSettings);

module.exports = router;
