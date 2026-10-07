// src/repositories/settings.repository.js — Data access for system_settings table
'use strict';

const db = require('../database/knex');

const TABLE = 'system_settings';

/**
 * Fetch all system settings as a unified dictionary: { general, canvas, firebase, alerts }
 */
const getAll = async () => {
  const rows = await db(TABLE).select('key', 'value', 'description', 'updated_at');
  const result = {};
  for (const row of rows) {
    result[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
  }
  return result;
};

/**
 * Fetch a single setting record by key.
 */
const getByKey = async (key) => {
  const row = await db(TABLE).where({ key }).first();
  if (!row) return null;
  return {
    ...row,
    value: typeof row.value === 'string' ? JSON.parse(row.value) : row.value,
  };
};

/**
 * Upsert a single setting by key.
 */
const upsert = async (key, value, userId = null, description = null) => {
  const existing = await db(TABLE).where({ key }).first();
  const valuePayload = typeof value === 'object' ? JSON.stringify(value) : value;

  if (existing) {
    const updateData = {
      value: valuePayload,
      updated_at: db.fn.now(),
    };
    if (userId) updateData.updated_by = userId;
    if (description) updateData.description = description;

    const [updated] = await db(TABLE)
      .where({ key })
      .update(updateData)
      .returning(['key', 'value', 'updated_at']);
    return {
      ...updated,
      value: typeof updated.value === 'string' ? JSON.parse(updated.value) : updated.value,
    };
  }

  const [inserted] = await db(TABLE)
    .insert({
      key,
      value: valuePayload,
      description: description || `${key} configuration`,
      updated_by: userId,
      updated_at: db.fn.now(),
    })
    .returning(['key', 'value', 'updated_at']);

  return {
    ...inserted,
    value: typeof inserted.value === 'string' ? JSON.parse(inserted.value) : inserted.value,
  };
};

/**
 * Batch update multiple settings keys in a transaction.
 */
const updateBatch = async (settingsMap, userId = null) => {
  return await db.transaction(async (trx) => {
    const results = {};
    for (const [key, value] of Object.entries(settingsMap)) {
      if (value === undefined || value === null) continue;
      const valuePayload = typeof value === 'object' ? JSON.stringify(value) : value;
      const existing = await trx(TABLE).where({ key }).first();

      if (existing) {
        await trx(TABLE).where({ key }).update({
          value: valuePayload,
          updated_at: trx.fn.now(),
          updated_by: userId,
        });
      } else {
        await trx(TABLE).insert({
          key,
          value: valuePayload,
          description: `${key} configuration`,
          updated_at: trx.fn.now(),
          updated_by: userId,
        });
      }
      results[key] = value;
    }
    return results;
  });
};

module.exports = {
  getAll,
  getByKey,
  upsert,
  updateBatch,
};
