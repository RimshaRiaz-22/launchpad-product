// src/database/migrations/001_init.js — Initial schema migration
'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  // ── Enable extensions ─────────────────────────────────────
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // ── users ──────────────────────────────────────────────────
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.string('email', 255).notNullable().unique();
    t.string('password_hash', 255).notNullable();
    t.string('name', 100).notNullable();
    t.string('avatar_url', 500).nullable();
    t.enu('role', ['user', 'admin']).notNullable().defaultTo('user');
    t.enu('plan', ['free', 'pro', 'team', 'enterprise']).notNullable().defaultTo('free');
    t.boolean('is_verified').notNullable().defaultTo(false);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.string('verification_token', 255).nullable();
    t.string('password_reset_token', 255).nullable();
    t.timestamp('password_reset_expires').nullable();
    t.timestamp('last_login_at').nullable();
    t.timestamps(true, true); // created_at, updated_at
  });

  // ── refresh_tokens ─────────────────────────────────────────
  await knex.schema.createTable('refresh_tokens', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('token_hash', 64).notNullable().unique(); // SHA-256 of the raw token
    t.string('user_agent', 500).nullable();
    t.string('ip_address', 45).nullable();
    t.boolean('is_revoked').notNullable().defaultTo(false);
    t.timestamp('expires_at').notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // ── projects ───────────────────────────────────────────────
  await knex.schema.createTable('projects', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.string('description', 1000).nullable();
    t.jsonb('canvas_data').nullable();          // Fabric.js JSON snapshot
    t.string('thumbnail_url', 500).nullable();
    t.integer('width').notNullable().defaultTo(1920);
    t.integer('height').notNullable().defaultTo(1080);
    t.boolean('is_public').notNullable().defaultTo(false);
    t.enu('status', ['draft', 'published', 'archived']).notNullable().defaultTo('draft');
    t.specificType('tags', 'text[]').nullable();
    t.timestamps(true, true);
  });

  // ── assets ─────────────────────────────────────────────────
  await knex.schema.createTable('assets', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.enu('type', ['image', 'video', 'font', 'svg', 'json', 'other']).notNullable().defaultTo('image');
    t.string('file_path', 1000).notNullable();
    t.string('file_url', 1000).nullable();
    t.bigInteger('file_size').notNullable();    // bytes
    t.string('mime_type', 100).notNullable();
    t.integer('width').nullable();
    t.integer('height').nullable();
    t.jsonb('metadata').nullable();            // EXIF, palette, etc.
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // ── templates ──────────────────────────────────────────────
  await knex.schema.createTable('templates', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('creator_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    t.string('name', 255).notNullable();
    t.string('description', 1000).nullable();
    t.string('category', 100).notNullable().defaultTo('general');
    t.jsonb('canvas_data').notNullable();
    t.string('thumbnail_url', 500).nullable();
    t.boolean('is_public').notNullable().defaultTo(true);
    t.boolean('is_premium').notNullable().defaultTo(false);
    t.integer('width').notNullable().defaultTo(1920);
    t.integer('height').notNullable().defaultTo(1080);
    t.specificType('tags', 'text[]').nullable();
    t.integer('use_count').notNullable().defaultTo(0);
    t.timestamps(true, true);
  });

  // ── subscriptions ──────────────────────────────────────────
  await knex.schema.createTable('subscriptions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.enu('plan', ['free', 'pro', 'team', 'enterprise']).notNullable().defaultTo('free');
    t.enu('status', ['active', 'canceled', 'past_due', 'trialing', 'incomplete'])
      .notNullable()
      .defaultTo('active');
    t.string('stripe_customer_id', 255).nullable().unique();
    t.string('stripe_subscription_id', 255).nullable().unique();
    t.string('stripe_price_id', 255).nullable();
    t.timestamp('trial_ends_at').nullable();
    t.timestamp('current_period_start').nullable();
    t.timestamp('current_period_end').nullable();
    t.timestamp('canceled_at').nullable();
    t.timestamps(true, true);
  });

  // ── audit_logs ─────────────────────────────────────────────
  await knex.schema.createTable('audit_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    t.string('action', 100).notNullable();      // e.g. 'user.login', 'project.delete'
    t.string('resource_type', 100).nullable();  // e.g. 'project', 'asset'
    t.uuid('resource_id').nullable();
    t.string('ip_address', 45).nullable();
    t.string('user_agent', 500).nullable();
    t.enu('severity', ['info', 'warning', 'critical']).notNullable().defaultTo('info');
    t.jsonb('metadata').nullable();             // extra context
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // ── Indexes ────────────────────────────────────────────────
  await knex.schema.table('refresh_tokens', (t) => {
    t.index('user_id', 'idx_refresh_tokens_user_id');
    t.index('token_hash', 'idx_refresh_tokens_token_hash');
  });

  await knex.schema.table('projects', (t) => {
    t.index('user_id', 'idx_projects_user_id');
    t.index('status', 'idx_projects_status');
    t.index('is_public', 'idx_projects_is_public');
  });

  await knex.schema.table('assets', (t) => {
    t.index('user_id', 'idx_assets_user_id');
    t.index('type', 'idx_assets_type');
  });

  await knex.schema.table('templates', (t) => {
    t.index('category', 'idx_templates_category');
    t.index('is_public', 'idx_templates_is_public');
    t.index('is_premium', 'idx_templates_is_premium');
  });

  await knex.schema.table('audit_logs', (t) => {
    t.index('user_id', 'idx_audit_logs_user_id');
    t.index('action', 'idx_audit_logs_action');
    t.index('created_at', 'idx_audit_logs_created_at');
  });

  await knex.schema.table('subscriptions', (t) => {
    t.index('user_id', 'idx_subscriptions_user_id');
    t.index('stripe_customer_id', 'idx_subscriptions_stripe_customer_id');
  });

  // ── updated_at trigger ─────────────────────────────────────
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  const tablesWithUpdatedAt = ['users', 'projects', 'templates', 'subscriptions'];
  for (const table of tablesWithUpdatedAt) {
    await knex.raw(`
      CREATE TRIGGER trigger_${table}_updated_at
      BEFORE UPDATE ON ${table}
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async (knex) => {
  // Drop triggers first
  const tablesWithTriggers = ['users', 'projects', 'templates', 'subscriptions'];
  for (const table of tablesWithTriggers) {
    await knex.raw(`DROP TRIGGER IF EXISTS trigger_${table}_updated_at ON ${table}`);
  }
  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column()');

  // Drop tables in reverse dependency order
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('subscriptions');
  await knex.schema.dropTableIfExists('templates');
  await knex.schema.dropTableIfExists('assets');
  await knex.schema.dropTableIfExists('projects');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
};
