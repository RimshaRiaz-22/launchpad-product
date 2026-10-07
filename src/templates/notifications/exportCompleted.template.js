// src/templates/notifications/exportCompleted.template.js
'use strict';

const { formatNotification } = require('./baseNotification');

/**
 * Compile Export Completed Notification
 *
 * @param {{
 *   projectName?: string,
 *   frameCount?: number,
 *   downloadUrl?: string
 * }} options
 */
const compileExportCompleted = ({
  projectName = 'Mobile Storefront Showcase',
  frameCount = 5,
  downloadUrl = '/studio/exports',
} = {}) => {
  return formatNotification({
    title: `📦 Assets Export Ready (${frameCount} frame${frameCount > 1 ? 's' : ''})`,
    body: `Your render for "${projectName}" has completed in high resolution. Click here to download your zip archive.`,
    type: 'user',
    priority: 'normal',
    icon: 'file_download',
    action_url: downloadUrl,
    data: {
      templateId: 'export_completed',
      category: 'export',
      projectName,
      frameCount,
    },
  });
};

module.exports = {
  compileExportCompleted,
};
