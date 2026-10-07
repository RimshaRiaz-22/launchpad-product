// backend/src/database/seeds/seed_stickers.js
// Ultra-Modern Vector Stickers & Emojis Seeder
// Seeds 88 precision handcrafted vector stickers across 7 categories and 14 subcategories.
'use strict';

const db = require('../knex');
const memoryCache = require('../../utils/memoryCache');

// Helper to construct precision vector SVG sticker data-URIs
function makeStickerSvg(content, { viewBox = '0 0 100 100', width = 100, height = 100 } = {}) {
  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">${content}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
}

// ─── 1. STICKER CATEGORIES ───────────────────────────────────────────────────
const STICKER_CATEGORIES = [
  {
    id: 'sticker-emojis',
    name: 'Emojis & Faces',
    label: 'Emojis & Faces',
    asset_type: 'sticker',
    description: 'Expressive emojis, smiling faces, reactions, and character moods',
    icon: 'Smile',
    color: '#F59E0B',
    sort_order: 0,
    is_active: true,
  },
  {
    id: 'sticker-gestures',
    name: 'Hands & Gestures',
    label: 'Hands & Gestures',
    asset_type: 'sticker',
    description: 'Thumbs up, peace signs, claps, points, high fives, and gestures',
    icon: 'ThumbsUp',
    color: '#10B981',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'sticker-hearts',
    name: 'Hearts & Love',
    label: 'Hearts & Love',
    asset_type: 'sticker',
    description: 'Romantic hearts, fiery hearts, sparkle hearts, and ribbons',
    icon: 'Heart',
    color: '#EC4899',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'sticker-promo',
    name: 'Promotional & Sales',
    label: 'Promotional Badges',
    asset_type: 'sticker',
    description: 'Sale tags, discount stickers, New, Hot, Verified, and Best Seller badges',
    icon: 'Tag',
    color: '#EF4444',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'sticker-rewards',
    name: 'Stars & Awards',
    label: 'Stars & Awards',
    asset_type: 'sticker',
    description: 'Golden stars, medals, trophies, crowns, and achievement ribbons',
    icon: 'Award',
    color: '#F59E0B',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'sticker-objects',
    name: 'Objects & Tech',
    label: 'Objects & Tech',
    asset_type: 'sticker',
    description: 'Rockets, fire, party poppers, lightning bolts, lightbulbs, and gifts',
    icon: 'Zap',
    color: '#8B5CF6',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'sticker-nature',
    name: 'Food & Nature',
    label: 'Food & Nature',
    asset_type: 'sticker',
    description: 'Delicious food, treats, rainbow, clover, sunshine, and cute animals',
    icon: 'Sun',
    color: '#0284C7',
    sort_order: 6,
    is_active: true,
  },
];

// ─── 2. STICKER SUBCATEGORIES ────────────────────────────────────────────────
const STICKER_SUBCATEGORIES = [
  // Emojis & Faces
  { id: 'sub-stk-happy', category_id: 'sticker-emojis', name: 'Happy & Joyful', label: 'Happy & Joyful', sort_order: 0 },
  { id: 'sub-stk-cool', category_id: 'sticker-emojis', name: 'Cool & Fun', label: 'Cool & Fun', sort_order: 1 },
  { id: 'sub-stk-dramatic', category_id: 'sticker-emojis', name: 'Dramatic & Shocked', label: 'Dramatic & Shocked', sort_order: 2 },

  // Hands & Gestures
  { id: 'sub-stk-reactions', category_id: 'sticker-gestures', name: 'Positive Reactions', label: 'Positive Reactions', sort_order: 0 },
  { id: 'sub-stk-pointers', category_id: 'sticker-gestures', name: 'Pointers & Signals', label: 'Pointers & Signals', sort_order: 1 },

  // Hearts & Love
  { id: 'sub-stk-classic-hearts', category_id: 'sticker-hearts', name: 'Classic Hearts', label: 'Classic Hearts', sort_order: 0 },
  { id: 'sub-stk-sparkle-hearts', category_id: 'sticker-hearts', name: 'Sparkle & Glow Hearts', label: 'Sparkle & Glow Hearts', sort_order: 1 },

  // Promotional & Sales
  { id: 'sub-stk-discounts', category_id: 'sticker-promo', name: 'Discounts & Deals', label: 'Discounts & Deals', sort_order: 0 },
  { id: 'sub-stk-status-tags', category_id: 'sticker-promo', name: 'Status & Pill Tags', label: 'Status & Pill Tags', sort_order: 1 },

  // Stars & Awards
  { id: 'sub-stk-stars', category_id: 'sticker-rewards', name: 'Stars & Sparkles', label: 'Stars & Sparkles', sort_order: 0 },
  { id: 'sub-stk-trophies', category_id: 'sticker-rewards', name: 'Trophies & Medals', label: 'Trophies & Medals', sort_order: 1 },

  // Objects & Tech
  { id: 'sub-stk-energy', category_id: 'sticker-objects', name: 'Energy & Excitement', label: 'Energy & Excitement', sort_order: 0 },
  { id: 'sub-stk-gadgets', category_id: 'sticker-objects', name: 'Gadgets & Tools', label: 'Gadgets & Tools', sort_order: 1 },

  // Food & Nature
  { id: 'sub-stk-food', category_id: 'sticker-nature', name: 'Food & Treats', label: 'Food & Treats', sort_order: 0 },
  { id: 'sub-stk-nature-sub', category_id: 'sticker-nature', name: 'Nature & Sunshine', label: 'Nature & Sunshine', sort_order: 1 },
];

// Helper gradients to embed inside SVG elements
const COMMON_DEFS = `
<defs>
  <radialGradient id="emojiGrad" cx="35%" cy="35%" r="65%">
    <stop offset="0%" stop-color="#FFE866"/>
    <stop offset="65%" stop-color="#FFC107"/>
    <stop offset="100%" stop-color="#FF9800"/>
  </radialGradient>
  <radialGradient id="redHeart" cx="35%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#FF5277"/>
    <stop offset="60%" stop-color="#E11D48"/>
    <stop offset="100%" stop-color="#9F1239"/>
  </radialGradient>
  <radialGradient id="goldStar" cx="35%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#FFF385"/>
    <stop offset="60%" stop-color="#FBBF24"/>
    <stop offset="100%" stop-color="#D97706"/>
  </radialGradient>
  <linearGradient id="fireGrad" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0%" stop-color="#DC2626"/>
    <stop offset="45%" stop-color="#F97316"/>
    <stop offset="85%" stop-color="#FACC15"/>
    <stop offset="100%" stop-color="#FEF08A"/>
  </linearGradient>
  <linearGradient id="rocketBody" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#FFFFFF"/>
    <stop offset="100%" stop-color="#E2E8F0"/>
  </linearGradient>
  <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#C084FC"/>
    <stop offset="100%" stop-color="#7E22CE"/>
  </linearGradient>
  <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#38BDF8"/>
    <stop offset="100%" stop-color="#0284C7"/>
  </linearGradient>
  <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#4ADE80"/>
    <stop offset="100%" stop-color="#15803D"/>
  </linearGradient>
  <linearGradient id="shadesGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#334155"/>
    <stop offset="100%" stop-color="#0F172A"/>
  </linearGradient>
  <filter id="dropGlow" x="-10%" y="-10%" width="120%" height="120%">
    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/>
  </filter>
</defs>
`;

