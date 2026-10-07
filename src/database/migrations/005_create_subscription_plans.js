// src/database/migrations/005_create_subscription_plans.js — Dynamic Subscription Plans & Entitlements
'use strict';

exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable('subscription_plans');
  if (!hasTable) {
    await knex.schema.createTable('subscription_plans', (table) => {
      table.string('id', 64).primary(); // slug: 'free', 'pro', 'team', 'enterprise', etc.
      table.string('name', 128).notNullable();
      table.text('description').nullable();
      table.integer('price_monthly').defaultTo(0); // in cents, e.g. 1200 for $12/mo
      table.integer('price_yearly').defaultTo(0); // in cents, e.g. 11500 for $115/yr
      table.string('currency', 10).defaultTo('usd');
      table.string('stripe_product_id', 128).nullable();
      table.string('stripe_price_id_monthly', 128).nullable();
      table.string('stripe_price_id_yearly', 128).nullable();
      table.integer('design_limit').defaultTo(3); // -1 = unlimited
      table.bigInteger('storage_limit_mb').defaultTo(100); // in MB, -1 = unlimited
      table.integer('max_seats').defaultTo(1); // -1 = unlimited
      table.boolean('can_export_4k').defaultTo(false);
      table.boolean('has_brand_kits').defaultTo(false);
      table.boolean('has_priority_support').defaultTo(false);
      table.jsonb('features').defaultTo('[]');
      table.boolean('is_active').defaultTo(true);
      table.boolean('is_custom').defaultTo(false);
      table.integer('sort_order').defaultTo(0);
      table.timestamps(true, true);
    });
  }

  // Seed default tiers if table is empty
  const countRes = await knex('subscription_plans').count('id as count').first();
  const count = parseInt(countRes?.count || '0', 10);

  if (count === 0) {
    await knex('subscription_plans').insert([
      {
        id: 'free',
        name: 'Free Starter',
        description: 'For individuals exploring mockups and standard exports.',
        price_monthly: 0,
        price_yearly: 0,
        currency: 'usd',
        design_limit: 3,
        storage_limit_mb: 100,
        max_seats: 1,
        can_export_4k: false,
        has_brand_kits: false,
        has_priority_support: false,
        features: JSON.stringify([
          '3 active design projects',
          'Standard export (PNG, JPEG up to 1080p)',
          '100 MB asset storage',
          'Access to standard templates',
        ]),
        is_active: true,
        is_custom: false,
        sort_order: 1,
      },
      {
        id: 'pro',
        name: 'Pro Designer',
        description: 'For power designers needing 4K exports and ultra-fast generation.',
        price_monthly: 1200, // $12.00
        price_yearly: 11500, // $115.00
        currency: 'usd',
        design_limit: -1, // unlimited
        storage_limit_mb: 10240, // 10 GB
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
        price_monthly: 4900, // $49.00
        price_yearly: 47000, // $470.00
        currency: 'usd',
        design_limit: -1,
        storage_limit_mb: 102400, // 100 GB
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
    ]);
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('subscription_plans');
};
