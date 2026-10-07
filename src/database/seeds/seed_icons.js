// backend/src/database/seeds/seed_icons.js
// Ultra-Modern Vector Icons Seeder
// Seeds 82 precision vector icons across 8 categories with live subcategories.
'use strict';

const db = require('../knex');
const memoryCache = require('../../utils/memoryCache');

// Helper to construct precision vector icon SVG data-URIs
function makeIconSvg(content, { stroke = 'currentColor', fill = 'none', strokeWidth = 2, color = '#1E293B' } = {}) {
  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="72" height="72" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" color="${color}">${content}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
}

// ─── 1. ICON CATEGORIES ──────────────────────────────────────────────────────
const ICON_CATEGORIES = [
  {
    id: 'icon-navigation',
    name: 'Navigation',
    label: 'Navigation & Interface',
    asset_type: 'icon',
    description: 'Interface arrows, menus, search, controls, and layout navigation',
    icon: 'Navigation',
    color: '#0284C7',
    sort_order: 0,
    is_active: true,
  },
  {
    id: 'icon-media',
    name: 'Media & Audio',
    label: 'Media & Playback',
    asset_type: 'icon',
    description: 'Video, music, photo, camera, sound, and player controls',
    icon: 'PlayCircle',
    color: '#F43F5E',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'icon-commerce',
    name: 'Commerce',
    label: 'Commerce & Finance',
    asset_type: 'icon',
    description: 'Shopping carts, credit cards, wallets, currencies, and receipts',
    icon: 'ShoppingCart',
    color: '#10B981',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'icon-communication',
    name: 'Communication',
    label: 'Communication & Social',
    asset_type: 'icon',
    description: 'Messages, chat bubbles, mail, sharing, stars, and social actions',
    icon: 'Chat',
    color: '#8B5CF6',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'icon-tech',
    name: 'Tech & Hardware',
    label: 'Technology & Devices',
    asset_type: 'icon',
    description: 'Smartphones, laptops, monitors, chips, cloud, and development',
    icon: 'Memory',
    color: '#6366F1',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'icon-security',
    name: 'Security',
    label: 'Security & System',
    asset_type: 'icon',
    description: 'Shields, locks, keys, verification badges, and alerts',
    icon: 'Security',
    color: '#059669',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'icon-business',
    name: 'Business',
    label: 'Business & Productivity',
    asset_type: 'icon',
    description: 'Briefcases, files, folders, calendars, clocks, and targets',
    icon: 'Work',
    color: '#D97706',
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'icon-design',
    name: 'Design & Tools',
    label: 'Design & Creative Tools',
    asset_type: 'icon',
    description: 'Editing pens, palettes, magic wands, typography, and crop tools',
    icon: 'Palette',
    color: '#EC4899',
    sort_order: 7,
    is_active: true,
  },
];

