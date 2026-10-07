// src/templates/notifications/maintenanceNotice.template.js
'use strict';

const { formatNotification } = require('./baseNotification');

/**
 * Compile Scheduled Maintenance Notification
 *
 * @param {{
 *   startTime?: string,
 *   duration?: string,
 *   action_url?: string
 * }} options
 */
const compileMaintenanceNotice = ({
  startTime = 'Tomorrow at 02:00 UTC',
  duration = '30 minutes',
  action_url = '/status',
} = {}) => {
  return formatNotification({
    title: `🛠️ Scheduled System Maintenance`,
    body: `We have scheduled infrastructure upgrades for ${startTime} (expected duration: ~${duration}). Studio exports may be briefly delayed during this window.`,
    type: 'broadcast',
    priority: 'urgent',
    icon: 'build',
    action_url,
    data: {
      templateId: 'maintenance_notice',
      category: 'system_announcement',
      startTime,
      duration,
    },
  });
};

module.exports = {
  compileMaintenanceNotice,
};
