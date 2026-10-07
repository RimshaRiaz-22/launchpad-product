// src/config/firebaseAdmin.config.js — Firebase Admin SDK initialization (HTTP v1 API)
'use strict';

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { getMessaging: getAdminMessaging } = require('firebase-admin/messaging');
const logger = require('./logger.config');

let isInitialized = false;

function initFirebaseAdmin() {
  if (admin.getApps().length > 0) {
    isInitialized = true;
    return admin.getApp();
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.REACT_APP_FIREBASE_PROJECT_ID ||
    'app-ss-e611d';

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Handle escaped newlines from environment variable strings
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  // 1. Try credentials from explicit environment variables (Client Email + Private Key)
  if (clientEmail && privateKey && !privateKey.includes('placeholder')) {
    try {
      const app = admin.initializeApp({
        credential: admin.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isInitialized = true;
      logger.info(
        `🔥 Firebase Admin initialized successfully via ENV credentials (Project: ${projectId})`
      );
      return app;
    } catch (err) {
      logger.error('Failed to initialize Firebase Admin from ENV credentials:', err.message);
    }
  }

  // 2. Try credentials from Service Account JSON file path
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.resolve(process.cwd(), 'firebase-service-account.json');

  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      const app = admin.initializeApp({
        credential: admin.cert(serviceAccount),
      });
      isInitialized = true;
      logger.info(
        `🔥 Firebase Admin initialized successfully from file: ${serviceAccountPath}`
      );
      return app;
    } catch (err) {
      logger.error(
        `Failed to parse Firebase service account file at ${serviceAccountPath}:`,
        err.message
      );
    }
  }

  // 3. Fallback: Log informative warning without crashing the application
  logger.warn(
    '⚠️ Firebase Admin credentials not provided (FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY or firebase-service-account.json). ' +
      'Push notification dispatch to devices will run in simulated mode until Service Account credentials are provided.'
  );

  return null;
}

// Initialize on module load
initFirebaseAdmin();

/**
 * Returns true if Firebase Admin is actively authenticated with Google Cloud.
 */
const isFirebaseAdminReady = () => {
  return isInitialized && admin.getApps().length > 0;
};

/**
 * Returns the Firebase Messaging instance if initialized, or null.
 */
const getMessaging = () => {
  if (!isFirebaseAdminReady()) {
    return null;
  }
  return getAdminMessaging();
};

module.exports = {
  admin,
  initFirebaseAdmin,
  isFirebaseAdminReady,
  getMessaging,
};

