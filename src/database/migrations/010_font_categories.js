// src/database/migrations/010_font_categories.js
// Creates font_categories table for admin-managed typography categories and seeds defaults.
'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  // ── 1. font_categories ──────────────────────────────────────────────────
  const hasCatTable = await knex.schema.hasTable('font_categories');
  if (!hasCatTable) {
    await knex.schema.createTable('font_categories', (t) => {
      t.string('id', 100).primary();        // slug e.g. 'sans-serif', 'display'
      t.string('name', 150).notNullable();  // e.g. 'Sans-Serif'
      t.string('label', 150).notNullable(); // e.g. 'Sans-Serif / Grotesque'
      t.string('description', 255).nullable();
      t.string('color', 30).nullable();     // accent color for UI badge
      t.integer('sort_order').notNullable().defaultTo(0);
      t.boolean('is_active').notNullable().defaultTo(true);
      t.timestamps(true, true);
    });

    await knex.raw('CREATE INDEX IF NOT EXISTS idx_font_categories_active ON font_categories (is_active, sort_order)');
  }

  // ── 2. Seed default font_categories ────────────────────────────────────
  const catCount = await knex('font_categories').count('id as count').first();
  if (parseInt(catCount?.count || 0, 10) === 0) {
    await knex('font_categories').insert([
      { id: 'sans-serif',   name: 'Sans-Serif',   label: 'Sans-Serif / Grotesque',        description: 'Clean, modern sans-serif typefaces ideal for UI and headlines',   color: '#10B981', sort_order: 0 },
      { id: 'serif',        name: 'Serif',         label: 'Serif / Classic',               description: 'Elegant serif typefaces for editorial and luxury brands',           color: '#F59E0B', sort_order: 1 },
      { id: 'display',      name: 'Display',       label: 'Display / Decorative',          description: 'High-impact display fonts for bold headlines and App Store titles',  color: '#EC4899', sort_order: 2 },
      { id: 'monospace',    name: 'Monospace',     label: 'Monospace / Code',              description: 'Fixed-width fonts for code, metrics, and developer aesthetics',      color: '#6366F1', sort_order: 3 },
      { id: 'handwriting',  name: 'Handwriting',   label: 'Handwriting / Script',          description: 'Calligraphic and script typefaces for warmth and personality',       color: '#0EA5E9', sort_order: 4 },
      { id: 'custom',       name: 'Custom',        label: 'Custom / Other',                description: 'Custom-uploaded or self-hosted font families',                       color: '#A855F7', sort_order: 5 },
    ]);
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async (knex) => {
  await knex.raw('DROP INDEX IF EXISTS idx_font_categories_active');
  await knex.schema.dropTableIfExists('font_categories');
};
