// src/templates/notifications/welcomeNotification.template.js
'use strict';

const { formatNotification } = require('./baseNotification');

/**
 * Compile Welcome Notification
 *
 * @param {{
 *   name?: string,
 *   action_url?: string
 * }} options
 */
const compileWelcomeNotification = ({
  name = 'Creator',
  action_url = '/studio',
} = {}) => {
  return formatNotification({
    title: `Welcome to Launchpad, ${name}! 👋`,
    body: `Explore studio presets, high-res 3D device mockups, and start building captivating visuals today.`,
    type: 'user',
    priority: 'normal',
    icon: 'waving_hand',
    action_url,
    data: {
      templateId: 'welcome_notification',
      category: 'onboarding',
    },
  });
};

module.exports = {
  compileWelcomeNotification,
};