// ─── 2. ICON SUBCATEGORIES ───────────────────────────────────────────────────
const ICON_SUBCATEGORIES = [
  // Navigation
  { id: 'icon-nav-arrows', category_id: 'icon-navigation', name: 'Arrows', label: 'Arrows & Directional', sort_order: 0 },
  { id: 'icon-nav-menu', category_id: 'icon-navigation', name: 'Menu & Search', label: 'Menu, Search & Filters', sort_order: 1 },
  { id: 'icon-nav-actions', category_id: 'icon-navigation', name: 'Controls', label: 'Actions & Controls', sort_order: 2 },

  // Media
  { id: 'icon-media-playback', category_id: 'icon-media', name: 'Playback', label: 'Playback & Audio', sort_order: 0 },
  { id: 'icon-media-capture', category_id: 'icon-media', name: 'Capture', label: 'Camera & Video', sort_order: 1 },

  // Commerce
  { id: 'icon-comm-shopping', category_id: 'icon-commerce', name: 'Shopping', label: 'Shopping & Bags', sort_order: 0 },
  { id: 'icon-comm-payment', category_id: 'icon-commerce', name: 'Payments', label: 'Money & Cards', sort_order: 1 },
  { id: 'icon-comm-analytics', category_id: 'icon-commerce', name: 'Analytics', label: 'Charts & Rates', sort_order: 2 },

  // Communication
  { id: 'icon-comm-messages', category_id: 'icon-communication', name: 'Messages', label: 'Chat & Mail', sort_order: 0 },
  { id: 'icon-comm-social', category_id: 'icon-communication', name: 'Social', label: 'Likes & Stars', sort_order: 1 },
  { id: 'icon-comm-people', category_id: 'icon-communication', name: 'People', label: 'Users & Team', sort_order: 2 },

  // Tech
  { id: 'icon-tech-devices', category_id: 'icon-tech', name: 'Devices', label: 'Computers & Phones', sort_order: 0 },
  { id: 'icon-tech-network', category_id: 'icon-tech', name: 'Network', label: 'Cloud & Database', sort_order: 1 },
  { id: 'icon-tech-dev', category_id: 'icon-tech', name: 'Code', label: 'Coding & Electronics', sort_order: 2 },

  // Security
  { id: 'icon-sec-locks', category_id: 'icon-security', name: 'Locks & Access', label: 'Locks & Access', sort_order: 0 },
  { id: 'icon-sec-shields', category_id: 'icon-security', name: 'Shields', label: 'Shields & Verification', sort_order: 1 },
  { id: 'icon-sec-alerts', category_id: 'icon-security', name: 'Alerts', label: 'Alerts & Information', sort_order: 2 },

  // Business
  { id: 'icon-biz-office', category_id: 'icon-business', name: 'Office', label: 'Office & Target', sort_order: 0 },
  { id: 'icon-biz-files', category_id: 'icon-business', name: 'Documents', label: 'Files & Folders', sort_order: 1 },
  { id: 'icon-biz-time', category_id: 'icon-business', name: 'Time', label: 'Time & Calendar', sort_order: 2 },

  // Design
  { id: 'icon-design-tools', category_id: 'icon-design', name: 'Drawing', label: 'Pens & Drawing', sort_order: 0 },
  { id: 'icon-design-editing', category_id: 'icon-design', name: 'Editing', label: 'Effects & AI', sort_order: 1 },
  { id: 'icon-design-display', category_id: 'icon-design', name: 'Display', label: 'Display & Mode', sort_order: 2 },
];