// ─── 3. STICKER ASSETS CATALOG (88 Precision Vector Stickers) ─────────────────
const STICKER_ASSETS = [
  // ── CATEGORY 1: Emojis & Faces (16 items) ───────────────────────────────────
  {
    id: 'sticker-emoji-grinning',
    name: 'Grinning Face',
    category: 'Emojis & Faces',
    subcategory: 'Happy & Joyful',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <ellipse cx="36" cy="38" rx="5" ry="7" fill="#262626"/>
      <ellipse cx="64" cy="38" rx="5" ry="7" fill="#262626"/>
      <circle cx="38" cy="36" r="2" fill="#FFFFFF"/>
      <circle cx="66" cy="36" r="2" fill="#FFFFFF"/>
      <ellipse cx="26" cy="50" rx="6" ry="4" fill="#FF8A80" opacity="0.6"/>
      <ellipse cx="74" cy="50" rx="6" ry="4" fill="#FF8A80" opacity="0.6"/>
      <path d="M30,56 C30,76 70,76 70,56 Z" fill="#262626"/>
      <path d="M34,56 C34,64 66,64 66,56 Z" fill="#FFFFFF"/>
      <path d="M42,67 C46,74 54,74 58,67 Z" fill="#FF5252"/>
    `,
    tags: ['emoji', 'happy', 'grin', 'smile', 'joy'],
  },
  {
    id: 'sticker-emoji-laughing-tears',
    name: 'Laughing with Tears',
    category: 'Emojis & Faces',
    subcategory: 'Happy & Joyful',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <path d="M26,38 C30,30 42,30 46,38" fill="none" stroke="#262626" stroke-width="4" stroke-linecap="round"/>
      <path d="M54,38 C58,30 70,30 74,38" fill="none" stroke="#262626" stroke-width="4" stroke-linecap="round"/>
      <path d="M28,52 C28,78 72,78 72,52 Z" fill="#262626"/>
      <path d="M32,52 C32,60 68,60 68,52 Z" fill="#FFFFFF"/>
      <path d="M40,68 C45,75 55,75 60,68 Z" fill="#FF5252"/>
      <path d="M14,40 C10,48 16,56 22,50 C26,46 22,38 14,40 Z" fill="#00B0FF"/>
      <path d="M86,40 C90,48 84,56 78,50 C74,46 78,38 86,40 Z" fill="#00B0FF"/>
    `,
    tags: ['emoji', 'laugh', 'rofl', 'funny', 'tears', 'lol'],
  },
  {
    id: 'sticker-emoji-heart-eyes',
    name: 'Smiling Heart Eyes',
    category: 'Emojis & Faces',
    subcategory: 'Happy & Joyful',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <path d="M34,26 C30,22 23,24 23,30 C23,38 34,46 34,46 C34,46 45,38 45,30 C45,24 38,22 34,26 Z" fill="#E11D48"/>
      <path d="M66,26 C62,22 55,24 55,30 C55,38 66,46 66,46 C66,46 77,38 77,30 C77,24 70,22 66,26 Z" fill="#E11D48"/>
      <path d="M30,58 C30,76 70,76 70,58 Z" fill="#262626"/>
      <path d="M34,58 C34,66 66,66 66,58 Z" fill="#FFFFFF"/>
      <ellipse cx="22" cy="52" rx="5" ry="3" fill="#FF8A80" opacity="0.6"/>
      <ellipse cx="78" cy="52" rx="5" ry="3" fill="#FF8A80" opacity="0.6"/>
    `,
    tags: ['emoji', 'love', 'heart-eyes', 'adore', 'crush', 'cute'],
  },
  {
    id: 'sticker-emoji-star-struck',
    name: 'Star-Struck',
    category: 'Emojis & Faces',
    subcategory: 'Cool & Fun',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <polygon points="34,24 37,32 46,33 39,39 41,48 34,43 27,48 29,39 22,33 31,32" fill="#F43F5E"/>
      <polygon points="66,24 69,32 78,33 71,39 73,48 66,43 59,48 61,39 54,33 63,32" fill="#F43F5E"/>
      <path d="M30,56 C30,76 70,76 70,56 Z" fill="#262626"/>
      <path d="M34,56 C34,64 66,64 66,56 Z" fill="#FFFFFF"/>
      <path d="M42,67 C46,74 54,74 58,67 Z" fill="#FF5252"/>
    `,
    tags: ['emoji', 'star', 'excited', 'celebrity', 'wow', 'struck'],
  },
  {
    id: 'sticker-emoji-cool-sunglasses',
    name: 'Cool Sunglasses',
    category: 'Emojis & Faces',
    subcategory: 'Cool & Fun',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <path d="M12,42 C16,34 32,34 47,38 L53,38 C68,34 84,34 88,42 C90,48 88,56 78,56 C64,56 56,48 53,42 L47,42 C44,48 36,56 22,56 C12,56 10,48 12,42 Z" fill="url(#shadesGrad)"/>
      <path d="M18,39 L42,42 C38,46 28,48 20,48 Z" fill="#94A3B8" opacity="0.4"/>
      <path d="M58,42 L82,39 C80,48 72,48 66,48 Z" fill="#94A3B8" opacity="0.4"/>
      <path d="M36,66 C42,74 58,74 64,66" fill="none" stroke="#262626" stroke-width="4" stroke-linecap="round"/>
    `,
    tags: ['emoji', 'cool', 'sunglasses', 'boss', 'shades', 'chill'],
  },
  {
    id: 'sticker-emoji-party-face',
    name: 'Party Celebration',
    category: 'Emojis & Faces',
    subcategory: 'Cool & Fun',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <polygon points="26,18 52,2 40,32" fill="#EC4899"/>
      <polygon points="34,16 52,2 44,24" fill="#3B82F6"/>
      <circle cx="52" cy="2" r="4" fill="#FACC15"/>
      <path d="M26,42 C30,36 38,36 42,42" fill="none" stroke="#262626" stroke-width="4" stroke-linecap="round"/>
      <path d="M60,42 C64,36 72,36 76,42" fill="none" stroke="#262626" stroke-width="4" stroke-linecap="round"/>
      <path d="M36,60 C40,70 60,70 64,60 Z" fill="#262626"/>
      <path d="M52,62 L82,68 L86,60 L54,58 Z" fill="#F43F5E"/>
      <path d="M82,68 C88,68 94,76 88,80 C84,82 78,74 84,70" fill="none" stroke="#F43F5E" stroke-width="3"/>
      <circle cx="16" cy="30" r="2.5" fill="#3B82F6"/>
      <circle cx="82" cy="24" r="2" fill="#EC4899"/>
      <circle cx="22" cy="74" r="3" fill="#10B981"/>
      <rect x="76" y="78" width="4" height="4" fill="#F59E0B" transform="rotate(30 78 80)"/>
    `,
    tags: ['emoji', 'party', 'birthday', 'horn', 'celebrate', 'fun'],
  },
  {
    id: 'sticker-emoji-winking',
    name: 'Winking Smile',
    category: 'Emojis & Faces',
    subcategory: 'Happy & Joyful',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <path d="M26,38 C30,34 38,34 42,38" fill="none" stroke="#262626" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="64" cy="38" rx="5" ry="7" fill="#262626"/>
      <circle cx="66" cy="36" r="2" fill="#FFFFFF"/>
      <ellipse cx="24" cy="48" rx="5" ry="3" fill="#FF8A80" opacity="0.6"/>
      <ellipse cx="76" cy="48" rx="5" ry="3" fill="#FF8A80" opacity="0.6"/>
      <path d="M34,58 C38,72 62,72 66,58 Z" fill="#262626"/>
      <path d="M38,58 C42,65 58,65 62,58 Z" fill="#FFFFFF"/>
    `,
    tags: ['emoji', 'wink', 'flirt', 'joke', 'friendly'],
  },
  {
    id: 'sticker-emoji-thinking',
    name: 'Thinking Face',
    category: 'Emojis & Faces',
    subcategory: 'Cool & Fun',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <path d="M26,32 C30,28 38,30 42,34" fill="none" stroke="#262626" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M58,34 C62,30 70,28 74,32" fill="none" stroke="#262626" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="34" cy="40" rx="4.5" ry="6" fill="#262626"/>
      <ellipse cx="66" cy="40" rx="4.5" ry="6" fill="#262626"/>
      <path d="M36,62 C44,58 56,58 64,62" fill="none" stroke="#262626" stroke-width="4" stroke-linecap="round"/>
      <path d="M28,82 C28,70 38,70 44,74 C50,78 58,78 62,74 L60,86 C52,90 38,90 28,82 Z" fill="#FFB74D" stroke="#E65100" stroke-width="2"/>
      <ellipse cx="44" cy="74" rx="3" ry="5" fill="#FFB74D"/>
    `,
    tags: ['emoji', 'think', 'ponder', 'idea', 'hmmm', 'question'],
  },
  {
    id: 'sticker-emoji-mind-blown',
    name: 'Mind Blown',
    category: 'Emojis & Faces',
    subcategory: 'Dramatic & Shocked',
    is_premium: false,
    content: `${COMMON_DEFS}
      <path d="M20,50 C20,74 33,94 50,94 C67,94 80,74 80,50 Z" fill="url(#emojiGrad)"/>
      <ellipse cx="36" cy="62" rx="4" ry="6" fill="#262626"/>
      <ellipse cx="64" cy="62" rx="4" ry="6" fill="#262626"/>
      <ellipse cx="50" cy="78" rx="8" ry="10" fill="#262626"/>
      <path d="M12,48 C6,38 14,24 26,26 C30,16 44,12 54,18 C64,10 80,14 84,26 C96,28 100,42 90,50 C80,56 22,56 12,48 Z" fill="#FF5722"/>
      <path d="M18,44 C14,36 20,28 28,30 C34,22 46,18 52,24 C60,18 72,22 76,30 C86,32 88,42 82,46 Z" fill="#FFB74D"/>
      <circle cx="50" cy="8" r="3" fill="#FACC15"/>
      <circle cx="26" cy="12" r="2" fill="#F43F5E"/>
      <circle cx="76" cy="10" r="2.5" fill="#3B82F6"/>
    `,
    tags: ['emoji', 'mind-blown', 'shock', 'explosion', 'boom', 'wow'],
  },
  {
    id: 'sticker-emoji-crying',
    name: 'Loudly Crying',
    category: 'Emojis & Faces',
    subcategory: 'Dramatic & Shocked',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <path d="M26,40 C30,34 38,34 42,40" fill="none" stroke="#262626" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M58,40 C62,34 70,34 74,40" fill="none" stroke="#262626" stroke-width="4.5" stroke-linecap="round"/>
      <ellipse cx="50" cy="68" rx="12" ry="14" fill="#262626"/>
      <path d="M30,42 L30,94 C34,94 38,88 38,82 L38,42 Z" fill="#00B0FF" opacity="0.9"/>
      <path d="M62,42 L62,94 C66,94 70,88 70,82 L70,42 Z" fill="#00B0FF" opacity="0.9"/>
    `,
    tags: ['emoji', 'cry', 'sad', 'tears', 'upset', 'sob'],
  },
  {
    id: 'sticker-emoji-angel',
    name: 'Angel Halo Smile',
    category: 'Emojis & Faces',
    subcategory: 'Happy & Joyful',
    is_premium: false,
    content: `${COMMON_DEFS}
      <ellipse cx="50" cy="10" rx="30" ry="7" fill="none" stroke="#38BDF8" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="50" cy="10" rx="30" ry="7" fill="none" stroke="#FDE047" stroke-width="2.5"/>
      <circle cx="50" cy="54" r="40" fill="url(#emojiGrad)"/>
      <ellipse cx="38" cy="48" rx="4" ry="6" fill="#262626"/>
      <ellipse cx="62" cy="48" rx="4" ry="6" fill="#262626"/>
      <circle cx="40" cy="46" r="1.5" fill="#FFFFFF"/>
      <circle cx="64" cy="46" r="1.5" fill="#FFFFFF"/>
      <ellipse cx="28" cy="58" rx="5" ry="3" fill="#FF8A80" opacity="0.6"/>
      <ellipse cx="72" cy="58" rx="5" ry="3" fill="#FF8A80" opacity="0.6"/>
      <path d="M38,64 C42,74 58,74 62,64" fill="none" stroke="#262626" stroke-width="3.5" stroke-linecap="round"/>
    `,
    tags: ['emoji', 'angel', 'halo', 'innocent', 'pure', 'blessed'],
  },
  {
    id: 'sticker-emoji-hugging',
    name: 'Hugging Smile',
    category: 'Emojis & Faces',
    subcategory: 'Happy & Joyful',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <path d="M30,36 C34,30 42,30 46,36" fill="none" stroke="#262626" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M54,36 C58,30 66,30 70,36" fill="none" stroke="#262626" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="26" cy="48" rx="6" ry="4" fill="#FF8A80" opacity="0.6"/>
      <ellipse cx="74" cy="48" rx="6" ry="4" fill="#FF8A80" opacity="0.6"/>
      <path d="M36,54 C36,68 64,68 64,54 Z" fill="#262626"/>
      <path d="M40,54 C40,62 60,62 60,54 Z" fill="#FFFFFF"/>
      <!-- Hugging hands -->
      <path d="M6,66 C10,58 22,60 26,68 C28,74 22,82 14,80 C6,78 4,72 6,66 Z" fill="#FFD54F" stroke="#F57C00" stroke-width="2"/>
      <path d="M94,66 C90,58 78,60 74,68 C72,74 78,82 86,80 C94,78 96,72 94,66 Z" fill="#FFD54F" stroke="#F57C00" stroke-width="2"/>
    `,
    tags: ['emoji', 'hug', 'comfort', 'warmth', 'friend', 'cuddle'],
  },
  {
    id: 'sticker-emoji-zany',
    name: 'Zany Face with Tongue',
    category: 'Emojis & Faces',
    subcategory: 'Cool & Fun',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <circle cx="34" cy="38" r="10" fill="#FFFFFF"/>
      <circle cx="34" cy="38" r="5" fill="#262626"/>
      <circle cx="66" cy="38" r="6" fill="#FFFFFF"/>
      <circle cx="66" cy="38" r="3" fill="#262626"/>
      <path d="M30,56 C34,68 66,68 70,56 Z" fill="#262626"/>
      <path d="M42,62 C42,78 58,78 58,62 Z" fill="#FF4081"/>
      <line x1="50" y1="62" x2="50" y2="72" stroke="#C2185B" stroke-width="1.5"/>
    `,
    tags: ['emoji', 'zany', 'crazy', 'tongue', 'silly', 'party'],
  },
  {
    id: 'sticker-emoji-shocked',
    name: 'Shocked Scream',
    category: 'Emojis & Faces',
    subcategory: 'Dramatic & Shocked',
    is_premium: false,
    content: `${COMMON_DEFS}
      <path d="M6,50 C6,24 24,6 50,6 C76,6 94,24 94,50 C94,76 76,94 50,94 C24,94 6,76 6,50 Z" fill="url(#emojiGrad)"/>
      <path d="M12,30 C20,12 80,12 88,30 C76,42 24,42 12,30 Z" fill="#60A5FA" opacity="0.6"/>
      <ellipse cx="36" cy="42" rx="7" ry="9" fill="#FFFFFF"/>
      <ellipse cx="64" cy="42" rx="7" ry="9" fill="#FFFFFF"/>
      <ellipse cx="36" cy="42" rx="3.5" ry="4.5" fill="#262626"/>
      <ellipse cx="64" cy="42" rx="3.5" ry="4.5" fill="#262626"/>
      <ellipse cx="50" cy="72" rx="10" ry="16" fill="#262626"/>
      <ellipse cx="50" cy="74" rx="6" ry="10" fill="#424242"/>
      <path d="M16,66 C14,52 26,52 28,66 C28,78 18,78 16,66 Z" fill="#FFE082"/>
      <path d="M84,66 C86,52 74,52 72,66 C72,78 82,78 84,66 Z" fill="#FFE082"/>
    `,
    tags: ['emoji', 'shocked', 'scream', 'fear', 'omg', 'surprise'],
  },
  {
    id: 'sticker-emoji-fire-eyes',
    name: 'Determined Fire Eyes',
    category: 'Emojis & Faces',
    subcategory: 'Cool & Fun',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <path d="M26,30 L42,36" stroke="#262626" stroke-width="4" stroke-linecap="round"/>
      <path d="M74,30 L58,36" stroke="#262626" stroke-width="4" stroke-linecap="round"/>
      <!-- Left flame eye -->
      <path d="M34,48 C30,48 26,44 28,38 C30,32 36,28 34,22 C40,26 44,34 42,42 C40,48 36,48 34,48 Z" fill="url(#fireGrad)"/>
      <!-- Right flame eye -->
      <path d="M66,48 C62,48 58,44 60,38 C62,32 68,28 66,22 C72,26 76,34 74,42 C72,48 68,48 66,48 Z" fill="url(#fireGrad)"/>
      <!-- Gritted confident mouth -->
      <path d="M32,66 C38,62 62,62 68,66 C62,74 38,74 32,66 Z" fill="#FFFFFF" stroke="#262626" stroke-width="2.5"/>
      <line x1="44" y1="64" x2="44" y2="70" stroke="#262626" stroke-width="2"/>
      <line x1="56" y1="64" x2="56" y2="70" stroke="#262626" stroke-width="2"/>
    `,
    tags: ['emoji', 'fire', 'determined', 'beast', 'focus', 'power'],
  },
  {
    id: 'sticker-emoji-nerd-geek',
    name: 'Smart Geek with Glasses',
    category: 'Emojis & Faces',
    subcategory: 'Cool & Fun',
    is_premium: false,
    content: `${COMMON_DEFS}
      <circle cx="50" cy="50" r="44" fill="url(#emojiGrad)"/>
      <!-- Thick black glasses frame -->
      <rect x="18" y="32" width="28" height="22" rx="4" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>
      <rect x="54" y="32" width="28" height="22" rx="4" fill="#FFFFFF" stroke="#1E293B" stroke-width="4"/>
      <line x1="46" y1="40" x2="54" y2="40" stroke="#1E293B" stroke-width="4"/>
      <circle cx="32" cy="43" r="4" fill="#1E293B"/>
      <circle cx="68" cy="43" r="4" fill="#1E293B"/>
      <!-- Buck teeth smile -->
      <path d="M36,66 C42,72 58,72 64,66" fill="none" stroke="#262626" stroke-width="3" stroke-linecap="round"/>
      <rect x="44" y="67" width="5" height="7" fill="#FFFFFF" stroke="#262626" stroke-width="1.5"/>
      <rect x="51" y="67" width="5" height="7" fill="#FFFFFF" stroke="#262626" stroke-width="1.5"/>
    `,
    tags: ['emoji', 'nerd', 'geek', 'glasses', 'smart', 'code'],
  },

  // ── CATEGORY 2: Hands & Gestures (12 items) ─────────────────────────────────
  {
    id: 'sticker-gesture-thumbs-up',
    name: 'Thumbs Up',
    category: 'Hands & Gestures',
    subcategory: 'Positive Reactions',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M22,54 L22,86 L36,86 L36,54 Z" fill="#3B82F6" stroke="#1D4ED8" stroke-width="2"/>
        <path d="M36,58 C36,58 44,46 46,32 C48,22 56,18 60,22 C64,26 62,36 58,44 L68,44 C76,44 80,48 78,54 C82,54 84,60 82,64 C84,64 86,70 82,74 C82,78 78,82 72,82 L42,82 C38,82 36,78 36,74 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <line x1="64" y1="54" x2="76" y2="54" stroke="#D97706" stroke-width="1.5"/>
        <line x1="64" y1="64" x2="78" y2="64" stroke="#D97706" stroke-width="1.5"/>
        <line x1="62" y1="74" x2="76" y2="74" stroke="#D97706" stroke-width="1.5"/>
      </g>
    `,
    tags: ['thumbs-up', 'like', 'approve', 'yes', 'positive', 'agree'],
  },
  {
    id: 'sticker-gesture-thumbs-down',
    name: 'Thumbs Down',
    category: 'Hands & Gestures',
    subcategory: 'Positive Reactions',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M22,14 L22,46 L36,46 L36,14 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>
        <path d="M36,42 C36,42 44,54 46,68 C48,78 56,82 60,78 C64,74 62,64 58,56 L68,56 C76,56 80,52 78,46 C82,46 84,40 82,36 C84,36 86,30 82,26 C82,22 78,18 72,18 L42,18 C38,18 36,22 36,26 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
      </g>
    `,
    tags: ['thumbs-down', 'dislike', 'no', 'reject', 'disapprove'],
  },
  {
    id: 'sticker-gesture-clapping',
    name: 'Clapping Hands',
    category: 'Hands & Gestures',
    subcategory: 'Positive Reactions',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M24,78 C28,66 38,50 56,40 C62,36 68,42 64,48 C56,58 48,68 40,82 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <path d="M42,86 C48,72 60,54 74,44 C80,40 86,46 80,52 C72,62 62,74 54,88 Z" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
        <circle cx="56" cy="22" r="3" fill="#FACC15"/>
        <circle cx="42" cy="28" r="2" fill="#FACC15"/>
        <circle cx="70" cy="26" r="2" fill="#FACC15"/>
      </g>
    `,
    tags: ['clap', 'applause', 'bravo', 'congrats', 'cheer'],
  },
  {
    id: 'sticker-gesture-peace',
    name: 'Victory Peace Sign',
    category: 'Hands & Gestures',
    subcategory: 'Positive Reactions',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M38,40 L38,16 C38,10 46,10 46,16 L46,38" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <path d="M48,38 L58,20 C62,14 70,18 66,24 L56,44" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <path d="M32,46 C32,46 26,52 28,62 C30,76 42,86 54,86 C66,86 74,78 74,62 C74,54 68,46 64,46 L64,60 C64,62 60,64 58,62 L58,46 L38,46 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
      </g>
    `,
    tags: ['peace', 'victory', 'two', 'v-sign', 'chill', 'win'],
  },
  {
    id: 'sticker-gesture-fist',
    name: 'Raised Power Fist',
    category: 'Hands & Gestures',
    subcategory: 'Positive Reactions',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M32,88 L32,56 C32,50 36,46 42,46 L62,46 C68,46 72,50 72,56 L72,88 Z" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
        <rect x="36" y="32" width="30" height="24" rx="8" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <line x1="44" y1="34" x2="44" y2="54" stroke="#D97706" stroke-width="1.5"/>
        <line x1="52" y1="34" x2="52" y2="54" stroke="#D97706" stroke-width="1.5"/>
        <line x1="60" y1="34" x2="60" y2="54" stroke="#D97706" stroke-width="1.5"/>
        <path d="M26,50 C26,42 34,42 38,48 L38,62 C34,66 26,62 26,50 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
      </g>
    `,
    tags: ['fist', 'power', 'solidarity', 'strength', 'fight'],
  },
  {
    id: 'sticker-gesture-crossed-fingers',
    name: 'Crossed Fingers for Luck',
    category: 'Hands & Gestures',
    subcategory: 'Positive Reactions',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M42,42 L42,16 C42,10 48,10 50,14 L50,44" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <path d="M52,42 L46,20 C44,14 52,10 56,16 L56,44" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <path d="M30,50 C30,50 26,56 28,66 C30,78 40,86 52,86 C64,86 72,78 72,66 C72,56 66,50 62,50 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
      </g>
    `,
    tags: ['luck', 'wish', 'hope', 'fingers-crossed', 'pray'],
  },
  {
    id: 'sticker-gesture-rock-on',
    name: 'Rock On Horns',
    category: 'Hands & Gestures',
    subcategory: 'Positive Reactions',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M30,46 L30,16 C30,10 38,10 38,16 L38,48" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <path d="M64,46 L64,16 C64,10 72,10 72,16 L72,48" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <path d="M30,50 C30,50 26,58 28,68 C30,80 40,88 52,88 C64,88 74,80 74,68 C74,58 70,50 66,50 L66,60 L58,60 L58,48 L44,48 L44,60 L36,60 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
      </g>
    `,
    tags: ['rock', 'horns', 'metal', 'cool', 'energy'],
  },
  {
    id: 'sticker-gesture-pointing-right',
    name: 'Pointing Right',
    category: 'Hands & Gestures',
    subcategory: 'Pointers & Signals',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M12,42 L12,74 L28,74 L28,42 Z" fill="#3B82F6" stroke="#1D4ED8" stroke-width="2"/>
        <path d="M28,44 L60,44 L90,44 C96,44 96,52 90,52 L60,52 L60,60 L78,60 C84,60 84,68 78,68 L56,68 L56,76 L40,76 C32,76 28,70 28,62 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
      </g>
    `,
    tags: ['point', 'right', 'next', 'click-here', 'look'],
  },
  {
    id: 'sticker-gesture-pointing-up',
    name: 'Pointing Up',
    category: 'Hands & Gestures',
    subcategory: 'Pointers & Signals',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M46,44 L46,12 C46,6 54,6 54,12 L54,46 L62,46 L62,60 C62,72 58,82 48,82 C38,82 34,72 34,60 L34,44 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <path d="M38,82 L38,94 L58,94 L58,82 Z" fill="#3B82F6" stroke="#1D4ED8" stroke-width="2"/>
      </g>
    `,
    tags: ['point', 'up', 'number-one', 'above', 'top'],
  },
  {
    id: 'sticker-gesture-ok-sign',
    name: 'OK Hand Sign',
    category: 'Hands & Gestures',
    subcategory: 'Positive Reactions',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <circle cx="44" cy="46" r="16" fill="none" stroke="#FBBF24" stroke-width="8"/>
        <circle cx="44" cy="46" r="16" fill="none" stroke="#D97706" stroke-width="2"/>
        <path d="M48,32 L48,12 C48,8 54,8 54,12 L54,34" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <path d="M56,36 L58,16 C58,12 64,12 64,16 L64,40" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <path d="M66,42 L70,22 C70,18 76,18 76,22 L74,50 C74,68 62,82 46,82 C34,82 28,72 28,60" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
      </g>
    `,
    tags: ['ok', 'perfect', 'nice', 'correct', 'good'],
  },
  {
    id: 'sticker-gesture-praying',
    name: 'Gratitude Prayer Hands',
    category: 'Hands & Gestures',
    subcategory: 'Positive Reactions',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M50,14 C48,22 42,34 38,44 L38,76 L48,84 L50,84 L50,14 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <path d="M50,14 C52,22 58,34 62,44 L62,76 L52,84 L50,84 L50,14 Z" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
        <path d="M34,76 L34,92 L46,92 L46,76 Z" fill="#3B82F6"/>
        <path d="M66,76 L66,92 L54,92 L54,76 Z" fill="#2563EB"/>
        <!-- Radiant glow sparks -->
        <line x1="50" y1="2" x2="50" y2="8" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="30" y1="12" x2="34" y2="16" stroke="#FBBF24" stroke-width="2" stroke-linecap="round"/>
        <line x1="70" y1="12" x2="66" y2="16" stroke="#FBBF24" stroke-width="2" stroke-linecap="round"/>
      </g>
    `,
    tags: ['pray', 'thank-you', 'please', 'grateful', 'namaste'],
  },
  {
    id: 'sticker-gesture-heart-hands',
    name: 'Heart Hands',
    category: 'Hands & Gestures',
    subcategory: 'Positive Reactions',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M50,68 C46,62 30,52 26,44 C22,34 26,24 36,24 C44,24 48,32 50,36 C52,32 56,24 64,24 C74,24 78,34 74,44 C70,52 54,62 50,68 Z" fill="#F43F5E"/>
        <path d="M18,48 C14,56 18,74 34,78 C44,80 48,74 50,68 C44,60 38,50 34,42 C28,42 20,44 18,48 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <path d="M82,48 C86,56 82,74 66,78 C56,80 52,74 50,68 C56,60 62,50 66,42 C72,42 80,44 82,48 Z" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
      </g>
    `,
    tags: ['heart-hands', 'love', 'appreciation', 'kpop', 'sweet'],
  },

  // ── CATEGORY 3: Hearts & Love (12 items) ────────────────────────────────────
  {
    id: 'sticker-heart-glossy-red',
    name: 'Glossy 3D Red Heart',
    category: 'Hearts & Love',
    subcategory: 'Classic Hearts',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M50,88 C20,68 6,48 6,28 C6,12 18,2 32,2 C42,2 48,8 50,16 C52,8 58,2 68,2 C82,2 94,12 94,28 C94,48 80,68 50,88 Z" fill="url(#redHeart)"/>
        <ellipse cx="32" cy="18" rx="10" ry="5" fill="#FFFFFF" opacity="0.45" transform="rotate(-30 32 18)"/>
      </g>
    `,
    tags: ['heart', 'red', 'glossy', '3d', 'love', 'romance'],
  },
  {
    id: 'sticker-heart-sparkle-pink',
    name: 'Sparkle Pink Heart',
    category: 'Hearts & Love',
    subcategory: 'Sparkle & Glow Hearts',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M50,84 C24,66 12,48 12,30 C12,16 22,6 35,6 C43,6 48,12 50,18 C52,12 57,6 65,6 C78,6 88,16 88,30 C88,48 76,66 50,84 Z" fill="#EC4899"/>
        <polygon points="20,16 22,22 28,24 22,26 20,32 18,26 12,24 18,22" fill="#FDE047"/>
        <polygon points="80,18 82,24 88,25 82,27 80,33 78,27 72,25 78,24" fill="#FDE047"/>
        <polygon points="76,62 77,66 81,67 77,68 76,72 75,68 71,67 75,66" fill="#FDE047"/>
      </g>
    `,
    tags: ['heart', 'pink', 'sparkle', 'cute', 'glitter'],
  },
  {
    id: 'sticker-heart-flame',
    name: 'Heart on Fire',
    category: 'Hearts & Love',
    subcategory: 'Sparkle & Glow Hearts',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <!-- Fire background -->
        <path d="M50,96 C24,96 14,76 18,54 C20,38 32,28 34,14 C40,24 46,26 48,18 C54,8 64,12 66,28 C70,24 76,28 78,36 C86,52 82,78 68,90 C62,94 56,96 50,96 Z" fill="url(#fireGrad)"/>
        <!-- Heart overlay -->
        <path d="M50,78 C30,62 20,48 20,34 C20,22 28,16 38,16 C45,16 48,20 50,26 C52,20 55,16 62,16 C72,16 80,22 80,34 C80,48 70,62 50,78 Z" fill="#B91C1C" opacity="0.95"/>
      </g>
    `,
    tags: ['heart', 'fire', 'flame', 'passion', 'hot', 'lit'],
  },
  {
    id: 'sticker-heart-beating',
    name: 'Beating Pulse Heart',
    category: 'Hearts & Love',
    subcategory: 'Sparkle & Glow Hearts',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <!-- Echo wave 1 -->
        <path d="M50,92 C16,70 2,48 2,26 C2,8 16,-2 32,-2 C44,-2 48,6 50,14 C52,6 56,-2 68,-2 C84,-2 98,8 98,26 C98,48 84,70 50,92 Z" fill="none" stroke="#F43F5E" stroke-width="2" opacity="0.3" transform="scale(0.9) translate(5,5)"/>
        <!-- Center Heart -->
        <path d="M50,80 C26,62 14,46 14,30 C14,16 24,8 36,8 C44,8 48,14 50,20 C52,14 56,8 64,8 C76,8 86,16 86,30 C86,46 74,62 50,80 Z" fill="#F43F5E"/>
        <polyline points="24,34 36,34 42,22 48,46 54,30 60,38 76,38" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `,
    tags: ['heart', 'beat', 'pulse', 'lifeline', 'ecg', 'health'],
  },
  {
    id: 'sticker-heart-two-floating',
    name: 'Two Flying Hearts',
    category: 'Hearts & Love',
    subcategory: 'Classic Hearts',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M60,86 C40,70 28,54 28,40 C28,28 36,20 46,20 C53,20 57,24 60,30 C63,24 67,20 74,20 C84,20 92,28 92,40 C92,54 80,70 60,86 Z" fill="#F43F5E"/>
        <path d="M30,52 C16,40 8,30 8,20 C8,12 14,6 22,6 C27,6 30,9 32,14 C34,9 37,6 42,6 C50,6 56,12 56,20 C56,30 44,40 30,52 Z" fill="#FB7185"/>
      </g>
    `,
    tags: ['hearts', 'two', 'flying', 'romance', 'couple'],
  },
  {
    id: 'sticker-heart-gift-ribbon',
    name: 'Heart with Gold Ribbon',
    category: 'Hearts & Love',
    subcategory: 'Classic Hearts',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M50,86 C24,68 10,48 10,28 C10,12 22,2 36,2 C44,2 48,8 50,16 C52,8 56,2 64,2 C78,2 90,12 90,28 C90,48 76,68 50,86 Z" fill="#E11D48"/>
        <!-- Gold Ribbon Wrap -->
        <rect x="44" y="2" width="12" height="84" fill="#FACC15"/>
        <rect x="10" y="32" width="80" height="12" fill="#FACC15"/>
        <!-- Bow -->
        <circle cx="50" cy="38" r="6" fill="#EAB308"/>
        <path d="M50,38 C42,26 30,30 36,38 Z" fill="#FACC15"/>
        <path d="M50,38 C58,26 70,30 64,38 Z" fill="#FACC15"/>
      </g>
    `,
    tags: ['heart', 'gift', 'ribbon', 'valentines', 'present'],
  },
  {
    id: 'sticker-heart-purple-royal',
    name: 'Royal Purple Heart',
    category: 'Hearts & Love',
    subcategory: 'Classic Hearts',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M50,86 C24,68 10,48 10,28 C10,12 22,2 36,2 C44,2 48,8 50,16 C52,8 56,2 64,2 C78,2 90,12 90,28 C90,48 76,68 50,86 Z" fill="url(#purpleGrad)"/>
        <ellipse cx="32" cy="18" rx="8" ry="4" fill="#FFFFFF" opacity="0.4" transform="rotate(-30 32 18)"/>
      </g>
    `,
    tags: ['heart', 'purple', 'royal', 'noble', 'special'],
  },
  {
    id: 'sticker-heart-blue-neon',
    name: 'Neon Blue Heart',
    category: 'Hearts & Love',
    subcategory: 'Classic Hearts',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M50,86 C24,68 10,48 10,28 C10,12 22,2 36,2 C44,2 48,8 50,16 C52,8 56,2 64,2 C78,2 90,12 90,28 C90,48 76,68 50,86 Z" fill="url(#cyanGrad)"/>
        <ellipse cx="32" cy="18" rx="8" ry="4" fill="#FFFFFF" opacity="0.4" transform="rotate(-30 32 18)"/>
      </g>
    `,
    tags: ['heart', 'blue', 'cyan', 'cool', 'trust'],
  },
  {
    id: 'sticker-heart-cupid-arrow',
    name: 'Cupid Arrow Heart',
    category: 'Hearts & Love',
    subcategory: 'Classic Hearts',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M50,86 C24,68 10,48 10,28 C10,12 22,2 36,2 C44,2 48,8 50,16 C52,8 56,2 64,2 C78,2 90,12 90,28 C90,48 76,68 50,86 Z" fill="#F43F5E"/>
        <!-- Arrow -->
        <line x1="6" y1="80" x2="94" y2="16" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
        <polygon points="94,16 82,18 88,26" fill="#FBBF24"/>
        <polygon points="6,80 14,72 16,84" fill="#E11D48"/>
      </g>
    `,
    tags: ['heart', 'arrow', 'cupid', 'shot', 'in-love'],
  },
  {
    id: 'sticker-heart-crystal-gem',
    name: 'Faceted Gem Heart',
    category: 'Hearts & Love',
    subcategory: 'Sparkle & Glow Hearts',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <polygon points="50,86 16,42 26,14 42,14 50,26 58,14 74,14 84,42" fill="#EC4899"/>
        <polygon points="50,86 16,42 32,42 50,56" fill="#DB2777"/>
        <polygon points="50,86 84,42 68,42 50,56" fill="#BE185D"/>
        <polygon points="32,42 50,56 68,42 50,26" fill="#F472B6"/>
        <polygon points="26,14 42,14 50,26 32,42" fill="#F9A8D4"/>
        <polygon points="74,14 58,14 50,26 68,42" fill="#F472B6"/>
      </g>
    `,
    tags: ['heart', 'gem', 'diamond', 'crystal', 'faceted'],
  },
  {
    id: 'sticker-heart-gold-sun',
    name: 'Golden Sun Heart',
    category: 'Hearts & Love',
    subcategory: 'Classic Hearts',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M50,86 C24,68 10,48 10,28 C10,12 22,2 36,2 C44,2 48,8 50,16 C52,8 56,2 64,2 C78,2 90,12 90,28 C90,48 76,68 50,86 Z" fill="url(#goldStar)"/>
        <ellipse cx="32" cy="18" rx="8" ry="4" fill="#FFFFFF" opacity="0.45" transform="rotate(-30 32 18)"/>
      </g>
    `,
    tags: ['heart', 'gold', 'sun', 'warmth', 'friendship'],
  },
  {
    id: 'sticker-heart-bandaged',
    name: 'Mended Heart Bandage',
    category: 'Hearts & Love',
    subcategory: 'Classic Hearts',
    is_premium: false,
    content: `${COMMON_DEFS}
      <g filter="url(#dropGlow)">
        <path d="M50,86 C24,68 10,48 10,28 C10,12 22,2 36,2 C44,2 48,8 50,16 C52,8 56,2 64,2 C78,2 90,12 90,28 C90,48 76,68 50,86 Z" fill="#E11D48"/>
        <!-- Cross Bandages -->
        <rect x="24" y="34" width="52" height="14" rx="3" fill="#FDE68A" stroke="#D97706" stroke-width="1.5" transform="rotate(35 50 41)"/>
        <circle cx="50" cy="41" r="1.5" fill="#D97706"/>
      </g>
    `,
    tags: ['heart', 'bandage', 'healing', 'recovery', 'mended'],
  },

  // ── CATEGORY 4: Promotional & Sales (12 items) ──────────────────────────────
  {
    id: 'sticker-promo-new-pill',
    name: 'NEW Pill Badge',
    category: 'Promotional & Sales',
    subcategory: 'Status & Pill Tags',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 4px rgba(0,0,0,0.18))">
        <rect x="4" y="24" width="92" height="52" rx="26" fill="#3B82F6"/>
        <rect x="7" y="27" width="86" height="46" rx="23" fill="url(#cyanGrad)"/>
        <text x="50" y="58" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">NEW</text>
      </g>
    `,
    tags: ['badge', 'new', 'pill', 'fresh', 'update'],
  },
  {
    id: 'sticker-promo-hot-badge',
    name: 'HOT Flame Badge',
    category: 'Promotional & Sales',
    subcategory: 'Status & Pill Tags',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(220,38,38,0.3))">
        <rect x="6" y="26" width="88" height="48" rx="14" fill="#DC2626"/>
        <path d="M18,34 C16,40 18,46 22,46 C24,46 25,44 26,42 C27,48 31,52 35,50 C38,44 32,36 30,30 C30,30 24,32 18,34 Z" fill="#FACC15"/>
        <text x="56" y="60" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="26" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">HOT</text>
      </g>
    `,
    tags: ['badge', 'hot', 'fire', 'trending', 'popular'],
  },
  {
    id: 'sticker-promo-sale-burst',
    name: 'SALE Starburst Sticker',
    category: 'Promotional & Sales',
    subcategory: 'Discounts & Deals',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <path d="M50,4 L59,16 L73,8 L77,23 L92,23 L88,38 L99,50 L88,62 L92,77 L77,77 L73,92 L59,84 L50,96 L41,84 L27,92 L23,77 L8,77 L12,62 L1,50 L12,38 L8,23 L23,23 L27,8 L41,16 Z" fill="#EF4444"/>
        <circle cx="50" cy="50" r="32" fill="#FEE2E2"/>
        <text x="50" y="58" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="22" fill="#DC2626" text-anchor="middle" letter-spacing="1">SALE</text>
      </g>
    `,
    tags: ['sale', 'discount', 'burst', 'deal', 'promo', 'offer'],
  },
  {
    id: 'sticker-promo-bestseller',
    name: 'BESTSELLER Medal Ribbon',
    category: 'Promotional & Sales',
    subcategory: 'Discounts & Deals',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- Ribbons -->
        <polygon points="34,60 30,94 48,82 50,84 44,60" fill="#B91C1C"/>
        <polygon points="66,60 70,94 52,82 50,84 56,60" fill="#991B1B"/>
        <!-- Rosette circle -->
        <circle cx="50" cy="44" r="34" fill="#F59E0B"/>
        <circle cx="50" cy="44" r="30" fill="#FEF3C7"/>
        <text x="50" y="38" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="9" fill="#92400E" text-anchor="middle" letter-spacing="1.5">BEST</text>
        <text x="50" y="52" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="9" fill="#92400E" text-anchor="middle" letter-spacing="1">SELLER</text>
        <polygon points="50,56 52,60 56,60 53,63 54,67 50,65 46,67 47,63 44,60 48,60" fill="#F59E0B"/>
      </g>
    `,
    tags: ['bestseller', 'award', 'top', 'ribbon', 'medal'],
  },
  {
    id: 'sticker-promo-50-off',
    name: '50% OFF Angled Tag',
    category: 'Promotional & Sales',
    subcategory: 'Discounts & Deals',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))" transform="rotate(-8 50 50)">
        <rect x="6" y="22" width="88" height="56" rx="8" fill="#10B981"/>
        <circle cx="16" cy="50" r="5" fill="#FFFFFF"/>
        <text x="54" y="47" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="24" fill="#FFFFFF" text-anchor="middle">50%</text>
        <text x="54" y="66" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="16" fill="#DCFCE7" text-anchor="middle" letter-spacing="2">OFF</text>
      </g>
    `,
    tags: ['50-off', 'discount', 'half-price', 'deal', 'promo'],
  },
  {
    id: 'sticker-promo-pro-badge',
    name: 'PRO Diamond Badge',
    category: 'Promotional & Sales',
    subcategory: 'Status & Pill Tags',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(126,34,206,0.3))">
        <rect x="6" y="24" width="88" height="52" rx="14" fill="url(#purpleGrad)"/>
        <polygon points="26,44 32,36 38,44 32,52" fill="#FDE047"/>
        <text x="60" y="59" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">PRO</text>
      </g>
    `,
    tags: ['pro', 'premium', 'badge', 'vip', 'expert'],
  },
  {
    id: 'sticker-promo-verified-check',
    name: 'VERIFIED Blue Badge',
    category: 'Promotional & Sales',
    subcategory: 'Status & Pill Tags',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(2,132,199,0.3))">
        <path d="M50,8 L60,14 L73,12 L79,24 L91,28 L91,41 L100,50 L91,59 L91,72 L79,76 L73,88 L60,86 L50,92 L40,86 L27,88 L21,76 L9,72 L9,59 L0,50 L9,41 L9,28 L21,24 L27,12 L40,14 Z" fill="#0284C7"/>
        <polyline points="32,50 44,62 68,36" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `,
    tags: ['verified', 'check', 'official', 'authentic', 'trusted'],
  },
  {
    id: 'sticker-promo-free-stamp',
    name: '100% FREE Stamp',
    category: 'Promotional & Sales',
    subcategory: 'Status & Pill Tags',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.18))">
        <circle cx="50" cy="50" r="44" fill="#059669"/>
        <circle cx="50" cy="50" r="38" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="4 3"/>
        <text x="50" y="42" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="12" fill="#A7F3D0" text-anchor="middle" letter-spacing="1">100%</text>
        <text x="50" y="66" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="24" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">FREE</text>
      </g>
    `,
    tags: ['free', 'zero', 'stamp', 'gift', 'bonus'],
  },
  {
    id: 'sticker-promo-top-rated',
    name: 'TOP RATED Shield',
    category: 'Promotional & Sales',
    subcategory: 'Status & Pill Tags',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <path d="M50,6 L88,18 L88,52 C88,74 70,90 50,96 C30,90 12,74 12,52 L12,18 Z" fill="#1E293B"/>
        <path d="M50,12 L82,22 L82,50 C82,68 68,82 50,88 C32,82 18,68 18,50 L18,22 Z" fill="#0F172A"/>
        <polygon points="50,26 53,35 62,35 55,40 58,49 50,44 42,49 45,40 38,35 47,35" fill="#FACC15"/>
        <text x="50" y="64" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="10" fill="#F8FAFC" text-anchor="middle" letter-spacing="1">TOP</text>
        <text x="50" y="76" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="800" font-size="9" fill="#38BDF8" text-anchor="middle" letter-spacing="0.5">RATED</text>
      </g>
    `,
    tags: ['top-rated', 'shield', 'award', 'rank', 'quality'],
  },
  {
    id: 'sticker-promo-deal-tag',
    name: 'SUPER DEAL Price Tag',
    category: 'Promotional & Sales',
    subcategory: 'Discounts & Deals',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <path d="M12,46 L46,12 L84,12 C88,12 90,14 90,18 L90,56 C90,60 88,62 84,66 L50,90 C46,94 40,94 36,90 L12,56 C8,52 8,50 12,46 Z" fill="#E11D48"/>
        <circle cx="76" cy="26" r="5" fill="#FFFFFF"/>
        <text x="46" y="56" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="15" fill="#FFFFFF" text-anchor="middle" transform="rotate(-45 46 56)">DEAL</text>
      </g>
    `,
    tags: ['deal', 'discount', 'tag', 'special', 'bargain'],
  },
  {
    id: 'sticker-promo-vip-crown',
    name: 'VIP Golden Crown Tag',
    category: 'Promotional & Sales',
    subcategory: 'Status & Pill Tags',
    is_premium: true,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.3))">
        <rect x="6" y="24" width="88" height="52" rx="12" fill="#18181B"/>
        <rect x="8" y="26" width="84" height="48" rx="10" fill="none" stroke="#EAB308" stroke-width="2"/>
        <polygon points="26,56 22,40 30,46 36,36 42,46 50,40 46,56" fill="#FACC15"/>
        <text x="64" y="58" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="24" fill="#FACC15" text-anchor="middle" letter-spacing="2">VIP</text>
      </g>
    `,
    tags: ['vip', 'luxury', 'gold', 'exclusive', 'crown'],
  },
  {
    id: 'sticker-promo-limited-edition',
    name: 'LIMITED Gold Seal',
    category: 'Promotional & Sales',
    subcategory: 'Status & Pill Tags',
    is_premium: true,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.25))">
        <rect x="4" y="28" width="92" height="44" rx="22" fill="#0F172A"/>
        <rect x="6" y="30" width="88" height="40" rx="20" fill="none" stroke="#F59E0B" stroke-width="2"/>
        <text x="50" y="54" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="11" fill="#FDE047" text-anchor="middle" letter-spacing="2">LIMITED</text>
      </g>
    `,
    tags: ['limited', 'edition', 'exclusive', 'rare', 'special'],
  },

  // ── CATEGORY 5: Stars & Awards (12 items) ───────────────────────────────────
  {
    id: 'sticker-award-3d-star',
    name: 'Golden 3D Star',
    category: 'Stars & Awards',
    subcategory: 'Stars & Sparkles',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(245,158,11,0.4))">
        <polygon points="50,4 64,36 98,36 70,58 80,92 50,70 20,92 30,58 2,36 36,36" fill="url(#goldStar)"/>
        <!-- Shading facets -->
        <polygon points="50,4 50,70 20,92 30,58 2,36 36,36" fill="#D97706" opacity="0.3"/>
        <polygon points="50,4 50,70 80,92 70,58 98,36 64,36" fill="#FFFFFF" opacity="0.25"/>
      </g>
    `,
    tags: ['star', 'gold', 'rating', 'favorite', '3d', 'reward'],
  },
  {
    id: 'sticker-award-sparkles',
    name: 'Magic Sparkles',
    category: 'Stars & Awards',
    subcategory: 'Stars & Sparkles',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 2px 4px rgba(234,179,8,0.3))">
        <path d="M46,6 Q46,42 10,46 Q46,50 46,86 Q46,50 82,46 Q46,42 46,6 Z" fill="url(#goldStar)"/>
        <path d="M78,12 Q78,26 64,28 Q78,30 78,44 Q78,30 92,28 Q78,26 78,12 Z" fill="#38BDF8"/>
        <path d="M22,66 Q22,76 12,78 Q22,80 22,90 Q22,80 32,78 Q22,76 22,66 Z" fill="#EC4899"/>
      </g>
    `,
    tags: ['sparkles', 'magic', 'glitter', 'stars', 'ai', 'clean'],
  },
  {
    id: 'sticker-award-diamond-gem',
    name: 'Brilliant Diamond Gem',
    category: 'Stars & Awards',
    subcategory: 'Stars & Sparkles',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(56,189,248,0.4))">
        <polygon points="20,32 50,8 80,32 50,92" fill="#0284C7"/>
        <polygon points="20,32 38,32 50,92" fill="#0369A1"/>
        <polygon points="80,32 62,32 50,92" fill="#075985"/>
        <polygon points="38,32 62,32 50,92" fill="#38BDF8"/>
        <polygon points="38,32 50,8 62,32" fill="#BAE6FD"/>
        <polygon points="20,32 50,8 38,32" fill="#7DD3FC"/>
        <polygon points="80,32 50,8 62,32" fill="#38BDF8"/>
      </g>
    `,
    tags: ['diamond', 'gem', 'jewel', 'crystal', 'brilliant', 'blue'],
  },
  {
    id: 'sticker-award-gold-trophy',
    name: '1st Place Golden Trophy',
    category: 'Stars & Awards',
    subcategory: 'Trophies & Medals',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(245,158,11,0.35))">
        <path d="M28,14 L72,14 L72,46 C72,60 62,70 50,70 C38,70 28,60 28,46 Z" fill="url(#goldStar)"/>
        <!-- Handles -->
        <path d="M28,20 C14,20 14,40 28,44" fill="none" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/>
        <path d="M72,20 C86,20 86,40 72,44" fill="none" stroke="#F59E0B" stroke-width="5" stroke-linecap="round"/>
        <!-- Stem & Base -->
        <rect x="44" y="70" width="12" height="12" fill="#D97706"/>
        <rect x="30" y="82" width="40" height="12" rx="3" fill="#78350F"/>
        <!-- Star emblem on cup -->
        <polygon points="50,30 52,36 58,36 53,40 55,46 50,42 45,46 47,40 42,36 48,36" fill="#FFFFFF"/>
      </g>
    `,
    tags: ['trophy', 'winner', 'gold', 'champion', 'first-place', 'award'],
  },
  {
    id: 'sticker-award-gold-medal',
    name: 'Gold Medal #1',
    category: 'Stars & Awards',
    subcategory: 'Trophies & Medals',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- V-ribbon -->
        <polygon points="34,6 44,52 30,52" fill="#EF4444"/>
        <polygon points="66,6 56,52 70,52" fill="#2563EB"/>
        <!-- Medal Disc -->
        <circle cx="50" cy="62" r="28" fill="url(#goldStar)"/>
        <circle cx="50" cy="62" r="24" fill="#F59E0B"/>
        <circle cx="50" cy="62" r="22" fill="#FEF08A"/>
        <text x="50" y="71" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="24" fill="#B45309" text-anchor="middle">1</text>
      </g>
    `,
    tags: ['medal', 'gold', 'first', 'number-one', 'olympic'],
  },
  {
    id: 'sticker-award-silver-medal',
    name: 'Silver Medal #2',
    category: 'Stars & Awards',
    subcategory: 'Trophies & Medals',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <polygon points="34,6 44,52 30,52" fill="#EF4444"/>
        <polygon points="66,6 56,52 70,52" fill="#2563EB"/>
        <circle cx="50" cy="62" r="28" fill="#E2E8F0"/>
        <circle cx="50" cy="62" r="24" fill="#CBD5E1"/>
        <circle cx="50" cy="62" r="22" fill="#F8FAFC"/>
        <text x="50" y="71" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="24" fill="#475569" text-anchor="middle">2</text>
      </g>
    `,
    tags: ['medal', 'silver', 'second', 'award'],
  },
  {
    id: 'sticker-award-bronze-medal',
    name: 'Bronze Medal #3',
    category: 'Stars & Awards',
    subcategory: 'Trophies & Medals',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <polygon points="34,6 44,52 30,52" fill="#EF4444"/>
        <polygon points="66,6 56,52 70,52" fill="#2563EB"/>
        <circle cx="50" cy="62" r="28" fill="#D97706"/>
        <circle cx="50" cy="62" r="24" fill="#B45309"/>
        <circle cx="50" cy="62" r="22" fill="#FDE68A"/>
        <text x="50" y="71" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="24" fill="#78350F" text-anchor="middle">3</text>
      </g>
    `,
    tags: ['medal', 'bronze', 'third', 'award'],
  },
  {
    id: 'sticker-award-golden-crown',
    name: 'Imperial Golden Crown',
    category: 'Stars & Awards',
    subcategory: 'Trophies & Medals',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(245,158,11,0.4))">
        <polygon points="12,74 88,74 84,36 68,54 50,22 32,54 16,36" fill="url(#goldStar)"/>
        <rect x="12" y="74" width="76" height="12" rx="3" fill="#D97706"/>
        <!-- Crown jewels -->
        <circle cx="16" cy="36" r="4" fill="#EC4899"/>
        <circle cx="50" cy="22" r="5" fill="#3B82F6"/>
        <circle cx="84" cy="36" r="4" fill="#EC4899"/>
        <circle cx="32" cy="80" r="3" fill="#10B981"/>
        <circle cx="50" cy="80" r="3" fill="#EC4899"/>
        <circle cx="68" cy="80" r="3" fill="#3B82F6"/>
      </g>
    `,
    tags: ['crown', 'king', 'queen', 'royal', 'vip', 'gold'],
  },
  {
    id: 'sticker-award-blue-rosette',
    name: 'Blue Ribbon Rosette',
    category: 'Stars & Awards',
    subcategory: 'Trophies & Medals',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- Tails -->
        <polygon points="40,58 32,94 48,84 50,86 46,58" fill="#1D4ED8"/>
        <polygon points="60,58 68,94 52,84 50,86 54,58" fill="#1E40AF"/>
        <!-- Scalloped rosette circle -->
        <circle cx="50" cy="42" r="32" fill="#2563EB"/>
        <circle cx="50" cy="42" r="26" fill="#3B82F6"/>
        <circle cx="50" cy="42" r="20" fill="#FEF08A"/>
        <polygon points="50,28 53,36 61,36 55,42 57,50 50,45 43,50 45,42 39,36 47,36" fill="#D97706"/>
      </g>
    `,
    tags: ['rosette', 'ribbon', 'first-prize', 'winner', 'blue'],
  },
  {
    id: 'sticker-award-shooting-star',
    name: 'Shooting Star Trail',
    category: 'Stars & Awards',
    subcategory: 'Stars & Sparkles',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(245,158,11,0.3))">
        <!-- Trail -->
        <path d="M12,88 Q34,64 68,36 L76,44 Q42,72 20,96 Z" fill="url(#goldStar)" opacity="0.6"/>
        <path d="M26,92 Q46,74 72,48 L78,54 Q52,80 32,98 Z" fill="#F43F5E" opacity="0.4"/>
        <!-- Star Head -->
        <polygon points="76,14 82,28 98,30 86,42 90,56 76,48 62,56 66,42 54,30 70,28" fill="url(#goldStar)"/>
      </g>
    `,
    tags: ['shooting-star', 'wish', 'magic', 'space', 'speed'],
  },
  {
    id: 'sticker-award-quality-seal',
    name: '100% Quality Gold Seal',
    category: 'Stars & Awards',
    subcategory: 'Trophies & Medals',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <circle cx="50" cy="50" r="44" fill="#F59E0B"/>
        <circle cx="50" cy="50" r="38" fill="#FEF3C7"/>
        <circle cx="50" cy="50" r="35" fill="none" stroke="#B45309" stroke-width="1.5" stroke-dasharray="3 2"/>
        <text x="50" y="44" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="11" fill="#78350F" text-anchor="middle" letter-spacing="1">100%</text>
        <text x="50" y="58" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="9" fill="#78350F" text-anchor="middle" letter-spacing="1">QUALITY</text>
        <text x="50" y="70" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="9" fill="#B45309" text-anchor="middle">★★★★★</text>
      </g>
    `,
    tags: ['quality', 'seal', 'guarantee', 'certified', 'gold'],
  },
  {
    id: 'sticker-award-golden-bell',
    name: 'Ringing Golden Bell',
    category: 'Stars & Awards',
    subcategory: 'Stars & Sparkles',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(245,158,11,0.3))">
        <circle cx="50" cy="14" r="5" fill="#D97706"/>
        <path d="M50,16 C34,16 28,34 26,56 L20,70 L80,70 L74,56 C72,34 66,16 50,16 Z" fill="url(#goldStar)"/>
        <rect x="18" y="70" width="64" height="8" rx="4" fill="#D97706"/>
        <circle cx="50" cy="84" r="7" fill="#B45309"/>
      </g>
    `,
    tags: ['bell', 'notification', 'ring', 'alert', 'gold'],
  },

  // ── CATEGORY 6: Objects & Tech (12 items) ───────────────────────────────────
  {
    id: 'sticker-obj-rocket-ship',
    name: '3D Rocket Launch',
    category: 'Objects & Tech',
    subcategory: 'Energy & Excitement',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.25))">
        <!-- Exhaust Fire -->
        <polygon points="50,70 38,98 50,88 62,98" fill="url(#fireGrad)"/>
        <polygon points="50,72 44,92 50,84 56,92" fill="#FACC15"/>
        <!-- Rocket Body -->
        <path d="M50,8 C38,24 34,48 34,70 L66,70 C66,48 62,24 50,8 Z" fill="url(#rocketBody)"/>
        <!-- Red Cone Nose -->
        <path d="M50,8 C45,16 42,26 40,32 L60,32 C58,26 55,16 50,8 Z" fill="#EF4444"/>
        <!-- Fins -->
        <polygon points="34,54 14,72 34,70" fill="#EF4444"/>
        <polygon points="66,54 86,72 66,70" fill="#EF4444"/>
        <!-- Porthole -->
        <circle cx="50" cy="46" r="9" fill="#0284C7"/>
        <circle cx="50" cy="46" r="6" fill="#38BDF8"/>
        <circle cx="48" cy="44" r="2" fill="#FFFFFF"/>
      </g>
    `,
    tags: ['rocket', 'launch', 'startup', 'fast', 'blastoff', 'growth'],
  },
  {
    id: 'sticker-obj-fire-flame',
    name: 'Blazing Fire Flame',
    category: 'Objects & Tech',
    subcategory: 'Energy & Excitement',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(220,38,38,0.4))">
        <path d="M50,6 C34,22 18,44 18,66 C18,84 32,96 50,96 C68,96 82,84 82,66 C82,50 72,36 68,26 C64,36 58,40 54,34 C50,26 56,16 50,6 Z" fill="url(#fireGrad)"/>
        <path d="M50,38 C42,48 34,58 34,70 C34,80 42,88 50,88 C58,88 66,80 66,70 C66,62 60,54 58,48 C56,54 52,56 50,52 Z" fill="#FEF08A"/>
      </g>
    `,
    tags: ['fire', 'flame', 'hot', 'lit', 'trending', 'burn'],
  },
  {
    id: 'sticker-obj-party-popper',
    name: 'Party Confetti Popper',
    category: 'Objects & Tech',
    subcategory: 'Energy & Excitement',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- Cone -->
        <polygon points="12,92 24,56 48,80" fill="#F59E0B"/>
        <polygon points="12,92 24,56 36,68" fill="#D97706"/>
        <!-- Confetti burst -->
        <circle cx="56" cy="38" r="4" fill="#EF4444"/>
        <circle cx="74" cy="50" r="3.5" fill="#3B82F6"/>
        <circle cx="48" cy="24" r="3" fill="#10B981"/>
        <circle cx="70" cy="28" r="4" fill="#EC4899"/>
        <circle cx="86" cy="40" r="3" fill="#FACC15"/>
        <circle cx="36" cy="34" r="2.5" fill="#8B5CF6"/>
        <!-- Streamers -->
        <path d="M38,62 Q60,40 82,22" fill="none" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/>
        <path d="M48,68 Q68,54 90,44" fill="none" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/>
        <path d="M42,54 Q50,26 62,12" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    `,
    tags: ['party', 'popper', 'celebration', 'confetti', 'yay', 'fun'],
  },
  {
    id: 'sticker-obj-gift-box',
    name: '3D Gift Box',
    category: 'Objects & Tech',
    subcategory: 'Energy & Excitement',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- Box Base -->
        <rect x="20" y="44" width="60" height="46" rx="4" fill="#EF4444"/>
        <!-- Box Lid -->
        <rect x="14" y="34" width="72" height="14" rx="3" fill="#DC2626"/>
        <!-- Ribbon Vertical -->
        <rect x="44" y="34" width="12" height="56" fill="#FACC15"/>
        <!-- Ribbon Horizontal -->
        <rect x="20" y="60" width="60" height="12" fill="#FACC15"/>
        <!-- Bow -->
        <path d="M50,34 C40,18 24,24 34,34 Z" fill="#FACC15"/>
        <path d="M50,34 C60,18 76,24 66,34 Z" fill="#FACC15"/>
        <circle cx="50" cy="34" r="4" fill="#EAB308"/>
      </g>
    `,
    tags: ['gift', 'present', 'box', 'birthday', 'surprise'],
  },
  {
    id: 'sticker-obj-lightbulb',
    name: 'Glowing Idea Lightbulb',
    category: 'Objects & Tech',
    subcategory: 'Gadgets & Tools',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 6px rgba(234,179,8,0.35))">
        <!-- Rays -->
        <line x1="50" y1="2" x2="50" y2="10" stroke="#FACC15" stroke-width="4" stroke-linecap="round"/>
        <line x1="16" y1="24" x2="22" y2="28" stroke="#FACC15" stroke-width="3" stroke-linecap="round"/>
        <line x1="84" y1="24" x2="78" y2="28" stroke="#FACC15" stroke-width="3" stroke-linecap="round"/>
        <!-- Glass bulb -->
        <path d="M50,14 C32,14 22,28 22,44 C22,56 32,64 36,72 L64,72 C68,64 78,56 78,44 C78,28 68,14 50,14 Z" fill="#FEF08A"/>
        <!-- Filament -->
        <path d="M42,50 L46,38 L54,38 L58,50" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
        <!-- Base screw -->
        <rect x="38" y="74" width="24" height="6" rx="2" fill="#94A3B8"/>
        <rect x="40" y="82" width="20" height="6" rx="2" fill="#64748B"/>
        <rect x="44" y="90" width="12" height="4" rx="2" fill="#334155"/>
      </g>
    `,
    tags: ['lightbulb', 'idea', 'creative', 'bright', 'innovation'],
  },
  {
    id: 'sticker-obj-money-bag',
    name: 'Cash Money Bag',
    category: 'Objects & Tech',
    subcategory: 'Gadgets & Tools',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- Tied Top -->
        <polygon points="50,24 38,12 62,12" fill="#D97706"/>
        <circle cx="50" cy="24" r="5" fill="#B45309"/>
        <!-- Bag Sack -->
        <path d="M50,26 C36,26 16,42 16,66 C16,84 30,94 50,94 C70,94 84,84 84,66 C84,42 64,26 50,26 Z" fill="#FBBF24"/>
        <text x="50" y="74" font-family="system-ui, -apple-system, Roboto, sans-serif" font-weight="900" font-size="34" fill="#15803D" text-anchor="middle">$</text>
      </g>
    `,
    tags: ['money', 'cash', 'bag', 'dollar', 'wealth', 'rich'],
  },
  {
    id: 'sticker-obj-target-bullseye',
    name: 'Target Bullseye',
    category: 'Objects & Tech',
    subcategory: 'Gadgets & Tools',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <circle cx="50" cy="50" r="44" fill="#EF4444"/>
        <circle cx="50" cy="50" r="34" fill="#FFFFFF"/>
        <circle cx="50" cy="50" r="24" fill="#EF4444"/>
        <circle cx="50" cy="50" r="14" fill="#FFFFFF"/>
        <circle cx="50" cy="50" r="6" fill="#EF4444"/>
        <!-- Arrow hitting bullseye -->
        <line x1="82" y1="18" x2="52" y2="48" stroke="#1E293B" stroke-width="4" stroke-linecap="round"/>
        <polygon points="88,12 80,14 86,20" fill="#FACC15"/>
      </g>
    `,
    tags: ['target', 'bullseye', 'goal', 'focus', 'aim', 'direct'],
  },
  {
    id: 'sticker-obj-lightning-bolt',
    name: 'Electric Lightning Bolt',
    category: 'Objects & Tech',
    subcategory: 'Energy & Excitement',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 6px rgba(245,158,11,0.4))">
        <polygon points="56,2 14,54 44,54 32,98 86,44 54,44" fill="url(#goldStar)"/>
        <polygon points="56,2 34,54 44,54 32,98 60,44 54,44" fill="#FFFFFF" opacity="0.3"/>
      </g>
    `,
    tags: ['lightning', 'bolt', 'electric', 'fast', 'flash', 'energy'],
  },
  {
    id: 'sticker-obj-shopping-cart',
    name: 'Shopping Cart',
    category: 'Objects & Tech',
    subcategory: 'Gadgets & Tools',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <path d="M12,20 L24,20 L38,62 L78,62 L88,32 L28,32" fill="none" stroke="#2563EB" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="42" y1="36" x2="42" y2="58" stroke="#93C5FD" stroke-width="2"/>
        <line x1="56" y1="36" x2="56" y2="58" stroke="#93C5FD" stroke-width="2"/>
        <line x1="70" y1="36" x2="70" y2="58" stroke="#93C5FD" stroke-width="2"/>
        <circle cx="40" cy="78" r="7" fill="#1E293B"/>
        <circle cx="40" cy="78" r="3" fill="#FFFFFF"/>
        <circle cx="74" cy="78" r="7" fill="#1E293B"/>
        <circle cx="74" cy="78" r="3" fill="#FFFFFF"/>
      </g>
    `,
    tags: ['cart', 'shop', 'ecommerce', 'buy', 'store', 'checkout'],
  },
  {
    id: 'sticker-obj-coffee-mug',
    name: 'Hot Steaming Coffee',
    category: 'Objects & Tech',
    subcategory: 'Energy & Excitement',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- Steam -->
        <path d="M36,22 Q40,14 36,6" fill="none" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
        <path d="M50,20 Q54,12 50,4" fill="none" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
        <path d="M64,22 Q68,14 64,6" fill="none" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
        <!-- Mug -->
        <path d="M22,30 L74,30 L70,78 C70,84 64,88 56,88 L40,88 C32,88 26,84 26,78 Z" fill="#E11D48"/>
        <!-- Handle -->
        <path d="M72,38 C86,38 86,66 70,66" fill="none" stroke="#E11D48" stroke-width="6" stroke-linecap="round"/>
        <!-- Heart on mug -->
        <path d="M48,58 C42,50 36,44 42,38 C46,34 50,40 48,42 C50,40 54,34 58,38 C64,44 58,50 48,58 Z" fill="#FFFFFF"/>
      </g>
    `,
    tags: ['coffee', 'tea', 'mug', 'morning', 'energy', 'warm'],
  },
  {
    id: 'sticker-obj-magic-wand',
    name: 'Magic Star Wand',
    category: 'Objects & Tech',
    subcategory: 'Gadgets & Tools',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(126,34,206,0.3))">
        <!-- Wand Stick -->
        <line x1="20" y1="84" x2="64" y2="40" stroke="#1E293B" stroke-width="6" stroke-linecap="round"/>
        <line x1="20" y1="84" x2="36" y2="68" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
        <!-- Star Head -->
        <polygon points="72,14 76,26 88,28 78,36 80,48 70,42 60,48 62,36 52,28 64,26" fill="url(#goldStar)"/>
        <!-- Sparkles -->
        <circle cx="86" cy="18" r="2.5" fill="#38BDF8"/>
        <circle cx="54" cy="14" r="2" fill="#EC4899"/>
        <circle cx="82" cy="54" r="2" fill="#FACC15"/>
      </g>
    `,
    tags: ['wand', 'magic', 'wizard', 'design', 'create', 'spell'],
  },
  {
    id: 'sticker-obj-megaphone',
    name: 'Loudspeaker Megaphone',
    category: 'Objects & Tech',
    subcategory: 'Gadgets & Tools',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- Sound Waves -->
        <path d="M78,34 C82,42 82,58 78,66" fill="none" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M86,26 C94,38 94,62 86,74" fill="none" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Megaphone Body -->
        <polygon points="34,42 70,24 70,76 34,58" fill="#DC2626"/>
        <rect x="20" y="42" width="16" height="16" rx="2" fill="#1E293B"/>
        <!-- Handle -->
        <path d="M26,58 L24,78 L34,78 L34,58" fill="#64748B"/>
      </g>
    `,
    tags: ['megaphone', 'announcement', 'loud', 'speaker', 'marketing', 'broadcast'],
  },

  // ── CATEGORY 7: Food & Nature (12 items) ────────────────────────────────────
  {
    id: 'sticker-food-red-apple',
    name: 'Glossy Red Apple',
    category: 'Food & Nature',
    subcategory: 'Food & Treats',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- Stem & Leaf -->
        <path d="M50,22 C50,12 56,6 60,4" fill="none" stroke="#78350F" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="64" cy="12" rx="10" ry="5" fill="#16A34A" transform="rotate(-20 64 12)"/>
        <!-- Apple Body -->
        <path d="M50,28 C42,20 20,20 16,42 C12,64 30,90 48,92 C50,92 50,92 52,92 C70,90 88,64 84,42 C80,20 58,20 50,28 Z" fill="#DC2626"/>
        <ellipse cx="30" cy="38" rx="8" ry="4" fill="#FFFFFF" opacity="0.4" transform="rotate(-30 30 38)"/>
      </g>
    `,
    tags: ['apple', 'fruit', 'food', 'red', 'healthy', 'fresh'],
  },
  {
    id: 'sticker-food-pizza-slice',
    name: 'Cheesy Pizza Slice',
    category: 'Food & Nature',
    subcategory: 'Food & Treats',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- Crust -->
        <path d="M20,24 Q50,14 80,24 L76,32 Q50,22 24,32 Z" fill="#D97706"/>
        <!-- Slice Body -->
        <polygon points="24,30 76,30 50,92" fill="#FBBF24"/>
        <!-- Pepperoni -->
        <circle cx="44" cy="42" r="6" fill="#DC2626"/>
        <circle cx="60" cy="48" r="5.5" fill="#DC2626"/>
        <circle cx="50" cy="66" r="5" fill="#DC2626"/>
        <!-- Basil leaves -->
        <ellipse cx="36" cy="56" rx="4" ry="2" fill="#15803D" transform="rotate(30 36 56)"/>
      </g>
    `,
    tags: ['pizza', 'cheese', 'slice', 'fast-food', 'pepperoni'],
  },
  {
    id: 'sticker-food-sweet-donut',
    name: 'Strawberry Sprinkles Donut',
    category: 'Food & Nature',
    subcategory: 'Food & Treats',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <circle cx="50" cy="50" r="42" fill="#D97706"/>
        <path d="M50,12 C72,12 86,26 86,50 C86,72 70,86 50,86 C28,86 14,72 14,50 C14,28 26,12 50,12 Z" fill="#EC4899"/>
        <!-- Hole -->
        <circle cx="50" cy="50" r="16" fill="#F8FAFC"/>
        <!-- Sprinkles -->
        <line x1="32" y1="28" x2="38" y2="30" stroke="#FDE047" stroke-width="3" stroke-linecap="round"/>
        <line x1="62" y1="26" x2="68" y2="28" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
        <line x1="74" y1="46" x2="76" y2="52" stroke="#4ADE80" stroke-width="3" stroke-linecap="round"/>
        <line x1="30" y1="64" x2="36" y2="66" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
        <line x1="58" y1="72" x2="64" y2="70" stroke="#FDE047" stroke-width="3" stroke-linecap="round"/>
      </g>
    `,
    tags: ['donut', 'sweet', 'pink', 'sprinkles', 'dessert', 'snack'],
  },
  {
    id: 'sticker-food-ice-cream',
    name: 'Swirl Ice Cream Cone',
    category: 'Food & Nature',
    subcategory: 'Food & Treats',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- Waffle Cone -->
        <polygon points="30,52 70,52 50,96" fill="#D97706"/>
        <line x1="38" y1="62" x2="62" y2="62" stroke="#B45309" stroke-width="1.5"/>
        <line x1="44" y1="76" x2="56" y2="76" stroke="#B45309" stroke-width="1.5"/>
        <!-- Swirl scoops -->
        <circle cx="50" cy="46" r="18" fill="#F472B6"/>
        <circle cx="50" cy="30" r="16" fill="#60A5FA"/>
        <circle cx="50" cy="18" r="12" fill="#FBBF24"/>
        <!-- Cherry on top -->
        <circle cx="50" cy="10" r="6" fill="#DC2626"/>
      </g>
    `,
    tags: ['ice-cream', 'dessert', 'sweet', 'summer', 'treat'],
  },
  {
    id: 'sticker-food-burger',
    name: 'Juicy Cheeseburger',
    category: 'Food & Nature',
    subcategory: 'Food & Treats',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- Top Bun -->
        <path d="M16,42 C16,22 30,14 50,14 C70,14 84,22 84,42 Z" fill="#D97706"/>
        <!-- Sesame seeds -->
        <ellipse cx="36" cy="26" rx="2" ry="1" fill="#FEF3C7"/>
        <ellipse cx="50" cy="22" rx="2" ry="1" fill="#FEF3C7"/>
        <ellipse cx="64" cy="28" rx="2" ry="1" fill="#FEF3C7"/>
        <!-- Lettuce -->
        <path d="M12,46 Q24,52 36,46 Q48,52 60,46 Q72,52 88,46" fill="none" stroke="#22C55E" stroke-width="6" stroke-linecap="round"/>
        <!-- Tomato & Cheese -->
        <rect x="18" y="52" width="64" height="6" fill="#EF4444"/>
        <polygon points="20,58 80,58 74,68 50,62 26,68" fill="#FACC15"/>
        <!-- Meat Patty -->
        <rect x="16" y="66" width="68" height="10" rx="4" fill="#78350F"/>
        <!-- Bottom Bun -->
        <rect x="20" y="78" width="60" height="12" rx="6" fill="#D97706"/>
      </g>
    `,
    tags: ['burger', 'cheeseburger', 'food', 'snack', 'fast-food'],
  },
  {
    id: 'sticker-nature-rainbow',
    name: 'Vibrant Cloud Rainbow',
    category: 'Food & Nature',
    subcategory: 'Nature & Sunshine',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.15))">
        <!-- Arcs -->
        <path d="M16,68 A34,34 0 0 1 84,68" fill="none" stroke="#EF4444" stroke-width="7"/>
        <path d="M22,68 A28,28 0 0 1 78,68" fill="none" stroke="#F59E0B" stroke-width="7"/>
        <path d="M28,68 A22,22 0 0 1 72,68" fill="none" stroke="#10B981" stroke-width="7"/>
        <path d="M34,68 A16,16 0 0 1 66,68" fill="none" stroke="#3B82F6" stroke-width="7"/>
        <!-- Clouds -->
        <ellipse cx="20" cy="72" rx="14" ry="10" fill="#FFFFFF"/>
        <circle cx="28" cy="66" r="10" fill="#FFFFFF"/>
        <ellipse cx="80" cy="72" rx="14" ry="10" fill="#FFFFFF"/>
        <circle cx="72" cy="66" r="10" fill="#FFFFFF"/>
      </g>
    `,
    tags: ['rainbow', 'clouds', 'sky', 'colors', 'nature', 'pride'],
  },
  {
    id: 'sticker-nature-radiant-sun',
    name: 'Radiant Smiling Sun',
    category: 'Food & Nature',
    subcategory: 'Nature & Sunshine',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 6px rgba(245,158,11,0.4))">
        <!-- Rays -->
        <path d="M50,4 L55,16 L66,6 L66,20 L78,14 L74,28 L88,26 L80,38 L96,40 L84,50 L96,60 L80,62 L88,74 L74,72 L78,86 L66,80 L66,94 L55,84 L50,96 L45,84 L34,94 L34,80 L22,86 L26,72 L12,74 L20,62 L4,60 L16,50 L4,40 L20,38 L12,26 L26,28 L22,14 L34,20 L34,6 L45,16 Z" fill="#FBBF24"/>
        <circle cx="50" cy="50" r="28" fill="#F59E0B"/>
        <!-- Face -->
        <circle cx="42" cy="46" r="3.5" fill="#78350F"/>
        <circle cx="58" cy="46" r="3.5" fill="#78350F"/>
        <path d="M42,56 C46,62 54,62 58,56" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="36" cy="52" rx="4" ry="2" fill="#EF4444" opacity="0.6"/>
        <ellipse cx="64" cy="52" rx="4" ry="2" fill="#EF4444" opacity="0.6"/>
      </g>
    `,
    tags: ['sun', 'sunshine', 'summer', 'bright', 'warmth', 'happy'],
  },
  {
    id: 'sticker-nature-crescent-stars',
    name: 'Peaceful Moon & Stars',
    category: 'Food & Nature',
    subcategory: 'Nature & Sunshine',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(245,158,11,0.3))">
        <!-- Moon -->
        <path d="M66,12 C42,12 24,30 24,54 C24,78 42,94 66,94 C48,84 40,66 44,48 C48,34 56,20 66,12 Z" fill="#FBBF24"/>
        <!-- Stars -->
        <polygon points="76,22 78,28 84,29 79,33 81,39 76,35 71,39 73,33 68,29 74,28" fill="#38BDF8"/>
        <polygon points="80,56 81,60 85,61 82,64 83,68 80,66 77,68 78,64 75,61 79,60" fill="#F472B6"/>
        <!-- Sleepy moon eye -->
        <path d="M38,48 C40,52 46,52 48,48" fill="none" stroke="#B45309" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    `,
    tags: ['moon', 'night', 'sleep', 'stars', 'astronomy', 'dream'],
  },
  {
    id: 'sticker-nature-clover-luck',
    name: 'Four-Leaf Lucky Clover',
    category: 'Food & Nature',
    subcategory: 'Nature & Sunshine',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(22,163,74,0.3))">
        <!-- Stem -->
        <path d="M50,50 Q44,78 34,92" fill="none" stroke="#15803D" stroke-width="5" stroke-linecap="round"/>
        <!-- Top Leaf -->
        <path d="M50,50 C40,24 60,24 50,50 Z" fill="#22C55E"/>
        <path d="M50,50 C36,32 50,14 50,50 Z" fill="#16A34A"/>
        <path d="M50,50 C64,32 50,14 50,50 Z" fill="#4ADE80"/>
        <!-- Left Leaf -->
        <path d="M50,50 C32,36 14,50 50,50 Z" fill="#16A34A"/>
        <path d="M50,50 C32,64 14,50 50,50 Z" fill="#22C55E"/>
        <!-- Right Leaf -->
        <path d="M50,50 C68,36 86,50 50,50 Z" fill="#4ADE80"/>
        <path d="M50,50 C68,64 86,50 50,50 Z" fill="#16A34A"/>
        <!-- Bottom Leaf -->
        <path d="M50,50 C36,68 50,86 50,50 Z" fill="#22C55E"/>
        <path d="M50,50 C64,68 50,86 50,50 Z" fill="#15803D"/>
      </g>
    `,
    tags: ['clover', 'luck', 'four-leaf', 'irish', 'green', 'fortune'],
  },
  {
    id: 'sticker-nature-palm-tree',
    name: 'Tropical Palm Tree',
    category: 'Food & Nature',
    subcategory: 'Nature & Sunshine',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))">
        <!-- Island sand -->
        <ellipse cx="50" cy="90" rx="36" ry="8" fill="#FBBF24"/>
        <!-- Trunk -->
        <path d="M48,88 Q58,60 52,38" fill="none" stroke="#78350F" stroke-width="7" stroke-linecap="round"/>
        <!-- Fronds -->
        <path d="M52,38 Q32,24 16,34" fill="none" stroke="#15803D" stroke-width="6" stroke-linecap="round"/>
        <path d="M52,38 Q36,12 26,18" fill="none" stroke="#22C55E" stroke-width="6" stroke-linecap="round"/>
        <path d="M52,38 Q52,8 60,10" fill="none" stroke="#4ADE80" stroke-width="6" stroke-linecap="round"/>
        <path d="M52,38 Q74,16 84,24" fill="none" stroke="#22C55E" stroke-width="6" stroke-linecap="round"/>
        <path d="M52,38 Q76,32 86,46" fill="none" stroke="#15803D" stroke-width="6" stroke-linecap="round"/>
      </g>
    `,
    tags: ['palm', 'tree', 'tropical', 'beach', 'vacation', 'summer'],
  },
  {
    id: 'sticker-nature-cute-cat',
    name: 'Cute Kitten Face',
    category: 'Food & Nature',
    subcategory: 'Nature & Sunshine',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.18))">
        <!-- Ears -->
        <polygon points="24,42 16,14 42,26" fill="#F1F5F9"/>
        <polygon points="24,38 20,20 36,28" fill="#FDA4AF"/>
        <polygon points="76,42 84,14 58,26" fill="#F1F5F9"/>
        <polygon points="76,38 80,20 64,28" fill="#FDA4AF"/>
        <!-- Head -->
        <circle cx="50" cy="54" r="34" fill="#FFFFFF"/>
        <!-- Eyes -->
        <ellipse cx="38" cy="48" rx="4" ry="6" fill="#1E293B"/>
        <circle cx="40" cy="46" r="1.5" fill="#FFFFFF"/>
        <ellipse cx="62" cy="48" rx="4" ry="6" fill="#1E293B"/>
        <circle cx="64" cy="46" r="1.5" fill="#FFFFFF"/>
        <!-- Nose & Whiskers -->
        <polygon points="47,56 53,56 50,60" fill="#FB7185"/>
        <path d="M50,60 C46,64 42,62 38,60 M50,60 C54,64 58,62 62,60" fill="none" stroke="#1E293B" stroke-width="2"/>
        <line x1="20" y1="52" x2="34" y2="54" stroke="#94A3B8" stroke-width="1.5"/>
        <line x1="18" y1="60" x2="34" y2="58" stroke="#94A3B8" stroke-width="1.5"/>
        <line x1="80" y1="52" x2="66" y2="54" stroke="#94A3B8" stroke-width="1.5"/>
        <line x1="82" y1="60" x2="66" y2="58" stroke="#94A3B8" stroke-width="1.5"/>
      </g>
    `,
    tags: ['cat', 'kitten', 'cute', 'pet', 'animal', 'meow'],
  },
  {
    id: 'sticker-nature-cute-dog',
    name: 'Happy Puppy Face',
    category: 'Food & Nature',
    subcategory: 'Nature & Sunshine',
    is_premium: false,
    content: `
      <g filter="drop-shadow(0 3px 5px rgba(0,0,0,0.18))">
        <!-- Floppy Ears -->
        <path d="M22,34 C12,42 10,64 24,70 C28,66 28,46 26,34 Z" fill="#B45309"/>
        <path d="M78,34 C88,42 90,64 76,70 C72,66 72,46 74,34 Z" fill="#B45309"/>
        <!-- Head -->
        <circle cx="50" cy="52" r="32" fill="#FBBF24"/>
        <!-- Eyes -->
        <circle cx="38" cy="46" r="4" fill="#1E293B"/>
        <circle cx="40" cy="44" r="1.5" fill="#FFFFFF"/>
        <circle cx="62" cy="46" r="4" fill="#1E293B"/>
        <circle cx="64" cy="44" r="1.5" fill="#FFFFFF"/>
        <!-- Snout -->
        <ellipse cx="50" cy="62" rx="14" ry="10" fill="#FEF08A"/>
        <ellipse cx="50" cy="58" rx="6" ry="4" fill="#1E293B"/>
        <path d="M50,62 C46,68 42,66 38,64 M50,62 C54,68 58,66 62,64" fill="none" stroke="#1E293B" stroke-width="2"/>
        <!-- Tongue -->
        <path d="M46,66 C46,74 54,74 54,66 Z" fill="#F43F5E"/>
      </g>
    `,
    tags: ['dog', 'puppy', 'cute', 'pet', 'animal', 'woof'],
  },
];

