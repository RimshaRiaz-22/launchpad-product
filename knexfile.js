// knexfile.js — Knex configuration for all environments
require('dotenv').config();

const connection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'launchpad_db',
      user: process.env.DB_USER || 'launchpad_user',
      password: process.env.DB_PASSWORD || 'launchpad_pass',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    };

/**
 * @type {import('knex').Knex.Config}
 */
const baseConfig = {
  client: 'pg',
  connection,
  pool: {
    min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    // Destroy connections after 60 seconds idle (avoid churn)
    idleTimeoutMillis: 60000,
    // Fail fast if no connection available after 10s
    acquireTimeoutMillis: 10000,
  },
  migrations: {
    directory: './src/database/migrations',
    tableName: 'knex_migrations',
    extension: 'js',
  },
  seeds: {
    directory: './src/database/seeds',
    extension: 'js',
  },
};

module.exports = {
  development: {
    ...baseConfig,
    debug: false,
    asyncStackTraces: true,
  },

  test: {
    ...baseConfig,
    connection: {
      ...baseConfig.connection,
      database: process.env.DB_NAME_TEST || process.env.DB_NAME || 'launchpad_db',
    },
    pool: { min: 1, max: 3 },
  },

  production: {
    ...baseConfig,
    connection: {
      ...baseConfig.connection,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
    },
    debug: false,
  },
};
