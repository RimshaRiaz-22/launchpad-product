// src/database/migrations/002_catalogs_and_mockups.js — Catalogs, rich JSON mockups, fonts, palettes, shapes
'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  // ── mockups table (supports rich multi-layer JSON specs) ─────
  await knex.schema.createTable('mockups', (t) => {
    t.string('id', 100).primary(); // slug or uuid
    t.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('name', 255).notNullable();
    t.string('slug', 100).nullable();
    t.string('category', 100).notNullable().defaultTo('Phones'); // 'Phones', 'Tablets', 'Desktops', 'Scenes', 'Clay'
    t.string('style', 50).notNullable().defaultTo('realistic');   // 'realistic', 'clay', 'minimal', 'scene', 'isometric'
    t.text('image_url').notNullable();                           // Base frame or render URL
    t.text('featured_image').nullable();                         // SVG or PNG preview card
    t.integer('natural_width').notNullable().defaultTo(393);
    t.integer('natural_height').notNullable().defaultTo(852);
    t.jsonb('screen_slot').notNullable();                        // { x, y, width, height, rx, ry, rotation }
    t.jsonb('spec').notNullable().defaultTo('{}');               // Rich multi-layer JSON composition (chassis, reflections, shadows, badges, overlays)
    t.boolean('is_builtin').notNullable().defaultTo(false);
    t.boolean('is_premium').notNullable().defaultTo(false);
    t.specificType('tags', 'text[]').nullable();
    t.timestamps(true, true);
  });

  // ── fonts table ─────────────────────────────────────────────
  await knex.schema.createTable('fonts', (t) => {
    t.string('id', 100).primary();
    t.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('name', 100).notNullable();
    t.string('family', 255).notNullable();
    t.string('category', 50).notNullable().defaultTo('sans-serif'); // 'sans-serif', 'serif', 'display', 'handwriting', 'monospace'
    t.text('font_url').nullable();
    t.jsonb('weights').notNullable().defaultTo('[400, 600, 700]');
    t.boolean('is_builtin').notNullable().defaultTo(false);
    t.timestamps(true, true);
  });

  // ── color_palettes table ────────────────────────────────────
  await knex.schema.createTable('color_palettes', (t) => {
    t.string('id', 100).primary();
    t.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('name', 100).notNullable();
    t.string('type', 30).notNullable().defaultTo('solid');          // 'solid', 'gradient'
    t.string('category', 50).notNullable().defaultTo('brand');      // 'brand', 'pastel', 'dark', 'vibrant', 'custom'
    t.jsonb('config').notNullable();                                // { colors: [...] } or { angle: 135, stops: [...] }
    t.boolean('is_builtin').notNullable().defaultTo(false);
    t.timestamps(true, true);
  });

  // ── shapes table ────────────────────────────────────────────
  await knex.schema.createTable('shapes', (t) => {
    t.string('id', 100).primary();
    t.string('name', 100).notNullable();
    t.string('group_id', 50).notNullable().defaultTo('basic');       // 'basic', 'polygons', 'symbols', 'badges'
    t.string('group_label', 100).notNullable().defaultTo('Basic');
    t.string('preview_type', 20).notNullable().defaultTo('svg');     // 'rect', 'bar', 'svg'
    t.jsonb('preview_data').nullable();                              // { w, h, radius } or { d }
    t.text('svg_path').nullable();
    t.string('fabric_type', 50).notNullable().defaultTo('Path');     // 'Rect', 'Circle', 'Triangle', 'Path'
    t.jsonb('default_props').notNullable().defaultTo('{}');
    t.timestamps(true, true);
  });

  // ── Indexes ────────────────────────────────────────────────
  await knex.schema.table('mockups', (t) => {
    t.index('category', 'idx_mockups_category');
    t.index('style', 'idx_mockups_style');
    t.index('is_builtin', 'idx_mockups_is_builtin');
    t.index('user_id', 'idx_mockups_user_id');
  });

  await knex.schema.table('fonts', (t) => {
    t.index('category', 'idx_fonts_category');
    t.index('is_builtin', 'idx_fonts_is_builtin');
    t.index('user_id', 'idx_fonts_user_id');
  });

  await knex.schema.table('color_palettes', (t) => {
    t.index('type', 'idx_color_palettes_type');
    t.index('category', 'idx_color_palettes_category');
    t.index('is_builtin', 'idx_color_palettes_is_builtin');
    t.index('user_id', 'idx_color_palettes_user_id');
  });

  await knex.schema.table('shapes', (t) => {
    t.index('group_id', 'idx_shapes_group_id');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('shapes');
  await knex.schema.dropTableIfExists('color_palettes');
  await knex.schema.dropTableIfExists('fonts');
  await knex.schema.dropTableIfExists('mockups');
};