// ─── 4. SEEDER EXECUTION FUNCTION ─────────────────────────────────────────────
async function seedStickers() {
  console.log('🚀 Starting Precision Vector Stickers & Categories Seeding...');

  // 1. Ensure Asset Categories for Stickers
  console.log(`📂 Ensuring ${STICKER_CATEGORIES.length} sticker categories...`);
  for (const cat of STICKER_CATEGORIES) {
    const existing = await db('asset_categories').where({ id: cat.id }).first();
    if (!existing) {
      await db('asset_categories').insert({
        ...cat,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
      console.log(`   ➕ Inserted sticker category: ${cat.name} (${cat.id})`);
    } else {
      await db('asset_categories')
        .where({ id: cat.id })
        .update({
          name: cat.name,
          label: cat.label,
          asset_type: cat.asset_type,
          description: cat.description,
          icon: cat.icon,
          color: cat.color,
          sort_order: cat.sort_order,
          is_active: cat.is_active,
          updated_at: db.fn.now(),
        });
    }
  }

  // 2. Ensure Subcategories for Stickers
  console.log(`📂 Ensuring ${STICKER_SUBCATEGORIES.length} sticker subcategories...`);
  for (const sub of STICKER_SUBCATEGORIES) {
    const existing = await db('asset_subcategories').where({ id: sub.id }).first();
    if (!existing) {
      await db('asset_subcategories').insert({
        ...sub,
        is_active: true,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
      console.log(`   ➕ Inserted sticker subcategory: ${sub.name} (${sub.id})`);
    } else {
      await db('asset_subcategories')
        .where({ id: sub.id })
        .update({
          category_id: sub.category_id,
          name: sub.name,
          label: sub.label,
          sort_order: sub.sort_order,
          updated_at: db.fn.now(),
        });
    }
  }

  // 3. Upsert Stickers into `assets` table
  console.log(`✨ Upserting ${STICKER_ASSETS.length} vector stickers into assets table...`);
  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of STICKER_ASSETS) {
    const fileUrl = makeStickerSvg(item.content);
    const existing = await db('assets').where({ id: item.id }).first();

    const assetPayload = {
      id: item.id,
      name: item.name,
      type: 'sticker',
      category: item.category,
      subcategory: item.subcategory,
      file_url: fileUrl,
      file_path: null,
      file_size: fileUrl.length,
      mime_type: 'image/svg+xml',
      width: 100,
      height: 100,
      is_builtin: true,
      is_premium: Boolean(item.is_premium),
      use_count: existing ? existing.use_count : 0,
      metadata: JSON.stringify({
        tags: item.tags,
        format: 'svg',
        render_mode: 'sticker',
        viewBox: '0 0 100 100',
      }),
      updated_at: db.fn.now(),
    };

    if (!existing) {
      await db('assets').insert({
        ...assetPayload,
        created_at: db.fn.now(),
      });
      insertedCount++;
    } else {
      await db('assets').where({ id: item.id }).update(assetPayload);
      updatedCount++;
    }
  }

  // Invalidate memory cache so frontend immediately sees updated tree
  try {
    memoryCache.delPrefix('asset:categories');
  } catch (_) {}

  console.log(`✅ [Vector Stickers] Seeding completed successfully!`);
  console.log(`   - Stickers Inserted: ${insertedCount}`);
  console.log(`   - Stickers Updated:  ${updatedCount}`);
  console.log(`   - Total in DB:       ${insertedCount + updatedCount}`);

  return { insertedCount, updatedCount };
}

// Support running both as standalone script and as Knex seed
if (require.main === module) {
  require('dotenv').config();
  seedStickers()
    .then(() => {
      console.log('🎉 Stickers Seeder completed without error.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeder encountered an error:', err);
      process.exit(1);
    });
}

exports.seed = seedStickers;
