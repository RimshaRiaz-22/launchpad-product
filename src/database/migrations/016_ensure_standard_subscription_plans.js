// src/database/migrations/016_ensure_standard_subscription_plans.js — Ensure standard subscription plans exist
'use strict';

/**
 * Standard subscription plans definition.
 * Ensures free, pro, team, and enterprise plans exist even if the table was previously created.
 */
exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable('subscription_plans');
  if (!hasTable) return;

  const standardPlans = [
    {
      id: 'free',
      name: 'Free',
      description: 'For individuals exploring mockups and standard exports.',
      price_monthly: 0,
      price_yearly: 0,
      currency: 'usd',
      design_limit: 5,
      storage_limit_mb: 100,
      max_seats: 1,
      can_export_4k: false,
      has_brand_kits: true,
      has_priority_support: false,
      features: JSON.stringify([
        '5 active design projects',
        '100 mb cloud storage',
        '1 team collaborator seats',
        'Ultra HD / 4K lossless exports',
        'Shared brand kits & typography',
      ]),
      is_active: true,
      is_custom: false,
      sort_order: 1,
    },
    {
      id: 'pro',
      name: 'Pro Designer',
      description: 'For power designers needing 4K exports and ultra-fast generation.',
      price_monthly: 1200,
      price_yearly: 11500,
      currency: 'usd',
      design_limit: -1,
      storage_limit_mb: 10240,
      max_seats: 1,
      can_export_4k: true,
      has_brand_kits: false,
      has_priority_support: true,
      features: JSON.stringify([
        'Unlimited design projects',
        'Ultra HD & SVG exports (up to 4K)',
        '10 GB asset storage',
        'All premium templates included',
        'Priority AI generation & enhancements',
      ]),
      is_active: true,
      is_custom: false,
      sort_order: 2,
    },
    {
      id: 'team',
      name: 'Team Studio',
      description: 'For design agencies and collaborative teams with brand kits.',
      price_monthly: 4900,
      price_yearly: 47000,
      currency: 'usd',
      design_limit: -1,
      storage_limit_mb: 102400,
      max_seats: 10,
      can_export_4k: true,
      has_brand_kits: true,
      has_priority_support: true,
      features: JSON.stringify([
        'Everything in Pro',
        'Up to 10 team seats with role permissions',
        '100 GB asset storage',
        'Shared team workspace & brand kits',
        'Dedicated priority support',
      ]),
      is_active: true,
      is_custom: false,
      sort_order: 3,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Scale',
      description: 'Dedicated infrastructure, custom SLAs, and SAML SSO for orgs.',
      price_monthly: 0,
      price_yearly: 0,
      currency: 'usd',
      design_limit: -1,
      storage_limit_mb: -1,
      max_seats: -1,
      can_export_4k: true,
      has_brand_kits: true,
      has_priority_support: true,
      features: JSON.stringify([
        'Custom SLA & dedicated infrastructure',
        'Unlimited storage & team seats',
        'Custom fonts, templates & SSO (SAML/Okta)',
        'Dedicated account manager & custom invoicing',
      ]),
      is_active: true,
      is_custom: true,
      sort_order: 4,
    },
  ];

  for (const plan of standardPlans) {
    const existing = await knex('subscription_plans').where({ id: plan.id }).first();
    if (!existing) {
      await knex('subscription_plans').insert(plan);
    }
  }
};

exports.down = async function (knex) {
  // Safe down: do nothing to prevent cascading deletes on live subscriptions
};
