// src/database/migrations/013_user_notifications_and_tokens.js
// Adds user_notifications for in-app inbox read-state and fcm_device_tokens for push targets.
'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  // ── 1. Create fcm_device_tokens table ─────────────────────────
  const hasTokensTable = await knex.schema.hasTable('fcm_device_tokens');
  if (!hasTokensTable) {
    await knex.schema.createTable('fcm_device_tokens', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.text('token').notNullable().unique();
      t.string('device_type', 50).notNullable().defaultTo('web'); // web, android, ios
      t.timestamp('last_used_at').notNullable().defaultTo(knex.fn.now());
      t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      t.index('user_id', 'idx_fcm_tokens_user_id');
      t.index('token', 'idx_fcm_tokens_token');
    });
  }

  // ── 2. Create user_notifications table ─────────────────────────
  const hasUserNotifsTable = await knex.schema.hasTable('user_notifications');
  if (!hasUserNotifsTable) {
    await knex.schema.createTable('user_notifications', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.uuid('notification_id').notNullable().references('id').inTable('notifications').onDelete('CASCADE');
      t.boolean('is_read').notNullable().defaultTo(false);
      t.timestamp('read_at').nullable();
      t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      t.index(['user_id', 'is_read'], 'idx_user_notifs_user_read');
      t.index('created_at', 'idx_user_notifs_created_at');
    });

    // Populate initial unread notifications for existing admin user
    const adminUser = await knex('users').where({ role: 'admin' }).first();
    const existingNotifications = await knex('notifications').select('id').limit(5);

    if (adminUser && existingNotifications.length > 0) {
      const inserts = existingNotifications.map((n) => ({
        user_id: adminUser.id,
        notification_id: n.id,
        is_read: false,
      }));
      await knex('user_notifications').insert(inserts);
    }
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('user_notifications');
  await knex.schema.dropTableIfExists('fcm_device_tokens');
};
