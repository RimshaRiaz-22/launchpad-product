// src/database/migrations/008_asset_categories_subcategories.js
// Creates asset_categories + asset_subcategories tables and adds subcategory column to assets.
// Seeds all default categories/subcategories for mockups, badges, stickers, illustrations, icons.
'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  // ── 1. asset_categories ──────────────────────────────────────────────────
  const hasCatTable = await knex.schema.hasTable('asset_categories');
  if (!hasCatTable) {
    await knex.schema.createTable('asset_categories', (t) => {
      t.string('id', 100).primary(); // slug e.g. 'mockup', 'badge'
      t.string('name', 150).notNullable();
      t.string('label', 150).notNullable();
      // Which asset TYPE this category belongs to ('mockup','badge','sticker','image','illustration','icon')
      t.string('asset_type', 50).notNullable();
      t.string('description', 255).nullable();
      t.string('icon', 100).nullable(); // MUI icon name hint for frontend
      t.string('color', 30).nullable(); // accent color for UI badge
      t.integer('sort_order').notNullable().defaultTo(0);
      t.boolean('is_active').notNullable().defaultTo(true);
      t.timestamps(true, true);
    });

    await knex.raw('CREATE INDEX IF NOT EXISTS idx_asset_categories_type ON asset_categories (asset_type, is_active, sort_order)');
  }

  // ── 2. asset_subcategories ───────────────────────────────────────────────
  const hasSubTable = await knex.schema.hasTable('asset_subcategories');
  if (!hasSubTable) {
    await knex.schema.createTable('asset_subcategories', (t) => {
      t.string('id', 100).primary(); // slug e.g. 'phone-notch'
      t.string('category_id', 100).notNullable().references('id').inTable('asset_categories').onDelete('CASCADE');
      t.string('name', 150).notNullable();
      t.string('label', 150).notNullable();
      t.string('description', 255).nullable();
      t.integer('sort_order').notNullable().defaultTo(0);
      t.boolean('is_active').notNullable().defaultTo(true);
      t.timestamps(true, true);
    });

    await knex.raw('CREATE INDEX IF NOT EXISTS idx_asset_subcategories_cat ON asset_subcategories (category_id, is_active, sort_order)');
  }

  // ── 3. Add subcategory column to assets ──────────────────────────────────
  const hasSubcategory = await knex.schema.hasColumn('assets', 'subcategory');
  if (!hasSubcategory) {
    await knex.schema.table('assets', (t) => {
      t.string('subcategory', 100).nullable();
    });
    await knex.raw('CREATE INDEX IF NOT EXISTS idx_assets_subcategory ON assets (type, category, subcategory)');
  }

  // ── 4. Seed asset_categories ─────────────────────────────────────────────
  const catCount = await knex('asset_categories').count('id as count').first();
  if (parseInt(catCount?.count || 0, 10) === 0) {
    await knex('asset_categories').insert([
      // Mockup categories
      { id: 'mockup-phones',     name: 'Phones',        label: 'Phone Mockups',         asset_type: 'mockup',       description: 'iPhone & Android phone device frames',  icon: 'PhoneIphone',   color: '#38BDF8', sort_order: 0 },
      { id: 'mockup-tablets',    name: 'Tablets',       label: 'Tablet Mockups',        asset_type: 'mockup',       description: 'iPad & Android tablet device frames',   icon: 'TabletMac',     color: '#34D399', sort_order: 1 },
      { id: 'mockup-desktops',   name: 'Desktops',      label: 'Desktop Mockups',       asset_type: 'mockup',       description: 'MacBook, iMac & Windows laptop frames', icon: 'LaptopMac',     color: '#A78BFA', sort_order: 2 },
      { id: 'mockup-wearables',  name: 'Wearables',     label: 'Wearable Mockups',      asset_type: 'mockup',       description: 'Apple Watch & smartwatch frames',       icon: 'Watch',         color: '#FB923C', sort_order: 3 },
      { id: 'mockup-scenes',     name: 'Scenes',        label: 'Scene Mockups',         asset_type: 'mockup',       description: 'Lifestyle & environmental scenes',      icon: 'Landscape',     color: '#F472B6', sort_order: 4 },
      // Badge categories
      { id: 'badge-appstore',    name: 'App Store',     label: 'App Store Badges',      asset_type: 'badge',        description: 'Apple App Store award & download badges', icon: 'Apple',        color: '#22D3EE', sort_order: 0 },
      { id: 'badge-playstore',   name: 'Google Play',   label: 'Google Play Badges',    asset_type: 'badge',        description: 'Google Play Store badges',              icon: 'PlayArrow',     color: '#4ADE80', sort_order: 1 },
      { id: 'badge-awards',      name: 'Awards',        label: 'Award Badges',          asset_type: 'badge',        description: 'Quality and featured award badges',     icon: 'EmojiEvents',   color: '#FBBF24', sort_order: 2 },
      // Sticker categories
      { id: 'sticker-3d',        name: '3D Objects',    label: '3D Stickers',           asset_type: 'sticker',      description: 'Premium 3D clay & glossy stickers',     icon: 'ViewInAr',      color: '#C084FC', sort_order: 0 },
      { id: 'sticker-emoji',     name: 'Emojis',        label: 'Emoji Stickers',        asset_type: 'sticker',      description: 'Animated emoji-style stickers',         icon: 'EmojiEmotions', color: '#FCD34D', sort_order: 1 },
      { id: 'sticker-ui',        name: 'UI Kit',        label: 'UI Kit Stickers',       asset_type: 'sticker',      description: 'UI element stickers for app showcases', icon: 'Widgets',       color: '#67E8F9', sort_order: 2 },
      // Illustration categories
      { id: 'ill-3d-clay',       name: '3D & Clay',     label: '3D & Clay Illustrations', asset_type: 'illustration', description: 'Premium 3D rendered illustrations',   icon: 'AutoFixHigh',   color: '#F87171', sort_order: 0 },
      { id: 'ill-abstract',      name: 'Abstract',      label: 'Abstract & Flow',       asset_type: 'illustration', description: 'Fluid, gradient & abstract artwork',    icon: 'Gradient',      color: '#A78BFA', sort_order: 1 },
      { id: 'ill-tech',          name: 'Tech & AI',     label: 'Tech & AI',             asset_type: 'illustration', description: 'Technology and artificial intelligence', icon: 'Memory',        color: '#38BDF8', sort_order: 2 },
      // Icon categories
      { id: 'icon-nav',          name: 'Navigation',    label: 'Navigation Icons',      asset_type: 'icon',         description: 'Navigation and wayfinding icons',       icon: 'Navigation',    color: '#34D399', sort_order: 0 },
      { id: 'icon-commerce',     name: 'Commerce',      label: 'Commerce & Finance',    asset_type: 'icon',         description: 'E-commerce and finance icons',          icon: 'ShoppingCart',  color: '#FBBF24', sort_order: 1 },
      { id: 'icon-media',        name: 'Media',         label: 'Media & Audio',         asset_type: 'icon',         description: 'Media playback and audio icons',        icon: 'PlayCircle',    color: '#F472B6', sort_order: 2 },
      { id: 'icon-system',       name: 'System',        label: 'System & Device',       asset_type: 'icon',         description: 'System and device icons',               icon: 'Settings',      color: '#94A3B8', sort_order: 3 },
    ]);
  }

  // ── 5. Seed asset_subcategories ───────────────────────────────────────────
  const subCount = await knex('asset_subcategories').count('id as count').first();
  if (parseInt(subCount?.count || 0, 10) === 0) {
    await knex('asset_subcategories').insert([
      // Phone subcategories
      { id: 'phone-notch',         category_id: 'mockup-phones',   name: 'Notch',              label: 'Phone – Notch',              sort_order: 0 },
      { id: 'phone-dynamic-island',category_id: 'mockup-phones',   name: 'Dynamic Island',     label: 'Phone – Dynamic Island',     sort_order: 1 },
      { id: 'phone-bezel-less',    category_id: 'mockup-phones',   name: 'Bezel-less',         label: 'Phone – Bezel-less',         sort_order: 2 },
      { id: 'phone-android',       category_id: 'mockup-phones',   name: 'Android',            label: 'Phone – Android',            sort_order: 3 },
      { id: 'phone-fold',          category_id: 'mockup-phones',   name: 'Fold',               label: 'Phone – Fold',               sort_order: 4 },
      // Tablet subcategories
      { id: 'tablet-ipad-pro',     category_id: 'mockup-tablets',  name: 'iPad Pro',           label: 'iPad Pro',                   sort_order: 0 },
      { id: 'tablet-ipad-air',     category_id: 'mockup-tablets',  name: 'iPad Air',           label: 'iPad Air',                   sort_order: 1 },
      { id: 'tablet-android',      category_id: 'mockup-tablets',  name: 'Android Tablet',     label: 'Android Tablet',             sort_order: 2 },
      // Desktop subcategories
      { id: 'desktop-macbook-pro', category_id: 'mockup-desktops', name: 'MacBook Pro',        label: 'MacBook Pro',                sort_order: 0 },
      { id: 'desktop-macbook-air', category_id: 'mockup-desktops', name: 'MacBook Air',        label: 'MacBook Air',                sort_order: 1 },
      { id: 'desktop-imac',        category_id: 'mockup-desktops', name: 'iMac',               label: 'iMac',                       sort_order: 2 },
      { id: 'desktop-windows',     category_id: 'mockup-desktops', name: 'Windows',            label: 'Windows Laptop',             sort_order: 3 },
      // Wearable subcategories
      { id: 'watch-apple-ultra',   category_id: 'mockup-wearables',name: 'Apple Ultra',        label: 'Apple Watch Ultra',          sort_order: 0 },
      { id: 'watch-apple-series',  category_id: 'mockup-wearables',name: 'Apple Series',       label: 'Apple Watch Series',         sort_order: 1 },
      // App Store badge subcategories
      { id: 'badge-download-ios',  category_id: 'badge-appstore',  name: 'Download',           label: 'Download on App Store',      sort_order: 0 },
      { id: 'badge-award-ios',     category_id: 'badge-appstore',  name: 'Award of the Day',   label: 'App of the Day',             sort_order: 1 },
      { id: 'badge-award-year',    category_id: 'badge-appstore',  name: 'Award of the Year',  label: 'App of the Year',            sort_order: 2 },
      // Google Play badge subcategories
      { id: 'badge-download-play', category_id: 'badge-playstore', name: 'Download',           label: 'Get it on Google Play',      sort_order: 0 },
      // Award badge subcategories
      { id: 'badge-editors-choice',category_id: 'badge-awards',    name: "Editor's Choice",    label: "Editor's Choice",            sort_order: 0 },
      { id: 'badge-featured',      category_id: 'badge-awards',    name: 'Featured',           label: 'Featured App',               sort_order: 1 },
    ]);
  }

  // ── 6. Backfill subcategory on existing assets ────────────────────────────
  // Skipped intentionally — existing assets will have subcategory = NULL.
  // Admin users can assign subcategories via the UI's edit panel.
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async (knex) => {
  await knex.raw('DROP INDEX IF EXISTS idx_assets_subcategory');
  await knex.raw('DROP INDEX IF EXISTS idx_asset_subcategories_cat');
  await knex.raw('DROP INDEX IF EXISTS idx_asset_categories_type');

  // Drop subcategory column from assets
  if (await knex.schema.hasColumn('assets', 'subcategory')) {
    await knex.schema.table('assets', (t) => t.dropColumn('subcategory'));
  }

  await knex.schema.dropTableIfExists('asset_subcategories');
  await knex.schema.dropTableIfExists('asset_categories');
};
