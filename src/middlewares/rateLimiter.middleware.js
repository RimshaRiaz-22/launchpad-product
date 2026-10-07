// src/middlewares/rateLimiter.middleware.js — Rate limiting
'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config/app.config');

/**
 * Standard rate limiter for general API routes.
 * Bypassed in development and for internal admin/analytics/audit-logs routes to prevent 429 throttling.
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.app.isDevelopment ? 50000 : config.rateLimit.maxRequests,
  standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,    // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later.',
  },
  skip: (req) =>
    config.app.isTest ||
    config.app.isDevelopment ||
    req.path.includes('/admin') ||
    req.originalUrl?.includes('/admin') ||
    req.originalUrl?.includes('/analytics') ||
    req.originalUrl?.includes('/audit-logs'),
});

/**
 * Strict limiter for auth endpoints.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.app.isDevelopment ? 5000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts. Please wait 15 minutes.',
  },
  skip: () => config.app.isTest || config.app.isDevelopment,
});

/**
 * Strict limiter for file upload endpoints.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.app.isDevelopment ? 1000 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    message: 'Upload limit reached. Please wait before uploading more files.',
  },
  skip: () => config.app.isTest || config.app.isDevelopment,
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };

