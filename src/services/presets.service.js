// src/services/presets.service.js — Business logic for showcase formats & device presets
'use strict';

const presetsRepo = require('../repositories/presets.repository');
const ApiError = require('../utils/ApiError');
const memoryCache = require('../utils/memoryCache');

const CACHE_PREFIX = 'presets:';

const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ── Formats ────────────────────────────────────────────────────────────────── */

const listFormats = async (includeInactive = false) => {
  return memoryCache.wrap(`${CACHE_PREFIX}formats:${includeInactive}`, 300, () =>
    presetsRepo.findAllFormats(includeInactive)
  );
};

const getFormat = async (id) => {
  const item = await presetsRepo.findFormatById(id);
  if (!item) throw ApiError.notFound('Showcase format not found', 'FORMAT_NOT_FOUND');
  return item;
};

const createFormat = async (data) => {
  if (!data.name || !data.name.trim()) {
    throw ApiError.badRequest('Format name is required', 'NAME_REQUIRED');
  }
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const existing = await presetsRepo.findFormatBySlug(slug);
  if (existing) {
    throw ApiError.conflict('A showcase format with this name/slug already exists', 'FORMAT_EXISTS');
  }

  const created = await presetsRepo.createFormat({
    name: data.name.trim(),
    slug,
    description: data.description ? data.description.trim() : null,
    badge_text: data.badge_text ? data.badge_text.trim() : null,
    badge_color: data.badge_color || '#10B981',
    visual_type: data.visual_type || 'app-store',
    image_url: data.image_url || null,
    gradient: data.gradient || null,
    sort_order: data.sort_order,
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
  });
  memoryCache.delPrefix(CACHE_PREFIX);
  return created;
};

const updateFormat = async (id, data) => {
  const existing = await presetsRepo.findFormatById(id);
  if (!existing) throw ApiError.notFound('Showcase format not found', 'FORMAT_NOT_FOUND');

  const payload = {};
  if (data.name !== undefined) payload.name = data.name.trim();
  if (data.description !== undefined) payload.description = data.description ? data.description.trim() : null;
  if (data.badge_text !== undefined) payload.badge_text = data.badge_text ? data.badge_text.trim() : null;
  if (data.badge_color !== undefined) payload.badge_color = data.badge_color;
  if (data.visual_type !== undefined) payload.visual_type = data.visual_type;
  if (data.image_url !== undefined) payload.image_url = data.image_url;
  if (data.gradient !== undefined) payload.gradient = data.gradient;
  if (data.is_active !== undefined) payload.is_active = Boolean(data.is_active);
  if (data.sort_order !== undefined) payload.sort_order = Number(data.sort_order);

  if (data.slug && data.slug !== existing.slug) {
    const slug = slugify(data.slug);
    const conflict = await presetsRepo.findFormatBySlug(slug);
    if (conflict && conflict.id !== id) {
      throw ApiError.conflict('A showcase format with this slug already exists', 'FORMAT_EXISTS');
    }
    payload.slug = slug;
  }

  const updated = await presetsRepo.updateFormat(id, payload);
  memoryCache.delPrefix(CACHE_PREFIX);
  return updated;
};

const deleteFormat = async (id) => {
  const existing = await presetsRepo.findFormatById(id);
  if (!existing) throw ApiError.notFound('Showcase format not found', 'FORMAT_NOT_FOUND');
  await presetsRepo.deleteFormat(id);
  memoryCache.delPrefix(CACHE_PREFIX);
  return true;
};

const reorderFormat = async (id, direction) => {
  if (!['up', 'down'].includes(direction)) {
    throw ApiError.badRequest('Direction must be "up" or "down"', 'INVALID_DIRECTION');
  }
  await presetsRepo.reorderFormat(id, direction);
  memoryCache.delPrefix(CACHE_PREFIX);
  return true;
};

/* ── Device Presets ──────────────────────────────────────────────────────────── */

const listPresets = async (options = {}) => {
  return presetsRepo.findAllPresets(options);
};

const getPreset = async (id) => {
  const item = await presetsRepo.findPresetById(id);
  if (!item) throw ApiError.notFound('Device preset not found', 'PRESET_NOT_FOUND');
  return item;
};

const createPreset = async (data) => {
  if (!data.name || !data.name.trim()) {
    throw ApiError.badRequest('Preset name is required', 'NAME_REQUIRED');
  }
  const width = parseInt(data.width, 10);
  const height = parseInt(data.height, 10);
  if (isNaN(width) || width <= 0 || isNaN(height) || height <= 0) {
    throw ApiError.badRequest('Width and height must be positive integers', 'INVALID_DIMENSIONS');
  }

  const baseSlug = data.slug ? slugify(data.slug) : slugify(data.name);
  const slug = `${baseSlug}-${width}x${height}`;

  const created = await presetsRepo.createPreset({
    name: data.name.trim(),
    slug,
    width,
    height,
    device_type: data.device_type || 'smartphone',
    format_id: data.format_id || null,
    is_standard: data.is_standard !== undefined ? Boolean(data.is_standard) : true,
    sort_order: data.sort_order,
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
  });
  memoryCache.delPrefix(CACHE_PREFIX);
  return created;
};

const updatePreset = async (id, data) => {
  const existing = await presetsRepo.findPresetById(id);
  if (!existing) throw ApiError.notFound('Device preset not found', 'PRESET_NOT_FOUND');

  const payload = {};
  if (data.name !== undefined) payload.name = data.name.trim();
  if (data.width !== undefined) {
    const w = parseInt(data.width, 10);
    if (isNaN(w) || w <= 0) throw ApiError.badRequest('Width must be positive', 'INVALID_WIDTH');
    payload.width = w;
  }
  if (data.height !== undefined) {
    const h = parseInt(data.height, 10);
    if (isNaN(h) || h <= 0) throw ApiError.badRequest('Height must be positive', 'INVALID_HEIGHT');
    payload.height = h;
  }
  if (data.device_type !== undefined) payload.device_type = data.device_type;
  if (data.format_id !== undefined) payload.format_id = data.format_id || null;
  if (data.is_standard !== undefined) payload.is_standard = Boolean(data.is_standard);
  if (data.is_active !== undefined) payload.is_active = Boolean(data.is_active);
  if (data.sort_order !== undefined) payload.sort_order = Number(data.sort_order);

  const updated = await presetsRepo.updatePreset(id, payload);
  memoryCache.delPrefix(CACHE_PREFIX);
  return updated;
};

const deletePreset = async (id) => {
  const existing = await presetsRepo.findPresetById(id);
  if (!existing) throw ApiError.notFound('Device preset not found', 'PRESET_NOT_FOUND');
  await presetsRepo.deletePreset(id);
  memoryCache.delPrefix(CACHE_PREFIX);
  return true;
};

const reorderPreset = async (id, direction) => {
  if (!['up', 'down'].includes(direction)) {
    throw ApiError.badRequest('Direction must be "up" or "down"', 'INVALID_DIRECTION');
  }
  await presetsRepo.reorderPreset(id, direction);
  memoryCache.delPrefix(CACHE_PREFIX);
  return true;
};

const getPublicData = async () => {
  return memoryCache.wrap(`${CACHE_PREFIX}public_all`, 300, () =>
    presetsRepo.getPublicFormatsAndPresets()
  );
};

module.exports = {
  listFormats,
  getFormat,
  createFormat,
  updateFormat,
  deleteFormat,
  reorderFormat,

  listPresets,
  getPreset,
  createPreset,
  updatePreset,
  deletePreset,
  reorderPreset,

  getPublicData,
};