// ─── 3. MODERN VECTOR ICONS ASSETS (82 Total) ────────────────────────────────
const ICON_ASSETS = [
  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY 1: Navigation & Interface
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'icon-home',
    name: 'Home',
    category: 'Navigation',
    subcategory: 'icon-nav-menu',
    content: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    is_premium: false,
    tags: ['home', 'house', 'main', 'start', 'navigation'],
  },
  {
    id: 'icon-search',
    name: 'Search',
    category: 'Navigation',
    subcategory: 'icon-nav-menu',
    content: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    is_premium: false,
    tags: ['search', 'find', 'explore', 'magnifier', 'lookup'],
  },
  {
    id: 'icon-menu',
    name: 'Menu / Hamburger',
    category: 'Navigation',
    subcategory: 'icon-nav-menu',
    content: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    is_premium: false,
    tags: ['menu', 'hamburger', 'drawer', 'navigation', 'bars'],
  },
  {
    id: 'icon-settings',
    name: 'Settings / Gear',
    category: 'Navigation',
    subcategory: 'icon-nav-actions',
    content: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    is_premium: false,
    tags: ['settings', 'gear', 'cog', 'preferences', 'options'],
  },
  {
    id: 'icon-filter',
    name: 'Filter',
    category: 'Navigation',
    subcategory: 'icon-nav-menu',
    content: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    is_premium: false,
    tags: ['filter', 'funnel', 'sort', 'refine'],
  },
  {
    id: 'icon-sliders',
    name: 'Sliders / Adjust',
    category: 'Navigation',
    subcategory: 'icon-nav-actions',
    content: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    is_premium: false,
    tags: ['sliders', 'adjust', 'tuning', 'controls'],
  },
  {
    id: 'icon-grid',
    name: 'Grid',
    category: 'Navigation',
    subcategory: 'icon-nav-menu',
    content: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    is_premium: false,
    tags: ['grid', 'layout', 'apps', 'dashboard', 'tiles'],
  },
  {
    id: 'icon-bell',
    name: 'Bell / Notification',
    category: 'Navigation',
    subcategory: 'icon-nav-actions',
    content: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    is_premium: false,
    tags: ['bell', 'notification', 'alert', 'alarm'],
  },
  {
    id: 'icon-check',
    name: 'Checkmark',
    category: 'Navigation',
    subcategory: 'icon-nav-actions',
    content: '<polyline points="20 6 9 17 4 12"/>',
    is_premium: false,
    tags: ['check', 'done', 'tick', 'success', 'confirm'],
  },
  {
    id: 'icon-x',
    name: 'Close / Cancel',
    category: 'Navigation',
    subcategory: 'icon-nav-actions',
    content: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    is_premium: false,
    tags: ['close', 'x', 'cancel', 'remove', 'delete'],
  },
  {
    id: 'icon-arrow-right',
    name: 'Arrow Right',
    category: 'Navigation',
    subcategory: 'icon-nav-arrows',
    content: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    is_premium: false,
    tags: ['arrow', 'right', 'next', 'forward', 'navigation'],
  },
  {
    id: 'icon-external-link',
    name: 'External Link',
    category: 'Navigation',
    subcategory: 'icon-nav-arrows',
    content: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    is_premium: false,
    tags: ['external', 'link', 'open', 'share', 'tab'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY 2: Media & Audio
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'icon-play',
    name: 'Play',
    category: 'Media & Audio',
    subcategory: 'icon-media-playback',
    content: '<polygon points="5 3 19 12 5 21 5 3"/>',
    is_premium: false,
    tags: ['play', 'video', 'music', 'start'],
  },
  {
    id: 'icon-pause',
    name: 'Pause',
    category: 'Media & Audio',
    subcategory: 'icon-media-playback',
    content: '<line x1="6" y1="4" x2="6" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/>',
    is_premium: false,
    tags: ['pause', 'stop', 'hold'],
  },
  {
    id: 'icon-camera',
    name: 'Camera',
    category: 'Media & Audio',
    subcategory: 'icon-media-capture',
    content: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    is_premium: false,
    tags: ['camera', 'photo', 'picture', 'snapshot'],
  },
  {
    id: 'icon-video',
    name: 'Video Camera',
    category: 'Media & Audio',
    subcategory: 'icon-media-capture',
    content: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
    is_premium: false,
    tags: ['video', 'record', 'movie', 'film'],
  },
  {
    id: 'icon-music',
    name: 'Music Note',
    category: 'Media & Audio',
    subcategory: 'icon-media-playback',
    content: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    is_premium: false,
    tags: ['music', 'song', 'audio', 'sound'],
  },
  {
    id: 'icon-headphones',
    name: 'Headphones',
    category: 'Media & Audio',
    subcategory: 'icon-media-playback',
    content: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
    is_premium: false,
    tags: ['headphones', 'listen', 'audio', 'earphones'],
  },
  {
    id: 'icon-mic',
    name: 'Microphone',
    category: 'Media & Audio',
    subcategory: 'icon-media-capture',
    content: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
    is_premium: false,
    tags: ['microphone', 'voice', 'audio', 'podcast', 'record'],
  },
  {
    id: 'icon-image',
    name: 'Image / Picture',
    category: 'Media & Audio',
    subcategory: 'icon-media-capture',
    content: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    is_premium: false,
    tags: ['image', 'photo', 'picture', 'gallery'],
  },
  {
    id: 'icon-volume-high',
    name: 'Volume High',
    category: 'Media & Audio',
    subcategory: 'icon-media-playback',
    content: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
    is_premium: false,
    tags: ['volume', 'speaker', 'sound', 'audio', 'loud'],
  },
  {
    id: 'icon-film',
    name: 'Film Strip',
    category: 'Media & Audio',
    subcategory: 'icon-media-capture',
    content: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>',
    is_premium: false,
    tags: ['film', 'cinema', 'video', 'movie'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY 3: Commerce & Finance
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'icon-shopping-cart',
    name: 'Shopping Cart',
    category: 'Commerce',
    subcategory: 'icon-comm-shopping',
    content: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    is_premium: false,
    tags: ['cart', 'ecommerce', 'shop', 'checkout', 'buy'],
  },
  {
    id: 'icon-shopping-bag',
    name: 'Shopping Bag',
    category: 'Commerce',
    subcategory: 'icon-comm-shopping',
    content: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    is_premium: false,
    tags: ['bag', 'shopping', 'store', 'retail', 'buy'],
  },
  {
    id: 'icon-credit-card',
    name: 'Credit Card',
    category: 'Commerce',
    subcategory: 'icon-comm-payment',
    content: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    is_premium: false,
    tags: ['credit card', 'payment', 'money', 'billing', 'visa'],
  },
  {
    id: 'icon-wallet',
    name: 'Wallet',
    category: 'Commerce',
    subcategory: 'icon-comm-payment',
    content: '<path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 3H4a2 2 0 0 0-2 2v2h18V5a2 2 0 0 0-2-2z"/><circle cx="16" cy="14" r="1"/>',
    is_premium: false,
    tags: ['wallet', 'money', 'finance', 'cash', 'crypto'],
  },
  {
    id: 'icon-dollar-sign',
    name: 'Dollar Sign',
    category: 'Commerce',
    subcategory: 'icon-comm-payment',
    content: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    is_premium: false,
    tags: ['dollar', 'currency', 'money', 'price', 'usd'],
  },
  {
    id: 'icon-tag',
    name: 'Price Tag',
    category: 'Commerce',
    subcategory: 'icon-comm-shopping',
    content: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    is_premium: false,
    tags: ['tag', 'price', 'discount', 'label', 'offer'],
  },
  {
    id: 'icon-percent',
    name: 'Percent / Discount',
    category: 'Commerce',
    subcategory: 'icon-comm-shopping',
    content: '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    is_premium: false,
    tags: ['percent', 'discount', 'sale', 'offer', 'deal'],
  },
  {
    id: 'icon-receipt',
    name: 'Receipt',
    category: 'Commerce',
    subcategory: 'icon-comm-payment',
    content: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>',
    is_premium: false,
    tags: ['receipt', 'invoice', 'bill', 'order', 'payment'],
  },
  {
    id: 'icon-trending-up',
    name: 'Trending Up Chart',
    category: 'Commerce',
    subcategory: 'icon-comm-analytics',
    content: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    is_premium: false,
    tags: ['chart', 'growth', 'trending', 'stats', 'analytics'],
  },
  {
    id: 'icon-pie-chart',
    name: 'Pie Chart',
    category: 'Commerce',
    subcategory: 'icon-comm-analytics',
    content: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    is_premium: false,
    tags: ['pie chart', 'analytics', 'statistics', 'diagram', 'data'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY 4: Communication & Social
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'icon-message-circle',
    name: 'Message Circle',
    category: 'Communication',
    subcategory: 'icon-comm-messages',
    content: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    is_premium: false,
    tags: ['chat', 'message', 'bubble', 'talk', 'conversation'],
  },
  {
    id: 'icon-message-square',
    name: 'Message Square',
    category: 'Communication',
    subcategory: 'icon-comm-messages',
    content: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    is_premium: false,
    tags: ['chat', 'comment', 'square', 'forum', 'discussion'],
  },
  {
    id: 'icon-mail',
    name: 'Mail Envelope',
    category: 'Communication',
    subcategory: 'icon-comm-messages',
    content: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    is_premium: false,
    tags: ['mail', 'email', 'envelope', 'letter', 'inbox'],
  },
  {
    id: 'icon-send',
    name: 'Send Paper Plane',
    category: 'Communication',
    subcategory: 'icon-comm-messages',
    content: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    is_premium: false,
    tags: ['send', 'paper plane', 'message', 'submit', 'deliver'],
  },
  {
    id: 'icon-share-2',
    name: 'Share Nodes',
    category: 'Communication',
    subcategory: 'icon-comm-social',
    content: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    is_premium: false,
    tags: ['share', 'social', 'forward', 'connect'],
  },
  {
    id: 'icon-heart',
    name: 'Heart / Like',
    category: 'Communication',
    subcategory: 'icon-comm-social',
    content: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    is_premium: false,
    tags: ['heart', 'like', 'love', 'favorite', 'social'],
  },
  {
    id: 'icon-star',
    name: 'Star / Rating',
    category: 'Communication',
    subcategory: 'icon-comm-social',
    content: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    is_premium: false,
    tags: ['star', 'favorite', 'rating', 'review', 'award'],
  },
  {
    id: 'icon-bookmark',
    name: 'Bookmark',
    category: 'Communication',
    subcategory: 'icon-comm-social',
    content: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    is_premium: false,
    tags: ['bookmark', 'save', 'ribbon', 'read later'],
  },
  {
    id: 'icon-thumbs-up',
    name: 'Thumbs Up',
    category: 'Communication',
    subcategory: 'icon-comm-social',
    content: '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
    is_premium: false,
    tags: ['thumbs up', 'like', 'approve', 'agree', 'good'],
  },
  {
    id: 'icon-users',
    name: 'Users Group / Team',
    category: 'Communication',
    subcategory: 'icon-comm-people',
    content: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    is_premium: false,
    tags: ['users', 'team', 'community', 'people', 'group'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY 5: Tech & Hardware
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'icon-smartphone',
    name: 'Smartphone',
    category: 'Tech & Hardware',
    subcategory: 'icon-tech-devices',
    content: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    is_premium: false,
    tags: ['smartphone', 'mobile', 'phone', 'device', 'ios'],
  },
  {
    id: 'icon-tablet',
    name: 'Tablet',
    category: 'Tech & Hardware',
    subcategory: 'icon-tech-devices',
    content: '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    is_premium: false,
    tags: ['tablet', 'ipad', 'android tablet', 'screen'],
  },
  {
    id: 'icon-laptop',
    name: 'Laptop',
    category: 'Tech & Hardware',
    subcategory: 'icon-tech-devices',
    content: '<rect x="3" y="4" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/>',
    is_premium: false,
    tags: ['laptop', 'macbook', 'computer', 'notebook', 'pc'],
  },
  {
    id: 'icon-monitor',
    name: 'Monitor / Display',
    category: 'Tech & Hardware',
    subcategory: 'icon-tech-devices',
    content: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    is_premium: false,
    tags: ['monitor', 'screen', 'desktop', 'display', 'imac'],
  },
  {
    id: 'icon-watch',
    name: 'Smartwatch',
    category: 'Tech & Hardware',
    subcategory: 'icon-tech-devices',
    content: '<circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/>',
    is_premium: false,
    tags: ['smartwatch', 'apple watch', 'clock', 'wrist', 'wearable'],
  },
  {
    id: 'icon-cpu',
    name: 'CPU Chip / Processor',
    category: 'Tech & Hardware',
    subcategory: 'icon-tech-dev',
    content: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
    is_premium: false,
    tags: ['cpu', 'chip', 'processor', 'hardware', 'silicon'],
  },
  {
    id: 'icon-database',
    name: 'Database',
    category: 'Tech & Hardware',
    subcategory: 'icon-tech-network',
    content: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    is_premium: false,
    tags: ['database', 'sql', 'storage', 'server', 'data'],
  },
  {
    id: 'icon-cloud',
    name: 'Cloud',
    category: 'Tech & Hardware',
    subcategory: 'icon-tech-network',
    content: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
    is_premium: false,
    tags: ['cloud', 'server', 'hosting', 'network', 'storage'],
  },
  {
    id: 'icon-wifi',
    name: 'Wifi Network',
    category: 'Tech & Hardware',
    subcategory: 'icon-tech-network',
    content: '<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
    is_premium: false,
    tags: ['wifi', 'wireless', 'network', 'internet', 'connection'],
  },
  {
    id: 'icon-code',
    name: 'Code / Developer',
    category: 'Tech & Hardware',
    subcategory: 'icon-tech-dev',
    content: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    is_premium: false,
    tags: ['code', 'developer', 'programming', 'html', 'syntax'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY 6: Security & System
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'icon-shield',
    name: 'Shield',
    category: 'Security',
    subcategory: 'icon-sec-shields',
    content: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    is_premium: false,
    tags: ['shield', 'protection', 'safe', 'security', 'antivirus'],
  },
  {
    id: 'icon-shield-check',
    name: 'Shield Check / Verified',
    category: 'Security',
    subcategory: 'icon-sec-shields',
    content: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    is_premium: false,
    tags: ['shield', 'verified', 'secure', 'protection', 'check'],
  },
  {
    id: 'icon-lock',
    name: 'Lock Closed',
    category: 'Security',
    subcategory: 'icon-sec-locks',
    content: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    is_premium: false,
    tags: ['lock', 'security', 'password', 'protected', 'closed'],
  },
  {
    id: 'icon-unlock',
    name: 'Lock Open',
    category: 'Security',
    subcategory: 'icon-sec-locks',
    content: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    is_premium: false,
    tags: ['unlock', 'open', 'access', 'security'],
  },
  {
    id: 'icon-key',
    name: 'Key',
    category: 'Security',
    subcategory: 'icon-sec-locks',
    content: '<path d="M21 2l-2 2m-1.5 1.5L16 7l-2-2 1.5-1.5L21 2zm-5 5l-2.5 2.5m-3-3L8 9m-2 2a4 4 0 1 0 4 4c0-1.07-.42-2.05-1.1-2.77L15 6l2 2 1.5-1.5L16 4l-4 4-1.23-1.23A3.99 3.99 0 0 0 6 11z"/>',
    is_premium: false,
    tags: ['key', 'access', 'auth', 'login', 'token'],
  },
  {
    id: 'icon-alert-triangle',
    name: 'Alert Triangle / Warning',
    category: 'Security',
    subcategory: 'icon-sec-alerts',
    content: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    is_premium: false,
    tags: ['warning', 'alert', 'caution', 'danger', 'triangle'],
  },
  {
    id: 'icon-alert-circle',
    name: 'Alert Circle',
    category: 'Security',
    subcategory: 'icon-sec-alerts',
    content: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    is_premium: false,
    tags: ['alert', 'circle', 'notice', 'attention'],
  },
  {
    id: 'icon-help-circle',
    name: 'Help Circle / Question',
    category: 'Security',
    subcategory: 'icon-sec-alerts',
    content: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    is_premium: false,
    tags: ['help', 'question', 'support', 'faq', 'info'],
  },
  {
    id: 'icon-info',
    name: 'Info Circle',
    category: 'Security',
    subcategory: 'icon-sec-alerts',
    content: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    is_premium: false,
    tags: ['info', 'details', 'about', 'information'],
  },
  {
    id: 'icon-flame',
    name: 'Fire / Trending',
    category: 'Security',
    subcategory: 'icon-sec-alerts',
    content: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    is_premium: false,
    tags: ['fire', 'flame', 'hot', 'popular', 'trending'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY 7: Business & Productivity
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'icon-briefcase',
    name: 'Briefcase',
    category: 'Business',
    subcategory: 'icon-biz-office',
    content: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    is_premium: false,
    tags: ['briefcase', 'work', 'job', 'business', 'portfolio'],
  },
  {
    id: 'icon-calendar',
    name: 'Calendar',
    category: 'Business',
    subcategory: 'icon-biz-time',
    content: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    is_premium: false,
    tags: ['calendar', 'date', 'schedule', 'event', 'month'],
  },
  {
    id: 'icon-clock',
    name: 'Clock',
    category: 'Business',
    subcategory: 'icon-biz-time',
    content: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    is_premium: false,
    tags: ['clock', 'time', 'hour', 'timer', 'watch'],
  },
  {
    id: 'icon-folder',
    name: 'Folder',
    category: 'Business',
    subcategory: 'icon-biz-files',
    content: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    is_premium: false,
    tags: ['folder', 'directory', 'archive', 'files'],
  },
  {
    id: 'icon-folder-plus',
    name: 'Folder Plus / Add',
    category: 'Business',
    subcategory: 'icon-biz-files',
    content: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>',
    is_premium: false,
    tags: ['folder', 'new folder', 'add', 'create directory'],
  },
  {
    id: 'icon-file-text',
    name: 'File Text / Document',
    category: 'Business',
    subcategory: 'icon-biz-files',
    content: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    is_premium: false,
    tags: ['document', 'file', 'text', 'doc', 'contract'],
  },
  {
    id: 'icon-clipboard',
    name: 'Clipboard / Task',
    category: 'Business',
    subcategory: 'icon-biz-files',
    content: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
    is_premium: false,
    tags: ['clipboard', 'copy', 'paste', 'tasks', 'checklist'],
  },
  {
    id: 'icon-award',
    name: 'Award Ribbon',
    category: 'Business',
    subcategory: 'icon-biz-office',
    content: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    is_premium: false,
    tags: ['award', 'ribbon', 'medal', 'winner', 'achievement'],
  },
  {
    id: 'icon-target',
    name: 'Target / Goal',
    category: 'Business',
    subcategory: 'icon-biz-office',
    content: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    is_premium: false,
    tags: ['target', 'goal', 'aim', 'focus', 'objective'],
  },
  {
    id: 'icon-compass',
    name: 'Compass',
    category: 'Business',
    subcategory: 'icon-biz-office',
    content: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    is_premium: false,
    tags: ['compass', 'direction', 'travel', 'navigation', 'safari'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY 8: Design & Creative Tools
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'icon-edit-3',
    name: 'Edit / Pen',
    category: 'Design & Tools',
    subcategory: 'icon-design-tools',
    content: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    is_premium: false,
    tags: ['edit', 'pen', 'pencil', 'write', 'modify'],
  },
  {
    id: 'icon-pen-tool',
    name: 'Pen Tool / Vector',
    category: 'Design & Tools',
    subcategory: 'icon-design-tools',
    content: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/>',
    is_premium: false,
    tags: ['pen tool', 'bezier', 'vector', 'path', 'illustrator'],
  },
  {
    id: 'icon-palette',
    name: 'Color Palette',
    category: 'Design & Tools',
    subcategory: 'icon-design-tools',
    content: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    is_premium: false,
    tags: ['palette', 'color', 'art', 'paint', 'swatch'],
  },
  {
    id: 'icon-wand',
    name: 'Magic Wand',
    category: 'Design & Tools',
    subcategory: 'icon-design-editing',
    content: '<path d="M15 4V2m0 16v-2M8 9h2m10 0h2m-4.2 2.8l1.4 1.4M9.8 4.8L8.4 3.4m11.4 11.4l-1.4 1.4M4.8 9.8L3.4 8.4m11.1 5.1L3 21"/>',
    is_premium: false,
    tags: ['magic wand', 'auto', 'enhance', 'effects', 'wizard'],
  },
  {
    id: 'icon-scissors',
    name: 'Scissors / Cut',
    category: 'Design & Tools',
    subcategory: 'icon-design-editing',
    content: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
    is_premium: false,
    tags: ['scissors', 'cut', 'snip', 'trim', 'tool'],
  },
  {
    id: 'icon-crop',
    name: 'Crop Tool',
    category: 'Design & Tools',
    subcategory: 'icon-design-editing',
    content: '<path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/>',
    is_premium: false,
    tags: ['crop', 'cut', 'resize', 'frame', 'aspect ratio'],
  },
  {
    id: 'icon-sparkles',
    name: 'AI Sparkles',
    category: 'Design & Tools',
    subcategory: 'icon-design-editing',
    content: '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" fill="none"/><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    is_premium: true,
    tags: ['sparkles', 'ai', 'magic', 'generative', 'smart', 'clean'],
  },
  {
    id: 'icon-layers',
    name: 'Layers',
    category: 'Design & Tools',
    subcategory: 'icon-design-display',
    content: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    is_premium: false,
    tags: ['layers', 'stack', 'ordering', 'elements', 'arrange'],
  },
  {
    id: 'icon-sun',
    name: 'Sun / Light Mode',
    category: 'Design & Tools',
    subcategory: 'icon-design-display',
    content: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    is_premium: false,
    tags: ['sun', 'light', 'brightness', 'day', 'theme'],
  },
  {
    id: 'icon-moon',
    name: 'Moon / Dark Mode',
    category: 'Design & Tools',
    subcategory: 'icon-design-display',
    content: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    is_premium: false,
    tags: ['moon', 'dark mode', 'night', 'theme', 'sleep'],
  },
];

// ─── 4. SEED EXECUTION ───────────────────────────────────────────────────────
async function seedVectorIcons() {
  console.log('🌱 [Vector Icons] Starting modern vector icons seeding...');

  // 1. Ensure Categories for Icons
  console.log(`📦 Ensuring ${ICON_CATEGORIES.length} icon categories...`);
  for (const cat of ICON_CATEGORIES) {
    const existing = await db('asset_categories').where({ id: cat.id }).first();
    if (!existing) {
      await db('asset_categories').insert({
        ...cat,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
      console.log(`   ➕ Inserted icon category: ${cat.name} (${cat.id})`);
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

  // 2. Ensure Subcategories for Icons
  console.log(`📂 Ensuring ${ICON_SUBCATEGORIES.length} icon subcategories...`);
  for (const sub of ICON_SUBCATEGORIES) {
    const existing = await db('asset_subcategories').where({ id: sub.id }).first();
    if (!existing) {
      await db('asset_subcategories').insert({
        ...sub,
        is_active: true,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
      console.log(`   ➕ Inserted icon subcategory: ${sub.name} (${sub.id})`);
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

  // 3. Upsert Icons into assets table
  console.log(`✨ Upserting ${ICON_ASSETS.length} vector icons into assets table...`);
  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of ICON_ASSETS) {
    const fileUrl = makeIconSvg(item.content);
    const existing = await db('assets').where({ id: item.id }).first();

    const assetPayload = {
      id: item.id,
      name: item.name,
      type: 'icon',
      category: item.category,
      subcategory: item.subcategory,
      file_url: fileUrl,
      file_path: null,
      file_size: fileUrl.length,
      mime_type: 'image/svg+xml',
      width: 72,
      height: 72,
      is_builtin: true,
      is_premium: Boolean(item.is_premium),
      use_count: existing ? existing.use_count : 0,
      metadata: JSON.stringify({
        tags: item.tags,
        format: 'svg',
        render_mode: 'vector',
        viewBox: '0 0 24 24',
        strokeWidth: 2,
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

  console.log(`✅ [Vector Icons] Seeding completed successfully!`);
  console.log(`   - Icons Inserted: ${insertedCount}`);
  console.log(`   - Icons Updated:  ${updatedCount}`);
  console.log(`   - Total in DB:    ${insertedCount + updatedCount}`);

  return { insertedCount, updatedCount };
}

// Support running both as standalone script and as Knex seed
if (require.main === module) {
  require('dotenv').config();
  seedVectorIcons()
    .then(() => {
      console.log('🎉 Vector Icons Seeder completed without error.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeder encountered an error:', err);
      process.exit(1);
    });
}

exports.seed = seedVectorIcons;
