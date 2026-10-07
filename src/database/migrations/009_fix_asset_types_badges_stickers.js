// src/database/migrations/009_fix_asset_types_badges_stickers.js
// 1. Adds 'badge' and 'sticker' to the assets type constraint
// 2. Fixes mime_type for SVG data-URI mockups
// 3. Seeds real badge and sticker assets
'use strict';

// ── Badge SVGs (real App Store / Google Play download badges) ─────────────────
const makeSvg = (content, vw, vh) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}">${content}</svg>`)}`;

// App Store Download Badge (simplified, proportionally accurate)
const SVG_BADGE_APPSTORE = makeSvg(
  `<rect width="200" height="60" rx="10" fill="#000"/>
   <text x="100" y="22" font-family="SF Pro,Helvetica,Arial,sans-serif" font-size="9" fill="#fff" text-anchor="middle" letter-spacing="1">Download on the</text>
   <text x="100" y="42" font-family="SF Pro,Helvetica,Arial,sans-serif" font-size="20" font-weight="600" fill="#fff" text-anchor="middle">App Store</text>
   <path d="M20 30 C20 24 24 20 30 20 C34 20 37 22 39 24 C41 22 45 20 49 20 C55 20 59 24 59 30 C59 38 49 46 39 52 C29 46 20 38 20 30Z" fill="#fff" transform="scale(0.55) translate(-5,10)"/>`,
  200, 60
);

// Google Play Badge
const SVG_BADGE_PLAYSTORE = makeSvg(
  `<rect width="200" height="60" rx="10" fill="#000"/>
   <text x="100" y="22" font-family="Roboto,Arial,sans-serif" font-size="9" fill="#fff" text-anchor="middle" letter-spacing="1">GET IT ON</text>
   <text x="100" y="42" font-family="Roboto,Arial,sans-serif" font-size="20" font-weight="400" fill="#fff" text-anchor="middle">Google Play</text>
   <polygon points="14,14 14,46 28,30" fill="#4ade80" transform="scale(0.7) translate(0,4)"/>`,
  200, 60
);

// App of the Day badge
const SVG_BADGE_APPDAY = makeSvg(
  `<rect width="200" height="60" rx="10" fill="#0071E3"/>
   <text x="100" y="20" font-family="SF Pro,Helvetica,Arial,sans-serif" font-size="8" fill="rgba(255,255,255,0.85)" text-anchor="middle" letter-spacing="1.2">APP STORE</text>
   <text x="100" y="36" font-family="SF Pro,Helvetica,Arial,sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">App of the Day</text>
   <text x="100" y="52" font-family="SF Pro,Helvetica,Arial,sans-serif" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">★ ★ ★ ★ ★</text>`,
  200, 60
);

// App of the Year badge
const SVG_BADGE_APPYEAR = makeSvg(
  `<rect width="200" height="60" rx="10" fill="#1D1D1F"/>
   <rect width="200" height="60" rx="10" fill="url(#gold)" opacity="0.15"/>
   <text x="100" y="20" font-family="SF Pro,Helvetica,Arial,sans-serif" font-size="8" fill="#F5C842" text-anchor="middle" letter-spacing="1.2">APP STORE  ✦</text>
   <text x="100" y="36" font-family="SF Pro,Helvetica,Arial,sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">App of the Year</text>
   <text x="100" y="52" font-family="SF Pro,Helvetica,Arial,sans-serif" font-size="8" fill="#F5C842" text-anchor="middle">2025 Winner</text>`,
  200, 60
);

// Editor's Choice badge
const SVG_BADGE_EDITORS = makeSvg(
  `<rect width="200" height="60" rx="10" fill="#1A1A2E"/>
   <text x="100" y="20" font-family="Roboto,Arial,sans-serif" font-size="8" fill="#34D399" text-anchor="middle" letter-spacing="1">GOOGLE PLAY</text>
   <text x="100" y="38" font-family="Roboto,Arial,sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">Editor's Choice</text>
   <text x="100" y="53" font-family="Roboto,Arial,sans-serif" font-size="8" fill="rgba(255,255,255,0.55)" text-anchor="middle">★ Editors recommend</text>`,
  200, 60
);

