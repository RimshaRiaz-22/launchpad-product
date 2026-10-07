// backend/src/database/seeds/seed_fonts.js
// Ultra-Comprehensive Google Fonts Seeder
// Seeds 562 modern, high-utility Google Fonts across all 5 typography categories:
// - Sans-Serif: 220 fonts (Inter, Roboto, Plus Jakarta Sans, Outfit, Poppins, Sora, etc.)
// - Serif: 130 fonts (Playfair Display, Merriweather, Lora, Cinzel, Cormorant, etc.)
// - Display: 110 fonts (Bebas Neue, Anton, Righteous, Oswald, Titan One, etc.)
// - Monospace: 42 fonts (JetBrains Mono, Fira Code, Space Mono, Roboto Mono, etc.)
// - Handwriting: 60 fonts (Caveat, Dancing Script, Pacifico, Great Vibes, etc.)
'use strict';

const path = require('path');
const db = require('../knex');
const memoryCache = require('../../utils/memoryCache');

const FONTS_DATA = require('./data/google_fonts_562.json');

const FONT_CATEGORIES = [
  {
    id: 'sans-serif',
    name: 'Sans-Serif',
    label: 'Sans-Serif / Clean UI',
    description: 'Clean, modern sans-serif typefaces ideal for UI, apps, and headlines',
    color: '#10B981',
    sort_order: 0,
    is_active: true,
  },
  {
    id: 'serif',
    name: 'Serif',
    label: 'Serif / Editorial & Luxury',
    description: 'Elegant serif typefaces for editorial, publication, and luxury brands',
    color: '#F59E0B',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'display',
    name: 'Display',
    label: 'Display / Bold Headlines',
    description: 'High-impact display fonts for bold headlines, marketing, and App Store titles',
    color: '#EC4899',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'monospace',
    name: 'Monospace',
    label: 'Monospace / Code & Tech',
    description: 'Fixed-width fonts for code, metrics, developer aesthetics, and tech layouts',
    color: '#6366F1',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'handwriting',
    name: 'Handwriting',
    label: 'Handwriting & Script',
    description: 'Calligraphic and expressive script typefaces for warmth, signature, and personality',
    color: '#0EA5E9',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'custom',
    name: 'Custom',
    label: 'Custom / Uploaded',
    description: 'Custom-uploaded or self-hosted font families',
    color: '#A855F7',
    sort_order: 5,
    is_active: true,
  },
];

async function seedFonts() {
  console.log('🚀 Starting Google Fonts Seeding (562 Modern Web Fonts)...');

  // 1. Ensure Categories in `font_categories` table
  console.log(`📂 Ensuring ${FONT_CATEGORIES.length} typography categories...`);
  const hasCatTable = await db.schema.hasTable('font_categories');
  if (hasCatTable) {
    for (const cat of FONT_CATEGORIES) {
      const existing = await db('font_categories').where({ id: cat.id }).first();
      if (!existing) {
        await db('font_categories').insert({
          ...cat,
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        });
        console.log(`   ➕ Inserted font category: ${cat.name} (${cat.id})`);
      } else {
        await db('font_categories')
          .where({ id: cat.id })
          .update({
            name: cat.name,
            label: cat.label,
            description: cat.description,
            color: cat.color,
            sort_order: cat.sort_order,
            is_active: cat.is_active,
            updated_at: db.fn.now(),
          });
      }
    }
  }

  // 2. Batch upsert Fonts into `fonts` table
  console.log(`✨ Upserting ${FONTS_DATA.length} Google Fonts into fonts table in high-performance batches...`);
  let insertedCount = 0;
  let updatedCount = 0;

  // Process in chunks of 50 for rapid database execution over SSL
  const CHUNK_SIZE = 50;
  for (let i = 0; i < FONTS_DATA.length; i += CHUNK_SIZE) {
    const chunk = FONTS_DATA.slice(i, i + CHUNK_SIZE);

    for (const font of chunk) {
      const existing = await db('fonts').where({ id: font.id }).first();

      const fontPayload = {
        id: font.id,
        user_id: null,
        name: font.name,
        family: font.family,
        category: font.category,
        font_url: font.font_url,
        weights: JSON.stringify(font.weights || [400, 700]),
        is_builtin: true,
        updated_at: db.fn.now(),
      };

      if (!existing) {
        await db('fonts').insert({
          ...fontPayload,
          created_at: db.fn.now(),
        });
        insertedCount++;
      } else {
        await db('fonts').where({ id: font.id }).update(fontPayload);
        updatedCount++;
      }
    }
    console.log(`   📦 Processed batch ${Math.floor(i / CHUNK_SIZE) + 1} (${Math.min(i + CHUNK_SIZE, FONTS_DATA.length)} / ${FONTS_DATA.length})...`);
  }

  // 3. Invalidate memory cache so frontend immediately sees updated fonts & categories
  try {
    memoryCache.delPrefix('fonts:categories');
  } catch (_) {}

  console.log('✅ [Google Fonts] Seeding completed successfully!');
  console.log(`   - Fonts Inserted: ${insertedCount}`);
  console.log(`   - Fonts Updated:  ${updatedCount}`);
  console.log(`   - Total in DB:     ${insertedCount + updatedCount}`);

  return { insertedCount, updatedCount, total: insertedCount + updatedCount };
}

// Support running both as standalone script and as Knex seed
if (require.main === module) {
  require('dotenv').config();
  seedFonts()
    .then(() => {
      console.log('🎉 Google Fonts Seeder completed without error.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Font Seeder encountered an error:', err);
      process.exit(1);
    });
}

exports.seed = seedFonts;
