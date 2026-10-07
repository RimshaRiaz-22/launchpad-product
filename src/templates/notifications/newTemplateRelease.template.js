// src/templates/notifications/newTemplateRelease.template.js
'use strict';

const { formatNotification } = require('./baseNotification');

/**
 * Compile New Template Release Notification
 *
 * @param {{
 *   templateName?: string,
 *   categoryName?: string,
 *   action_url?: string,
 *   previewImage?: string
 * }} options
 */
const compileNewTemplateRelease = ({
  templateName = 'Ultra App Mockup',
  categoryName = 'App Store Mockups',
  action_url = '/studio/templates',
  previewImage = null,
} = {}) => {
  return formatNotification({
    title: `✨ New Template: ${templateName}`,
    body: `A fresh new design preset has just been released in ${categoryName}. Check it out in the studio now!`,
    type: 'broadcast',
    priority: 'normal',
    icon: 'auto_awesome',
    action_url,
    image_url: previewImage,
    data: {
      templateId: 'new_template_release',
      category: 'product_updates',
      templateName,
      categoryName,
    },
  });
};

module.exports = {
  compileNewTemplateRelease,
};
