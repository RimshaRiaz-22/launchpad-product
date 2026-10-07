// src/repositories/presets.repository.js — Data access for showcase formats & device preset sizes
'use strict';

const db = require('../database/knex');

const FORMATS_TABLE = 'showcase_formats';
const PRESETS_TABLE = 'device_presets';

/* ── Showcase Formats ───────────────────────────────────────────────────────── */

const findAllFormats = async (includeInactive = false) => {
  const q = db(FORMATS_TABLE).orderBy('sort_order', 'asc').orderBy('name', 'asc');
  if (!includeInactive) q.where({ is_active: true });
  return q;
};

const findFormatById = async (id) => db(FORMATS_TABLE).where({ id }).first();

const findFormatBySlug = async (slug) => db(FORMATS_TABLE).where({ slug }).first();

const createFormat = async (data) => {
  // Compute next sort order if not provided
  if (data.sort_order === undefined) {
    const max = await db(FORMATS_TABLE).max('sort_order as max').first();
    data.sort_order = (max?.max ?? -1) + 1;
  }
  const [created] = await db(FORMATS_TABLE).insert(data).returning('*');
  return created;
};

const updateFormat = async (id, data) => {
  const [updated] = await db(FORMATS_TABLE)
    .where({ id })
    .update({ ...data, updated_at: db.fn.now() })
    .returning('*');
  return updated;
};

const deleteFormat = async (id) => db(FORMATS_TABLE).where({ id }).delete();

const reorderFormat = async (id, direction) => {
  const item = await findFormatById(id);
  if (!item) return;

  const neighbour = await db(FORMATS_TABLE)
    .where(direction === 'up' ? 'sort_order' : 'sort_order', direction === 'up' ? '<' : '>', item.sort_order)
    .orderBy('sort_order', direction === 'up' ? 'desc' : 'asc')
    .first();

  if (!neighbour) return;

  const currentOrder = item.sort_order;
  const targetOrder = neighbour.sort_order;

  await db.transaction(async (trx) => {
    await trx(FORMATS_TABLE).where({ id: item.id }).update({ sort_order: targetOrder });
    await trx(FORMATS_TABLE).where({ id: neighbour.id }).update({ sort_order: currentOrder });
  });
};

/* ── Device Preset Sizes ─────────────────────────────────────────────────────── */

const findAllPresets = async ({ includeInactive = false, formatId = null } = {}) => {
  const q = db(PRESETS_TABLE).orderBy('sort_order', 'asc').orderBy('name', 'asc');
  if (!includeInactive) q.where({ is_active: true });
  if (formatId) q.where({ format_id: formatId });
  return q;
};

const findPresetById = async (id) => db(PRESETS_TABLE).where({ id }).first();

const createPreset = async (data) => {
  if (data.sort_order === undefined) {
    const max = await db(PRESETS_TABLE).max('sort_order as max').first();
    data.sort_order = (max?.max ?? -1) + 1;
  }
  const [created] = await db(PRESETS_TABLE).insert(data).returning('*');
  return created;
};

const updatePreset = async (id, data) => {
  const [updated] = await db(PRESETS_TABLE)
    .where({ id })
    .update({ ...data, updated_at: db.fn.now() })
    .returning('*');
  return updated;
};

const deletePreset = async (id) => db(PRESETS_TABLE).where({ id }).delete();

const reorderPreset = async (id, direction) => {
  const item = await findPresetById(id);
  if (!item) return;

  const neighbour = await db(PRESETS_TABLE)
    .where(direction === 'up' ? 'sort_order' : 'sort_order', direction === 'up' ? '<' : '>', item.sort_order)
    .orderBy('sort_order', direction === 'up' ? 'desc' : 'asc')
    .first();

  if (!neighbour) return;

  const currentOrder = item.sort_order;
  const targetOrder = neighbour.sort_order;

  await db.transaction(async (trx) => {
    await trx(PRESETS_TABLE).where({ id: item.id }).update({ sort_order: targetOrder });
    await trx(PRESETS_TABLE).where({ id: neighbour.id }).update({ sort_order: currentOrder });
  });
};

/* ── Unified Public Data ────────────────────────────────────────────────────── */

const getPublicFormatsAndPresets = async () => {
  const [formats, presets] = await Promise.all([
    findAllFormats(false),
    findAllPresets({ includeInactive: false }),
  ]);

  return {
    formats,
    presets: {
      standard: presets.filter((p) => p.is_standard),
      more: presets.filter((p) => !p.is_standard),
      all: presets,
    },
  };
};

module.exports = {
  findAllFormats,
  findFormatById,
  findFormatBySlug,
  createFormat,
  updateFormat,
  deleteFormat,
  reorderFormat,

  findAllPresets,
  findPresetById,
  createPreset,
  updatePreset,
  deletePreset,
  reorderPreset,

  getPublicFormatsAndPresets,
};