// Featured badge
const SVG_BADGE_FEATURED = makeSvg(
  `<rect width="200" height="60" rx="10" fill="linear-gradient(135deg,#667eea,#764ba2)"/>
   <rect width="200" height="60" rx="10" fill="#5B21B6"/>
   <text x="100" y="22" font-family="SF Pro,Helvetica,Arial,sans-serif" font-size="9" fill="rgba(255,255,255,0.75)" text-anchor="middle" letter-spacing="1">APP STORE</text>
   <text x="100" y="42" font-family="SF Pro,Helvetica,Arial,sans-serif" font-size="18" font-weight="700" fill="#fff" text-anchor="middle">✦ Featured</text>`,
  200, 60
);

// "Top Free" badge
const SVG_BADGE_TOPFREE = makeSvg(
  `<rect width="200" height="60" rx="10" fill="#0F172A"/>
   <text x="100" y="22" font-family="Roboto,Arial,sans-serif" font-size="9" fill="#38BDF8" text-anchor="middle" letter-spacing="1">#1 TOP FREE APP</text>
   <text x="100" y="43" font-family="Roboto,Arial,sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">Google Play</text>`,
  200, 60
);

// "Top Paid" badge
const SVG_BADGE_TOPPAID = makeSvg(
  `<rect width="200" height="60" rx="10" fill="#0F172A"/>
   <text x="100" y="22" font-family="Roboto,Arial,sans-serif" font-size="9" fill="#FBBF24" text-anchor="middle" letter-spacing="1">#1 TOP PAID APP</text>
   <text x="100" y="43" font-family="Roboto,Arial,sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">Google Play</text>`,
  200, 60
);

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  // ── 0. Ensure updated_at column exists on assets (required by trigger_assets_updated_at)
  const hasUpdatedAt = await knex.schema.hasColumn('assets', 'updated_at');
  if (!hasUpdatedAt) {
    await knex.schema.table('assets', (t) => {
      t.timestamp('updated_at').nullable().defaultTo(knex.fn.now());
    });
  }

  // ── 1. Expand type CHECK constraint to include badge + sticker ─────────────
  await knex.raw('ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_check');
  await knex.raw(`
    ALTER TABLE assets
    ADD CONSTRAINT assets_type_check
    CHECK (type IN ('image', 'illustration', 'icon', 'mockup', 'shape', 'svg', 'badge', 'sticker', 'video', 'font', 'json', 'other'))
  `);

  // ── 2. Fix mime_type for SVG data-URI mockups stored as octet-stream ────────
  await knex('assets')
    .where('type', 'mockup')
    .where('mime_type', 'application/octet-stream')
    .whereRaw(`file_url LIKE 'data:image/svg+xml%'`)
    .update({ mime_type: 'image/svg+xml' });

  // Also fix any icons that were saved without a proper SVG mime_type
  await knex('assets')
    .where('type', 'icon')
    .where('mime_type', 'application/octet-stream')
    .whereRaw(`file_url LIKE 'data:image/svg+xml%'`)
    .update({ mime_type: 'image/svg+xml' });

  // ── 3. Seed badge assets ───────────────────────────────────────────────────
  const badgeCount = await knex('assets').where('type', 'badge').count('id as count').first();
  if (parseInt(badgeCount?.count || 0, 10) === 0) {
    await knex('assets').insert([
      {
        id: 'badge-download-appstore',
        name: 'Download on the App Store',
        type: 'badge',
        category: 'App Store',
        subcategory: 'badge-download-ios',
        file_url: SVG_BADGE_APPSTORE,
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 200,
        height: 60,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['app-store', 'download', 'ios', 'apple', 'badge'] }),
      },
      {
        id: 'badge-app-of-day',
        name: 'App of the Day',
        type: 'badge',
        category: 'App Store',
        subcategory: 'badge-award-ios',
        file_url: SVG_BADGE_APPDAY,
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 200,
        height: 60,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['app-store', 'award', 'ios', 'featured'] }),
      },
      {
        id: 'badge-app-of-year',
        name: 'App of the Year',
        type: 'badge',
        category: 'App Store',
        subcategory: 'badge-award-year',
        file_url: SVG_BADGE_APPYEAR,
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 200,
        height: 60,
        is_builtin: true,
        is_premium: true,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['app-store', 'award', 'year', 'winner', 'gold'] }),
      },
      {
        id: 'badge-download-playstore',
        name: 'Get it on Google Play',
        type: 'badge',
        category: 'Google Play',
        subcategory: 'badge-download-play',
        file_url: SVG_BADGE_PLAYSTORE,
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 200,
        height: 60,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['google-play', 'download', 'android', 'badge'] }),
      },
      {
        id: 'badge-editors-choice',
        name: "Editor's Choice",
        type: 'badge',
        category: 'Google Play',
        subcategory: 'badge-editors-choice',
        file_url: SVG_BADGE_EDITORS,
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 200,
        height: 60,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['google-play', 'editors-choice', 'award', 'android'] }),
      },
      {
        id: 'badge-top-free',
        name: '#1 Top Free App',
        type: 'badge',
        category: 'Google Play',
        subcategory: 'badge-download-play',
        file_url: SVG_BADGE_TOPFREE,
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 200,
        height: 60,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['google-play', 'top-free', 'chart', 'rank'] }),
      },
      {
        id: 'badge-featured',
        name: 'Featured App',
        type: 'badge',
        category: 'Awards',
        subcategory: 'badge-featured',
        file_url: SVG_BADGE_FEATURED,
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 200,
        height: 60,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['featured', 'award', 'highlight'] }),
      },
      {
        id: 'badge-top-paid',
        name: '#1 Top Paid App',
        type: 'badge',
        category: 'Google Play',
        subcategory: 'badge-download-play',
        file_url: SVG_BADGE_TOPPAID,
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 200,
        height: 60,
        is_builtin: true,
        is_premium: true,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['google-play', 'top-paid', 'chart', 'rank'] }),
      },
    ]);
  }

  // ── 4. Seed sticker assets (CDN PNG + SVG) ────────────────────────────────
  const stickerCount = await knex('assets').where('type', 'sticker').count('id as count').first();
  if (parseInt(stickerCount?.count || 0, 10) === 0) {
    // Using high-quality CDN image URLs (Unsplash objects/emojis, styled consistently)
    await knex('assets').insert([
      {
        id: 'sticker-star-gold',
        name: 'Gold Star Rating',
        type: 'sticker',
        category: '3D Objects',
        subcategory: 'sticker-3d',
        file_url: makeSvg(
          `<text y="80" font-size="90" text-anchor="middle" x="50">⭐</text>`,
          100, 100
        ),
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 100,
        height: 100,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['star', 'rating', '3d', 'gold'] }),
      },
      {
        id: 'sticker-rocket-3d',
        name: '3D Rocket Launch',
        type: 'sticker',
        category: '3D Objects',
        subcategory: 'sticker-3d',
        file_url: makeSvg(
          `<text y="80" font-size="90" text-anchor="middle" x="50">🚀</text>`,
          100, 100
        ),
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 100,
        height: 100,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['rocket', 'launch', 'startup', '3d'] }),
      },
      {
        id: 'sticker-crown-3d',
        name: '3D Crown',
        type: 'sticker',
        category: '3D Objects',
        subcategory: 'sticker-3d',
        file_url: makeSvg(
          `<text y="80" font-size="90" text-anchor="middle" x="50">👑</text>`,
          100, 100
        ),
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 100,
        height: 100,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['crown', 'premium', 'king', '3d'] }),
      },
      {
        id: 'sticker-fire',
        name: 'Fire Trending',
        type: 'sticker',
        category: 'Emojis',
        subcategory: 'sticker-emoji',
        file_url: makeSvg(
          `<text y="80" font-size="90" text-anchor="middle" x="50">🔥</text>`,
          100, 100
        ),
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 100,
        height: 100,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['fire', 'trending', 'hot', 'emoji'] }),
      },
      {
        id: 'sticker-sparkle',
        name: 'Sparkle Magic',
        type: 'sticker',
        category: 'Emojis',
        subcategory: 'sticker-emoji',
        file_url: makeSvg(
          `<text y="80" font-size="90" text-anchor="middle" x="50">✨</text>`,
          100, 100
        ),
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 100,
        height: 100,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['sparkle', 'magic', 'new', 'featured'] }),
      },
      {
        id: 'sticker-trophy',
        name: 'Trophy Award',
        type: 'sticker',
        category: '3D Objects',
        subcategory: 'sticker-3d',
        file_url: makeSvg(
          `<text y="80" font-size="90" text-anchor="middle" x="50">🏆</text>`,
          100, 100
        ),
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 100,
        height: 100,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['trophy', 'award', 'winner', 'achievement'] }),
      },
      {
        id: 'sticker-new-label',
        name: 'NEW Label',
        type: 'sticker',
        category: 'UI Kit',
        subcategory: 'sticker-ui',
        file_url: makeSvg(
          `<rect width="100" height="36" rx="18" fill="#10B981"/>
           <text x="50" y="24" font-size="16" font-weight="800" fill="#fff" font-family="Inter,Arial,sans-serif" text-anchor="middle" letter-spacing="2">NEW</text>`,
          100, 36
        ),
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 100,
        height: 36,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['new', 'label', 'badge', 'ui', 'pill'] }),
      },
      {
        id: 'sticker-pro-label',
        name: 'PRO Label',
        type: 'sticker',
        category: 'UI Kit',
        subcategory: 'sticker-ui',
        file_url: makeSvg(
          `<rect width="100" height="36" rx="18" fill="#FBBF24"/>
           <text x="50" y="24" font-size="16" font-weight="800" fill="#000" font-family="Inter,Arial,sans-serif" text-anchor="middle" letter-spacing="2">PRO</text>`,
          100, 36
        ),
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 100,
        height: 36,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['pro', 'premium', 'label', 'ui', 'pill'] }),
      },
      {
        id: 'sticker-sale-label',
        name: 'SALE Label',
        type: 'sticker',
        category: 'UI Kit',
        subcategory: 'sticker-ui',
        file_url: makeSvg(
          `<rect width="100" height="36" rx="18" fill="#EF4444"/>
           <text x="50" y="24" font-size="16" font-weight="800" fill="#fff" font-family="Inter,Arial,sans-serif" text-anchor="middle" letter-spacing="2">SALE</text>`,
          100, 36
        ),
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 100,
        height: 36,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['sale', 'discount', 'label', 'ui', 'pill'] }),
      },
      {
        id: 'sticker-verified',
        name: 'Verified Badge',
        type: 'sticker',
        category: 'UI Kit',
        subcategory: 'sticker-ui',
        file_url: makeSvg(
          `<circle cx="50" cy="50" r="45" fill="#3B82F6"/>
           <polyline points="28,50 44,66 72,34" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
          100, 100
        ),
        mime_type: 'image/svg+xml',
        file_size: 0,
        width: 100,
        height: 100,
        is_builtin: true,
        is_premium: false,
        use_count: 0,
        metadata: JSON.stringify({ tags: ['verified', 'check', 'trust', 'ui', 'badge'] }),
      },
    ]);
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async (knex) => {
  // Remove seeded badges and stickers
  await knex('assets').whereIn('id', [
    'badge-download-appstore', 'badge-app-of-day', 'badge-app-of-year',
    'badge-download-playstore', 'badge-editors-choice', 'badge-top-free',
    'badge-featured', 'badge-top-paid',
    'sticker-star-gold', 'sticker-rocket-3d', 'sticker-crown-3d',
    'sticker-fire', 'sticker-sparkle', 'sticker-trophy',
    'sticker-new-label', 'sticker-pro-label', 'sticker-sale-label', 'sticker-verified',
  ]).delete();

  // Restore original type constraint (without badge/sticker)
  await knex.raw('ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_check');
  await knex.raw(`
    ALTER TABLE assets
    ADD CONSTRAINT assets_type_check
    CHECK (type IN ('image', 'illustration', 'icon', 'mockup', 'shape', 'svg', 'video', 'font', 'json', 'other'))
  `);
};
