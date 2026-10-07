// src/database/autoSync.js — Automated Database & Schema Synchronization
'use strict';

const path = require('path');
const fs = require('fs');
const { Client } = require('pg');
const db = require('./knex');
const logger = require('../config/logger.config');
const config = require('../config/app.config');

/**
 * Ensures the target PostgreSQL database exists.
 * If not, connects to the default 'postgres' database and creates it automatically.
 * Eliminates the need to open pgAdmin to create databases.
 */
const ensureDatabaseExists = async () => {
  const targetDb = config.db.name;

  const client = new Client({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: 'postgres',
    ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDb]
    );

    if (res.rowCount === 0) {
      logger.info(`📦 Database "${targetDb}" does not exist. Creating it automatically...`);
      await client.query(`CREATE DATABASE "${targetDb.replace(/"/g, '""')}"`);
      logger.info(`✅ Database "${targetDb}" created successfully!`);
    } else {
      logger.debug(`Database "${targetDb}" already exists.`);
    }
  } catch (err) {
    logger.warn(`Database creation check skipped: ${err.message}`);
  } finally {
    await client.end().catch(() => {});
  }
};

/**
 * Ensures required PostgreSQL extensions (uuid-ossp, pgcrypto) exist.
 */
const ensureExtensions = async () => {
  try {
    await db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public');
    await db.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public');
  } catch (err) {
    logger.warn(`Extension verification notice: ${err.message}`);
  }
};

/**
 * Runs all pending Knex migrations automatically.
 */
const runMigrations = async () => {
  const migrationsDir = path.resolve(__dirname, 'migrations');

  try {
    const [batchNo, log] = await db.migrate.latest({
      directory: migrationsDir,
      tableName: 'knex_migrations',
    });

    if (log && log.length > 0) {
      logger.info(`⚡ Applied ${log.length} new database migration(s) (Batch #${batchNo}):`);
      log.forEach((file) => logger.info(`   └─ ${file}`));
    } else {
      logger.info('✅ Database schema is already up to date with migrations.');
    }
  } catch (err) {
    logger.error('Failed to run Knex migrations:', { error: err.message });
    throw err;
  }
};

/**
 * Synchronizes schema directly against backend/database/init.sql.
 * If you add or modify tables or columns in init.sql, this automatically:
 * 1. Creates any missing tables.
 * 2. Adds any missing columns to existing tables (ALTER TABLE ADD COLUMN IF NOT EXISTS).
 * 3. Ensures performance indexes and helper functions exist.
 * Eliminates the need to manually open pgAdmin to add missing columns or tables.
 */
