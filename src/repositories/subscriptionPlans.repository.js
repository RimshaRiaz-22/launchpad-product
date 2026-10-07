// src/repositories/subscriptionPlans.repository.js — Data access for subscription_plans table
'use strict';

const db = require('../database/knex');

const TABLE = 'subscription_plans';

/**
 * Retrieve all subscription plans ordered by sort_order
 */
const findAll = async (onlyActive = false) => {
  let query = db(TABLE).select('*').orderBy('sort_order', 'asc');
  if (onlyActive) {
    query = query.where({ is_active: true });
  }
  const plans = await query;
  return plans.map((p) => ({
    ...p,
    features: Array.isArray(p.features)
      ? p.features
      : typeof p.features === 'string'
      ? JSON.parse(p.features || '[]')
      : [],
  }));
};

/**
 * Find plan by its slug / ID (e.g. 'free', 'pro', 'team', 'enterprise')
 */
const findById = async (id) => {
  const plan = await db(TABLE).where({ id }).first();
  if (!plan) return null;
  return {
    ...plan,
    features: Array.isArray(plan.features)
      ? plan.features
      : typeof plan.features === 'string'
      ? JSON.parse(plan.features || '[]')
      : [],
  };
};

/**
 * Retrieve all plans with live subscriber counts from PostgreSQL
 */
const findAllWithSubscriberCounts = async () => {
  const plans = await findAll(false);

  // Group active subscriptions by plan
  const subCounts = await db('subscriptions')
    .select('plan')
    .count('id as count')
    .whereIn('status', ['active', 'trialing'])
    .groupBy('plan');

  const countMap = {};
  subCounts.forEach((row) => {
    countMap[row.plan] = parseInt(row.count || '0', 10);
  });

  // Also count users by plan in case subscriptions table doesn't have free plan rows
  const userCounts = await db('users')
    .select('plan')
    .count('id as count')
    .groupBy('plan');

  const userCountMap = {};
  userCounts.forEach((row) => {
    userCountMap[row.plan] = parseInt(row.count || '0', 10);
  });

  return plans.map((plan) => {
    const subscriberCount = countMap[plan.id] || (plan.id === 'free' ? userCountMap['free'] || 0 : 0);
    return {
      ...plan,
      subscriber_count: subscriberCount,
      total_users_count: userCountMap[plan.id] || 0,
    };
  });
};

/**
 * Create a new subscription plan
 */
const create = async (data) => {
  const payload = {
    ...data,
    features: Array.isArray(data.features) ? JSON.stringify(data.features) : (data.features || '[]'),
  };
  const [created] = await db(TABLE).insert(payload).returning('*');
  return {
    ...created,
    features: Array.isArray(created.features)
      ? created.features
      : typeof created.features === 'string'
      ? JSON.parse(created.features || '[]')
      : [],
  };
};

/**
 * Update an existing subscription plan
 */
const update = async (id, data) => {
  const payload = { ...data };
  if (payload.features !== undefined) {
    payload.features = Array.isArray(payload.features) ? JSON.stringify(payload.features) : payload.features;
  }
  const [updated] = await db(TABLE)
    .where({ id })
    .update({ ...payload, updated_at: db.fn.now() })
    .returning('*');
  if (!updated) return null;
  return {
    ...updated,
    features: Array.isArray(updated.features)
      ? updated.features
      : typeof updated.features === 'string'
      ? JSON.parse(updated.features || '[]')
      : [],
  };
};

/**
 * Find plan by its associated Stripe Price ID or Product ID
 */
const findByStripePriceOrProduct = async (priceId, productId) => {
  let query = db(TABLE);
  if (priceId && productId) {
    query = query.where(function () {
      this.where({ stripe_price_id_monthly: priceId })
        .orWhere({ stripe_price_id_yearly: priceId })
        .orWhere({ stripe_product_id: productId });
    });
  } else if (priceId) {
    query = query.where(function () {
      this.where({ stripe_price_id_monthly: priceId })
        .orWhere({ stripe_price_id_yearly: priceId });
    });
  } else if (productId) {
    query = query.where({ stripe_product_id: productId });
  } else {
    return null;
  }
  const plan = await query.first();
  if (!plan) return null;
  return {
    ...plan,
    features: Array.isArray(plan.features)
      ? plan.features
      : typeof plan.features === 'string'
      ? JSON.parse(plan.features || '[]')
      : [],
  };
};

/**
 * Delete or toggle plan
 */
const remove = async (id) => {
  return db(TABLE).where({ id }).del();
};

module.exports = {
  findAll,
  findById,
  findAllWithSubscriberCounts,
  findByStripePriceOrProduct,
  create,
  update,
  remove,
};

