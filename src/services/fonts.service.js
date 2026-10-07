// src/services/fonts.service.js — Business logic for fonts
'use strict';

const fontsRepo = require('../repositories/fonts.repository');
const ApiError = require('../utils/ApiError');

const listFonts = async (filters) => {
  return fontsRepo.findMany(filters);
};

const getFontById = async (id) => {
  const font = await fontsRepo.findById(id);
  if (!font) {
    throw ApiError.notFound(`Font "${id}" not found`);
  }
  return font;
};

const getCategories = async () => {
  return fontsRepo.getCategories();
};

const createFont = async (userId, data) => {
  const payload = {
    id: data.id || `font-${Date.now()}`,
    user_id: userId,
    name: data.name,
    family: data.family || `"${data.name}"`,
    category: data.category || 'custom',
    font_url: data.font_url || null,
    weights: typeof data.weights === 'string' ? data.weights : JSON.stringify(data.weights || [400, 700]),
    is_builtin: false,
  };

  return fontsRepo.create(payload);
};

const deleteFont = async (id, userId, userRole) => {
  const font = await fontsRepo.findById(id);
  if (!font) {
    throw ApiError.notFound(`Font "${id}" not found`);
  }

  if (font.is_builtin && String(userRole || '').toLowerCase() !== 'admin') {
    throw ApiError.forbidden('Cannot delete system built-in fonts');
  }

  if (font.user_id && font.user_id !== userId && String(userRole || '').toLowerCase() !== 'admin') {
    throw ApiError.forbidden('You do not have permission to delete this font');
  }

  await fontsRepo.remove(id);
  return { success: true, id };
};

module.exports = {
  listFonts,
  getFontById,
  getCategories,
  createFont,
  deleteFont,
};