const syncSchemaFromInitSql = async () => {
  const initSqlPath = path.resolve(__dirname, '../../database/init.sql');
  if (!fs.existsSync(initSqlPath)) {
    logger.debug('init.sql not found for schema sync.');
    return;
  }

  try {
    const sqlContent = fs.readFileSync(initSqlPath, 'utf8');

    // 1. Fetch current tables and columns in public schema
    const existingColsRes = await db('information_schema.columns')
      .where({ table_schema: 'public' })
      .select('table_name', 'column_name');

    const dbSchema = {};
    for (const row of existingColsRes) {
      if (!dbSchema[row.table_name]) {
        dbSchema[row.table_name] = new Set();
      }
      dbSchema[row.table_name].add(row.column_name);
    }

    // 2. Parse tables and columns defined in init.sql
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\n\);/gi;
    let match;
    let createdTables = 0;
    let addedColumns = 0;

    while ((match = tableRegex.exec(sqlContent)) !== null) {
      const tableName = match[1];
      const tableSql = match[0];
      const body = match[2];

      if (!dbSchema[tableName]) {
        // Table is completely missing in database — create it
        try {
          await db.raw(tableSql);
          logger.info(`📦 Auto-created missing table: public."${tableName}"`);
          createdTables++;
          dbSchema[tableName] = new Set();
        } catch (tableErr) {
          logger.warn(`Notice auto-creating table "${tableName}": ${tableErr.message}`);
        }
      } else {
        // Table exists — inspect its columns
        const lines = body.split('\n');
        for (let rawLine of lines) {
          let line = rawLine.trim();
          if (!line || line.startsWith('--') || line.toUpperCase().startsWith('CONSTRAINT')) {
            continue;
          }
          if (line.endsWith(',')) {
            line = line.slice(0, -1).trim();
          }
          if (!line) continue;

          const colMatch = line.match(/^"?([a-zA-Z0-9_]+)"?\s+(.+)$/);
          if (colMatch) {
            const colName = colMatch[1];
            if (!dbSchema[tableName].has(colName)) {
              let colDef = line;
              // Make nullable if table already has rows and column has NOT NULL without DEFAULT
              if (colDef.toUpperCase().includes('NOT NULL') && !colDef.toUpperCase().includes('DEFAULT')) {
                colDef = colDef.replace(/NOT\s+NULL/gi, '').trim();
              }
              try {
                await db.raw(`ALTER TABLE public."${tableName}" ADD COLUMN IF NOT EXISTS ${colDef}`);
                logger.info(`➕ Auto-added missing column: public."${tableName}"."${colName}"`);
                dbSchema[tableName].add(colName);
                addedColumns++;
              } catch (colErr) {
                logger.warn(`Notice adding column "${colName}" to "${tableName}": ${colErr.message}`);
              }
            }
          }
        }
      }
    }

    if (createdTables > 0 || addedColumns > 0) {
      logger.info(`✨ Schema auto-sync: ${createdTables} new table(s) created, ${addedColumns} missing column(s) added.`);
    }

    // 3. Ensure automatic updated_at trigger function exists
    try {
      await db.raw(`
        CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
        LANGUAGE plpgsql AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$;
      `);
    } catch (_fnErr) {
      // Ignored if permissions are restricted
    }

    // 4. Ensure performance indexes from init.sql exist
    const indexMatches = sqlContent.match(/CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS[\s\S]*?;/gi) || [];
    for (const idxSql of indexMatches) {
      try {
        await db.raw(idxSql);
      } catch (_idxErr) {
        // Safe to ignore if already exists or dependent column pending
      }
    }
  } catch (err) {
    logger.warn(`init.sql schema auto-sync notice: ${err.message}`);
  }
};

/**
 * Ensures system roles ('admin', 'user') exist in roles table and any users
 * with unlinked role_id are automatically resolved and linked.
 */
const ensureRolesAndLinkUsers = async () => {
  try {
    const hasRoles = await db.schema.hasTable('roles');
    if (!hasRoles) return;

    const existingRoles = await db('roles').select('id', 'name');
    const hasAdmin = existingRoles.some((r) => r.name.toLowerCase() === 'admin');
    const hasUser = existingRoles.some((r) => r.name.toLowerCase() === 'user');

    if (!hasAdmin) {
      await db('roles').insert({
        name: 'admin',
        description: 'Full administrative access to all resources and settings',
      });
      logger.info('🔑 Ensured admin role in roles table.');
    }
    if (!hasUser) {
      await db('roles').insert({
        name: 'user',
        description: 'Standard user with standard application permissions',
      });
      logger.info('👤 Ensured user role in roles table.');
    }

    // Backfill any user where role_id is NULL
    await db.raw(`
      UPDATE users
      SET role_id = roles.id
      FROM roles
      WHERE users.role_id IS NULL
        AND LOWER(users.role) = LOWER(roles.name)
    `);

    // Fallback: assign user role if role_id is still NULL
    await db.raw(`
      UPDATE users
      SET role_id = (SELECT id FROM roles WHERE LOWER(name) = 'user' LIMIT 1)
      WHERE users.role_id IS NULL
    `);
  } catch (err) {
    logger.warn(`Role auto-sync notice: ${err.message}`);
  }
};

/**
 * Main auto-sync orchestrator called on server startup.
 * Automatically synchronizes the database without needing pgAdmin:
 * 1. Ensures database exists (local dev).
 * 2. Verifies connectivity.
 * 3. Ensures PostgreSQL extensions.
 * 4. Runs Knex migrations.
 * 5. Auto-syncs any missing tables or missing columns from init.sql.
 * 6. Ensures roles and user foreign keys.
 */
