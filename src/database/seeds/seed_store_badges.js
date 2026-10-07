// backend/src/database/seeds/seed_store_badges.js
// Ultra-High-Quality Official Store Badges Seeder
// Seeds all major app stores, gaming stores, alternative ecosystems, extensions, and awards.
"use strict";

const db = require("../knex");
const logger = require("../../config/logger.config");
const memoryCache = require("../../utils/memoryCache");

// Helper to construct crisp, responsive SVG data-URIs
function makeBadgeSvg({
  width = 240,
  height = 70,
  rx = 13,
  bg = "#000000",
  border = "rgba(255,255,255,0.18)",
  borderWidth = 1,
  gradient = null,
  iconSvg = "",
  topText = "",
  topColor = "rgba(255,255,255,0.82)",
  topSize = 10,
  topWeight = 500,
  topLetterSpacing = "0.8px",
  bottomText = "",
  bottomColor = "#ffffff",
  bottomSize = 19,
  bottomWeight = 700,
  bottomLetterSpacing = "-0.2px",
  accentSvg = "",
  customDefs = "",
}) {
  const defs = `
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        ${gradient ? gradient : '<stop offset="0%" stop-color="#141416"/><stop offset="100%" stop-color="#0a0a0c"/>'}
      </linearGradient>
      ${customDefs}
    </defs>
  `;

  const bgFill = gradient ? "url(#bgGrad)" : bg;
  const borderStroke =
    borderWidth > 0 ? `stroke="${border}" stroke-width="${borderWidth}"` : "";

  const rawSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${defs}
  <rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${width - borderWidth}" height="${height - borderWidth}" rx="${rx}" ry="${rx}" fill="${bgFill}" ${borderStroke}/>
  ${iconSvg}
  <g id="badge-text" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
    ${topText ? `<text x="70" y="30" font-size="${topSize}" font-weight="${topWeight}" fill="${topColor}" letter-spacing="${topLetterSpacing}">${topText}</text>` : ""}
    ${bottomText ? `<text x="70" y="${topText ? 52 : 42}" font-size="${bottomSize}" font-weight="${bottomWeight}" fill="${bottomColor}" letter-spacing="${bottomLetterSpacing}">${bottomText}</text>` : ""}
  </g>
  ${accentSvg}
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
}

// ─── ICON VECTOR PATHS & MARKS ───────────────────────────────────────────────

// Apple Mark (official proportions)
const APPLE_ICON_WHITE = `
  <g transform="translate(18, 14) scale(1.6)" fill="#FFFFFF">
    <path d="M15.22 18.06c-.66.97-1.37 1.94-2.45 1.96-1.07.02-1.42-.64-2.65-.64-1.23 0-1.62.62-2.65.66-1.06.04-1.87-1.07-2.54-2.04-1.38-1.99-2.43-5.63-1.01-8.11 1.05-1.83 2.92-2.98 4.96-3.01 1.03-.02 2 .7 2.63.7.63 0 1.8-.87 3.03-.74 1.28.14 2.25.68 2.87 1.59-2.51 1.51-2.1 4.8.41 5.83-.82 1.45-1.9 2.89-2.6 3.8m-2.43-12.78c.55-.67.92-1.6.82-2.54-.79.03-1.75.53-2.31 1.19-.49.57-.92 1.5-.8 2.41.88.07 1.74-.4 2.29-1.06z"/>
  </g>
`;

const APPLE_ICON_BLACK = `
  <g transform="translate(18, 14) scale(1.6)" fill="#000000">
    <path d="M15.22 18.06c-.66.97-1.37 1.94-2.45 1.96-1.07.02-1.42-.64-2.65-.64-1.23 0-1.62.62-2.65.66-1.06.04-1.87-1.07-2.54-2.04-1.38-1.99-2.43-5.63-1.01-8.11 1.05-1.83 2.92-2.98 4.96-3.01 1.03-.02 2 .7 2.63.7.63 0 1.8-.87 3.03-.74 1.28.14 2.25.68 2.87 1.59-2.51 1.51-2.1 4.8.41 5.83-.82 1.45-1.9 2.89-2.6 3.8m-2.43-12.78c.55-.67.92-1.6.82-2.54-.79.03-1.75.53-2.31 1.19-.49.57-.92 1.5-.8 2.41.88.07 1.74-.4 2.29-1.06z"/>
  </g>
`;

const APPLE_ICON_GOLD = `
  <g transform="translate(18, 14) scale(1.6)" fill="#F5C842">
    <path d="M15.22 18.06c-.66.97-1.37 1.94-2.45 1.96-1.07.02-1.42-.64-2.65-.64-1.23 0-1.62.62-2.65.66-1.06.04-1.87-1.07-2.54-2.04-1.38-1.99-2.43-5.63-1.01-8.11 1.05-1.83 2.92-2.98 4.96-3.01 1.03-.02 2 .7 2.63.7.63 0 1.8-.87 3.03-.74 1.28.14 2.25.68 2.87 1.59-2.51 1.51-2.1 4.8.41 5.83-.82 1.45-1.9 2.89-2.6 3.8m-2.43-12.78c.55-.67.92-1.6.82-2.54-.79.03-1.75.53-2.31 1.19-.49.57-.92 1.5-.8 2.41.88.07 1.74-.4 2.29-1.06z"/>
  </g>
`;

// Google Play 4-Color Vibrant Triangle
const GOOGLE_PLAY_COLOR_ICON = `
  <g transform="translate(18, 16) scale(1.4)">
    <defs>
      <linearGradient id="gp_blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00A0FF"/>
        <stop offset="100%" stop-color="#0082FF"/>
      </linearGradient>
      <linearGradient id="gp_green" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00E676"/>
        <stop offset="100%" stop-color="#00C853"/>
      </linearGradient>
      <linearGradient id="gp_yellow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFD600"/>
        <stop offset="100%" stop-color="#FFAB00"/>
      </linearGradient>
      <linearGradient id="gp_red" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF3D00"/>
        <stop offset="100%" stop-color="#D50000"/>
      </linearGradient>
    </defs>
    <!-- Left Blue segment -->
    <path d="M1.2 2.1C.7 2.6.4 3.4.4 4.5v19c0 1.1.3 1.9.8 2.4l.1.1 10.7-10.7v-.2L1.2 2.1z" fill="url(#gp_blue)"/>
    <!-- Top Green segment -->
    <path d="M15.5 18.7l-3.5-3.5V15l3.5-3.5.1.1 4.2 2.4c1.2.7 1.2 1.8 0 2.5l-4.3 2.2z" fill="url(#gp_yellow)"/>
    <!-- Bottom Red segment -->
    <path d="M15.6 18.6L12 15 1.3 25.7c.4.4 1.1.5 1.9.1l12.4-7.2z" fill="url(#gp_red)"/>
    <!-- Right Yellow segment -->
    <path d="M15.6 11.4L3.2 4.2c-.8-.4-1.5-.3-1.9.1L12 15l3.6-3.6z" fill="url(#gp_green)"/>
  </g>
`;

// Steam Official Crank / Valve Logo
const STEAM_ICON = `
  <g transform="translate(18, 16) scale(1.4)" fill="#FFFFFF">
    <path d="M13.5 0C6.05 0 0 6.05 0 13.5c0 6.2 4.19 11.41 9.92 13l3.65-5.28c-.28-.35-.45-.79-.45-1.28 0-1.14.92-2.06 2.06-2.06s2.06.92 2.06 2.06c0 1.14-.92 2.06-2.06 2.06-.21 0-.41-.03-.6-.09l-3.56 5.16C11.66 26.9 12.57 27 13.5 27c7.45 0 13.5-6.05 13.5-13.5S20.95 0 13.5 0zm6.91 9.49c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 1.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5z"/>
  </g>
`;

// Epic Games Crest Logo
const EPIC_GAMES_ICON = `
  <g transform="translate(18, 14) scale(1.4)" fill="#FFFFFF">
    <path d="M0 4.2C0 1.88 1.88 0 4.2 0h17.6C24.12 0 26 1.88 26 4.2v17.6c0 2.32-1.88 4.2-4.2 4.2H4.2C1.88 26 0 24.12 0 21.8V4.2z" fill="#121212"/>
    <path d="M13 2.5L22.5 6v14.5L13 24l-9.5-3.5V6L13 2.5z" stroke="#FFFFFF" stroke-width="1.6" fill="#000000"/>
    <path d="M10 8h6v2.2h-3.6v2.4h3.2v2.1h-3.2v2.6h3.6V19h-6V8z" fill="#FFFFFF"/>
  </g>
`;

// Microsoft Store 4-Square Colored Logo
const MICROSOFT_STORE_ICON = `
  <g transform="translate(18, 18) scale(1.35)">
    <rect x="0" y="0" width="11" height="11" fill="#F25022"/>
    <rect x="13" y="0" width="11" height="11" fill="#7FBA00"/>
    <rect x="0" y="13" width="11" height="11" fill="#00A4EF"/>
    <rect x="13" y="13" width="11" height="11" fill="#FFB900"/>
  </g>
`;

