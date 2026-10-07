// src/templates/notifications/baseNotification.js — Shared notification compiler and FCM builder
'use strict';

const config = require('../../config/app.config');

/**
 * Normalizes notification options and creates both In-App and FCM push payloads.
 *
 * @param {{
 *   title: string,
 *   body: string,
 *   type?: 'broadcast' | 'user' | 'system' | 'update' | 'marketing',
 *   priority?: 'normal' | 'high' | 'urgent',
 *   action_url?: string,
 *   icon?: string,
 *   image_url?: string,
 *   data?: Record<string, any>
 * }} param0
 */
const formatNotification = ({
  title,
  body,
  type = 'broadcast',
  priority = 'normal',
  action_url = '/',
  icon = 'notifications',
  image_url = null,
  data = {},
}) => {
  const appName = config?.app?.name || 'Launchpad Studio';

  const fcmPayload = {
    notification: {
      title,
      body,
      ...(image_url ? { imageUrl: image_url } : {}),
    },
    data: {
      type,
      priority,
      action_url: action_url || '/',
      click_action: action_url || '/',
      appName,
      ...Object.fromEntries(
        Object.entries(data || {}).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)])
      ),
    },
    android: {
      priority: priority === 'urgent' || priority === 'high' ? 'high' : 'normal',
      notification: {
        sound: 'default',
        clickAction: action_url || '/',
        icon: 'ic_notification',
        color: '#10B981',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          contentAvailable: true,
        },
      },
    },
    webpush: {
      headers: {
        Urgency: priority === 'urgent' ? 'high' : 'normal',
      },
      notification: {
        title,
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...(image_url ? { image: image_url } : {}),
        data: {
          url: action_url || '/',
          ...data,
        },
      },
    },
  };

  return {
    title,
    body,
    type,
    priority,
    action_url,
    icon,
    image_url,
    data,
    fcmPayload,
  };
};

module.exports = {
  formatNotification,
};
