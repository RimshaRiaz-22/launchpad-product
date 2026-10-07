// src/app.js — Express application factory
'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const config = require('./config/app.config');
const logger = require('./config/logger.config');
const v1Router = require('./api/v1/index');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');

const app = express();

// ─────────────────────────────────────────────────────────────
// Trust proxy (needed for correct req.ip behind load balancers)
// ─────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────
// Security Middlewares
// ─────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Allow file uploads
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin images/SVGs to load in frontend
    contentSecurityPolicy: config.app.isProduction,
  })
);

const corsOptions = {
  origin: (origin, callback) => {
    // Server-to-server, curl, Postman, or mobile apps (no Origin header)
    if (!origin) {
      return callback(null, true);
    }

    // In development mode, allow localhost and any origin if configured with '*'
    if (!config.app.isProduction) {
      return callback(null, true);
    }

    // In production mode, strictly check against configured CORS whitelist
    if (config.cors.origins.includes('*') || config.cors.origins.includes(origin)) {
      return callback(null, true);
    }

    // Reject unapproved origins in production
    return callback(new Error(`CORS policy: Origin ${origin} not allowed by Access-Control-Allow-Origin`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: ['*'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


// ─────────────────────────────────────────────────────────────
// Body Parsers
// ─────────────────────────────────────────────────────────────

// JSON + URL-encoded body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─────────────────────────────────────────────────────────────
// Compression
// ─────────────────────────────────────────────────────────────
app.use(compression());

// ─────────────────────────────────────────────────────────────
// HTTP Request Logging (Morgan → Winston)
// ─────────────────────────────────────────────────────────────
if (!config.app.isTest) {
  app.use(
    morgan(config.app.isProduction ? 'combined' : 'dev', {
      stream: logger.stream,
      skip: (req) => req.url === '/health' || req.url.endsWith('/health'),
    })
  );
}

// ─────────────────────────────────────────────────────────────
// Global API Rate Limiter
// ─────────────────────────────────────────────────────────────
app.use(`/api/${config.app.apiVersion}`, apiLimiter);

// ─────────────────────────────────────────────────────────────
// Root health check (outside versioned API)
// ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: config.app.name,
    env: config.app.env,
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────
app.use(`/api/${config.app.apiVersion}`, v1Router);

// ─────────────────────────────────────────────────────────────
// Error Handling (must be last)
// ─────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
