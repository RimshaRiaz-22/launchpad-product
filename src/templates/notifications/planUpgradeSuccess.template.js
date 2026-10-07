// src/templates/notifications/planUpgradeSuccess.template.js
'use strict';

const { formatNotification } = require('./baseNotification');

/**
 * Compile Plan Upgrade Success Notification
 *
 * @param {{
 *   planName?: string,
 *   action_url?: string
 * }} options
 */
const compilePlanUpgradeSuccess = ({
  planName = 'Pro Plan',
  action_url = '/studio/billing',
} = {}) => {
  return formatNotification({
    title: `🚀 Subscription Upgraded: ${planName}`,
    body: `You are now on the ${planName}! Unlimited 4K exports, priority cloud rendering, and premium devices are unlocked.`,
    type: 'user',
    priority: 'high',
    icon: 'rocket_launch',
    action_url,
    data: {
      templateId: 'plan_upgrade_success',
      category: 'billing',
      planName,
    },
  });
};

module.exports = {
  compilePlanUpgradeSuccess,
};
