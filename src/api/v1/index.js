// src/api/v1/index.js — v1 API router aggregator
'use strict';

const { Router } = require('express');

const authRoutes      = require('./routes/auth.routes');
const usersRoutes     = require('./routes/users.routes');
const projectsRoutes  = require('./routes/projects.routes');
const assetsRoutes    = require('./routes/assets.routes');
const assetCategoriesRoutes = require('./routes/assetCategories.routes');
const templatesRoutes           = require('./routes/templates.routes');
const templateCategoriesRoutes  = require('./routes/templateCategories.routes');
const billingRoutes             = require('./routes/billing.routes');
const fontsRoutes          = require('./routes/fonts.routes');
const fontCategoriesRoutes = require('./routes/fontCategories.routes');
const mockupsRoutes   = require('./routes/mockups.routes');
const shapesRoutes    = require('./routes/shapes.routes');
const auditLogsRoutes = require('./routes/auditLogs.routes');
const adminAnalyticsRoutes = require('./routes/adminAnalytics.routes');
const presetsRoutes = require('./routes/presets.routes');
const settingsRoutes = require('./routes/settings.routes');
const notificationsRoutes = require('./routes/notifications.routes');

const router = Router();

// ── Health check ──────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'Launchpad API',
    version: 'v1',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API Routes ────────────────────────────────────────────────
router.use('/auth',            authRoutes);
router.use('/users',           usersRoutes);
router.use('/projects',        projectsRoutes);
router.use('/assets',          assetsRoutes);   // unified: user uploads + library (mockups, shapes, images, etc.)
router.use('/asset-categories', assetCategoriesRoutes); // categories + subcategories for assets
router.use('/mockups',         mockupsRoutes);
router.use('/shapes',          shapesRoutes);
router.use('/templates',         templatesRoutes);
router.use('/template-categories', templateCategoriesRoutes);
router.use('/presets',         presetsRoutes);
router.use('/billing',           billingRoutes);
router.use('/fonts',            fontsRoutes);
router.use('/font-categories',  fontCategoriesRoutes); // admin-managed font category definitions
router.use('/audit-logs',      auditLogsRoutes);
router.use('/admin/analytics', adminAnalyticsRoutes);
router.use('/settings',        settingsRoutes);
router.use('/notifications',   notificationsRoutes);

module.exports = router;
