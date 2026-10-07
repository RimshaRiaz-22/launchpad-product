// src/database/migrations/015_alter_projects_thumbnail_url_to_text.js
'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable('projects');
  if (hasTable) {
    await knex.raw('ALTER TABLE public.projects ALTER COLUMN thumbnail_url TYPE TEXT');
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  const hasTable = await knex.schema.hasTable('projects');
  if (hasTable) {
    await knex.raw('ALTER TABLE public.projects ALTER COLUMN thumbnail_url TYPE VARCHAR(500)');
  }
};
