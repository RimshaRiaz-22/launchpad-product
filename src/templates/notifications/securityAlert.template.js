// src/templates/notifications/securityAlert.template.js
'use strict';

const { formatNotification } = require('./baseNotification');

/**
 * Compile Security Alert Notification
 *
 * @param {{
 *   device?: string,
 *   location?: string,
 *   action_url?: string
 * }} options
 */
const compileSecurityAlert = ({
  device = 'Chrome on Windows',
  location = 'Unknown IP',
  action_url = '/studio/settings',
} = {}) => {
  return formatNotification({
    title: `🛡️ New Sign-In Detected`,
    body: `A new session was detected from ${device} (${location}). If this wasn't you, revoke all other active sessions immediately in Security settings.`,
    type: 'user',
    priority: 'urgent',
    icon: 'security',
    action_url,
    data: {
      templateId: 'security_alert',
      category: 'security',
      device,
      location,
    },
  });
};

module.exports = {
  compileSecurityAlert,
};