// Amazon Appstore Smiling A Logo
const AMAZON_ICON = `
  <g transform="translate(16, 17) scale(1.35)">
    <path d="M12.8 2.2C6.9 2.2 2 7 2 13c0 3.8 2 7.2 5.1 9.1-.3-.9-.5-1.9-.5-2.9 0-3.6 2.3-6.6 5.6-7.8-.3-.6-.5-1.3-.5-2.1 0-2.8 2.2-5 5-5 .7 0 1.4.1 2 .4-1.8-1.5-4.1-2.5-6.9-2.5z" fill="#FF9900"/>
    <path d="M3.2 21.8c4.6 3.4 10.6 3.6 15.6.8.5-.3.2-.8-.3-.6-4.6 2.2-10.2 2-14.7-.8-.4-.3-.8.3-.6.6z" fill="#FF9900"/>
    <path d="M19.7 20.9c-.3-.4-1.8-.2-2.5 0-.2.1-.2.3 0 .4.9.4 1.9.4 2.5 0 .2-.1.1-.3 0-.4z" fill="#FF9900"/>
  </g>
`;

// Samsung Galaxy Store Icon
const SAMSUNG_GALAXY_ICON = `
  <g transform="translate(16, 15) scale(1.4)">
    <rect width="26" height="26" rx="6" fill="#0381FE"/>
    <path d="M8 9h10v12H8z" fill="none"/>
    <path d="M13 6a3 3 0 00-3 3v1h6V9a3 3 0 00-3-3zm4 4V9a4 4 0 00-8 0v1H7a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-2zm-4 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill="#FFFFFF"/>
  </g>
`;

// Huawei AppGallery Red Icon
const HUAWEI_ICON = `
  <g transform="translate(16, 15) scale(1.4)">
    <rect width="26" height="26" rx="6" fill="#C7000B"/>
    <path d="M13 5c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 2c3.3 0 6 2.7 6 6 0 1.2-.4 2.4-1 3.4l-2.6-2.6c.3-.5.5-1.1.5-1.8 0-1.7-1.3-3-3-3s-3 1.3-3 3c0 .7.2 1.3.5 1.8L7.8 16.4C7.2 15.4 6.8 14.2 6.8 13c0-3.3 2.7-6 6-6z" fill="#FFFFFF"/>
  </g>
`;

// Chrome Web Store Icon
const CHROME_STORE_ICON = `
  <g transform="translate(16, 15) scale(1.4)">
    <circle cx="13" cy="13" r="12" fill="#FFFFFF"/>
    <!-- Chrome Red Top -->
    <path d="M13 1a12 12 0 00-10.4 6l5.2 9L13 7.8h9.4A12 12 0 0013 1z" fill="#EA4335"/>
    <!-- Chrome Green Right -->
    <path d="M25 13a12 12 0 00-1.6-6H13l4.6 8-4.7 8.2A12 12 0 0025 13z" fill="#34A853"/>
    <!-- Chrome Yellow Bottom Left -->
    <path d="M13 25a12 12 0 0010.4-6L18.2 10 13 18.2l-5.2-9A12 12 0 0013 25z" fill="#FBBC05"/>
    <!-- Blue Center Circle -->
    <circle cx="13" cy="13" r="5.2" fill="#4285F4"/>
    <circle cx="13" cy="13" r="4.2" fill="#FFFFFF"/>
    <circle cx="13" cy="13" r="3.2" fill="#1A73E8"/>
  </g>
`;

// Firefox Add-ons Icon
const FIREFOX_ICON = `
  <g transform="translate(16, 15) scale(1.4)">
    <circle cx="13" cy="13" r="12" fill="#FF7139"/>
    <path d="M13 3c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S18.5 3 13 3zm5.6 14.8c-.8 1.4-2.2 2.5-3.8 2.8-.7.1-1.4.1-2.1-.1-2.2-.6-3.8-2.4-4.2-4.6-.2-1.3.1-2.6.8-3.7.4-.6.9-1.2 1.5-1.6.3-.2.6.2.4.5-.5.9-.6 1.9-.3 2.9.4 1.5 1.6 2.7 3.2 3 .8.2 1.6.1 2.3-.2.8-.4 1.4-1.1 1.7-1.9.2-.5.8-.3.7.2-.1.9-.4 1.9-.9 2.7z" fill="#FFE169"/>
  </g>
`;

// Product Hunt Cat Icon
const PRODUCT_HUNT_ICON = `
  <g transform="translate(16, 15) scale(1.4)">
    <circle cx="13" cy="13" r="12" fill="#DA552F"/>
    <path d="M11 7h4a3.5 3.5 0 010 7h-4V7zm0 9.5V19h-2.5V7H15a6 6 0 010 12h-4v-2.5z" fill="#FFFFFF"/>
  </g>
`;

// Discord Clyde Icon
const DISCORD_ICON = `
  <g transform="translate(15, 16) scale(1.4)" fill="#5865F2">
    <path d="M21.5 3.2s-2.1-.9-4.3-1.1c-.3.5-.6 1.2-.8 1.8-2.3-.3-4.6-.3-6.9 0-.2-.6-.5-1.3-.8-1.8-2.2.2-4.3 1.1-4.3 1.1C1.2 8.1.3 13.9.7 19.6c2.4 1.8 4.7 2.9 7 3.1.6-.8 1.1-1.6 1.5-2.5-1-.4-2-.9-2.9-1.6.2-.2.5-.4.7-.6 4.3 2 8.9 2 13.2 0 .2.2.5.4.7.6-.9.7-1.9 1.2-2.9 1.6.4.9 1 1.7 1.5 2.5 2.3-.2 4.6-1.3 7-3.1.5-6.5-.8-12.2-3.8-16.4zm-12.8 13c-1.3 0-2.4-1.2-2.4-2.7 0-1.5 1.1-2.7 2.4-2.7 1.4 0 2.5 1.2 2.4 2.7 0 1.5-1 2.7-2.4 2.7zm8.6 0c-1.3 0-2.4-1.2-2.4-2.7 0-1.5 1.1-2.7 2.4-2.7 1.4 0 2.5 1.2 2.4 2.7 0 1.5-1 2.7-2.4 2.7z"/>
  </g>
`;

// GitHub Invertocat Icon
const GITHUB_ICON = `
  <g transform="translate(16, 15) scale(1.4)" fill="#FFFFFF">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </g>
`;

// PlayStation Classic Controller / Shapes Icon
const PLAYSTATION_ICON = `
  <g transform="translate(16, 17) scale(1.35)" fill="#003791">
    <rect width="26" height="26" rx="5" fill="#FFFFFF"/>
    <path d="M6 13l7-7v14L6 13zm7 7l7-7-7-7v14z" fill="#003791"/>
  </g>
`;

// Xbox Sphere Icon
const XBOX_ICON = `
  <g transform="translate(16, 15) scale(1.4)">
    <circle cx="13" cy="13" r="12" fill="#107C10"/>
    <path d="M5.4 6.8c1.8-1.5 4.4-2.5 7.6-2.5s5.8 1 7.6 2.5c-.8.8-3.4 3.8-5 5.8 2.2 2.7 5.2 6.8 5.6 7.4-2 1.3-4.5 2-7.2 2s-5.2-.7-7.2-2c.4-.6 3.4-4.7 5.6-7.4-1.6-2-4.2-5-5-5.8z" fill="#FFFFFF"/>
  </g>
`;

// Nintendo eShop Icon
const NINTENDO_ICON = `
  <g transform="translate(16, 15) scale(1.4)">
    <rect width="26" height="26" rx="6" fill="#E60012"/>
    <path d="M7 6h4v14H7zM15 6h4v14h-4z" fill="#FFFFFF"/>
    <circle cx="9" cy="9" r="1.5" fill="#E60012"/>
    <circle cx="17" cy="17" r="1.5" fill="#E60012"/>
  </g>
`;

// itch.io Arcade Icon
const ITCHIO_ICON = `
  <g transform="translate(16, 16) scale(1.35)" fill="#FA5C5C">
    <path d="M2.5 3h21v14l-4 4H5.5l-4-4V3zm4 5a2 2 0 100 4 2 2 0 000-4zm11 0a2 2 0 100 4 2 2 0 000-4zM9 15h8v2H9v-2z"/>
  </g>
`;

// Shopify Green Bag Icon
const SHOPIFY_ICON = `
  <g transform="translate(16, 15) scale(1.4)">
    <path d="M19.7 7.2l-3.2-1c-.2-.1-.5 0-.6.2l-1.3 3.6-2.6-.9c-.1 0-.3 0-.4.1L9 12v.1l6.1 1.7 4.9-5.6c.1-.1.1-.3-.3-.4v-.6z" fill="#95BF47"/>
    <path d="M21 9.5l-8.6 15.2c-.3.5-.9.7-1.4.5l-8.5-4c-.5-.2-.8-.8-.6-1.3L7 5l14 4.5z" fill="#5E8E3E"/>
    <path d="M14.5 13.5c-.8-.2-1.6.3-1.8 1.1l-.8 3.5c-.2.8.3 1.6 1.1 1.8.8.2 1.6-.3 1.8-1.1l.8-3.5c.2-.8-.3-1.6-1.1-1.8z" fill="#FFFFFF"/>
  </g>
`;

