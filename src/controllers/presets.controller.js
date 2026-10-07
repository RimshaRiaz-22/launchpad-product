// src/controllers/presets.controller.js — Request handlers for showcase formats & device presets
'use strict';

const presetsService = require('../services/presets.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/* ── Public Combined ────────────────────────────────────────────────────────── */

const getPublicPresets = asyncHandler(async (req, res) => {
  const data = await presetsService.getPublicData();
  return ApiResponse.success(res, data, 'Showcase formats and device presets retrieved successfully');
});

/* ── Formats ────────────────────────────────────────────────────────────────── */

const listFormats = asyncHandler(async (req, res) => {
  const includeInactive = req.query.include_inactive === 'true';
  const formats = await presetsService.listFormats(includeInactive);
  return ApiResponse.success(res, { formats }, 'Showcase formats retrieved successfully');
});

const getFormat = asyncHandler(async (req, res) => {
  const format = await presetsService.getFormat(req.params.id);
  return ApiResponse.success(res, { format }, 'Showcase format retrieved successfully');
});

const createFormat = asyncHandler(async (req, res) => {
  const format = await presetsService.createFormat(req.body);
  return ApiResponse.created(res, { format }, 'Showcase format created successfully');
});

const updateFormat = asyncHandler(async (req, res) => {
  const format = await presetsService.updateFormat(req.params.id, req.body);
  return ApiResponse.success(res, { format }, 'Showcase format updated successfully');
});

const deleteFormat = asyncHandler(async (req, res) => {
  await presetsService.deleteFormat(req.params.id);
  return ApiResponse.success(res, null, 'Showcase format deleted successfully');
});

const reorderFormat = asyncHandler(async (req, res) => {
  await presetsService.reorderFormat(req.params.id, req.body.direction);
  return ApiResponse.success(res, null, 'Showcase format reordered successfully');
});

/* ── Device Presets ─────────────────────────────────────────────────────────── */

const listPresets = asyncHandler(async (req, res) => {
  const includeInactive = req.query.include_inactive === 'true';
  const formatId = req.query.format_id || null;
  const presets = await presetsService.listPresets({ includeInactive, formatId });
  return ApiResponse.success(res, { presets }, 'Device presets retrieved successfully');
});

const getPreset = asyncHandler(async (req, res) => {
  const preset = await presetsService.getPreset(req.params.id);
  return ApiResponse.success(res, { preset }, 'Device preset retrieved successfully');
});

const createPreset = asyncHandler(async (req, res) => {
  const preset = await presetsService.createPreset(req.body);
  return ApiResponse.created(res, { preset }, 'Device preset created successfully');
});

const updatePreset = asyncHandler(async (req, res) => {
  const preset = await presetsService.updatePreset(req.params.id, req.body);
  return ApiResponse.success(res, { preset }, 'Device preset updated successfully');
});

const deletePreset = asyncHandler(async (req, res) => {
  await presetsService.deletePreset(req.params.id);
  return ApiResponse.success(res, null, 'Device preset deleted successfully');
});

const reorderPreset = asyncHandler(async (req, res) => {
  await presetsService.reorderPreset(req.params.id, req.body.direction);
  return ApiResponse.success(res, null, 'Device preset reordered successfully');
});

module.exports = {
  getPublicPresets,

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
};
