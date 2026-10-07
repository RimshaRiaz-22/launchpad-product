// src/controllers/notifications.controller.js — Notifications, Templates, In-App & Push Handlers
'use strict';

const notificationsService = require('../services/notifications.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/notifications/templates
 * Admin: List notification templates catalog and schema.
 */
const getTemplatesCatalog = asyncHandler(async (req, res) => {
  const catalog = notificationsService.getTemplatesCatalog();
  return ApiResponse.success(res, { templates: catalog }, 'Notification templates catalog retrieved');
});

/**
 * POST /api/v1/notifications/templates/:templateId/preview
 * Admin: Preview a compiled notification template.
 */
const previewTemplate = asyncHandler(async (req, res) => {
  const preview = notificationsService.previewTemplateNotification({
    templateId: req.params.templateId,
    params: req.body.params || req.body,
  });
  return ApiResponse.success(res, preview, 'Template preview compiled successfully');
});

/**
 * POST /api/v1/notifications/templates/:templateId/dispatch
 * Admin: Dispatch a notification using a registered template.
 */
const dispatchTemplate = asyncHandler(async (req, res) => {
  const result = await notificationsService.dispatchTemplateNotification(
    {
      templateId: req.params.templateId,
      params: req.body.params || {},
      audience: req.body.audience || 'all',
      channel: req.body.channel || 'push_and_inapp',
    },
    req.user,
    req.ip || req.connection?.remoteAddress
  );
  return ApiResponse.created(res, { notification: result }, 'Template notification dispatched successfully');
});

/**
 * GET /api/v1/notifications
 * Admin: List sent push and in-app broadcast history.
 */
const listNotifications = asyncHandler(async (req, res) => {
  const result = await notificationsService.listNotifications(req.query);
  return ApiResponse.success(res, result, 'Notification broadcast history retrieved');
});

/**
 * POST /api/v1/notifications/broadcast
 * Admin: Dispatch a custom push/in-app broadcast.
 */
const broadcastNotification = asyncHandler(async (req, res) => {
  const notification = await notificationsService.broadcastNotification(
    req.body,
    req.user,
    req.ip || req.connection?.remoteAddress
  );
  return ApiResponse.created(res, { notification }, 'Notification broadcast dispatched successfully');
});

/**
 * GET /api/v1/notifications/inbox
 * User/Admin: Retrieve authenticated user's in-app notification inbox.
 */
const getUserInbox = asyncHandler(async (req, res) => {
  const inbox = await notificationsService.getUserInbox({
    userId: req.user.id,
    query: req.query,
  });
  return ApiResponse.success(res, inbox, 'User inbox retrieved successfully');
});

/**
 * PATCH /api/v1/notifications/inbox/:id/read
 * User/Admin: Mark single notification as read.
 */
const markAsRead = asyncHandler(async (req, res) => {
  const updated = await notificationsService.markAsRead({
    userId: req.user.id,
    notificationId: req.params.id,
  });
  return ApiResponse.success(res, { notification: updated }, 'Notification marked as read');
});

/**
 * POST /api/v1/notifications/inbox/read-all
 * User/Admin: Mark all user's notifications as read.
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationsService.markAllAsRead({
    userId: req.user.id,
  });
  return ApiResponse.success(res, result, 'All notifications marked as read');
});

/**
 * POST /api/v1/notifications/device-token
 * User/Admin: Register FCM push notification device token.
 */
const registerDeviceToken = asyncHandler(async (req, res) => {
  const { token, deviceType } = req.body;
  const registered = await notificationsService.registerDeviceToken({
    userId: req.user.id,
    token,
    deviceType,
  });
  return ApiResponse.created(res, { deviceToken: registered }, 'Device push token registered successfully');
});

/**
 * GET /api/v1/notifications/devices
 * Admin: Get registered device stats and telemetry.
 */
const getDeviceStats = asyncHandler(async (req, res) => {
  const stats = await notificationsService.getDeviceStats();
  return ApiResponse.success(res, stats, 'Device telemetry retrieved successfully');
});

/**
 * POST /api/v1/notifications/test
 * Admin: Test Firebase FCM configuration and connectivity.
 */
const testFirebase = asyncHandler(async (req, res) => {
  const result = await notificationsService.testFirebaseConnection(
    req.body,
    req.user,
    req.ip || req.connection?.remoteAddress
  );
  return ApiResponse.success(res, result, 'Firebase connection verified');
});

/**
 * DELETE /api/v1/notifications/:id
 * Admin: Delete notification from history.
 */
const deleteNotification = asyncHandler(async (req, res) => {
  await notificationsService.deleteNotification(
    req.params.id,
    req.user,
    req.ip || req.connection?.remoteAddress
  );
  return ApiResponse.success(res, null, 'Notification removed from history');
});

module.exports = {
  getTemplatesCatalog,
  previewTemplate,
  dispatchTemplate,
  listNotifications,
  broadcastNotification,
  getUserInbox,
  markAsRead,
  markAllAsRead,
  registerDeviceToken,
  getDeviceStats,
  testFirebase,
  deleteNotification,
};