// Slack Octothorpe Icon
const SLACK_ICON = `
  <g transform="translate(16, 15) scale(1.4)">
    <path d="M6 14.5a2.5 2.5 0 01-2.5-2.5A2.5 2.5 0 016 9.5h2.5v5H6z" fill="#E01E5A"/>
    <path d="M7.5 14.5a2.5 2.5 0 012.5-2.5 2.5 2.5 0 012.5 2.5V17a2.5 2.5 0 01-2.5 2.5A2.5 2.5 0 017.5 17v-2.5z" fill="#E01E5A"/>
    <path d="M11.5 6a2.5 2.5 0 012.5-2.5A2.5 2.5 0 0116.5 6v2.5h-5V6z" fill="#36C5F0"/>
    <path d="M11.5 7.5a2.5 2.5 0 012.5 2.5 2.5 2.5 0 01-2.5 2.5H9a2.5 2.5 0 01-2.5-2.5A2.5 2.5 0 019 7.5h2.5z" fill="#36C5F0"/>
    <path d="M20 11.5a2.5 2.5 0 012.5 2.5 2.5 2.5 0 01-2.5 2.5h-2.5v-5H20z" fill="#2EB67D"/>
    <path d="M18.5 11.5a2.5 2.5 0 01-2.5 2.5 2.5 2.5 0 01-2.5-2.5V9a2.5 2.5 0 012.5-2.5A2.5 2.5 0 0118.5 9v2.5z" fill="#2EB67D"/>
    <path d="M14.5 20a2.5 2.5 0 01-2.5 2.5A2.5 2.5 0 019.5 20v-2.5h5V20z" fill="#ECB22E"/>
    <path d="M14.5 18.5a2.5 2.5 0 01-2.5-2.5 2.5 2.5 0 012.5-2.5H17a2.5 2.5 0 012.5 2.5 2.5 2.5 0 01-2.5 2.5h-2.5z" fill="#ECB22E"/>
  </g>
`;

// Gold Star Trophy Award Icon
const TROPHY_GOLD_ICON = `
  <g transform="translate(18, 14) scale(1.4)" fill="#FFD700">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v2c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 17.9V20H8v2h8v-2h-3v-2.1c1.83-.43 3.24-1.74 3.61-3.96C19.08 13.63 21 11.55 21 9V7c0-1.1-.9-2-2-2zM5 9V7h2v4.82C5.84 11.4 5 10.3 5 9zm14 0c0 1.3-.84 2.4-2 2.82V7h2v2z"/>
  </g>
`;

// 5-Star Row Graphic for Reviews
const STARS_FIVE_GOLD = `
  <g transform="translate(16, 21) scale(1.3)" fill="#FFB800">
    <path d="M5 0l1.5 3.3L10 3.8 7.5 6.2 8.1 9.8 5 8.1 1.9 9.8 2.5 6.2 0 3.8l3.5-.5z"/>
    <path d="M17 0l1.5 3.3 3.5.5-2.5 2.4.6 3.6-3.1-1.7-3.1 1.7.6-3.6-2.5-2.4 3.5-.5z"/>
    <path d="M29 0l1.5 3.3 3.5.5-2.5 2.4.6 3.6-3.1-1.7-3.1 1.7.6-3.6-2.5-2.4 3.5-.5z"/>
  </g>
`;

// Security Shield Verified Icon
const SHIELD_VERIFIED_ICON = `
  <g transform="translate(18, 14) scale(1.4)">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="#00C853"/>
    <path d="M10 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4L10 15.5z" fill="#FFFFFF"/>
  </g>
`;

// ─── 1. ASSET CATEGORIES TO SEED ─────────────────────────────────────────────
const BADGE_CATEGORIES = [
  {
    id: "badge-appstore",
    name: "App Store",
    label: "App Store",
    asset_type: "badge",
    description:
      "Official Apple App Store download, pre-order, and device-specific badges",
    icon: "Apple",
    color: "#0071E3",
    sort_order: 0,
    is_active: true,
  },
  {
    id: "badge-playstore",
    name: "Google Play",
    label: "Google Play",
    asset_type: "badge",
    description:
      "Official Google Play Store badges, Play Pass, and pre-registration",
    icon: "PlayArrow",
    color: "#00E676",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "badge-gaming",
    name: "Desktop & Gaming",
    label: "Desktop & Gaming",
    asset_type: "badge",
    description:
      "Steam, Epic Games Store, Microsoft Store, PlayStation, Xbox, and Nintendo",
    icon: "SportsEsports",
    color: "#1A9FFF",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "badge-alternative",
    name: "Alternative Stores",
    label: "Alternative Stores",
    asset_type: "badge",
    description:
      "Samsung Galaxy Store, Amazon Appstore, Huawei AppGallery, F-Droid & direct APK",
    icon: "PhoneAndroid",
    color: "#FF9900",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "badge-extensions",
    name: "Browser Extensions",
    label: "Browser Extensions",
    asset_type: "badge",
    description:
      "Chrome Web Store, Firefox Add-ons, Edge Add-ons, Safari, and Shopify App Store",
    icon: "Extension",
    color: "#4285F4",
    sort_order: 4,
    is_active: true,
  },
  {
    id: "badge-community",
    name: "Community & Dev",
    label: "Community & Dev",
    asset_type: "badge",
    description: "Product Hunt, GitHub, Slack, Discord, and Figma Community",
    icon: "Code",
    color: "#DA552F",
    sort_order: 5,
    is_active: true,
  },
  {
    id: "badge-awards",
    name: "Awards & Trust",
    label: "Awards & Trust",
    asset_type: "badge",
    description:
      "App of the Day, Editor's Choice, App of the Year, Star Ratings, and Trust Badges",
    icon: "EmojiEvents",
    color: "#FFB800",
    sort_order: 6,
    is_active: true,
  },
];

// Baseline categories for other tabs (Mockup, Sticker, Illustration, Icon)
const OTHER_CATEGORIES = [
  {
    id: "mockup-phones",
    name: "Phones",
    label: "Phone Mockups",
    asset_type: "mockup",
    description: "iPhone & Android device frames",
    icon: "PhoneIphone",
    color: "#38BDF8",
    sort_order: 0,
    is_active: true,
  },
  {
    id: "mockup-tablets",
    name: "Tablets",
    label: "Tablet Mockups",
    asset_type: "mockup",
    description: "iPad & Android tablet frames",
    icon: "TabletMac",
    color: "#34D399",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "mockup-desktops",
    name: "Desktops",
    label: "Desktop Mockups",
    asset_type: "mockup",
    description: "MacBook, iMac & Windows frames",
    icon: "LaptopMac",
    color: "#A78BFA",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "mockup-wearables",
    name: "Wearables",
    label: "Wearable Mockups",
    asset_type: "mockup",
    description: "Apple Watch & smartwatches",
    icon: "Watch",
    color: "#FB923C",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "sticker-3d",
    name: "3D Objects",
    label: "3D Stickers",
    asset_type: "sticker",
    description: "Clay & glossy 3D objects",
    icon: "ViewInAr",
    color: "#C084FC",
    sort_order: 0,
    is_active: true,
  },
  {
    id: "sticker-emoji",
    name: "Emojis",
    label: "Emoji Stickers",
    asset_type: "sticker",
    description: "Popular expressive emojis",
    icon: "EmojiEmotions",
    color: "#FCD34D",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "sticker-ui",
    name: "UI Kit",
    label: "UI Kit Stickers",
    asset_type: "sticker",
    description: "Badges, labels & pills",
    icon: "Widgets",
    color: "#67E8F9",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "ill-3d-clay",
    name: "3D & Clay",
    label: "3D & Clay Illustrations",
    asset_type: "illustration",
    description: "Rendered artwork",
    icon: "AutoFixHigh",
    color: "#F87171",
    sort_order: 0,
    is_active: true,
  },
  {
    id: "ill-abstract",
    name: "Abstract",
    label: "Abstract & Flow",
    asset_type: "illustration",
    description: "Fluid & gradient backgrounds",
    icon: "Gradient",
    color: "#A78BFA",
    sort_order: 1,
    is_active: true,
  },
];

