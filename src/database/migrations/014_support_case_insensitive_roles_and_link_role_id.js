// src/database/migrations/014_support_case_insensitive_roles_and_link_role_id.js
// Support case-insensitive role resolution (admin/ADMIN, user/USER) and backfill users.role_id foreign keys
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
  }

  // 2. Ensure default system roles exist in roles table (case-insensitive check)
  const existingRoles = await knex('roles').select('id', 'name');
  const hasAdmin = existingRoles.some((r) => r.name.toLowerCase() === 'admin');
  const hasUser = existingRoles.some((r) => r.name.toLowerCase() === 'user');

  if (!hasAdmin) {
    await knex('roles').insert({
      name: 'admin',
      description: 'Full administrative access to all resources and settings',
    });
  }

  if (!hasUser) {
    await knex('roles').insert({
      name: 'user',
      description: 'Standard user with standard application permissions',
    });
  }

  // 3. Ensure role_id column exists on users table
  const hasRoleId = await knex.schema.hasColumn('users', 'role_id');
  if (!hasRoleId) {
    await knex.schema.table('users', (table) => {
      table.uuid('role_id').nullable().references('id').inTable('roles').onDelete('RESTRICT');
    });
  }

  // 4. Update users_role_check constraint to be case-insensitive (accepts admin, ADMIN, user, USER, etc.)
  try {
    await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await knex.raw("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (LOWER(role) = ANY (ARRAY['user'::text, 'admin'::text, 'superadmin'::text]))");
  } catch (err) {
    // Non-blocking in environments where constraint is managed differently
    console.warn('Notice updating users_role_check constraint:', err.message);
  }

  // 5. Backfill users.role_id from roles matching case-insensitively
  await knex.raw(`
    UPDATE users
    SET role_id = roles.id
    FROM roles
    WHERE users.role_id IS NULL
      AND LOWER(users.role) = LOWER(roles.name)
  `);

  // 6. For any remaining users where role_id is still NULL, assign the default user role
  await knex.raw(`
    UPDATE users
    SET role_id = (SELECT id FROM roles WHERE LOWER(name) = 'user' LIMIT 1)
    WHERE users.role_id IS NULL
  `);

  // 7. Ensure index exists on role_id
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id)');
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  try {
    await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await knex.raw("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['user'::text, 'admin'::text, 'superadmin'::text]))");
  } catch (err) {
    console.warn('Notice reverting users_role_check constraint:', err.message);
  }
};
