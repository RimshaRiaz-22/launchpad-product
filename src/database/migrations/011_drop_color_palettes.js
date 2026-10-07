// src/database/migrations/011_drop_color_palettes.js
// Drops the color_palettes table as color systems are now hardcoded directly in the client editor.
'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  await knex.schema.dropTableIfExists('color_palettes');
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async (knex) => {
  const hasTable = await knex.schema.hasTable('color_palettes');
  if (!hasTable) {
    await knex.schema.createTable('color_palettes', (t) => {
      t.string('id', 100).primary();
      t.string('name', 150).notNullable();
      t.string('type', 50).notNullable().defaultTo('solid');
      t.string('category', 100).nullable();
      t.jsonb('config').notNullable().defaultTo('{}');
      t.boolean('is_builtin').notNullable().defaultTo(false);
      t.uuid('user_id').nullable();
      t.timestamps(true, true);
    });
  }
};
