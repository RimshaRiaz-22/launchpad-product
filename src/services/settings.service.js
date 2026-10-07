// src/services/settings.service.js — Business logic for platform & administrative settings
'use strict';

const settingsRepo = require('../repositories/settings.repository');
const auditLogsService = require('./auditLogs.service');
const logger = require('../config/logger.config');
const memoryCache = require('../utils/memoryCache');

const SETTINGS_CACHE_KEY = 'platform:settings';

const DEFAULT_SETTINGS = {
  general: {
    platformName: 'Launchpad App Store Studio',
    supportEmail: 'support@launchpad.app',
    supportDocsUrl: 'https://docs.launchpad.app',
    allowPublicSignups: true,
    requireEmailVerification: false,
    maintenanceMode: false,
    defaultUserPlan: 'free',
  },
  canvas: {
    defaultExportFormat: 'png',
    defaultExportMultiplier: 2,
    autoSaveIntervalSec: 30,
    snapToGrid: true,
    freeTierWatermark: true,
    strictStoreDimensions: true,
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'app-ss-e611d',
    apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDeQ5peHQnqBKL1zF5AZAljnASTZ-OI_Ko',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'app-ss-e611d.firebaseapp.com',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'app-ss-e611d.firebasestorage.app',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '376384198393',
    appId: process.env.FIREBASE_APP_ID || '1:376384198393:web:edb6c35a8d653da0c33428',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-HGX9JF9J8V',
    vapidKey: process.env.FIREBASE_VAPID_KEY || '',
    serverKey: process.env.FIREBASE_SERVER_KEY || '',
    isEnabled: process.env.FIREBASE_ENABLED !== 'false',
    autoPushOnPublish: false,
  },
  alerts: {
    notifyOnPaidUpgrade: true,
    notifyOnSuspiciousLogin: true,
    notifyWeeklyDigest: false,
  },
};

/**
 * Retrieve all system settings merged with defaults (cached in-memory for 5 minutes).
 */
const getSettings = async () => {
  return memoryCache.wrap(SETTINGS_CACHE_KEY, 300, async () => {
    try {
      const rawSettings = await settingsRepo.getAll();
      return {
        general: { ...DEFAULT_SETTINGS.general, ...(rawSettings.general || {}) },
        canvas: { ...DEFAULT_SETTINGS.canvas, ...(rawSettings.canvas || {}) },
        firebase: { ...DEFAULT_SETTINGS.firebase, ...(rawSettings.firebase || {}) },
        alerts: { ...DEFAULT_SETTINGS.alerts, ...(rawSettings.alerts || {}) },
      };
    } catch (err) {
      logger.warn('Failed to read system_settings table, falling back to defaults:', err.message);
      return DEFAULT_SETTINGS;
    }
  });
};

/**
 * Update system settings in batch.
 * @param {object} updates Map of category to updated properties { general?, canvas?, firebase?, alerts? }
 * @param {string} userId Admin ID performing the update
 * @param {string} ipAddress Requester IP address
 */
const updateSettings = async (updates, userId = null, ipAddress = null) => {
  const current = await getSettings();

  const toSave = {};
  if (updates.general) {
    toSave.general = { ...current.general, ...updates.general };
  }
  if (updates.canvas) {
    toSave.canvas = { ...current.canvas, ...updates.canvas };
  }
  if (updates.firebase) {
    toSave.firebase = { ...current.firebase, ...updates.firebase };
  }
  if (updates.alerts) {
    toSave.alerts = { ...current.alerts, ...updates.alerts };
  }

  const saved = await settingsRepo.updateBatch(toSave, userId);
  memoryCache.del(SETTINGS_CACHE_KEY);

  // Broadcast notification to users if watermark policy changed
  if (updates.canvas && updates.canvas.freeTierWatermark !== undefined) {
    const previousWm = current.canvas?.freeTierWatermark !== false;
    const newWm = updates.canvas.freeTierWatermark !== false;
    if (previousWm !== newWm) {
      try {
        const notificationsService = require('./notifications.service');
        if (!newWm) {
          await notificationsService.broadcastNotification(
            {
              title: 'Watermark Policy Updated: Free Exports Unlocked 🎉',
              body: 'Launchpad administrators have disabled attribution watermarks for free tier exports! Enjoy high-resolution downloads without watermark attribution.',
              type: 'announcement',
              audience: 'all',
              action_url: '/editor',
              channel: 'push_and_inapp',
              metadata: {
                settingKey: 'freeTierWatermark',
                value: false,
              },
            },
            { id: userId },
            ipAddress
          );
        } else {
          await notificationsService.broadcastNotification(
            {
              title: 'Watermark Policy Updated',
              body: 'Attribution watermark has been enabled on free tier exports by platform administrators.',
              type: 'info',
              audience: 'all',
              action_url: '/editor',
              channel: 'push_and_inapp',
              metadata: {
                settingKey: 'freeTierWatermark',
                value: true,
              },
            },
            { id: userId },
            ipAddress
          );
        }
      } catch (notifyErr) {
        logger.warn('Failed broadcasting watermark setting notification:', notifyErr.message);
      }
    }
  }

  // Log compliance audit trail
  auditLogsService.logEvent({
    user_id: userId,
    action: 'settings.update',
    resource_type: 'system_settings',
    resource_id: null,
    ip_address: ipAddress,
    severity: 'info',
    metadata: {
      updatedSections: Object.keys(toSave),
      updatedAt: new Date().toISOString(),
    },
  });

  return {
    ...current,
    ...saved,
  };
};

module.exports = {
  getSettings,
  updateSettings,
  DEFAULT_SETTINGS,
};
