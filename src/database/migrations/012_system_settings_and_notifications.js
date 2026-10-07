// src/database/migrations/012_system_settings_and_notifications.js
// Adds system_settings key-value configuration and notifications dispatch history tables.
'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  // ── 1. Create system_settings table ─────────────────────────
  const hasSettingsTable = await knex.schema.hasTable('system_settings');
  if (!hasSettingsTable) {
    await knex.schema.createTable('system_settings', (t) => {
      t.string('key', 100).primary();
      t.jsonb('value').notNullable().defaultTo('{}');
      t.string('description', 255).nullable();
      t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      t.uuid('updated_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    });

    // Seed default settings
    await knex('system_settings').insert([
      {
        key: 'general',
        description: 'Global platform branding, contact info, and registration policies',
        value: JSON.stringify({
          platformName: 'Launchpad App Store Studio',
          supportEmail: 'support@launchpad.app',
          supportDocsUrl: 'https://docs.launchpad.app',
          allowPublicSignups: true,
          requireEmailVerification: false,
          maintenanceMode: false,
          defaultUserPlan: 'free',
        }),
      },
      {
        key: 'canvas',
        description: 'Default export settings, autosave frequency, and canvas snapping guidelines',
        value: JSON.stringify({
          defaultExportFormat: 'png',
          defaultExportMultiplier: 2,
          autoSaveIntervalSec: 30,
          snapToGrid: true,
          freeTierWatermark: true,
          strictStoreDimensions: true,
        }),
      },
      {
        key: 'firebase',
        description: 'Firebase Cloud Messaging (FCM) credentials and push notification configuration',
        value: JSON.stringify({
          projectId: 'launchpad-app-store-studio',
          apiKey: '',
          authDomain: 'launchpad-app-store-studio.firebaseapp.com',
          messagingSenderId: '104928374829',
          appId: '1:104928374829:web:a93b482f190e38a2',
          vapidKey: '',
          serverKey: '',
          isEnabled: true,
          autoPushOnPublish: false,
        }),
      },
      {
        key: 'alerts',
        description: 'Super-admin alert notifications for subscriptions and security',
        value: JSON.stringify({
          notifyOnPaidUpgrade: true,
          notifyOnSuspiciousLogin: true,
          notifyWeeklyDigest: false,
        }),
      },
    ]);
  }

  // ── 2. Create notifications table ────────────────────────────
  const hasNotificationsTable = await knex.schema.hasTable('notifications');
  if (!hasNotificationsTable) {
    await knex.schema.createTable('notifications', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      t.string('title', 255).notNullable();
      t.text('body').notNullable();
      t.string('type', 50).notNullable().defaultTo('info'); // info, success, warning, error, announcement, promo
      t.string('audience', 50).notNullable().defaultTo('all'); // all, free, pro, team, enterprise
      t.string('action_url', 500).nullable();
      t.string('channel', 50).notNullable().defaultTo('push_and_inapp');
      t.string('status', 50).notNullable().defaultTo('sent'); // sent, draft, failed
      t.uuid('sent_by').nullable().references('id').inTable('users').onDelete('SET NULL');
      t.string('fcm_message_id', 255).nullable();
      t.jsonb('metadata').nullable();
      t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      t.index('audience', 'idx_notifications_audience');
      t.index('created_at', 'idx_notifications_created_at');
    });

    // Seed sample broadcast records
    await knex('notifications').insert([
      {
        title: '🎉 New iPhone 16 Pro & iPad Pro 13″ Presets Available',
        body: 'Start designing multi-screen showcases with official App Store and Google Play display dimensions.',
        type: 'announcement',
        audience: 'all',
        action_url: '/editor',
        channel: 'push_and_inapp',
        status: 'sent',
        fcm_message_id: 'fcm_msg_init_001',
        metadata: JSON.stringify({ priority: 'high', icon: 'rocket' }),
      },
      {
        title: '⚡ High-Performance WebP & 4K Retina Export Pipeline',
        body: 'Export ultra-crisp app screenshots in lossless PNG or compressed WebP at up to 3x resolution.',
        type: 'info',
        audience: 'pro',
        action_url: '/editor',
        channel: 'push_and_inapp',
        status: 'sent',
        fcm_message_id: 'fcm_msg_init_002',
        metadata: JSON.stringify({ priority: 'normal', icon: 'zap' }),
      },
    ]);
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('system_settings');
};
