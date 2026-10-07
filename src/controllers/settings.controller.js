// src/controllers/settings.controller.js — System & platform settings request handlers
'use strict';

const settingsService = require('../services/settings.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/settings
 * Admin: Retrieve all platform settings (general, canvas, firebase, alerts).
 */
const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings();
  const isAdmin = req.user && String(req.user.role).toLowerCase() === 'admin';

  let sanitizedSettings = settings;
  if (!isAdmin) {
    sanitizedSettings = {
      ...settings,
      firebase: {
        ...settings.firebase,
        serverKey: '', // Strip sensitive server key for non-admins
      },
    };
  }

  return ApiResponse.success(res, { settings: sanitizedSettings }, 'System settings retrieved successfully');
});

/**
 * PUT /api/v1/settings
 * Admin: Update platform settings.
 */
const updateSettings = asyncHandler(async (req, res) => {
  const updated = await settingsService.updateSettings(
    req.body,
    req.user?.id,
    req.ip || req.connection?.remoteAddress
  );
  return ApiResponse.success(res, { settings: updated }, 'System settings updated successfully');
});

module.exports = {
  getSettings,
  updateSettings,
};
