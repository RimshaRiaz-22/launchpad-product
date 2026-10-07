// src/database/knex.js — Singleton Knex instance
'use strict';

const knex = require('knex');
const knexConfig = require('../../knexfile');
const logger = require('../config/logger.config');

const env = process.env.NODE_ENV || 'development';
const config = knexConfig[env];

const db = knex(config);

// Log slow queries in development
if (env === 'development') {
  db.on('query', (query) => {
    if (process.env.DEBUG_SQL === 'true') {
      logger.debug('SQL Query', {
        sql: query.sql,
        bindings: query.bindings,
      });
    }
  });

  db.on('query-error', (err, query) => {
    logger.error('SQL Error', {
      sql: query.sql,
      bindings: query.bindings,
      error: err.message,
    });
  });
}

module.exports = db;