// ─── 2. ASSET SUBCATEGORIES TO SEED ──────────────────────────────────────────
const BADGE_SUBCATEGORIES = [
  // App Store
  {
    id: "badge-appstore-download",
    category_id: "badge-appstore",
    name: "Download",
    label: "Download on App Store",
    sort_order: 0,
  },
  {
    id: "badge-appstore-device",
    category_id: "badge-appstore",
    name: "Device Specific",
    label: "Mac, Watch & Vision Pro",
    sort_order: 1,
  },
  {
    id: "badge-appstore-preorder",
    category_id: "badge-appstore",
    name: "Pre-order",
    label: "Pre-order on App Store",
    sort_order: 2,
  },
  {
    id: "badge-appstore-awards",
    category_id: "badge-appstore",
    name: "App Store Awards",
    label: "App of the Day & Year",
    sort_order: 3,
  },

  // Google Play
  {
    id: "badge-playstore-download",
    category_id: "badge-playstore",
    name: "Download",
    label: "Get it on Google Play",
    sort_order: 0,
  },
  {
    id: "badge-playstore-pass",
    category_id: "badge-playstore",
    name: "Play Pass",
    label: "Google Play Pass",
    sort_order: 1,
  },
  {
    id: "badge-playstore-preregister",
    category_id: "badge-playstore",
    name: "Pre-register",
    label: "Pre-register on Play",
    sort_order: 2,
  },
  {
    id: "badge-playstore-awards",
    category_id: "badge-playstore",
    name: "Play Awards",
    label: "Editor's Choice & Best of",
    sort_order: 3,
  },
  {
    id: "badge-playstore-trust",
    category_id: "badge-playstore",
    name: "Play Protect",
    label: "Play Protect Verified",
    sort_order: 4,
  },

  // Gaming
  {
    id: "badge-gaming-steam",
    category_id: "badge-gaming",
    name: "Steam",
    label: "Steam Badges",
    sort_order: 0,
  },
  {
    id: "badge-gaming-epic",
    category_id: "badge-gaming",
    name: "Epic Games",
    label: "Epic Games Store",
    sort_order: 1,
  },
  {
    id: "badge-gaming-microsoft",
    category_id: "badge-gaming",
    name: "Microsoft Store",
    label: "Microsoft & Windows",
    sort_order: 2,
  },
  {
    id: "badge-gaming-itchio",
    category_id: "badge-gaming",
    name: "itch.io",
    label: "itch.io Indie Games",
    sort_order: 3,
  },
  {
    id: "badge-gaming-consoles",
    category_id: "badge-gaming",
    name: "Consoles & VR",
    label: "PlayStation, Xbox, Nintendo, Quest",
    sort_order: 4,
  },

  // Alternative
  {
    id: "badge-alt-samsung",
    category_id: "badge-alternative",
    name: "Samsung Galaxy",
    label: "Galaxy Store Badges",
    sort_order: 0,
  },
  {
    id: "badge-alt-amazon",
    category_id: "badge-alternative",
    name: "Amazon Appstore",
    label: "Amazon Appstore Badges",
    sort_order: 1,
  },
  {
    id: "badge-alt-huawei",
    category_id: "badge-alternative",
    name: "Huawei AppGallery",
    label: "AppGallery Badges",
    sort_order: 2,
  },
  {
    id: "badge-alt-fdroid",
    category_id: "badge-alternative",
    name: "F-Droid",
    label: "F-Droid Open Source",
    sort_order: 3,
  },
  {
    id: "badge-alt-apk",
    category_id: "badge-alternative",
    name: "Direct APK",
    label: "Direct APK Download",
    sort_order: 4,
  },

  // Extensions
  {
    id: "badge-ext-chrome",
    category_id: "badge-extensions",
    name: "Chrome Web Store",
    label: "Chrome Web Store",
    sort_order: 0,
  },
  {
    id: "badge-ext-firefox",
    category_id: "badge-extensions",
    name: "Firefox Add-ons",
    label: "Firefox Add-ons",
    sort_order: 1,
  },
  {
    id: "badge-ext-safari",
    category_id: "badge-extensions",
    name: "Safari & Edge",
    label: "Safari & Edge Add-ons",
    sort_order: 2,
  },
  {
    id: "badge-ext-shopify",
    category_id: "badge-extensions",
    name: "Shopify App Store",
    label: "Shopify App Store",
    sort_order: 3,
  },

  // Community
  {
    id: "badge-comm-producthunt",
    category_id: "badge-community",
    name: "Product Hunt",
    label: "Product Hunt Badges",
    sort_order: 0,
  },
  {
    id: "badge-comm-github",
    category_id: "badge-community",
    name: "GitHub",
    label: "GitHub Star & Releases",
    sort_order: 1,
  },
  {
    id: "badge-comm-workplace",
    category_id: "badge-community",
    name: "Slack & Discord",
    label: "Slack & Discord",
    sort_order: 2,
  },

  // Awards & Trust
  {
    id: "badge-award-ratings",
    category_id: "badge-awards",
    name: "Ratings & Reviews",
    label: "5-Star App Ratings",
    sort_order: 0,
  },
  {
    id: "badge-award-socialproof",
    category_id: "badge-awards",
    name: "Social Proof",
    label: "Downloads & User Counts",
    sort_order: 1,
  },
  {
    id: "badge-award-trust",
    category_id: "badge-awards",
    name: "Trust & Security",
    label: "Malware-Free & SSL Seals",
    sort_order: 2,
  },
];

// Baseline subcategories for mockups/stickers
const OTHER_SUBCATEGORIES = [
  {
    id: "phone-notch",
    category_id: "mockup-phones",
    name: "Notch",
    label: "Phone – Notch",
    sort_order: 0,
  },
  {
    id: "phone-dynamic-island",
    category_id: "mockup-phones",
    name: "Dynamic Island",
    label: "Phone – Dynamic Island",
    sort_order: 1,
  },
  {
    id: "phone-bezel-less",
    category_id: "mockup-phones",
    name: "Bezel-less",
    label: "Phone – Bezel-less",
    sort_order: 2,
  },
  {
    id: "tablet-ipad-pro",
    category_id: "mockup-tablets",
    name: "iPad Pro",
    label: "iPad Pro",
    sort_order: 0,
  },
  {
    id: "desktop-macbook-pro",
    category_id: "mockup-desktops",
    name: "MacBook Pro",
    label: "MacBook Pro",
    sort_order: 0,
  },
  {
    id: "watch-apple-ultra",
    category_id: "mockup-wearables",
    name: "Apple Ultra",
    label: "Apple Watch Ultra",
    sort_order: 0,
  },
  {
    id: "sticker-3d-obj",
    category_id: "sticker-3d",
    name: "3D Objects",
    label: "3D Objects",
    sort_order: 0,
  },
  {
    id: "sticker-emoji-pack",
    category_id: "sticker-emoji",
    name: "Emojis",
    label: "Emojis",
    sort_order: 0,
  },
  {
    id: "sticker-ui-pack",
    category_id: "sticker-ui",
    name: "UI Kit",
    label: "UI Kit",
    sort_order: 0,
  },
];