const autoSyncDatabase = async () => {
  logger.info('🔄 Checking database & syncing schema...');

  // Step 1: Ensure database exists (local dev only)
  if (config.db.host === 'localhost' || config.db.host === '127.0.0.1') {
    await ensureDatabaseExists();
  }

  // Step 2: Verify connectivity to the app database
  try {
    await db.raw('SELECT 1+1 AS connected');
    logger.info(`✅ Connected to database "${config.db.name}" (${config.db.host})`);
  } catch (err) {
    logger.error(`❌ Could not connect to database "${config.db.name}": ${err.message}`);
    logger.error('👉 Please check DB_HOST, DB_USER, DB_PASSWORD, and DB_PORT in backend/.env');
    throw err;
  }

  // Step 3: Ensure extensions
  await ensureExtensions();

  // Step 4: Run migrations
  await runMigrations();

  // Step 5: Automatically add any missing tables or columns from init.sql
  await syncSchemaFromInitSql();

  // Step 6: Ensure system roles exist and users have role_id foreign keys populated
  await ensureRolesAndLinkUsers();

  // Step 7: Ensure store badges and vector icons exist
  try {
    const badgeCount = await db('assets').where({ type: 'badge' }).count('id as count').first();
    if (parseInt(badgeCount?.count || 0, 10) === 0) {
      logger.info('📦 Auto-seeding default store badges...');
      const { seed: seedBadges } = require('./seeds/seed_store_badges');
      await seedBadges();
    }
  } catch (badgeErr) {
    logger.warn(`Store badges auto-sync notice: ${badgeErr.message}`);
  }

  try {
    const iconCount = await db('assets').where({ type: 'icon' }).count('id as count').first();
    if (parseInt(iconCount?.count || 0, 10) === 0) {
      logger.info('📦 Auto-seeding default vector icons...');
      const { seed: seedIcons } = require('./seeds/seed_icons');
      await seedIcons();
    }
  } catch (iconErr) {
    logger.warn(`Vector icons auto-sync notice: ${iconErr.message}`);
  }

  try {
    const shapeCount = await db('assets').where({ type: 'shape' }).count('id as count').first();
    if (parseInt(shapeCount?.count || 0, 10) === 0) {
      logger.info('📦 Auto-seeding default vector shapes...');
      const { seed: seedShapes } = require('./seeds/seed_shapes');
      await seedShapes();
    }
  } catch (shapeErr) {
    logger.warn(`Vector shapes auto-sync notice: ${shapeErr.message}`);
  }

  try {
    const stickerCount = await db('assets').where({ type: 'sticker' }).count('id as count').first();
    if (parseInt(stickerCount?.count || 0, 10) === 0) {
      logger.info('📦 Auto-seeding default vector stickers & emojis...');
      const { seed: seedStickers } = require('./seeds/seed_stickers');
      await seedStickers();
    }
  } catch (stickerErr) {
    logger.warn(`Vector stickers auto-sync notice: ${stickerErr.message}`);
  }

  try {
    const imageCount = await db('assets').where({ type: 'image' }).count('id as count').first();
    if (parseInt(imageCount?.count || 0, 10) === 0) {
      logger.info('📦 Auto-seeding default mockup & stock images...');
      const { seed: seedImages } = require('./seeds/seed_images');
      await seedImages();
    }
  } catch (imageErr) {
    logger.warn(`Mockup images auto-sync notice: ${imageErr.message}`);
  }

  try {
    const fontCount = await db('fonts').where({ is_builtin: true }).count('id as count').first();
    if (parseInt(fontCount?.count || 0, 10) < 100) {
      logger.info('📦 Auto-seeding comprehensive modern Google Fonts catalog (562 fonts)...');
      const { seed: seedFonts } = require('./seeds/seed_fonts');
      await seedFonts();
    }
  } catch (fontErr) {
    logger.warn(`Google fonts auto-sync notice: ${fontErr.message}`);
  }

  try {
    const mockupCount = await db('mockups').where({ is_builtin: true }).count('id as count').first();
    if (parseInt(mockupCount?.count || 0, 10) === 0) {
      logger.info('📦 Auto-seeding device mockups (iPhones, iPads, MacBooks, browsers, watches)...');
      const { seedMockups } = require('./seeds/seed_mockups');
      await seedMockups(db);
    }
  } catch (mockupErr) {
    logger.warn(`Device mockups auto-sync notice: ${mockupErr.message}`);
  }

  logger.info('🚀 Database schema auto-synced successfully.');
};

module.exports = {
  autoSyncDatabase,
  ensureDatabaseExists,
  ensureExtensions,
  runMigrations,
  syncSchemaFromInitSql,
  ensureRolesAndLinkUsers,
};

