// src/config/app.config.js — Centralised application configuration
'use strict';

require('dotenv').config();

const config = {
  app: {
    name: process.env.APP_NAME || 'Launchpad',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    apiVersion: process.env.API_VERSION || 'v1',
    url: process.env.APP_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:5000',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'launchpad_db',
    user: process.env.DB_USER || 'launchpad_user',
    password: process.env.DB_PASSWORD || 'launchpad_pass',
    ssl: process.env.DB_SSL === 'true',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    },
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || '*')
      .split(',')
      .map((o) => o.trim()),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  upload: {
    maxFileSizeMb: parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB, 10) || 10,
    allowedMimes: (
      process.env.UPLOAD_ALLOWED_MIMES ||
      'image/jpeg,image/png,image/webp,image/svg+xml,application/json'
    )
      .split(',')
      .map((m) => m.trim()),
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    prices: {
      pro: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
      team: process.env.STRIPE_PRICE_TEAM_MONTHLY || '',
    },
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'app-ss-e611d',
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'app-ss-e611d.firebaseapp.com',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'app-ss-e611d.firebasestorage.app',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '376384198393',
    appId: process.env.FIREBASE_APP_ID || '1:376384198393:web:edb6c35a8d653da0c33428',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-HGX9JF9J8V',
    vapidKey: process.env.FIREBASE_VAPID_KEY || '',
    serverKey: process.env.FIREBASE_SERVER_KEY || '',
  },

  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Launchpad <no-reply@launchpad.app>',
    support: process.env.EMAIL_SUPPORT || 'support@launchpad.app',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'launchpad',
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
    enabled: process.env.CLOUDINARY_ENABLED === 'true',
  },
};

// ─────────────────────────────────────────────────────────────
// Startup validation — fail fast on missing or insecure config
// ─────────────────────────────────────────────────────────────
const validateConfig = () => {
  const errors = [];
  const warnings = [];

  // 1. Mandatory Secrets
  if (!config.jwt.accessSecret) {
    errors.push('JWT_ACCESS_SECRET is required but missing.');
  } else if (config.jwt.accessSecret.length < 32 && config.app.isProduction) {
    errors.push('JWT_ACCESS_SECRET is too short for production (minimum 32 characters required).');
  }

  if (!config.jwt.refreshSecret) {
    errors.push('JWT_REFRESH_SECRET is required but missing.');
  } else if (config.jwt.refreshSecret.length < 32 && config.app.isProduction) {
    errors.push('JWT_REFRESH_SECRET is too short for production (minimum 32 characters required).');
  }

  // 2. Production Security Checks
  if (config.app.isProduction) {
    if (config.jwt.accessSecret?.includes('dev_key')) {
      errors.push('Production is using a default development JWT_ACCESS_SECRET. Rotate with a strong random secret.');
    }
    if (config.jwt.refreshSecret?.includes('dev_key')) {
      errors.push('Production is using a default development JWT_REFRESH_SECRET. Rotate with a strong random secret.');
    }
    if (config.cors.origins.includes('*')) {
      warnings.push('CORS_ORIGINS contains wildcard "*" in production while credentials: true is enabled.');
    }
    if (!process.env.DATABASE_URL && (!config.db.host || config.db.host === 'localhost')) {
      warnings.push('Production is configured without DATABASE_URL and pointing to localhost database.');
    }
  }

  // 3. Port Validity
  if (isNaN(config.app.port) || config.app.port <= 0 || config.app.port > 65535) {
    errors.push(`Invalid PORT configured: ${process.env.PORT}`);
  }

  // Output warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  [Config Warning] Potential security concerns detected:');
    warnings.forEach((w) => console.warn(`   - ${w}`));
    console.warn('');
  }

  // Fail fast on errors
  if (errors.length > 0) {
    console.error('\n❌ [Config Error] Server startup aborted due to configuration errors:');
    errors.forEach((e) => console.error(`   - ${e}`));
    console.error('\nCheck your .env file or review .env.example for required variables.\n');
    throw new Error(`Environment validation failed with ${errors.length} error(s).`);
  }
};

if (!config.app.isTest) {
  validateConfig();
}

module.exports = config;
