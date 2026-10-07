// server.js — Application entry point
// Handles graceful startup, shutdown, and uncaught exceptions
'use strict';

require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const logger = require('./src/config/logger.config');
const db = require('./src/database/knex');
const { autoSyncDatabase } = require('./src/database/autoSync');

const PORT = parseInt(process.env.PORT, 10) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─────────────────────────────────────────────────────────────
// Uncaught Exception / Rejection Guards (must be first)
// ─────────────────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION — shutting down', {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION — shutting down', {
    reason: reason?.message || reason,
    promise,
  });
  process.exit(1);
});

// ─────────────────────────────────────────────────────────────
// Boot Sequence
// ─────────────────────────────────────────────────────────────
const bootstrap = async () => {
  // 1. Auto-create database (if missing) and auto-sync all migrations/tables
  try {
    await autoSyncDatabase();
  } catch (err) {
    logger.error('Database auto-sync failed — stopping boot', { error: err.message });
    process.exit(1);
  }

  // 2. Create HTTP server
  const server = http.createServer(app);

  // 3. Start listening (bind to 0.0.0.0 for cloud providers like Render)
  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀  Launchpad API running`, {
      env: NODE_ENV,
      port: PORT,
      url: `http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`,
    });
  });

  // ─────────────────────────────────────────────────────────
  // Graceful Shutdown
  // ─────────────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.info(`${signal} received — graceful shutdown initiated`);

    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await db.destroy();
        logger.info('Database pool closed');
      } catch (err) {
        logger.error('Error closing database pool', { message: err.message });
      }

      logger.info('Goodbye 👋');
      process.exit(0);
    });

    // Force exit after 10 seconds if shutdown hangs
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

bootstrap();
