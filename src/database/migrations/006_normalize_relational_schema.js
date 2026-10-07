// src/database/migrations/006_normalize_relational_schema.js — Normalized roles, foreign keys, and indexes
'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  // 1. Ensure 'roles' table exists
  const hasRoles = await knex.schema.hasTable('roles');
  if (!hasRoles) {
    await knex.schema.createTable('roles', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name', 50).notNullable().unique();
      table.string('description', 255).nullable();
      table.timestamps(true, true);
    });

    // Seed default system roles
    await knex('roles').insert([
      { name: 'admin', description: 'Product owner and platform super-admin' },
      { name: 'user', description: 'Standard platform creator and subscriber' },
    ]);
  }

  // 2. Add role_id and subscription_plan_id to users if not present
  const hasRoleId = await knex.schema.hasColumn('users', 'role_id');
  if (!hasRoleId) {
    await knex.schema.table('users', (table) => {
      table.uuid('role_id').nullable().references('id').inTable('roles').onDelete('RESTRICT');
    });
  }

  const hasSubPlanId = await knex.schema.hasColumn('users', 'subscription_plan_id');
  if (!hasSubPlanId) {
    await knex.schema.table('users', (table) => {
      table.string('subscription_plan_id', 64).nullable().references('id').inTable('subscription_plans').onDelete('RESTRICT');
    });
  }

  // 3. Backfill user role_id and subscription_plan_id
  const adminRole = await knex('roles').where({ name: 'admin' }).first();
  const userRole = await knex('roles').where({ name: 'user' }).first();

  if (adminRole) {
    await knex('users').where({ role: 'admin' }).update({ role_id: adminRole.id });
  }
  if (userRole) {
    await knex('users').where({ role: 'user' }).update({ role_id: userRole.id });
  }

  // Backfill subscription_plan_id from plan slug
  await knex.raw(`
    UPDATE users
    SET subscription_plan_id = subscription_plans.id
    FROM subscription_plans
    WHERE users.plan = subscription_plans.id AND users.subscription_plan_id IS NULL
  `);

  // 4. Add subscription_plan_id to subscriptions table if not present
  const hasSubTablePlanId = await knex.schema.hasColumn('subscriptions', 'subscription_plan_id');
  if (!hasSubTablePlanId) {
    await knex.schema.table('subscriptions', (table) => {
      table.string('subscription_plan_id', 64).nullable().references('id').inTable('subscription_plans').onDelete('RESTRICT');
    });

    await knex.raw(`
      UPDATE subscriptions
      SET subscription_plan_id = subscription_plans.id
      FROM subscription_plans
      WHERE subscriptions.plan = subscription_plans.id AND subscriptions.subscription_plan_id IS NULL
    `);
  }

  // 5. Add composite indexes
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_subscription_plan_id ON users(subscription_plan_id)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_role_plan ON users(role, plan)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(subscription_plan_id)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status)');
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw('DROP INDEX IF EXISTS idx_subscriptions_user_status');
  await knex.raw('DROP INDEX IF EXISTS idx_subscriptions_plan_id');
  await knex.raw('DROP INDEX IF EXISTS idx_users_role_plan');
  await knex.raw('DROP INDEX IF EXISTS idx_users_subscription_plan_id');
  await knex.raw('DROP INDEX IF EXISTS idx_users_role_id');

  if (await knex.schema.hasColumn('subscriptions', 'subscription_plan_id')) {
    await knex.schema.table('subscriptions', (table) => {
      table.dropColumn('subscription_plan_id');
    });
  }

  if (await knex.schema.hasColumn('users', 'subscription_plan_id')) {
    await knex.schema.table('users', (table) => {
      table.dropColumn('subscription_plan_id');
    });
  }

  if (await knex.schema.hasColumn('users', 'role_id')) {
    await knex.schema.table('users', (table) => {
      table.dropColumn('role_id');
    });
  }

  await knex.schema.dropTableIfExists('roles');
};
