// src/templates/notifications/index.js — Modular registry of notification templates and catalog
'use strict';

const { formatNotification } = require('./baseNotification');
const { compileWelcomeNotification } = require('./welcomeNotification.template');
const { compileNewTemplateRelease } = require('./newTemplateRelease.template');
const { compilePlanUpgradeSuccess } = require('./planUpgradeSuccess.template');
const { compileMaintenanceNotice } = require('./maintenanceNotice.template');
const { compileExportCompleted } = require('./exportCompleted.template');
const { compileSecurityAlert } = require('./securityAlert.template');

/**
 * Catalog of notification templates with their schemas and documentation.
 * Used by Admin panel to display template choices, preview them, and dynamically generate dispatch forms.
 */
const NOTIFICATION_TEMPLATES_CATALOG = [
  {
    id: 'welcome_notification',
    name: 'Welcome & Onboarding',
    category: 'Onboarding',
    description: 'Sent to new users welcoming them to the Studio with quick links to device mockups.',
    defaultType: 'user',
    defaultPriority: 'normal',
    defaultIcon: 'waving_hand',
    compiler: compileWelcomeNotification,
    fields: [
      { key: 'name', label: 'User Name', type: 'string', defaultValue: 'Alex', placeholder: 'e.g. Alex or Creator', description: 'Name of the recipient' },
      { key: 'action_url', label: 'Action URL', type: 'string', defaultValue: '/studio', placeholder: '/studio', description: 'Target URL on notification click' },
    ],
  },
  {
    id: 'new_template_release',
    name: 'New Design Template Release',
    category: 'Product Updates',
    description: 'Broadcast announcement informing creators of fresh design presets or device mockups.',
    defaultType: 'broadcast',
    defaultPriority: 'normal',
    defaultIcon: 'auto_awesome',
    compiler: compileNewTemplateRelease,
    fields: [
      { key: 'templateName', label: 'Template Name', type: 'string', defaultValue: 'Minimalist iOS 18 Showcase', placeholder: 'Template Title', description: 'Name of the newly added template' },
      { key: 'categoryName', label: 'Category Name', type: 'string', defaultValue: 'App Store Mockups', placeholder: 'Category name', description: 'Category where the template lives' },
      { key: 'action_url', label: 'Action URL', type: 'string', defaultValue: '/studio/templates', placeholder: '/studio/templates', description: 'Deep link to open template' },
      { key: 'previewImage', label: 'Banner Image URL (Optional)', type: 'string', defaultValue: '', placeholder: 'https://...', description: 'Optional rich image preview for push' },
    ],
  },
  {
    id: 'plan_upgrade_success',
    name: 'Subscription Plan Upgrade',
    category: 'Billing',
    description: 'Confirmation alert when a user upgrades to Pro or Enterprise tier.',
    defaultType: 'user',
    defaultPriority: 'high',
    defaultIcon: 'rocket_launch',
    compiler: compilePlanUpgradeSuccess,
    fields: [
      { key: 'planName', label: 'Plan Name', type: 'string', defaultValue: 'Pro Plan', placeholder: 'e.g. Pro or Studio Enterprise', description: 'Tier subscribed to' },
      { key: 'action_url', label: 'Action URL', type: 'string', defaultValue: '/studio/billing', placeholder: '/studio/billing', description: 'Billing page link' },
    ],
  },
  {
    id: 'maintenance_notice',
    name: 'System Maintenance Notice',
    category: 'System',
    description: 'Broadcast alert to all users warning of scheduled downtime or maintenance windows.',
    defaultType: 'broadcast',
    defaultPriority: 'urgent',
    defaultIcon: 'build',
    compiler: compileMaintenanceNotice,
    fields: [
      { key: 'startTime', label: 'Start Time', type: 'string', defaultValue: 'Tomorrow at 02:00 UTC', placeholder: 'e.g. Saturday at 03:00 UTC', description: 'Scheduled maintenance date/time' },
      { key: 'duration', label: 'Expected Duration', type: 'string', defaultValue: '30 minutes', placeholder: 'e.g. 45 minutes', description: 'Anticipated downtime duration' },
      { key: 'action_url', label: 'Action URL', type: 'string', defaultValue: '/status', placeholder: '/status', description: 'Status page URL' },
    ],
  },
  {
    id: 'export_completed',
    name: 'Render & Export Completed',
    category: 'Exports',
    description: 'Triggered when background canvas renders or zip bundles finish exporting.',
    defaultType: 'user',
    defaultPriority: 'normal',
    defaultIcon: 'file_download',
    compiler: compileExportCompleted,
    fields: [
      { key: 'projectName', label: 'Project Name', type: 'string', defaultValue: 'App Store Screenshots', placeholder: 'Name of project', description: 'Name of the rendered project' },
      { key: 'frameCount', label: 'Frame Count', type: 'number', defaultValue: 5, placeholder: '5', description: 'Number of frames generated' },
      { key: 'downloadUrl', label: 'Download / View URL', type: 'string', defaultValue: '/studio/exports', placeholder: '/studio/exports', description: 'Export archive URL' },
    ],
  },
  {
    id: 'security_alert',
    name: 'Security Alert / New Sign-In',
    category: 'Security',
    description: 'Dispatched when an unfamiliar browser session or IP signs into an account.',
    defaultType: 'user',
    defaultPriority: 'urgent',
    defaultIcon: 'security',
    compiler: compileSecurityAlert,
    fields: [
      { key: 'device', label: 'Detected Device / Client', type: 'string', defaultValue: 'Chrome on Windows', placeholder: 'e.g. Safari on macOS', description: 'Client browser and OS' },
      { key: 'location', label: 'IP / Geolocation', type: 'string', defaultValue: '192.168.1.1 (San Francisco, US)', placeholder: 'IP or Location', description: 'Detected approximate location' },
      { key: 'action_url', label: 'Action URL', type: 'string', defaultValue: '/studio/settings', placeholder: '/studio/settings', description: 'Security settings page' },
    ],
  },
];

/**
 * Get catalog without compiler function objects (for JSON API transmission)
 */
const getCatalogMetadata = () => {
  return NOTIFICATION_TEMPLATES_CATALOG.map(({ compiler, ...rest }) => rest);
};

/**
 * Find and compile a template by template ID with user provided parameters
 */
const compileTemplateById = (templateId, params = {}) => {
  const template = NOTIFICATION_TEMPLATES_CATALOG.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Notification template with id "${templateId}" not found.`);
  }
  return {
    templateMetadata: {
      id: template.id,
      name: template.name,
      category: template.category,
      defaultType: template.defaultType,
      defaultPriority: template.defaultPriority,
    },
    compiled: template.compiler(params),
  };
};

module.exports = {
  formatNotification,
  compileWelcomeNotification,
  compileNewTemplateRelease,
  compilePlanUpgradeSuccess,
  compileMaintenanceNotice,
  compileExportCompleted,
  compileSecurityAlert,
  NOTIFICATION_TEMPLATES_CATALOG,
  getCatalogMetadata,
  compileTemplateById,
};
