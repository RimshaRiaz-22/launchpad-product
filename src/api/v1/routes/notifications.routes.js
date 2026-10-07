// src/api/v1/routes/notifications.routes.js — Notifications, Templates, Inbox & FCM Push Routes
'use strict';

const { Router } = require('express');
const notificationsController = require('../../../controllers/notifications.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');

const router = Router();

// All notification endpoints require user authentication
router.use(authenticate);

// ── User In-App Inbox & Token Endpoints (Available to all authenticated users) ──
router.get('/inbox', notificationsController.getUserInbox);
router.patch('/inbox/:id/read', notificationsController.markAsRead);
router.post('/inbox/read-all', notificationsController.markAllAsRead);
router.post('/device-token', notificationsController.registerDeviceToken);

// ── Admin-Only Notification Management & Templates ──
router.use(authorize('admin'));

// Templates catalog & dispatching
router.get('/templates', notificationsController.getTemplatesCatalog);
router.post('/templates/:templateId/preview', notificationsController.previewTemplate);
router.post('/templates/:templateId/dispatch', notificationsController.dispatchTemplate);

// Device token telemetry
router.get('/devices', notificationsController.getDeviceStats);

// Broadcast history & custom dispatch
router.get('/', notificationsController.listNotifications);
router.post('/broadcast', notificationsController.broadcastNotification);
router.post('/test', notificationsController.testFirebase);
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
