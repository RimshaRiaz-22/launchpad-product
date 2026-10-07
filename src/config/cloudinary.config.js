// src/config/cloudinary.config.js — Cloudinary SDK configuration
'use strict';

const cloudinary = require('cloudinary').v2;
const config = require('./app.config');
const logger = require('./logger.config');

const isDummy = (val) => {
  if (!val || typeof val !== 'string') return true;
  const lower = val.trim().toLowerCase();
  return (
    lower.includes('your_') ||
    lower.includes('placeholder') ||
    lower.includes('dummy') ||
    lower === 'abcdefghijklmnopqrstuvwxyz_12345' ||
    lower === '123456789012345'
  );
};

const isCloudinaryConfigured = () => {
  const { cloudName, apiKey, apiSecret, enabled } = config.cloudinary;
  if (!enabled) return false;
  if (!cloudName || !apiKey || !apiSecret) return false;
  if (isDummy(cloudName) || isDummy(apiKey) || isDummy(apiSecret)) return false;
  return true;
};

// Initialize configuration if keys are provided
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });

  if (isCloudinaryConfigured()) {
    logger.info('Cloudinary initialized successfully', {
      cloudName: config.cloudinary.cloudName,
      folder: config.cloudinary.folder,
    });
  } else {
    logger.debug('Cloudinary configured with placeholder/disabled credentials. Local storage will be used.');
  }
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  isDummy,
};