// ─── 3. ALL STORE BADGES DATA ────────────────────────────────────────────────
const BADGE_ASSETS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. APPLE APP STORE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "badge-apple-download-black",
    name: "Download on the App Store (Official Black)",
    category: "App Store",
    subcategory: "badge-appstore-download",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.25)",
      iconSvg: APPLE_ICON_WHITE,
      topText: "Download on the",
      bottomText: "App Store",
    }),
    is_premium: false,
    tags: ["apple", "app store", "ios", "download", "official", "black"],
  },
  {
    id: "badge-apple-download-white",
    name: "Download on the App Store (White / Outline)",
    category: "App Store",
    subcategory: "badge-appstore-download",
    file_url: makeBadgeSvg({
      bg: "#FFFFFF",
      border: "#000000",
      borderWidth: 1.5,
      iconSvg: APPLE_ICON_BLACK,
      topText: "Download on the",
      topColor: "rgba(0,0,0,0.7)",
      bottomText: "App Store",
      bottomColor: "#000000",
    }),
    is_premium: false,
    tags: ["apple", "app store", "ios", "download", "official", "white"],
  },
  {
    id: "badge-apple-download-glass",
    name: "Download on the App Store (Dark Glass)",
    category: "App Store",
    subcategory: "badge-appstore-download",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#2c2d35"/><stop offset="100%" stop-color="#15161b"/>',
      border: "rgba(255,255,255,0.3)",
      iconSvg: APPLE_ICON_WHITE,
      topText: "Download on the",
      bottomText: "App Store",
    }),
    is_premium: true,
    tags: ["apple", "app store", "ios", "glassmorphism", "premium", "dark"],
  },
  {
    id: "badge-apple-mac-appstore",
    name: "Available on the Mac App Store",
    category: "App Store",
    subcategory: "badge-appstore-device",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.22)",
      iconSvg: APPLE_ICON_WHITE,
      topText: "Available on the",
      bottomText: "Mac App Store",
      bottomSize: 18,
    }),
    is_premium: false,
    tags: ["apple", "mac", "macos", "macbook", "desktop", "app store"],
  },
  {
    id: "badge-apple-watch-badge",
    name: "Available on Apple Watch (watchOS)",
    category: "App Store",
    subcategory: "badge-appstore-device",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.22)",
      iconSvg: APPLE_ICON_WHITE,
      topText: "Available on",
      bottomText: "Apple Watch",
    }),
    is_premium: false,
    tags: ["apple", "watch", "watchos", "wearable", "app store"],
  },
  {
    id: "badge-apple-vision-pro",
    name: "Available on Apple Vision Pro",
    category: "App Store",
    subcategory: "badge-appstore-device",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#1f2937"/><stop offset="100%" stop-color="#111827"/>',
      border: "rgba(56,189,248,0.4)",
      iconSvg: APPLE_ICON_WHITE,
      topText: "Designed for",
      bottomText: "Apple Vision Pro",
      bottomSize: 17,
      bottomColor: "#38BDF8",
    }),
    is_premium: true,
    tags: ["apple", "vision pro", "visionos", "vr", "spatial", "app store"],
  },
  {
    id: "badge-apple-ipad",
    name: "Available on iPad (iPadOS)",
    category: "App Store",
    subcategory: "badge-appstore-device",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.22)",
      iconSvg: APPLE_ICON_WHITE,
      topText: "Designed for",
      bottomText: "iPad & iPadOS",
    }),
    is_premium: false,
    tags: ["apple", "ipad", "ipados", "tablet", "app store"],
  },
  {
    id: "badge-apple-preorder-black",
    name: "Pre-order on the App Store (Black)",
    category: "App Store",
    subcategory: "badge-appstore-preorder",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.22)",
      iconSvg: APPLE_ICON_WHITE,
      topText: "Pre-order on the",
      bottomText: "App Store",
    }),
    is_premium: false,
    tags: ["apple", "app store", "pre-order", "coming soon"],
  },
  {
    id: "badge-apple-design-award",
    name: "Apple Design Award Winner",
    category: "App Store",
    subcategory: "badge-appstore-awards",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#1c1917"/><stop offset="100%" stop-color="#0c0a09"/>',
      border: "#F5C842",
      borderWidth: 1.5,
      iconSvg: APPLE_ICON_GOLD,
      topText: "APPLE DESIGN AWARD",
      topColor: "#F5C842",
      topSize: 9,
      topLetterSpacing: "1.2px",
      bottomText: "Winner",
      bottomColor: "#FFFFFF",
      bottomSize: 21,
    }),
    is_premium: true,
    tags: ["apple", "design award", "winner", "gold", "prestige"],
  },
  {
    id: "badge-apple-app-of-day",
    name: "App of the Day (App Store)",
    category: "App Store",
    subcategory: "badge-appstore-awards",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#0077ED"/><stop offset="100%" stop-color="#0058B6"/>',
      border: "rgba(255,255,255,0.3)",
      iconSvg: APPLE_ICON_WHITE,
      topText: "APP STORE",
      topColor: "rgba(255,255,255,0.85)",
      topSize: 9,
      topLetterSpacing: "1.5px",
      bottomText: "App of the Day",
      bottomSize: 18,
    }),
    is_premium: false,
    tags: ["apple", "app store", "app of the day", "featured"],
  },
  {
    id: "badge-apple-app-of-year",
    name: "App of the Year Winner (App Store)",
    category: "App Store",
    subcategory: "badge-appstore-awards",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#18181B"/><stop offset="100%" stop-color="#09090B"/>',
      border: "#EAB308",
      iconSvg: APPLE_ICON_GOLD,
      topText: "APP STORE AWARD",
      topColor: "#FDE047",
      topSize: 9,
      topLetterSpacing: "1.5px",
      bottomText: "App of the Year",
      bottomColor: "#FFFFFF",
    }),
    is_premium: true,
    tags: ["apple", "app of the year", "award", "winner", "gold"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. GOOGLE PLAY STORE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "badge-google-play-black",
    name: "Get it on Google Play (Official Black)",
    category: "Google Play",
    subcategory: "badge-playstore-download",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.22)",
      iconSvg: GOOGLE_PLAY_COLOR_ICON,
      topText: "GET IT ON",
      topSize: 10,
      topWeight: 600,
      topLetterSpacing: "1px",
      bottomText: "Google Play",
    }),
    is_premium: false,
    tags: ["google play", "android", "download", "official", "black"],
  },
  {
    id: "badge-google-play-white",
    name: "Get it on Google Play (White Edition)",
    category: "Google Play",
    subcategory: "badge-playstore-download",
    file_url: makeBadgeSvg({
      bg: "#FFFFFF",
      border: "#000000",
      borderWidth: 1.5,
      iconSvg: GOOGLE_PLAY_COLOR_ICON,
      topText: "GET IT ON",
      topColor: "rgba(0,0,0,0.65)",
      topSize: 10,
      topWeight: 600,
      topLetterSpacing: "1px",
      bottomText: "Google Play",
      bottomColor: "#000000",
    }),
    is_premium: false,
    tags: ["google play", "android", "download", "official", "white"],
  },
  {
    id: "badge-google-play-dark-glow",
    name: "Get it on Google Play (Modern Dark)",
    category: "Google Play",
    subcategory: "badge-playstore-download",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#1E293B"/><stop offset="100%" stop-color="#0F172A"/>',
      border: "rgba(0,230,118,0.3)",
      iconSvg: GOOGLE_PLAY_COLOR_ICON,
      topText: "GET IT ON",
      topColor: "#34D399",
      topSize: 9.5,
      topWeight: 700,
      topLetterSpacing: "1px",
      bottomText: "Google Play",
    }),
    is_premium: true,
    tags: ["google play", "android", "dark", "gradient", "premium"],
  },
  {
    id: "badge-google-play-pass",
    name: "Included with Google Play Pass",
    category: "Google Play",
    subcategory: "badge-playstore-pass",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.22)",
      iconSvg: GOOGLE_PLAY_COLOR_ICON,
      topText: "INCLUDED WITH",
      topSize: 9,
      topLetterSpacing: "1px",
      bottomText: "Google Play Pass",
      bottomSize: 17,
      bottomColor: "#00E676",
    }),
    is_premium: true,
    tags: ["google play", "play pass", "subscription", "android"],
  },
  {
    id: "badge-google-play-preregister",
    name: "Pre-register on Google Play",
    category: "Google Play",
    subcategory: "badge-playstore-preregister",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.22)",
      iconSvg: GOOGLE_PLAY_COLOR_ICON,
      topText: "PRE-REGISTER ON",
      topSize: 9,
      topLetterSpacing: "1px",
      bottomText: "Google Play",
    }),
    is_premium: false,
    tags: ["google play", "pre-register", "launch", "android"],
  },
  {
    id: "badge-google-play-editors-choice",
    name: "Google Play Editor's Choice",
    category: "Google Play",
    subcategory: "badge-playstore-awards",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#064E3B"/><stop offset="100%" stop-color="#022C22"/>',
      border: "#10B981",
      iconSvg: GOOGLE_PLAY_COLOR_ICON,
      topText: "GOOGLE PLAY",
      topColor: "#34D399",
      topSize: 9,
      topLetterSpacing: "1.2px",
      bottomText: "Editor's Choice",
    }),
    is_premium: false,
    tags: ["google play", "editors choice", "award", "verified"],
  },
  {
    id: "badge-google-play-best-of-year",
    name: "Google Play Best of 2025",
    category: "Google Play",
    subcategory: "badge-playstore-awards",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#1E1B4B"/><stop offset="100%" stop-color="#0F0E2A"/>',
      border: "#818CF8",
      iconSvg: TROPHY_GOLD_ICON,
      topText: "GOOGLE PLAY AWARDS",
      topColor: "#A5B4FC",
      topSize: 9,
      topLetterSpacing: "1.2px",
      bottomText: "Best of 2025",
      bottomColor: "#FBBF24",
    }),
    is_premium: true,
    tags: ["google play", "best of", "winner", "trophy"],
  },
  {
    id: "badge-google-play-top-free",
    name: "#1 Top Free App - Google Play",
    category: "Google Play",
    subcategory: "badge-playstore-awards",
    file_url: makeBadgeSvg({
      bg: "#0F172A",
      border: "rgba(56,189,248,0.4)",
      iconSvg: GOOGLE_PLAY_COLOR_ICON,
      topText: "#1 TOP FREE APP",
      topColor: "#38BDF8",
      topSize: 9.5,
      topWeight: 800,
      topLetterSpacing: "1px",
      bottomText: "Google Play",
    }),
    is_premium: false,
    tags: ["google play", "top free", "chart", "ranking", "number 1"],
  },
  {
    id: "badge-google-play-protect",
    name: "Google Play Protect Certified",
    category: "Google Play",
    subcategory: "badge-playstore-trust",
    file_url: makeBadgeSvg({
      bg: "#0A0E1A",
      border: "#00C853",
      iconSvg: SHIELD_VERIFIED_ICON,
      topText: "VERIFIED & TESTED BY",
      topColor: "rgba(255,255,255,0.7)",
      topSize: 8.5,
      topLetterSpacing: "1px",
      bottomText: "Play Protect",
      bottomColor: "#00E676",
    }),
    is_premium: false,
    tags: ["google play", "play protect", "security", "verified", "safe"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. DESKTOP & GAMING STORES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "badge-steam-available-dark",
    name: "Available on Steam (Official Dark)",
    category: "Desktop & Gaming",
    subcategory: "badge-gaming-steam",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#1B2838"/><stop offset="100%" stop-color="#101822"/>',
      border: "rgba(102,192,244,0.3)",
      iconSvg: STEAM_ICON,
      topText: "AVAILABLE ON",
      topColor: "#66C0F4",
      topSize: 9.5,
      topLetterSpacing: "1px",
      bottomText: "STEAM",
      bottomSize: 22,
      bottomWeight: 800,
    }),
    is_premium: false,
    tags: ["steam", "pc", "gaming", "valve", "available"],
  },
  {
    id: "badge-steam-download-glow",
    name: "Download on Steam (Glow Edition)",
    category: "Desktop & Gaming",
    subcategory: "badge-gaming-steam",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#2A475E"/><stop offset="100%" stop-color="#1B2838"/>',
      border: "#66C0F4",
      iconSvg: STEAM_ICON,
      topText: "DOWNLOAD ON",
      topColor: "rgba(255,255,255,0.85)",
      topSize: 9.5,
      topLetterSpacing: "1px",
      bottomText: "STEAM",
      bottomSize: 22,
      bottomWeight: 800,
    }),
    is_premium: true,
    tags: ["steam", "download", "pc", "gamer", "glow"],
  },
  {
    id: "badge-epic-games-official",
    name: "Available on Epic Games Store",
    category: "Desktop & Gaming",
    subcategory: "badge-gaming-epic",
    file_url: makeBadgeSvg({
      bg: "#121212",
      border: "rgba(255,255,255,0.22)",
      iconSvg: EPIC_GAMES_ICON,
      topText: "AVAILABLE ON THE",
      topSize: 9,
      topLetterSpacing: "1px",
      bottomText: "Epic Games Store",
      bottomSize: 17,
      bottomWeight: 700,
    }),
    is_premium: false,
    tags: ["epic games", "fortnite", "unreal", "pc gaming", "store"],
  },
  {
    id: "badge-microsoft-store-official",
    name: "Get it from Microsoft Store",
    category: "Desktop & Gaming",
    subcategory: "badge-gaming-microsoft",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.22)",
      iconSvg: MICROSOFT_STORE_ICON,
      topText: "Get it from",
      topSize: 10,
      topColor: "rgba(255,255,255,0.8)",
      bottomText: "Microsoft",
      bottomSize: 20,
    }),
    is_premium: false,
    tags: ["microsoft", "windows", "windows 11", "pc", "store"],
  },
  {
    id: "badge-windows-11-store",
    name: "Available for Windows 11 & 10",
    category: "Desktop & Gaming",
    subcategory: "badge-gaming-microsoft",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#0067B8"/><stop offset="100%" stop-color="#004E8C"/>',
      border: "rgba(255,255,255,0.3)",
      iconSvg: MICROSOFT_STORE_ICON,
      topText: "AVAILABLE FOR",
      topColor: "rgba(255,255,255,0.85)",
      topSize: 9,
      topLetterSpacing: "1.2px",
      bottomText: "Windows 11 | 10",
      bottomSize: 17,
    }),
    is_premium: false,
    tags: ["windows", "microsoft", "windows 11", "desktop"],
  },
  {
    id: "badge-itchio-gaming",
    name: "Available on itch.io (Indie Games)",
    category: "Desktop & Gaming",
    subcategory: "badge-gaming-itchio",
    file_url: makeBadgeSvg({
      bg: "#1A1A1A",
      border: "#FA5C5C",
      iconSvg: ITCHIO_ICON,
      topText: "AVAILABLE ON",
      topColor: "#FA5C5C",
      topSize: 9,
      topLetterSpacing: "1px",
      bottomText: "itch.io",
      bottomSize: 22,
      bottomWeight: 800,
    }),
    is_premium: false,
    tags: ["itch.io", "indie", "gaming", "pc", "mac"],
  },
  {
    id: "badge-playstation-store",
    name: "Available on PlayStation Store",
    category: "Desktop & Gaming",
    subcategory: "badge-gaming-consoles",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#003791"/><stop offset="100%" stop-color="#00205B"/>',
      border: "rgba(255,255,255,0.3)",
      iconSvg: PLAYSTATION_ICON,
      topText: "AVAILABLE ON",
      topColor: "rgba(255,255,255,0.85)",
      topSize: 9,
      topLetterSpacing: "1px",
      bottomText: "PlayStation Store",
      bottomSize: 17,
    }),
    is_premium: false,
    tags: ["playstation", "ps5", "ps4", "sony", "gaming"],
  },
  {
    id: "badge-xbox-series",
    name: "Optimized for Xbox Series X|S",
    category: "Desktop & Gaming",
    subcategory: "badge-gaming-consoles",
    file_url: makeBadgeSvg({
      bg: "#107C10",
      border: "rgba(255,255,255,0.3)",
      iconSvg: XBOX_ICON,
      topText: "OPTIMIZED FOR",
      topColor: "rgba(255,255,255,0.85)",
      topSize: 9,
      topLetterSpacing: "1.2px",
      bottomText: "Xbox Series X|S",
      bottomSize: 17,
    }),
    is_premium: false,
    tags: ["xbox", "microsoft", "series x", "gaming", "console"],
  },
  {
    id: "badge-nintendo-eshop",
    name: "Available on Nintendo eShop",
    category: "Desktop & Gaming",
    subcategory: "badge-gaming-consoles",
    file_url: makeBadgeSvg({
      bg: "#E60012",
      border: "rgba(255,255,255,0.3)",
      iconSvg: NINTENDO_ICON,
      topText: "AVAILABLE ON",
      topColor: "rgba(255,255,255,0.85)",
      topSize: 9,
      topLetterSpacing: "1.2px",
      bottomText: "Nintendo eShop",
      bottomSize: 17,
    }),
    is_premium: false,
    tags: ["nintendo", "switch", "eshop", "gaming"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ALTERNATIVE MOBILE & ANDROID STORES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "badge-samsung-galaxy-store",
    name: "Available on Samsung Galaxy Store",
    category: "Alternative Stores",
    subcategory: "badge-alt-samsung",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.22)",
      iconSvg: SAMSUNG_GALAXY_ICON,
      topText: "AVAILABLE ON",
      topSize: 9.5,
      topLetterSpacing: "1px",
      bottomText: "Galaxy Store",
      bottomColor: "#0381FE",
    }),
    is_premium: false,
    tags: ["samsung", "galaxy", "galaxy store", "android"],
  },
  {
    id: "badge-amazon-appstore",
    name: "Available at Amazon Appstore",
    category: "Alternative Stores",
    subcategory: "badge-alt-amazon",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.22)",
      iconSvg: AMAZON_ICON,
      topText: "available at",
      topSize: 10,
      topColor: "rgba(255,255,255,0.8)",
      bottomText: "amazon appstore",
      bottomColor: "#FF9900",
      bottomSize: 18,
    }),
    is_premium: false,
    tags: ["amazon", "appstore", "fire", "android"],
  },
  {
    id: "badge-huawei-appgallery",
    name: "Explore it on Huawei AppGallery",
    category: "Alternative Stores",
    subcategory: "badge-alt-huawei",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.22)",
      iconSvg: HUAWEI_ICON,
      topText: "EXPLORE IT ON",
      topSize: 9,
      topLetterSpacing: "1px",
      bottomText: "AppGallery",
      bottomColor: "#FF2442",
    }),
    is_premium: false,
    tags: ["huawei", "appgallery", "harmonyos", "android"],
  },
  {
    id: "badge-fdroid-download",
    name: "Get it on F-Droid (Open Source)",
    category: "Alternative Stores",
    subcategory: "badge-alt-fdroid",
    file_url: makeBadgeSvg({
      bg: "#1E232A",
      border: "#1976D2",
      iconSvg: `
        <g transform="translate(18, 16) scale(1.4)" fill="#1976D2">
          <rect width="24" height="24" rx="5" fill="#FFFFFF"/>
          <circle cx="8" cy="8" r="2" fill="#1976D2"/>
          <circle cx="16" cy="8" r="2" fill="#1976D2"/>
          <path d="M6 14h12v4H6z" fill="#1976D2"/>
        </g>
      `,
      topText: "GET IT ON",
      topColor: "rgba(255,255,255,0.7)",
      topSize: 9.5,
      topLetterSpacing: "1px",
      bottomText: "F-Droid",
      bottomColor: "#42A5F5",
      bottomSize: 22,
    }),
    is_premium: false,
    tags: ["f-droid", "open source", "foss", "android"],
  },
  {
    id: "badge-apk-direct-download",
    name: "Direct APK Download (Android)",
    category: "Alternative Stores",
    subcategory: "badge-alt-apk",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#166534"/><stop offset="100%" stop-color="#14532D"/>',
      border: "#22C55E",
      iconSvg: `
        <g transform="translate(18, 15) scale(1.4)" fill="#FFFFFF">
          <circle cx="12" cy="12" r="11" fill="#22C55E"/>
          <path d="M12 6v8m-4-4l4 4 4-4m-6 8h8" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
      `,
      topText: "DIRECT INSTALL",
      topColor: "#BBF7D0",
      topSize: 9,
      topLetterSpacing: "1px",
      bottomText: "Download APK",
      bottomColor: "#FFFFFF",
    }),
    is_premium: false,
    tags: ["apk", "android", "direct download", "sideload", "install"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. BROWSER EXTENSIONS & SAAS STORES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "badge-chrome-web-store-black",
    name: "Available in Chrome Web Store (Black)",
    category: "Browser Extensions",
    subcategory: "badge-ext-chrome",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(255,255,255,0.22)",
      iconSvg: CHROME_STORE_ICON,
      topText: "AVAILABLE IN THE",
      topSize: 8.5,
      topLetterSpacing: "1px",
      bottomText: "Chrome Web Store",
      bottomSize: 17,
    }),
    is_premium: false,
    tags: ["chrome", "extension", "google", "browser", "web store"],
  },
  {
    id: "badge-chrome-web-store-white",
    name: "Available in Chrome Web Store (White)",
    category: "Browser Extensions",
    subcategory: "badge-ext-chrome",
    file_url: makeBadgeSvg({
      bg: "#FFFFFF",
      border: "#000000",
      borderWidth: 1.5,
      iconSvg: CHROME_STORE_ICON,
      topText: "AVAILABLE IN THE",
      topColor: "rgba(0,0,0,0.65)",
      topSize: 8.5,
      topLetterSpacing: "1px",
      bottomText: "Chrome Web Store",
      bottomColor: "#000000",
      bottomSize: 17,
    }),
    is_premium: false,
    tags: ["chrome", "extension", "google", "white", "web store"],
  },
  {
    id: "badge-firefox-addons",
    name: "Get the Add-on for Firefox",
    category: "Browser Extensions",
    subcategory: "badge-ext-firefox",
    file_url: makeBadgeSvg({
      bg: "#0C0A1D",
      border: "#FF7139",
      iconSvg: FIREFOX_ICON,
      topText: "GET THE ADD-ON FOR",
      topColor: "rgba(255,255,255,0.7)",
      topSize: 8.5,
      topLetterSpacing: "1px",
      bottomText: "Firefox",
      bottomColor: "#FF9400",
      bottomSize: 22,
    }),
    is_premium: false,
    tags: ["firefox", "mozilla", "extension", "add-on", "browser"],
  },
  {
    id: "badge-safari-extensions",
    name: "Available for Safari (Mac & iOS)",
    category: "Browser Extensions",
    subcategory: "badge-ext-safari",
    file_url: makeBadgeSvg({
      bg: "#000000",
      border: "rgba(0,122,255,0.4)",
      iconSvg: `
        <g transform="translate(16, 15) scale(1.4)">
          <circle cx="13" cy="13" r="12" fill="#007AFF"/>
          <polygon points="17,9 14,14 9,17 12,12" fill="#FFFFFF"/>
          <polygon points="17,9 12,12 14,14" fill="#FF3B30"/>
        </g>
      `,
      topText: "AVAILABLE FOR",
      topColor: "rgba(255,255,255,0.7)",
      topSize: 8.5,
      topLetterSpacing: "1px",
      bottomText: "Apple Safari",
      bottomColor: "#007AFF",
      bottomSize: 18,
    }),
    is_premium: false,
    tags: ["safari", "apple", "mac", "ios", "extension"],
  },
  {
    id: "badge-shopify-app-store",
    name: "Available on Shopify App Store",
    category: "Browser Extensions",
    subcategory: "badge-ext-shopify",
    file_url: makeBadgeSvg({
      bg: "#001A0E",
      border: "#95BF47",
      iconSvg: SHOPIFY_ICON,
      topText: "AVAILABLE ON THE",
      topColor: "#95BF47",
      topSize: 8.5,
      topLetterSpacing: "1px",
      bottomText: "Shopify App Store",
      bottomSize: 17,
    }),
    is_premium: true,
    tags: ["shopify", "ecommerce", "app store", "merchant"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. DEVELOPER & COMMUNITY PLATFORMS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "badge-product-hunt-featured",
    name: "Featured on Product Hunt",
    category: "Community & Dev",
    subcategory: "badge-comm-producthunt",
    file_url: makeBadgeSvg({
      bg: "#FFFFFF",
      border: "#DA552F",
      borderWidth: 1.8,
      iconSvg: PRODUCT_HUNT_ICON,
      topText: "FEATURED ON",
      topColor: "rgba(0,0,0,0.65)",
      topSize: 9,
      topLetterSpacing: "1.2px",
      bottomText: "Product Hunt",
      bottomColor: "#DA552F",
      bottomSize: 19,
    }),
    is_premium: false,
    tags: ["product hunt", "launch", "startup", "featured"],
  },
  {
    id: "badge-product-hunt-number-one",
    name: "#1 Product of the Day (Product Hunt)",
    category: "Community & Dev",
    subcategory: "badge-comm-producthunt",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#DA552F"/><stop offset="100%" stop-color="#C0392B"/>',
      border: "rgba(255,255,255,0.4)",
      iconSvg: `
        <g transform="translate(16, 15) scale(1.4)">
          <circle cx="13" cy="13" r="12" fill="#FFFFFF"/>
          <path d="M11 7h4a3.5 3.5 0 010 7h-4V7zm0 9.5V19h-2.5V7H15a6 6 0 010 12h-4v-2.5z" fill="#DA552F"/>
        </g>
      `,
      topText: "#1 PRODUCT OF THE DAY",
      topColor: "#FFFFFF",
      topSize: 8.5,
      topLetterSpacing: "1px",
      topWeight: 800,
      bottomText: "Product Hunt",
      bottomColor: "#FFFFFF",
      bottomSize: 19,
    }),
    is_premium: true,
    tags: ["product hunt", "winner", "number 1", "startup award"],
  },
  {
    id: "badge-github-star-repo",
    name: "Star on GitHub (Open Source)",
    category: "Community & Dev",
    subcategory: "badge-comm-github",
    file_url: makeBadgeSvg({
      bg: "#24292E",
      border: "rgba(255,255,255,0.22)",
      iconSvg: GITHUB_ICON,
      topText: "OPEN SOURCE ON",
      topColor: "rgba(255,255,255,0.7)",
      topSize: 9,
      topLetterSpacing: "1px",
      bottomText: "Star on GitHub",
      bottomColor: "#FFFFFF",
      bottomSize: 18,
    }),
    is_premium: false,
    tags: ["github", "open source", "developer", "star", "git"],
  },
  {
    id: "badge-discord-community",
    name: "Join our Discord Community",
    category: "Community & Dev",
    subcategory: "badge-comm-workplace",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#5865F2"/><stop offset="100%" stop-color="#4752C4"/>',
      border: "rgba(255,255,255,0.25)",
      iconSvg: `
        <g transform="translate(15, 16) scale(1.4)" fill="#FFFFFF">
          <path d="M21.5 3.2s-2.1-.9-4.3-1.1c-.3.5-.6 1.2-.8 1.8-2.3-.3-4.6-.3-6.9 0-.2-.6-.5-1.3-.8-1.8-2.2.2-4.3 1.1-4.3 1.1C1.2 8.1.3 13.9.7 19.6c2.4 1.8 4.7 2.9 7 3.1.6-.8 1.1-1.6 1.5-2.5-1-.4-2-.9-2.9-1.6.2-.2.5-.4.7-.6 4.3 2 8.9 2 13.2 0 .2.2.5.4.7.6-.9.7-1.9 1.2-2.9 1.6.4.9 1 1.7 1.5 2.5 2.3-.2 4.6-1.3 7-3.1.5-6.5-.8-12.2-3.8-16.4zm-12.8 13c-1.3 0-2.4-1.2-2.4-2.7 0-1.5 1.1-2.7 2.4-2.7 1.4 0 2.5 1.2 2.4 2.7 0 1.5-1 2.7-2.4 2.7zm8.6 0c-1.3 0-2.4-1.2-2.4-2.7 0-1.5 1.1-2.7 2.4-2.7 1.4 0 2.5 1.2 2.4 2.7 0 1.5-1 2.7-2.4 2.7z"/>
        </g>
      `,
      topText: "JOIN US ON",
      topColor: "rgba(255,255,255,0.85)",
      topSize: 9,
      topLetterSpacing: "1.2px",
      bottomText: "Discord",
      bottomSize: 22,
      bottomWeight: 800,
    }),
    is_premium: false,
    tags: ["discord", "community", "chat", "gamer", "support"],
  },
  {
    id: "badge-slack-add-button",
    name: "Add to Slack (Workspace App)",
    category: "Community & Dev",
    subcategory: "badge-comm-workplace",
    file_url: makeBadgeSvg({
      bg: "#FFFFFF",
      border: "#000000",
      borderWidth: 1.5,
      iconSvg: SLACK_ICON,
      topText: "ADD TO",
      topColor: "rgba(0,0,0,0.65)",
      topSize: 9,
      topLetterSpacing: "1.2px",
      bottomText: "Slack",
      bottomColor: "#000000",
      bottomSize: 22,
      bottomWeight: 800,
    }),
    is_premium: false,
    tags: ["slack", "workspace", "saas", "integration"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. STORE AWARDS, RATINGS & TRUST
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "badge-rating-5star-appstore",
    name: "Rated 5.0 ★★★★★ on App Store",
    category: "Awards & Trust",
    subcategory: "badge-award-ratings",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#18181B"/><stop offset="100%" stop-color="#09090B"/>',
      border: "#FBBF24",
      iconSvg: STARS_FIVE_GOLD,
      topText: "5.0 ★★★★★ RATING",
      topColor: "#FBBF24",
      topSize: 8.5,
      topWeight: 800,
      topLetterSpacing: "1.2px",
      bottomText: "Apple App Store",
      bottomSize: 18,
    }),
    is_premium: false,
    tags: ["rating", "5 stars", "reviews", "social proof", "app store"],
  },
  {
    id: "badge-rating-49star-googleplay",
    name: "Rated 4.9 ★★★★★ on Google Play",
    category: "Awards & Trust",
    subcategory: "badge-award-ratings",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#064E3B"/><stop offset="100%" stop-color="#022C22"/>',
      border: "#34D399",
      iconSvg: STARS_FIVE_GOLD,
      topText: "4.9 ★★★★★ RATING",
      topColor: "#34D399",
      topSize: 8.5,
      topWeight: 800,
      topLetterSpacing: "1.2px",
      bottomText: "Google Play Store",
      bottomSize: 17,
    }),
    is_premium: false,
    tags: ["rating", "5 stars", "reviews", "social proof", "google play"],
  },
  {
    id: "badge-social-1m-downloads",
    name: "Over 1,000,000+ Downloads (Social Proof)",
    category: "Awards & Trust",
    subcategory: "badge-award-socialproof",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#1E1B4B"/><stop offset="100%" stop-color="#0F172A"/>',
      border: "#818CF8",
      iconSvg: `
        <g transform="translate(18, 14) scale(1.4)" fill="#818CF8">
          <circle cx="12" cy="12" r="11" fill="rgba(129,140,248,0.2)"/>
          <path d="M12 4v10m-4-4l4 4 4-4m-7 8h14" stroke="#818CF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
      `,
      topText: "TRUSTED WORLDWIDE",
      topColor: "#A5B4FC",
      topSize: 8.5,
      topLetterSpacing: "1.2px",
      bottomText: "1,000,000+ Installs",
      bottomColor: "#FFFFFF",
      bottomSize: 17,
    }),
    is_premium: false,
    tags: ["social proof", "1 million", "downloads", "installs", "users"],
  },
  {
    id: "badge-trust-security-verified",
    name: "100% Virus & Malware Free Verified",
    category: "Awards & Trust",
    subcategory: "badge-award-trust",
    file_url: makeBadgeSvg({
      gradient:
        '<stop offset="0%" stop-color="#022C22"/><stop offset="100%" stop-color="#064E3B"/>',
      border: "#10B981",
      iconSvg: SHIELD_VERIFIED_ICON,
      topText: "SECURITY VERIFIED",
      topColor: "#6EE7B7",
      topSize: 8.5,
      topWeight: 800,
      topLetterSpacing: "1px",
      bottomText: "100% Safe & Clean",
      bottomColor: "#FFFFFF",
      bottomSize: 17,
    }),
    is_premium: false,
    tags: ["trust", "security", "verified", "safe", "clean", "antivirus"],
  },
  {
    id: "badge-trust-ssl-secured",
    name: "256-Bit SSL Encrypted & Secured",
    category: "Awards & Trust",
    subcategory: "badge-award-trust",
    file_url: makeBadgeSvg({
      bg: "#0F172A",
      border: "#38BDF8",
      iconSvg: `
        <g transform="translate(18, 15) scale(1.4)" fill="#38BDF8">
          <rect x="4" y="10" width="16" height="12" rx="3" fill="#38BDF8"/>
          <path d="M8 10V6a4 4 0 018 0v4" stroke="#38BDF8" stroke-width="2.5" fill="none"/>
          <circle cx="12" cy="16" r="1.5" fill="#0F172A"/>
        </g>
      `,
      topText: "BANK-GRADE SECURITY",
      topColor: "#7DD3FC",
      topSize: 8.5,
      topLetterSpacing: "1.2px",
      bottomText: "256-Bit SSL Protected",
      bottomColor: "#FFFFFF",
      bottomSize: 16,
    }),
    is_premium: true,
    tags: ["ssl", "encryption", "security", "trust", "safe"],
  },
];

