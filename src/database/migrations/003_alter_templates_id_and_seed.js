// src/database/migrations/003_alter_templates_id_and_seed.js — Alter templates id to varchar, thumbnail_url to text, and seed template
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  // Alter templates.id to VARCHAR(100) to support slug IDs like 'savage-mushroom-fitness' as well as UUIDs
  await knex.raw('ALTER TABLE templates ALTER COLUMN id TYPE VARCHAR(100) USING id::text');
  await knex.raw('ALTER TABLE templates ALTER COLUMN id SET DEFAULT uuid_generate_v4()::text');

  // Alter thumbnail_url to TEXT to support inline SVG data URIs
  await knex.raw('ALTER TABLE templates ALTER COLUMN thumbnail_url TYPE TEXT');
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async (knex) => {
  await knex('templates').where({ id: 'savage-mushroom-fitness' }).delete();
  await knex.raw('ALTER TABLE templates ALTER COLUMN thumbnail_url TYPE VARCHAR(500)');
  await knex.raw('ALTER TABLE templates ALTER COLUMN id TYPE UUID USING id::uuid');
  await knex.raw('ALTER TABLE templates ALTER COLUMN id SET DEFAULT uuid_generate_v4()');
};
