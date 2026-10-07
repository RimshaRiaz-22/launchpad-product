// src/database/migrations/007_create_showcase_and_presets.js
'use strict';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // 1. Table: showcase_formats (Cards like App Store Screenshots, Device Mockups, etc.)
  const hasShowcaseTable = await knex.schema.hasTable('showcase_formats');
  if (!hasShowcaseTable) {
    await knex.schema.createTable('showcase_formats', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name', 150).notNullable();
      table.string('slug', 100).unique().notNullable();
      table.string('description', 255);
      table.string('badge_text', 80);
      table.string('badge_color', 30).defaultTo('#10B981');
      table.string('visual_type', 50).defaultTo('app-store'); // 'app-store', 'mockups', 'feature-graphic', 'custom_image'
      table.text('image_url').nullable();
      table.text('gradient').nullable();
      table.integer('sort_order').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 2. Table: device_presets (Sizes like iPhone 6.9", iPad 13", etc.)
  const hasPresetsTable = await knex.schema.hasTable('device_presets');
  if (!hasPresetsTable) {
    await knex.schema.createTable('device_presets', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name', 120).notNullable();
      table.string('slug', 100).unique().notNullable();
      table.integer('width').notNullable();
      table.integer('height').notNullable();
      table.string('device_type', 50).defaultTo('smartphone'); // 'smartphone', 'tablet_mac', 'phone_android', 'tablet_android', 'laptop_mac', 'aspect_ratio', 'crop_square', 'custom'
      table.uuid('format_id').nullable().references('id').inTable('showcase_formats').onDelete('SET NULL');
      table.boolean('is_standard').defaultTo(true); // true = primary rail pill, false = "More sizes" dropdown
      table.integer('sort_order').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 3. Seed initial showcase_formats if empty
  const formatCount = await knex('showcase_formats').count('id as count').first();
  if (parseInt(formatCount?.count || '0', 10) === 0) {
    await knex('showcase_formats').insert([
      {
        id: '11111111-1111-4111-a111-111111111111',
        name: 'App Store Screenshots',
        slug: 'app-store',
        description: 'Multi-screen showcases',
        badge_text: 'iOS 18 Ready',
        badge_color: '#10B981',
        visual_type: 'app-store',
        sort_order: 0,
        is_active: true,
      },
      {
        id: '22222222-2222-4222-a222-222222222222',
        name: 'Device Mockups',
        slug: 'mockups',
        description: '3D hardware presentations',
        badge_text: '3D Perspective',
        badge_color: '#38BDF8',
        visual_type: 'mockups',
        sort_order: 1,
        is_active: true,
      },
      {
        id: '33333333-3333-4333-a333-333333333333',
        name: 'Google Play Feature Graphics',
        slug: 'feature-graphic',
        description: '1024 × 500 promo banners',
        badge_text: 'Play Store Banner',
        badge_color: '#34D399',
        visual_type: 'feature-graphic',
        sort_order: 2,
        is_active: true,
      },
    ]);
  }

  // 4. Seed initial device_presets if empty
  const presetCount = await knex('device_presets').count('id as count').first();
  if (parseInt(presetCount?.count || '0', 10) === 0) {
    await knex('device_presets').insert([
      {
        id: 'aaaaaaaa-1111-4aaa-aaaa-aaaaaaaaaaaa',
        name: 'iPhone 6.9"',
        slug: 'iphone-6.9',
        width: 1290,
        height: 2796,
        device_type: 'smartphone',
        is_standard: true,
        sort_order: 0,
        is_active: true,
      },
      {
        id: 'bbbbbbbb-2222-4bbb-bbbb-bbbbbbbbbbbb',
        name: 'iPad 13"',
        slug: 'ipad-13',
        width: 2064,
        height: 2752,
        device_type: 'tablet_mac',
        is_standard: true,
        sort_order: 1,
        is_active: true,
      },
      {
        id: 'cccccccc-3333-4ccc-cccc-cccccccccccc',
        name: 'Android Phone',
        slug: 'android-phone',
        width: 1080,
        height: 2400,
        device_type: 'phone_android',
        is_standard: true,
        sort_order: 2,
        is_active: true,
      },
      {
        id: 'dddddddd-4444-4ddd-dddd-dddddddddddd',
        name: 'Android Tablet',
        slug: 'android-tablet',
        width: 1600,
        height: 2560,
        device_type: 'tablet_android',
        is_standard: true,
        sort_order: 3,
        is_active: true,
      },
      {
        id: 'eeeeeeee-5555-4eee-eeee-eeeeeeeeeeee',
        name: 'Mac',
        slug: 'mac',
        width: 2880,
        height: 1800,
        device_type: 'laptop_mac',
        is_standard: true,
        sort_order: 4,
        is_active: true,
      },
      {
        id: 'ffffffff-6666-4fff-ffff-ffffffffffff',
        name: 'iPhone 6.5" (1242 × 2688)',
        slug: 'iphone-6.5',
        width: 1242,
        height: 2688,
        device_type: 'smartphone',
        is_standard: false,
        sort_order: 5,
        is_active: true,
      },
      {
        id: '00000000-7777-4000-0000-000000000000',
        name: 'Play Store Banner (1024 × 500)',
        slug: 'play-store-banner-1024x500',
        width: 1024,
        height: 500,
        device_type: 'aspect_ratio',
        is_standard: false,
        sort_order: 6,
        is_active: true,
      },
      {
        id: '99999999-8888-4999-9999-999999999999',
        name: 'Square Social (1600 × 1600)',
        slug: 'square-social-1600x1600',
        width: 1600,
        height: 1600,
        device_type: 'crop_square',
        is_standard: false,
        sort_order: 7,
        is_active: true,
      },
    ]);
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('device_presets');
  await knex.schema.dropTableIfExists('showcase_formats');
};
