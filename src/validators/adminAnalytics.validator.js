// src/validators/adminAnalytics.validator.js — Joi schemas for admin analytics routes
'use strict';

const Joi = require('joi');

const overviewQuerySchema = Joi.object({
  range: Joi.string().valid('30d', '90d', '6m', '12m', 'ytd').default('12m'),
  env: Joi.string().valid('live', 'test', 'all').default('live'),
  plan: Joi.string().valid('all', 'paid', 'free', 'pro', 'studio', 'enterprise').default('all'),
});

const broadcastBodySchema = Joi.object({
  title: Joi.string().min(3).max(120).required().trim(),
  message: Joi.string().min(5).max(1000).required().trim(),
  type: Joi.string().valid('info', 'warning', 'announcement', 'success').default('info'),
});

const reportQuerySchema = Joi.object({
  range: Joi.string().valid('30d', '90d', '6m', '12m', 'ytd').default('12m'),
  format: Joi.string().valid('csv', 'json').default('csv'),
});

module.exports = {
  overviewQuerySchema,
  broadcastBodySchema,
  reportQuerySchema,
};
