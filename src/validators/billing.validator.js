// src/validators/billing.validator.js — Joi schemas for billing endpoints
'use strict';

const Joi = require('joi');

const urlWithStripePlaceholder = Joi.string()
  .custom((value, helpers) => {
    if (!value) return value;
    const testUrl = value.replace(/\{CHECKOUT_SESSION_ID\}/g, 'CHECKOUT_SESSION_ID');
    try {
      const parsed = new URL(testUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return helpers.error('string.uriCustom');
      }
      return value;
    } catch {
      return helpers.error('string.uriCustom');
    }
  })
  .messages({
    'string.uriCustom': '{{#label}} must be a valid http or https URL',
  })
  .allow(null, '');

const createCheckoutSessionSchema = Joi.object({
  planId: Joi.string().required(),
  successUrl: urlWithStripePlaceholder,
  cancelUrl: urlWithStripePlaceholder,
});

const verifySessionSchema = Joi.object({
  sessionId: Joi.string().min(5).max(255).required(),
});

const customerPortalSchema = Joi.object({
  returnUrl: urlWithStripePlaceholder,
});

const cancelSubscriptionSchema = Joi.object({
  immediately: Joi.boolean().default(false),
});

const listSubscriptionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(0).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('all', 'active', 'canceled', 'past_due', 'trialing', 'incomplete').default('all'),
  plan: Joi.string().allow('', 'all'),
  search: Joi.string().max(100).trim().allow('', null),
  q: Joi.string().max(100).trim().allow('', null),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'current_period_end', 'plan', 'status', 'user_name', 'user_email').default('created_at'),
  sort_by: Joi.string().valid('created_at', 'updated_at', 'current_period_end', 'plan', 'status', 'user_name', 'user_email'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  sort_order: Joi.string().valid('asc', 'desc'),
});

const adminCancelSubscriptionSchema = Joi.object({
  immediately: Joi.boolean().default(false),
  reason: Joi.string().max(255).allow('', null),
});

const adminRefundSubscriptionSchema = Joi.object({
  amount: Joi.number().min(0).allow(null),
  reason: Joi.string().max(255).allow('', null),
});

const createPlanSchema = Joi.object({
  id: Joi.string().min(2).max(64).regex(/^[a-z0-9_-]+$/).required(),
  name: Joi.string().min(2).max(128).required(),
  description: Joi.string().allow('', null),
  price_monthly: Joi.number().integer().min(0).default(0),
  price_yearly: Joi.number().integer().min(0).default(0),
  currency: Joi.string().default('usd'),
  design_limit: Joi.number().integer().min(-1).default(3),
  storage_limit_mb: Joi.number().integer().min(-1).default(100),
  max_seats: Joi.number().integer().min(-1).default(1),
  can_export_4k: Joi.boolean().default(false),
  has_brand_kits: Joi.boolean().default(false),
  has_priority_support: Joi.boolean().default(false),
  features: Joi.array().items(Joi.string()).default([]),
  is_active: Joi.boolean().default(true),
  is_custom: Joi.boolean().default(false),
  sort_order: Joi.number().integer().default(0),
});

const updatePlanSchema = Joi.object({
  name: Joi.string().min(2).max(128),
  description: Joi.string().allow('', null),
  price_monthly: Joi.number().integer().min(0),
  price_yearly: Joi.number().integer().min(0),
  currency: Joi.string(),
  design_limit: Joi.number().integer().min(-1),
  storage_limit_mb: Joi.number().integer().min(-1),
  max_seats: Joi.number().integer().min(-1),
  can_export_4k: Joi.boolean(),
  has_brand_kits: Joi.boolean(),
  has_priority_support: Joi.boolean(),
  features: Joi.array().items(Joi.string()),
  is_active: Joi.boolean(),
  is_custom: Joi.boolean(),
  sort_order: Joi.number().integer(),
});

const adminChangePlanSchema = Joi.object({
  newPlanId: Joi.string().min(2).max(64).required(),
  prorationBehavior: Joi.string().valid('create_prorations', 'none', 'always_invoice').default('create_prorations'),
});

const adminExtendSubscriptionSchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).default(30),
  reason: Joi.string().max(255).allow('', null),
});

module.exports = {
  createCheckoutSessionSchema,
  verifySessionSchema,
  customerPortalSchema,
  cancelSubscriptionSchema,
  listSubscriptionsQuerySchema,
  adminCancelSubscriptionSchema,
  adminRefundSubscriptionSchema,
  adminChangePlanSchema,
  adminExtendSubscriptionSchema,
  createPlanSchema,
  updatePlanSchema,
};
