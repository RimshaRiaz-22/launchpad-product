// src/config/logger.config.js — Winston structured logger (Console-only, no file clutter)
'use strict';

const { createLogger, format, transports } = require('winston');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// ─────────────────────────────────────────────────────────────
// Custom Console Format
// ─────────────────────────────────────────────────────────────
const consoleFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? `\n${JSON.stringify(meta, null, 2)}`
      : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// ─────────────────────────────────────────────────────────────
// Logger instance (Clean Console transport without creating disk log files)
// ─────────────────────────────────────────────────────────────
const logger = createLogger({
  level: LOG_LEVEL,
  transports: [
    new transports.Console({
      format: consoleFormat,
    }),
  ],
  exitOnError: false,
  // Silence in test environment
  silent: process.env.NODE_ENV === 'test',
});

// Stream for Morgan HTTP logging
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

module.exports = logger;