// ─── 4. SEED EXECUTION LOGIC ─────────────────────────────────────────────────
async function seedStoreBadges() {
  console.log(
    "🌱 [Store Badges] Starting high-fidelity store badges seeding...",
  );

  // 1. Ensure Categories
  const allCategoriesToEnsure = [...BADGE_CATEGORIES, ...OTHER_CATEGORIES];
  console.log(`📦 Ensuring ${allCategoriesToEnsure.length} categories...`);

  for (const cat of allCategoriesToEnsure) {
    const existing = await db("asset_categories").where({ id: cat.id }).first();
    if (!existing) {
      await db("asset_categories").insert({
        ...cat,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
      console.log(
        `   ➕ Inserted category: [${cat.asset_type}] ${cat.name} (${cat.id})`,
      );
    } else {
      // Update label/name/color/sort_order if needed
      await db("asset_categories").where({ id: cat.id }).update({
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

  // 2. Ensure Subcategories
  const allSubcategoriesToEnsure = [
    ...BADGE_SUBCATEGORIES,
    ...OTHER_SUBCATEGORIES,
  ];
  console.log(
    `📂 Ensuring ${allSubcategoriesToEnsure.length} subcategories...`,
  );

  for (const sub of allSubcategoriesToEnsure) {
    const existing = await db("asset_subcategories")
      .where({ id: sub.id })
      .first();
    if (!existing) {
      await db("asset_subcategories").insert({
        ...sub,
        is_active: true,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
      console.log(`   ➕ Inserted subcategory: ${sub.name} (${sub.id})`);
    } else {
      await db("asset_subcategories").where({ id: sub.id }).update({
        category_id: sub.category_id,
        name: sub.name,
        label: sub.label,
        sort_order: sub.sort_order,
        updated_at: db.fn.now(),
      });
    }
  }

  // 3. Upsert Badges into assets table
  console.log(
    `✨ Upserting ${BADGE_ASSETS.length} store badges into assets table...`,
  );
  let insertedCount = 0;
  let updatedCount = 0;

  for (const b of BADGE_ASSETS) {
    const existing = await db("assets").where({ id: b.id }).first();
    const assetPayload = {
      id: b.id,
      name: b.name,
      type: "badge",
      category: b.category,
      subcategory: b.subcategory,
      file_url: b.file_url,
      file_path: null,
      file_size: b.file_url ? b.file_url.length : 0,
      mime_type: "image/svg+xml",
      width: 240,
      height: 70,
      is_builtin: true,
      is_premium: Boolean(b.is_premium),
      use_count: existing ? existing.use_count : 0,
      metadata: JSON.stringify({
        tags: b.tags,
        format: "svg",
        render_mode: "vector",
        aspect_ratio: "3.43:1",
      }),
      updated_at: db.fn.now(),
    };

    if (!existing) {
      await db("assets").insert({
        ...assetPayload,
        created_at: db.fn.now(),
      });
      insertedCount++;
    } else {
      await db("assets").where({ id: b.id }).update(assetPayload);
      updatedCount++;
    }
  }

  // 4. Invalidate memory cache so frontend immediately sees live changes
  try {
    memoryCache.delPrefix("asset:categories");
  } catch (_) {}

  console.log(`✅ [Store Badges] Seeding completed successfully!`);
  console.log(`   - Badges Inserted: ${insertedCount}`);
  console.log(`   - Badges Updated:  ${updatedCount}`);
  console.log(`   - Total in DB:     ${insertedCount + updatedCount}`);

  return { insertedCount, updatedCount };
}

// Support running both as standalone script and as Knex seed
if (require.main === module) {
  require("dotenv").config();
  seedStoreBadges()
    .then(() => {
      console.log("🎉 Seeder completed without error.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seeder encountered an error:", err);
      process.exit(1);
    });
}

exports.seed = seedStoreBadges;
