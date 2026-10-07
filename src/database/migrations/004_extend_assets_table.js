// src/database/migrations/004_extend_assets_table.js — Extend assets table with category, use_count, spec, groups & seed
'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  // 1. Alter id to VARCHAR(100) to support both slug IDs ('phone-notch') and UUIDs
  await knex.raw('ALTER TABLE assets ALTER COLUMN id TYPE VARCHAR(100) USING id::text');
  await knex.raw('ALTER TABLE assets ALTER COLUMN id SET DEFAULT uuid_generate_v4()::text');

  // 2. Make user_id and file_path nullable for built-in platform assets
  await knex.raw('ALTER TABLE assets ALTER COLUMN user_id DROP NOT NULL');
  await knex.raw('ALTER TABLE assets ALTER COLUMN file_path DROP NOT NULL');

  // 2b. Expand type check constraint to include mockup, shape, illustration, icon, svg
  await knex.raw('ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_check');
  await knex.raw("ALTER TABLE assets ADD CONSTRAINT assets_type_check CHECK (type IN ('image', 'illustration', 'icon', 'mockup', 'shape', 'svg', 'video', 'font', 'json', 'other'))");

  // 3. Make file_size and mime_type have safe defaults for SVG / built-in data
  await knex.raw('ALTER TABLE assets ALTER COLUMN file_size SET DEFAULT 0');
  await knex.raw('ALTER TABLE assets ALTER COLUMN mime_type SET DEFAULT \'application/octet-stream\'');

  // 4. Expand file_url and file_path to TEXT for data URIs and long URLs
  await knex.raw('ALTER TABLE assets ALTER COLUMN file_url TYPE TEXT');
  await knex.raw('ALTER TABLE assets ALTER COLUMN file_path TYPE TEXT');

  // 5. Add columns if not existing
  const hasCol = async (col) => knex.schema.hasColumn('assets', col);

  if (!(await hasCol('is_builtin'))) {
    await knex.schema.table('assets', (t) => {
      t.boolean('is_builtin').notNullable().defaultTo(false);
    });
  }

  if (!(await hasCol('is_premium'))) {
    await knex.schema.table('assets', (t) => {
      t.boolean('is_premium').notNullable().defaultTo(false);
    });
  }

  if (!(await hasCol('category'))) {
    await knex.schema.table('assets', (t) => {
      t.string('category', 100).notNullable().defaultTo('General');
    });
  }

  if (!(await hasCol('use_count'))) {
    await knex.schema.table('assets', (t) => {
      t.integer('use_count').notNullable().defaultTo(0);
    });
  }

  if (!(await hasCol('group_id'))) {
    await knex.schema.table('assets', (t) => {
      t.string('group_id', 100).nullable();
    });
  }

  if (!(await hasCol('group_label'))) {
    await knex.schema.table('assets', (t) => {
      t.string('group_label', 255).nullable();
    });
  }

  if (!(await hasCol('spec'))) {
    await knex.schema.table('assets', (t) => {
      t.jsonb('spec').nullable();
    });
  }

  // 6. Add indexes
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_assets_type_category ON assets (type, category)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_assets_type_builtin ON assets (type, is_builtin)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_assets_type_premium ON assets (type, is_premium)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_assets_type_use_count ON assets (type, use_count DESC)');

  // 7. Migrate existing mockups table rows into assets (if mockups table exists)
  const hasMockups = await knex.schema.hasTable('mockups');
  if (hasMockups) {
    const mockups = await knex('mockups').select('*');
    for (const m of mockups) {
      const exists = await knex('assets').where({ id: m.id }).first();
      if (!exists) {
        await knex('assets').insert({
          id: m.id,
          name: m.name,
          type: 'mockup',
          category: m.category || 'Phones',
          file_url: m.image_url,
          is_builtin: m.is_builtin !== undefined ? m.is_builtin : true,
          is_premium: m.is_premium !== undefined ? m.is_premium : false,
          width: m.natural_width || 393,
          height: m.natural_height || 852,
          spec: typeof m.spec === 'string' ? m.spec : JSON.stringify(m.spec || {}),
          metadata: JSON.stringify({
            slug: m.slug,
            style: m.style,
            featured_image: m.featured_image,
            screen_slot: typeof m.screen_slot === 'string' ? JSON.parse(m.screen_slot) : m.screen_slot,
            tags: m.tags,
          }),
          created_at: m.created_at || new Date(),
        });
      }
    }
  }

  // 8. Migrate existing shapes table rows into assets (if shapes table exists)
  const hasShapes = await knex.schema.hasTable('shapes');
  if (hasShapes) {
    const shapes = await knex('shapes').select('*');
    for (const s of shapes) {
      const exists = await knex('assets').where({ id: s.id }).first();
      if (!exists) {
        await knex('assets').insert({
          id: s.id,
          name: s.name,
          type: 'shape',
          category: s.group_label || 'Basic',
          group_id: s.group_id || 'basic',
          group_label: s.group_label || 'Basic',
          file_url: null,
          is_builtin: true,
          is_premium: false,
          metadata: JSON.stringify({
            preview_type: s.preview_type,
            preview_data: typeof s.preview_data === 'string' ? JSON.parse(s.preview_data) : s.preview_data,
            svg_path: s.svg_path,
            fabric_type: s.fabric_type,
            default_props: typeof s.default_props === 'string' ? JSON.parse(s.default_props) : s.default_props,
          }),
          created_at: s.created_at || new Date(),
        });
      }
    }
  }

  // 9. Ensure existing image assets have valid categories
  await knex('assets')
    .where({ type: 'image' })
    .where((builder) => {
      builder.whereNull('category').orWhere('category', 'General');
    })
    .update({ category: 'Fitness & Health' });

  // 10. Seed sample rich Illustrations and Icons if none exist
  const illustrationCount = await knex('assets').where({ type: 'illustration' }).count('id as count').first();
  if (parseInt(illustrationCount?.count || 0, 10) === 0) {
    await knex('assets').insert([
      {
        id: 'ill-3d-rocket',
        name: '3D Growth Rocket',
        type: 'illustration',
        category: '3D & Clay',
        is_builtin: true,
        is_premium: false,
        file_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        width: 600,
        height: 600,
        use_count: 85,
        metadata: JSON.stringify({ tags: ['rocket', 'launch', 'startup', 'growth'] }),
      },
      {
        id: 'ill-3d-shield',
        name: 'Cyber Security Shield',
        type: 'illustration',
        category: '3D & Clay',
        is_builtin: true,
        is_premium: true,
        file_url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80',
        width: 600,
        height: 600,
        use_count: 62,
        metadata: JSON.stringify({ tags: ['security', 'shield', 'crypto', 'protection'] }),
      },
      {
        id: 'ill-abs-geometry',
        name: 'Vibrant Flow Dynamics',
        type: 'illustration',
        category: 'Abstract & Flow',
        is_builtin: true,
        is_premium: false,
        file_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        width: 600,
        height: 600,
        use_count: 110,
        metadata: JSON.stringify({ tags: ['abstract', 'fluid', 'gradient', 'vibrant'] }),
      },
      {
        id: 'ill-tech-ai',
        name: 'Neural Network Core',
        type: 'illustration',
        category: 'Tech & AI',
        is_builtin: true,
        is_premium: true,
        file_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
        width: 600,
        height: 600,
        use_count: 140,
        metadata: JSON.stringify({ tags: ['ai', 'tech', 'neural', 'future'] }),
      },
    ]);
  }

  const iconCount = await knex('assets').where({ type: 'icon' }).count('id as count').first();
  if (parseInt(iconCount?.count || 0, 10) === 0) {
    const makeSvgData = (path) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`)}`;
    await knex('assets').insert([
      {
        id: 'icon-home',
        name: 'Home',
        type: 'icon',
        category: 'Navigation',
        is_builtin: true,
        is_premium: false,
        file_url: makeSvgData('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
        width: 24,
        height: 24,
        use_count: 95,
      },
      {
        id: 'icon-bell',
        name: 'Notification Bell',
        type: 'icon',
        category: 'System & Device',
        is_builtin: true,
        is_premium: false,
        file_url: makeSvgData('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'),
        width: 24,
        height: 24,
        use_count: 88,
      },
      {
        id: 'icon-credit-card',
        name: 'Credit Card',
        type: 'icon',
        category: 'Commerce & Finance',
        is_builtin: true,
        is_premium: false,
        file_url: makeSvgData('<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>'),
        width: 24,
        height: 24,
        use_count: 76,
      },
      {
        id: 'icon-trending-up',
        name: 'Trending Chart',
        type: 'icon',
        category: 'Commerce & Finance',
        is_builtin: true,
        is_premium: true,
        file_url: makeSvgData('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'),
        width: 24,
        height: 24,
        use_count: 120,
      },
      {
        id: 'icon-play-circle',
        name: 'Play Media',
        type: 'icon',
        category: 'Media & Audio',
        is_builtin: true,
        is_premium: false,
        file_url: makeSvgData('<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>'),
        width: 24,
        height: 24,
        use_count: 65,
      },
      {
        id: 'icon-cpu',
        name: 'Processor Chip',
        type: 'icon',
        category: 'System & Device',
        is_builtin: true,
        is_premium: true,
        file_url: makeSvgData('<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>'),
        width: 24,
        height: 24,
        use_count: 42,
      },
    ]);
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async (knex) => {
  await knex.raw('DROP INDEX IF EXISTS idx_assets_type_category');
  await knex.raw('DROP INDEX IF EXISTS idx_assets_type_builtin');
  await knex.raw('DROP INDEX IF EXISTS idx_assets_type_premium');
  await knex.raw('DROP INDEX IF EXISTS idx_assets_type_use_count');
};
