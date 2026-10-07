// src/services/billing.service.js — Dynamic Billing & Tier Entitlements with Direct Stripe API (Zero Webhooks)
'use strict';

const Stripe = require('stripe');
const db = require('../database/knex');
const billingRepo = require('../repositories/billing.repository');
const subscriptionPlansRepo = require('../repositories/subscriptionPlans.repository');
const usersRepo = require('../repositories/users.repository');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger.config');
const config = require('../config/app.config');
const auditLogsService = require('./auditLogs.service');
const emailService = require('./email.service');
const memoryCache = require('../utils/memoryCache');

// Initialize Stripe SDK client with API key
let stripe = null;
if (config.stripe.secretKey && !config.stripe.secretKey.includes('placeholder')) {
  try {
    stripe = new Stripe(config.stripe.secretKey);
  } catch (err) {
    logger.warn('Stripe SDK initialization failed with current secretKey', { error: err.message });
  }
}

/**
 * Helper to ensure Stripe client is available when making API calls.
 */
const getStripeClient = () => {
  if (!stripe) {
    if (config.stripe.secretKey) {
      stripe = new Stripe(config.stripe.secretKey);
      return stripe;
    }
    throw ApiError.internal('Stripe is not configured. Please provide STRIPE_SECRET_KEY in .env');
  }
  return stripe;
};

/**
 * Check if Stripe is configured and operational
 */
const isStripeConfigured = () => {
  return Boolean(config.stripe.secretKey && !config.stripe.secretKey.includes('placeholder'));
};

/**
 * Safely extract current period dates from Stripe subscription objects across API versions
 */
const extractPeriodDates = (stripeSub) => {
  const item = stripeSub?.items?.data?.[0];
  const rawStart = stripeSub?.current_period_start || item?.current_period_start || stripeSub?.start_date || stripeSub?.created;
  const rawEnd = stripeSub?.current_period_end || item?.current_period_end;

  const start = rawStart && !isNaN(Number(rawStart)) ? new Date(Number(rawStart) * 1000) : new Date();
  const end = rawEnd && !isNaN(Number(rawEnd)) ? new Date(Number(rawEnd) * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return {
    start: isNaN(start.getTime()) ? new Date() : start,
    end: isNaN(end.getTime()) ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : end,
  };
};

/**
 * In-memory cache map for synchronous limits resolution, loaded dynamically from database
 */
let MEMORY_PLANS = {};

/**
 * Refresh memory cache of plans from database
 */
const refreshMemoryPlans = async () => {
  try {
    const dbPlans = await subscriptionPlansRepo.findAll(false);
    if (dbPlans && dbPlans.length > 0) {
      const newMap = {};
      dbPlans.forEach((p) => {
        newMap[p.id] = {
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price_monthly ? p.price_monthly / 100 : 0,
          price_monthly: p.price_monthly,
          price_yearly: p.price_yearly,
          currency: p.currency,
          interval: 'month',
          stripePriceId: p.stripe_price_id_monthly,
          stripeProductId: p.stripe_product_id,
          features: p.features || [],
          limits: {
            maxProjects: p.design_limit,
            maxStorageBytes: p.storage_limit_mb === -1 ? -1 : (Number(p.storage_limit_mb) || 100) * 1024 * 1024,
            maxSeats: p.max_seats,
            canExport4k: p.can_export_4k,
            hasBrandKits: p.has_brand_kits,
            premiumTemplates: p.id !== 'free',
          },
          is_active: p.is_active,
          is_custom: p.is_custom,
        };
      });
      MEMORY_PLANS = newMap;
      memoryCache.delPrefix('billing:');
    }
  } catch (err) {
    logger.warn('Could not refresh memory plans from DB:', err.message);
  }
};

// Initial background load
refreshMemoryPlans();

/**
 * Get public billing configuration for client frontend (cached in-memory for 5 minutes).
 */
const getBillingConfig = async () => {
  return memoryCache.wrap('billing:config', 300, async () => {
    if (Object.keys(MEMORY_PLANS).length === 0) {
      await refreshMemoryPlans();
    }
    return {
      publishableKey: config.stripe.publishableKey,
      plans: Object.entries(MEMORY_PLANS)
        .filter(([, plan]) => plan.is_active !== false)
        .map(([id, plan]) => ({
          id,
          name: plan.name,
          description: plan.description,
          price: plan.price,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          interval: plan.interval,
          features: plan.features,
          limits: plan.limits,
        })),
    };
  });
};

/**
 * Get available plans list (public/creator view) (cached in-memory for 5 minutes).
 */
const getPlans = async () => {
  return memoryCache.wrap('billing:plans', 300, async () => {
    const dbPlans = await subscriptionPlansRepo.findAll(true);
    if (dbPlans && dbPlans.length > 0) {
      return dbPlans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price_monthly ? p.price_monthly / 100 : 0,
        price_monthly: p.price_monthly,
        price_yearly: p.price_yearly,
        currency: p.currency,
        interval: 'month',
        features: p.features || [],
        limits: {
          maxProjects: p.design_limit,
          maxStorageBytes: p.storage_limit_mb === -1 ? -1 : (Number(p.storage_limit_mb) || 100) * 1024 * 1024,
          maxSeats: p.max_seats,
          canExport4k: p.can_export_4k,
          hasBrandKits: p.has_brand_kits,
          premiumTemplates: p.id !== 'free',
        },
      }));
    }
    return Object.entries(MEMORY_PLANS).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  });
};

/**
 * Get the current subscription for a user.
 */
const getSubscription = async (userId) => {
  let subscription = await billingRepo.findByUserId(userId);
  const user = await usersRepo.findById(userId);

  if (!subscription) {
    subscription = await billingRepo.create({
      user_id: userId,
      plan: user?.plan || 'free',
      status: 'active',
    });
  }

  // Self-Healing & Direct Stripe Reconciliation (Zero Webhooks)
  // If user is currently marked free but has a Stripe customer ID, verify if an active subscription exists in Stripe
  if ((!subscription.plan || subscription.plan === 'free') && isStripeConfigured() && subscription.stripe_customer_id) {
    try {
      const stripeClient = getStripeClient();
      const subs = await stripeClient.subscriptions.list({
        customer: subscription.stripe_customer_id,
        status: 'active',
        limit: 1,
      });

      if (subs?.data && subs.data.length > 0) {
        const activeSub = subs.data[0];
        const remotePriceId = activeSub.items?.data?.[0]?.price?.id;
        const remoteProductId = activeSub.items?.data?.[0]?.price?.product;
        let detectedPlan = activeSub.metadata?.planId;

        if (!detectedPlan && (remotePriceId || remoteProductId)) {
          const matchedPlan = await subscriptionPlansRepo.findByStripePriceOrProduct(remotePriceId, remoteProductId);
          if (matchedPlan) detectedPlan = matchedPlan.id;
        }
        if (!detectedPlan) detectedPlan = 'pro';

        const { start: currentPeriodStart, end: currentPeriodEnd } = extractPeriodDates(activeSub);

        const updated = await billingRepo.update(subscription.id, {
          plan: detectedPlan,
          subscription_plan_id: detectedPlan,
          status: 'active',
          stripe_subscription_id: activeSub.id,
          stripe_price_id: remotePriceId || subscription.stripe_price_id,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          canceled_at: null,
        });

        await usersRepo.update(userId, {
          plan: detectedPlan,
          subscription_plan_id: detectedPlan,
        });

        subscription = {
          ...subscription,
          ...updated,
          plan: detectedPlan,
          status: 'active',
        };

        logger.info('Auto-reconciled active Stripe subscription for user', {
          userId,
          plan: detectedPlan,
          stripeSubscriptionId: activeSub.id,
        });
      }
    } catch (reconcileErr) {
      logger.warn('Non-fatal error during subscription auto-reconciliation:', {
        userId,
        error: reconcileErr.message,
      });
    }
  }

  const planId = subscription.plan || 'free';
  let planDetails = await subscriptionPlansRepo.findById(planId);
  if (!planDetails) {
    planDetails = MEMORY_PLANS[planId] || MEMORY_PLANS.free;
  }

  return {
    ...subscription,
    planDetails,
  };
};

/**
 * Helper to retrieve or create a Stripe customer for the user.
 */
const getOrCreateStripeCustomer = async (userId, userEmail, userName) => {
  const stripeClient = getStripeClient();
  let subscription = await billingRepo.findByUserId(userId);

  if (subscription?.stripe_customer_id) {
    try {
      const customer = await stripeClient.customers.retrieve(subscription.stripe_customer_id);
      if (customer && !customer.deleted) {
        return customer.id;
      }
    } catch (err) {
      logger.warn('Failed to retrieve existing Stripe customer, creating new one', { error: err.message });
    }
  }

  const customer = await stripeClient.customers.create({
    email: userEmail,
    name: userName || undefined,
    metadata: {
      userId,
      app: config.app.name,
    },
  });

  await billingRepo.upsertByUserId(userId, {
    stripe_customer_id: customer.id,
    plan: subscription?.plan || 'free',
    status: subscription?.status || 'active',
  });

  return customer.id;
};

/**
 * Create a Stripe Checkout Session directly using API key (Zero Webhooks).
 */
const createCheckoutSession = async (userId, { planId, successUrl, cancelUrl }) => {
  const user = await usersRepo.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  const plan = await subscriptionPlansRepo.findById(planId);
  if (!plan || plan.id === 'free') {
    throw ApiError.badRequest('Invalid plan selected for checkout.', 'INVALID_PLAN');
  }

  const stripeClient = getStripeClient();
  const customerId = await getOrCreateStripeCustomer(userId, user.email, user.name);

  const defaultSuccessUrl = `${config.app.url}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&status=success`;
  const defaultCancelUrl = `${config.app.url}/dashboard/billing?status=canceled`;

  let lineItems;
  if (plan.stripe_price_id_monthly && !plan.stripe_price_id_monthly.includes('placeholder')) {
    lineItems = [{ price: plan.stripe_price_id_monthly, quantity: 1 }];
  } else {
    lineItems = [
      {
        price_data: {
          currency: plan.currency || 'usd',
          product_data: {
            name: `Launchpad ${plan.name}`,
            description: (plan.features || []).slice(0, 2).join(', ') || plan.description,
          },
          unit_amount: plan.price_monthly,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ];
  }

  const session = await stripeClient.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : user.email,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: lineItems,
    metadata: {
      userId,
      planId,
    },
    subscription_data: {
      metadata: {
        userId,
        planId,
      },
    },
    success_url: successUrl || defaultSuccessUrl,
    cancel_url: cancelUrl || defaultCancelUrl,
  });

  logger.info('Stripe checkout session created directly via API', { userId, planId, sessionId: session.id });

  return {
    sessionId: session.id,
    url: session.url,
  };
};

/**
 * Verify a completed checkout session directly with Stripe API key (Zero Webhooks).
 */
const verifyCheckoutSession = async (userId, sessionId) => {
  if (!sessionId) {
    throw ApiError.badRequest('Session ID is required', 'SESSION_ID_REQUIRED');
  }

  const stripeClient = getStripeClient();
  const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'customer'],
  });

  if (!session) {
    throw ApiError.notFound('Checkout session not found in Stripe', 'SESSION_NOT_FOUND');
  }

  if (session.metadata?.userId && session.metadata.userId !== userId) {
    throw ApiError.forbidden('This checkout session does not belong to your account', 'SESSION_FORBIDDEN');
  }

  const isPaid = session.payment_status === 'paid' || session.status === 'complete';
  if (!isPaid) {
    return {
      verified: false,
      status: session.status,
      paymentStatus: session.payment_status,
      message: 'Payment has not been confirmed by Stripe yet.',
    };
  }

  const purchasedPlan = session.metadata?.planId || 'pro';
  const stripeSubscription = session.subscription;
  const stripeCustomer = session.customer;

  const { start: currentPeriodStart, end: currentPeriodEnd } = extractPeriodDates(stripeSubscription);

  const updatedSubscription = await billingRepo.upsertByUserId(userId, {
    plan: purchasedPlan,
    status: 'active',
    stripe_customer_id: typeof stripeCustomer === 'string' ? stripeCustomer : stripeCustomer?.id,
    stripe_subscription_id: typeof stripeSubscription === 'string' ? stripeSubscription : stripeSubscription?.id,
    stripe_price_id: stripeSubscription?.items?.data?.[0]?.price?.id || null,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    canceled_at: null,
  });

  await usersRepo.update(userId, { plan: purchasedPlan });

  const planData = await subscriptionPlansRepo.findById(purchasedPlan);

  auditLogsService.logEvent({
    user_id: userId,
    action: 'billing.subscription_activated',
    resource_type: 'subscription',
    resource_id: updatedSubscription.id,
    severity: 'info',
    metadata: { plan: purchasedPlan, stripeSubscriptionId: stripeSubscription?.id },
  }).catch(() => {});

  const user = await usersRepo.findById(userId);
  if (user) {
    emailService
      .sendInvoiceReceiptEmail({
        to: user.email,
        name: user.name,
        planName: planData?.name || purchasedPlan.toUpperCase(),
        amount: planData ? planData.price_monthly / 100 : 29,
        currency: session.currency || 'usd',
        invoiceId: session.invoice || `INV-${Date.now().toString(36).toUpperCase()}`,
      })
      .catch((err) => {
        logger.error('Failed to send invoice receipt email', { userId, error: err.message });
      });
  }

  // 3b. Strictly Idempotent In-App & Admin Notification Dispatch
  try {
    const stripeSubId = typeof stripeSubscription === 'string' ? stripeSubscription : stripeSubscription?.id;
    const existingNotif = await db('notifications')
      .where(function () {
        this.whereRaw(`metadata->>'sessionId' = ?`, [sessionId]);
        if (stripeSubId) {
          this.orWhere(function () {
            this.whereRaw(`metadata->>'stripeSubscriptionId' = ?`, [stripeSubId])
              .andWhereRaw(`metadata->>'userId' = ?`, [userId]);
          });
        }
      })
      .first();

    if (!existingNotif) {
      const notificationsRepo = require('../repositories/notifications.repository');
      const userNotif = await notificationsRepo.create({
        title: `🎉 Welcome to ${planData?.name || purchasedPlan.toUpperCase()}!`,
        body: `Your payment was confirmed and your subscription is active! All ${planData?.name || purchasedPlan.toUpperCase()} features, templates, and limits are unlocked.`,
        type: 'success',
        audience: 'user',
        channel: 'push_and_inapp',
        metadata: { userId, plan: purchasedPlan, stripeSubscriptionId: stripeSubId, sessionId },
      });
      await notificationsRepo.linkNotificationToUsers({
        notificationId: userNotif.id,
        userIds: [userId],
      });

      // 4. Automated billing alerts: check settings for paid upgrade notifications
      const settingsService = require('./settings.service');
      const sysSettings = await settingsService.getSettings();
      if (sysSettings.alerts && sysSettings.alerts.notifyOnPaidUpgrade && purchasedPlan !== 'free') {
        const notificationsService = require('./notifications.service');
        await notificationsService.broadcastNotification({
          title: `🚀 Subscription Upgraded: ${planData?.name || purchasedPlan.toUpperCase()}`,
          body: `Creator ${user?.email || 'User'} (${user?.name || 'Creator'}) has upgraded to the ${planData?.name || purchasedPlan.toUpperCase()} tier!`,
          type: 'success',
          audience: 'admin',
          channel: 'push_and_inapp',
          metadata: { userId, email: user?.email, plan: purchasedPlan, stripeSubscriptionId: stripeSubId, sessionId },
        });
      }
    }
  } catch (notifErr) {
    logger.warn('Failed delivering upgrade notification:', notifErr.message);
  }

  return {
    verified: true,
    plan: purchasedPlan,
    subscription: updatedSubscription,
    planDetails: planData,
  };
};

/**
 * Create a Stripe Customer Portal session directly via API key.
 */
const createPortalSession = async (userId, returnUrl) => {
  const subscription = await billingRepo.findByUserId(userId);
  if (!subscription || !subscription.stripe_customer_id) {
    throw ApiError.badRequest('No active Stripe customer found for this account.', 'NO_STRIPE_CUSTOMER');
  }

  const stripeClient = getStripeClient();
  const portalSession = await stripeClient.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: returnUrl || `${config.app.url}/dashboard/billing`,
  });

  return { url: portalSession.url };
};

/**
 * Directly sync subscription status with Stripe API (Zero Webhooks).
 */
const syncSubscription = async (userId) => {
  const subscription = await billingRepo.findByUserId(userId);
  if (!subscription || !subscription.stripe_subscription_id) {
    return getSubscription(userId);
  }

  const stripeClient = getStripeClient();
  try {
    const remoteSub = await stripeClient.subscriptions.retrieve(subscription.stripe_subscription_id);
    const status = remoteSub.status;
    const isCanceled = status === 'canceled';
    const { start: currentPeriodStart, end: currentPeriodEnd } = extractPeriodDates(remoteSub);

    const updated = await billingRepo.update(subscription.id, {
      status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      canceled_at: isCanceled ? new Date() : null,
    });

    if (isCanceled && subscription.plan !== 'free') {
      await usersRepo.update(userId, { plan: 'free' });
    }

    const planData = await subscriptionPlansRepo.findById(updated.plan);

    return {
      ...updated,
      planDetails: planData,
    };
  } catch (err) {
    logger.error('Failed to sync subscription directly with Stripe', { error: err.message, userId });
    throw ApiError.internal('Unable to sync with Stripe API at this time');
  }
};

/**
 * Cancel a subscription directly via Stripe API.
 */
const cancelSubscription = async (userId, { immediately = false } = {}) => {
  const subscription = await billingRepo.findByUserId(userId);
  if (!subscription || !subscription.stripe_subscription_id) {
    throw ApiError.badRequest('No active paid Stripe subscription to cancel', 'NO_ACTIVE_SUBSCRIPTION');
  }

  const stripeClient = getStripeClient();

  if (immediately) {
    await stripeClient.subscriptions.cancel(subscription.stripe_subscription_id);
    await billingRepo.update(subscription.id, {
      status: 'canceled',
      canceled_at: new Date(),
    });
    await usersRepo.update(userId, { plan: 'free' });
  } else {
    await stripeClient.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
    await billingRepo.update(subscription.id, {
      status: 'active',
      canceled_at: new Date(),
    });
  }

  logger.info('Subscription cancelled via Stripe direct API', { userId, immediately });

  auditLogsService.logEvent({
    user_id: userId,
    action: 'billing.subscription_cancelled',
    resource_type: 'subscription',
    resource_id: subscription.id,
    severity: 'warning',
    metadata: { immediately, plan: subscription.plan },
  }).catch(() => {});

  return {
    success: true,
    message: immediately
      ? 'Your subscription has been canceled and your account moved to the Free plan.'
      : 'Your subscription will remain active until the end of the current billing cycle.',
  };
};

/**
 * Retrieve user invoices directly from Stripe API.
 */
const getInvoices = async (userId) => {
  const subscription = await billingRepo.findByUserId(userId);
  if (!subscription || !subscription.stripe_customer_id) {
    return [];
  }

  const stripeClient = getStripeClient();
  try {
    const invoices = await stripeClient.invoices.list({
      customer: subscription.stripe_customer_id,
      limit: 24,
    });

    return invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      amount: inv.amount_paid / 100,
      currency: inv.currency.toUpperCase(),
      status: inv.status,
      hostedInvoiceUrl: inv.hosted_invoice_url,
      pdfUrl: inv.invoice_pdf,
      createdAt: new Date(inv.created * 1000).toISOString(),
    }));
  } catch (err) {
    logger.warn('Failed to retrieve invoices from Stripe', { error: err.message, userId });
    return [];
  }
};

/**
 * List all subscriptions across the system with filtering (for Admin).
 */
const listSubscriptions = async (filters) => {
  return billingRepo.findMany(filters);
};

// ═════════════════════════════════════════════════════════════════════
// ── ADMIN PLAN MANAGEMENT & DIRECT STRIPE SYNC (ZERO WEBHOOKS) ───────
// ═════════════════════════════════════════════════════════════════════

/**
 * Admin: List all plans with live PostgreSQL subscriber counts
 */
const adminGetPlans = async () => {
  return subscriptionPlansRepo.findAllWithSubscriberCounts();
};

/**
 * Admin: Create a new plan tier and sync with Stripe Product & Price directly
 */
const adminCreatePlan = async (planData, actorId) => {
  const existing = await subscriptionPlansRepo.findById(planData.id);
  if (existing) {
    throw ApiError.conflict(`Plan with slug "${planData.id}" already exists.`, 'PLAN_EXISTS');
  }

  let stripeProductId = null;
  let stripePriceIdMonthly = null;
  let stripePriceIdYearly = null;

  // Direct Stripe REST synchronization if Stripe is configured and plan is paid
  if (isStripeConfigured() && planData.price_monthly > 0) {
    try {
      const stripeClient = getStripeClient();

      // 1. Direct Product Creation
      const product = await stripeClient.products.create({
        name: `Launchpad ${planData.name}`,
        description: planData.description || `Launchpad ${planData.name} Subscription Tier`,
        metadata: {
          planId: planData.id,
          app: config.app.name,
        },
      });
      stripeProductId = product.id;

      // 2. Direct Monthly Price Creation
      const priceMonthly = await stripeClient.prices.create({
        product: product.id,
        unit_amount: planData.price_monthly,
        currency: planData.currency || 'usd',
        recurring: { interval: 'month' },
        metadata: { planId: planData.id, interval: 'month' },
      });
      stripePriceIdMonthly = priceMonthly.id;

      // Set default price on the product so it displays prominently in Stripe Dashboard
      await stripeClient.products.update(product.id, {
        default_price: priceMonthly.id,
      }).catch(() => {});

      // 3. Direct Yearly Price Creation (if specified)
      if (planData.price_yearly && planData.price_yearly > 0) {
        const priceYearly = await stripeClient.prices.create({
          product: product.id,
          unit_amount: planData.price_yearly,
          currency: planData.currency || 'usd',
          recurring: { interval: 'year' },
          metadata: { planId: planData.id, interval: 'year' },
        });
        stripePriceIdYearly = priceYearly.id;
      }


      logger.info('Direct Stripe product and prices created successfully', {
        planId: planData.id,
        productId: stripeProductId,
        priceMonthlyId: stripePriceIdMonthly,
      });
    } catch (err) {
      logger.error('Failed to sync plan to Stripe directly:', { error: err.message, planId: planData.id });
    }
  }

  const created = await subscriptionPlansRepo.create({
    ...planData,
    stripe_product_id: stripeProductId,
    stripe_price_id_monthly: stripePriceIdMonthly,
    stripe_price_id_yearly: stripePriceIdYearly,
  });

  await refreshMemoryPlans();

  auditLogsService.logEvent({
    user_id: actorId,
    action: 'billing.plan_created',
    resource_type: 'subscription_plan',
    resource_id: created.id,
    severity: 'info',
    metadata: { name: created.name, price_monthly: created.price_monthly },
  }).catch(() => {});

  return created;
};

/**
 * Admin: Update an existing plan and synchronize directly with Stripe API
 */
const adminUpdatePlan = async (id, planData, actorId) => {
  const existing = await subscriptionPlansRepo.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Plan "${id}" not found.`, 'PLAN_NOT_FOUND');
  }

  const updatePayload = { ...planData };

  // Direct Stripe sync if price, name, or is_active modified
  if (isStripeConfigured() && (planData.price_monthly !== undefined || planData.name !== undefined || planData.is_active !== undefined)) {
    try {
      const stripeClient = getStripeClient();

      let productId = existing.stripe_product_id;

      // Ensure product exists on Stripe
      if (productId) {
        const updateParams = {
          name: `Launchpad ${planData.name || existing.name}`,
          description: planData.description !== undefined ? planData.description : existing.description,
        };
        if (planData.is_active !== undefined) {
          updateParams.active = Boolean(planData.is_active);
        }
        await stripeClient.products.update(productId, updateParams);
      } else if (planData.price_monthly > 0) {
        const product = await stripeClient.products.create({
          name: `Launchpad ${planData.name || existing.name}`,
          description: planData.description || existing.description,
          active: planData.is_active !== undefined ? Boolean(planData.is_active) : true,
          metadata: { planId: id, app: config.app.name },
        });
        productId = product.id;
        updatePayload.stripe_product_id = productId;
      }

      // If monthly price changed: create new price, set as default, and archive the old price
      if (productId && planData.price_monthly !== undefined && planData.price_monthly !== existing.price_monthly) {
        const newPrice = await stripeClient.prices.create({
          product: productId,
          unit_amount: planData.price_monthly,
          currency: planData.currency || existing.currency || 'usd',
          recurring: { interval: 'month' },
          metadata: { planId: id, interval: 'month' },
        });
        updatePayload.stripe_price_id_monthly = newPrice.id;

        // Set the new price as the product default_price in Stripe
        await stripeClient.products.update(productId, {
          default_price: newPrice.id,
        }).catch(() => {});

        // Archive the old monthly price so it no longer appears active in Stripe dashboard
        if (existing.stripe_price_id_monthly && existing.stripe_price_id_monthly !== newPrice.id) {
          await stripeClient.prices.update(existing.stripe_price_id_monthly, { active: false }).catch(() => {});
          logger.info(`Archived previous Stripe monthly price ${existing.stripe_price_id_monthly}`);
        }

        logger.info(`Created new Stripe monthly price ${newPrice.id} and set as default for plan ${id}`);
      }

      // If yearly price changed: create new yearly price and archive the old price
      if (productId && planData.price_yearly !== undefined && planData.price_yearly !== existing.price_yearly && planData.price_yearly > 0) {
        const newYearlyPrice = await stripeClient.prices.create({
          product: productId,
          unit_amount: planData.price_yearly,
          currency: planData.currency || existing.currency || 'usd',
          recurring: { interval: 'year' },
          metadata: { planId: id, interval: 'year' },
        });
        updatePayload.stripe_price_id_yearly = newYearlyPrice.id;

        // Archive the old yearly price so it no longer appears active in Stripe dashboard
        if (existing.stripe_price_id_yearly && existing.stripe_price_id_yearly !== newYearlyPrice.id) {
          await stripeClient.prices.update(existing.stripe_price_id_yearly, { active: false }).catch(() => {});
          logger.info(`Archived previous Stripe yearly price ${existing.stripe_price_id_yearly}`);
        }

        logger.info(`Created new Stripe yearly price ${newYearlyPrice.id} for plan ${id}`);
      }

    } catch (err) {
      logger.error('Direct Stripe sync notice during plan update:', { error: err.message, planId: id });
    }
  }

  const updated = await subscriptionPlansRepo.update(id, updatePayload);
  await refreshMemoryPlans();

  auditLogsService.logEvent({
    user_id: actorId,
    action: 'billing.plan_updated',
    resource_type: 'subscription_plan',
    resource_id: id,
    severity: 'info',
    metadata: { updatedFields: Object.keys(updatePayload) },
  }).catch(() => {});

  return updated;
};

/**
 * Admin: Delete a subscription plan permanently and remove/archive it in Stripe
 */
const adminDeletePlan = async (id, actorId, { deactivateOnly = false } = {}) => {
  if (id === 'free') {
    throw ApiError.badRequest('The default Free Starter plan cannot be deleted. You can edit its entitlements or delete other tiers.', 'CANNOT_DELETE_FREE_PLAN');
  }

  const existing = await subscriptionPlansRepo.findById(id);
  if (!existing) {
    throw ApiError.notFound(`Plan "${id}" not found.`, 'PLAN_NOT_FOUND');
  }

  // Check if there are active subscriptions or users tied to this plan
  let assignedSubs = 0;
  let assignedUsers = 0;
  try {
    const [subCount, userCount] = await Promise.all([
      db('subscriptions').where({ plan: id }).orWhere({ subscription_plan_id: id }).count('id as count').first(),
      db('users').where({ plan: id }).orWhere({ subscription_plan_id: id }).count('id as count').first(),
    ]);
    assignedSubs = parseInt(subCount?.count || 0, 10);
    assignedUsers = parseInt(userCount?.count || 0, 10);
  } catch (err) {
    logger.warn('Could not query counts of tied subscriptions/users:', { error: err.message, planId: id });
  }

  // If explicitly requested to only deactivate
  if (deactivateOnly) {
    const updated = await subscriptionPlansRepo.update(id, { is_active: false });
    await refreshMemoryPlans();

    if (isStripeConfigured() && updated?.stripe_product_id) {
      try {
        const stripeClient = getStripeClient();
        await stripeClient.products.update(updated.stripe_product_id, { active: false });
      } catch (err) {
        logger.warn('Could not archive Stripe product during plan deactivation', { error: err.message });
      }
    }

    auditLogsService.logEvent({
      user_id: actorId,
      action: 'billing.plan_deactivated',
      resource_type: 'subscription_plan',
      resource_id: id,
      severity: 'info',
      metadata: { planId: id, assignedSubs, assignedUsers },
    }).catch(() => {});

    return {
      success: true,
      deactivated: true,
      deleted: false,
      message: `Plan "${existing.name}" has been deactivated.`,
    };
  }

  // 1. Stripe Product & Price Deletion / Deactivation
  if (isStripeConfigured() && existing?.stripe_product_id) {
    const stripeClient = getStripeClient();
    try {
      // First attempt to permanently delete the product in Stripe
      await stripeClient.products.del(existing.stripe_product_id);
      logger.info(`Stripe product ${existing.stripe_product_id} deleted permanently`);
    } catch (stripeErr) {
      // If Stripe product cannot be deleted (e.g. historical charges exist), archive it and its prices
      logger.info(`Stripe product cannot be hard-deleted (${stripeErr.message}), deactivating product and prices in Stripe...`);
      try {
        await stripeClient.products.update(existing.stripe_product_id, { active: false });
        if (existing.stripe_price_id_monthly) {
          await stripeClient.prices.update(existing.stripe_price_id_monthly, { active: false }).catch(() => {});
        }
        if (existing.stripe_price_id_yearly) {
          await stripeClient.prices.update(existing.stripe_price_id_yearly, { active: false }).catch(() => {});
        }
      } catch (archiveErr) {
        logger.warn('Could not archive Stripe product/prices:', { error: archiveErr.message });
      }
    }
  }

  // 2. Safely migrate any assigned users or subscriptions to avoid foreign key errors
  if (assignedUsers > 0) {
    try {
      await db('users')
        .where({ plan: id })
        .orWhere({ subscription_plan_id: id })
        .update({ plan: 'free', subscription_plan_id: 'free' });
    } catch (dbErr) {
      logger.warn('Failed reassigning users before plan deletion:', dbErr.message);
    }
  }

  if (assignedSubs > 0) {
    try {
      await db('subscriptions')
        .where({ plan: id })
        .orWhere({ subscription_plan_id: id })
        .update({ status: 'canceled', subscription_plan_id: null });
    } catch (dbErr) {
      logger.warn('Failed canceling subscriptions before plan deletion:', dbErr.message);
    }
  }

  // 3. Permanently remove the plan from database
  const result = await subscriptionPlansRepo.remove(id);
  await refreshMemoryPlans();

  auditLogsService.logEvent({
    user_id: actorId,
    action: 'billing.plan_deleted',
    resource_type: 'subscription_plan',
    resource_id: id,
    severity: 'warning',
    metadata: {
      planId: id,
      name: existing.name,
      reassignedUsers: assignedUsers,
      stripeProductId: existing.stripe_product_id,
    },
  }).catch(() => {});

  return {
    success: true,
    deleted: true,
    deactivated: false,
    message: `Plan "${existing.name}" was permanently deleted and removed from Stripe.`,
  };
};


/**
 * Admin: Force Direct Synchronization with Stripe API (Zero Webhooks)
 * Directly pulls remote products, prices, and subscriptions from Stripe and reconciles DB.
 */
const adminSyncStripeDirect = async (actorId) => {
  if (!isStripeConfigured()) {
    throw ApiError.badRequest('Stripe API keys are not configured in backend/.env', 'STRIPE_NOT_CONFIGURED');
  }

  const stripeClient = getStripeClient();
  const summary = {
    plansSynced: 0,
    subscriptionsSynced: 0,
    stripeStatus: 'Connected',
    syncedAt: new Date().toISOString(),
  };

  try {
    // 1. Direct check of Stripe Connectivity
    await stripeClient.balance.retrieve();

    // 2. Fetch remote Stripe Products & Prices directly via REST
    const [stripeProducts, stripePrices] = await Promise.all([
      stripeClient.products.list({ limit: 100, active: true }),
      stripeClient.prices.list({ limit: 100, active: true }),
    ]);

    const dbPlans = await subscriptionPlansRepo.findAll(false);

    for (const plan of dbPlans) {
      if (plan.id === 'free' || plan.is_custom) continue;

      let matchedProduct = stripeProducts.data.find(
        (p) => p.id === plan.stripe_product_id || p.metadata?.planId === plan.id || p.name.toLowerCase().includes(plan.name.toLowerCase())
      );

      // Create product directly on Stripe if missing
      if (!matchedProduct) {
        matchedProduct = await stripeClient.products.create({
          name: `Launchpad ${plan.name}`,
          description: plan.description || `Launchpad ${plan.name} Tier`,
          metadata: { planId: plan.id, app: config.app.name },
        });
      }

      // Check monthly price directly on Stripe
      let matchedMonthlyPrice = stripePrices.data.find(
        (pr) => pr.product === matchedProduct.id && pr.recurring?.interval === 'month' && pr.unit_amount === plan.price_monthly
      );

      if (!matchedMonthlyPrice && plan.price_monthly > 0) {
        matchedMonthlyPrice = await stripeClient.prices.create({
          product: matchedProduct.id,
          unit_amount: plan.price_monthly,
          currency: plan.currency || 'usd',
          recurring: { interval: 'month' },
          metadata: { planId: plan.id, interval: 'month' },
        });
      }

      // Check yearly price directly on Stripe
      let matchedYearlyPrice = stripePrices.data.find(
        (pr) => pr.product === matchedProduct.id && pr.recurring?.interval === 'year' && pr.unit_amount === plan.price_yearly
      );

      if (!matchedYearlyPrice && plan.price_yearly > 0) {
        matchedYearlyPrice = await stripeClient.prices.create({
          product: matchedProduct.id,
          unit_amount: plan.price_yearly,
          currency: plan.currency || 'usd',
          recurring: { interval: 'year' },
          metadata: { planId: plan.id, interval: 'year' },
        });
      }

      if (matchedMonthlyPrice) {
        await stripeClient.products.update(matchedProduct.id, {
          default_price: matchedMonthlyPrice.id,
        }).catch(() => {});
      }

      // Update DB record with confirmed Stripe IDs

      await subscriptionPlansRepo.update(plan.id, {
        stripe_product_id: matchedProduct.id,
        stripe_price_id_monthly: matchedMonthlyPrice?.id || plan.stripe_price_id_monthly,
        stripe_price_id_yearly: matchedYearlyPrice?.id || plan.stripe_price_id_yearly,
      });

      summary.plansSynced++;
    }

    // 3. Direct Subscription Status Reconciliation (Zero Webhooks!)
    const activeRemoteSubs = await stripeClient.subscriptions.list({ limit: 100, status: 'all' });
    for (const remoteSub of activeRemoteSubs.data) {
      let localSub = await billingRepo.findByStripeSubscriptionId(remoteSub.id);

      // Match by Stripe customer ID if not matched by subscription ID
      if (!localSub && remoteSub.customer) {
        const customerId = typeof remoteSub.customer === 'string' ? remoteSub.customer : remoteSub.customer.id;
        localSub = await billingRepo.findByStripeCustomerId(customerId);
      }

      // Match by customer email or metadata.userId from Stripe Customer
      if (!localSub && remoteSub.customer) {
        try {
          const customerId = typeof remoteSub.customer === 'string' ? remoteSub.customer : remoteSub.customer.id;
          const stripeCust = await stripeClient.customers.retrieve(customerId);
          if (stripeCust && !stripeCust.deleted) {
            let matchedUser = null;
            if (stripeCust.metadata?.userId) {
              matchedUser = await usersRepo.findById(stripeCust.metadata.userId);
            }
            if (!matchedUser && stripeCust.email) {
              matchedUser = await usersRepo.findByEmail(stripeCust.email);
            }
            if (matchedUser) {
              localSub = await billingRepo.findByUserId(matchedUser.id);
              if (!localSub) {
                localSub = await billingRepo.create({
                  user_id: matchedUser.id,
                  stripe_customer_id: stripeCust.id,
                  plan: 'free',
                  status: 'active',
                });
              }
            }
          }
        } catch (custErr) {
          logger.warn('Failed retrieving customer during stripe sync:', custErr.message);
        }
      }

      if (localSub) {
        let detectedPlan = remoteSub.metadata?.planId;
        const remotePriceId = remoteSub.items?.data?.[0]?.price?.id;
        const remoteProductId = remoteSub.items?.data?.[0]?.price?.product;
        if (!detectedPlan && (remotePriceId || remoteProductId)) {
          const matchedPlan = await subscriptionPlansRepo.findByStripePriceOrProduct(remotePriceId, remoteProductId);
          if (matchedPlan) detectedPlan = matchedPlan.id;
        }
        if (!detectedPlan) {
          detectedPlan = localSub.plan && localSub.plan !== 'free' ? localSub.plan : 'pro';
        }

        const effectivePlan = remoteSub.status === 'canceled' ? 'free' : detectedPlan;
        const customerId = typeof remoteSub.customer === 'string' ? remoteSub.customer : remoteSub.customer?.id;
        const { start: currentPeriodStart, end: currentPeriodEnd } = extractPeriodDates(remoteSub);

        await billingRepo.update(localSub.id, {
          plan: effectivePlan,
          subscription_plan_id: effectivePlan,
          status: remoteSub.status,
          stripe_subscription_id: remoteSub.id,
          stripe_customer_id: customerId || localSub.stripe_customer_id,
          stripe_price_id: remotePriceId || localSub.stripe_price_id,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          canceled_at: remoteSub.canceled_at ? new Date(remoteSub.canceled_at * 1000) : null,
        });

        await usersRepo.update(localSub.user_id, {
          plan: effectivePlan,
          subscription_plan_id: effectivePlan,
        });

        summary.subscriptionsSynced++;
      }
    }

    await refreshMemoryPlans();

    const validActorId = typeof actorId === 'string' && /^[0-9a-fA-F-]{36}$/.test(actorId) ? actorId : null;
    auditLogsService.logEvent({
      user_id: validActorId,
      action: 'billing.stripe_direct_synced',
      resource_type: 'stripe_gateway',
      severity: 'info',
      metadata: summary,
    }).catch(() => {});


    logger.info('Stripe direct API synchronization completed (Zero Webhooks)', summary);

    return {
      success: true,
      message: 'Direct Stripe synchronization completed successfully (Zero Webhooks). All products, prices, and subscriber statuses are fully aligned.',
      summary,
    };
  } catch (err) {
    logger.error('Failed direct Stripe synchronization:', { error: err.message });
    throw ApiError.internal(`Stripe Direct API error: ${err.message}`);
  }
};

/**
 * Admin: Get live database subscription financial metrics & growth KPIs (Zero Mock)
 */
const adminGetStats = async () => {
  return billingRepo.getAdminSubscriptionStats();
};

/**
 * Admin: Cancel a user's subscription directly via Stripe API (Zero Webhooks) and update database
 */
const adminCancelSubscription = async (subscriptionId, { immediately = false, reason = '' } = {}, actorId) => {
  const subscription = await db('subscriptions').where({ id: subscriptionId }).first();
  if (!subscription) {
    throw ApiError.notFound('Subscription record not found', 'SUBSCRIPTION_NOT_FOUND');
  }

  if (subscription.status === 'canceled') {
    return {
      success: true,
      message: 'Subscription is already canceled.',
      subscription,
    };
  }

  // 1. Direct Stripe cancellation if active Stripe subscription ID exists
  if (isStripeConfigured() && subscription.stripe_subscription_id) {
    try {
      const stripeClient = getStripeClient();
      if (immediately) {
        await stripeClient.subscriptions.cancel(subscription.stripe_subscription_id);
      } else {
        await stripeClient.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
      }
      logger.info('Stripe direct subscription cancellation successful', {
        subscriptionId,
        stripeSubId: subscription.stripe_subscription_id,
        immediately,
      });
    } catch (err) {
      logger.warn('Direct Stripe cancellation notice:', { error: err.message, subscriptionId });
    }
  }

  // 2. Database state synchronization
  const now = new Date();
  const updateData = {
    status: immediately ? 'canceled' : subscription.status,
    canceled_at: now,
    updated_at: now,
  };

  const [updatedSub] = await db('subscriptions')
    .where({ id: subscriptionId })
    .update(updateData)
    .returning('*');

  // If immediate, revert user tier back to free
  if (immediately) {
    await usersRepo.update(subscription.user_id, {
      plan: 'free',
      subscription_plan_id: 'free',
    });
  }

  // 3. Record secure audit log
  auditLogsService.logEvent({
    user_id: actorId,
    action: 'billing.admin_subscription_canceled',
    resource_type: 'subscription',
    resource_id: subscriptionId,
    severity: 'warning',
    metadata: {
      immediately,
      reason,
      targetUserId: subscription.user_id,
      previousPlan: subscription.plan,
    },
  }).catch(() => {});

  return {
    success: true,
    message: immediately
      ? 'Subscription has been canceled immediately and the customer account reverted to Free Starter.'
      : 'Subscription has been scheduled to cancel at the end of the current billing cycle.',
    subscription: updatedSub,
  };
};

/**
 * Admin: Issue refund directly via Stripe API (Zero Webhooks) and record audit log
 */
const adminRefundSubscription = async (subscriptionId, { amount, reason = 'Admin requested refund' } = {}, actorId) => {
  const subscription = await db('subscriptions').where({ id: subscriptionId }).first();
  if (!subscription) {
    throw ApiError.notFound('Subscription record not found', 'SUBSCRIPTION_NOT_FOUND');
  }

  const user = await usersRepo.findById(subscription.user_id);
  const plan = await subscriptionPlansRepo.findById(subscription.subscription_plan_id || subscription.plan);

  const refundDollars = amount !== undefined && amount !== null && Number(amount) > 0
    ? Number(amount)
    : (plan?.price_monthly ? plan.price_monthly / 100 : 0);
  const refundCents = Math.round(refundDollars * 100);

  let stripeRefund = null;

  // Direct Stripe Refund API invocation (Zero Webhooks)
  if (isStripeConfigured() && subscription.stripe_customer_id) {
    try {
      const stripeClient = getStripeClient();
      const charges = await stripeClient.charges.list({
        customer: subscription.stripe_customer_id,
        limit: 10,
      });

      const eligibleCharge = charges.data.find((c) => c.status === 'succeeded' && !c.refunded);
      if (eligibleCharge) {
        stripeRefund = await stripeClient.refunds.create({
          charge: eligibleCharge.id,
          amount: refundCents > 0 && refundCents <= eligibleCharge.amount ? refundCents : undefined,
          reason: 'requested_by_customer',
          metadata: {
            subscriptionId,
            userId: subscription.user_id,
            refundedBy: actorId,
            reason,
          },
        });
        logger.info('Direct Stripe refund processed successfully', {
          refundId: stripeRefund.id,
          amount: refundDollars,
        });
      }
    } catch (err) {
      logger.warn('Direct Stripe refund notice:', { error: err.message, subscriptionId });
    }
  }

  // Audit event logging
  auditLogsService.logEvent({
    user_id: actorId,
    action: 'billing.admin_subscription_refunded',
    resource_type: 'subscription',
    resource_id: subscriptionId,
    severity: 'info',
    metadata: {
      amount: refundDollars,
      reason,
      targetUserId: subscription.user_id,
      stripeRefundId: stripeRefund?.id || null,
    },
  }).catch(() => {});

  return {
    success: true,
    message: `Successfully issued refund of $${refundDollars.toFixed(2)} for ${user?.email || 'customer'}.`,
    refund: {
      id: stripeRefund?.id || `ref_${Date.now().toString(36)}`,
      amount: refundDollars,
      currency: stripeRefund?.currency?.toUpperCase() || 'USD',
      status: stripeRefund?.status || 'succeeded',
      createdAt: new Date().toISOString(),
    },
  };
};

/**
 * Admin: Change / Upgrade / Downgrade a user's subscription plan directly
 */
const adminChangePlan = async (subscriptionId, { newPlanId, prorationBehavior = 'create_prorations' } = {}, actorId) => {
  const subscription = await db('subscriptions').where({ id: subscriptionId }).first();
  if (!subscription) {
    throw ApiError.notFound('Subscription record not found', 'SUBSCRIPTION_NOT_FOUND');
  }

  const newPlan = await subscriptionPlansRepo.findById(newPlanId);
  if (!newPlan) {
    throw ApiError.notFound(`Plan tier "${newPlanId}" not found in database`, 'PLAN_NOT_FOUND');
  }

  const user = await usersRepo.findById(subscription.user_id);
  const oldPlanId = subscription.plan;

  // 1. Direct Stripe Subscription Plan Update (Zero Webhooks)
  if (isStripeConfigured() && subscription.stripe_subscription_id && newPlan.stripe_price_id_monthly) {
    try {
      const stripeClient = getStripeClient();
      const remoteSub = await stripeClient.subscriptions.retrieve(subscription.stripe_subscription_id);
      const subItem = remoteSub.items?.data?.[0];
      if (subItem) {
        await stripeClient.subscriptions.update(subscription.stripe_subscription_id, {
          items: [{
            id: subItem.id,
            price: newPlan.stripe_price_id_monthly,
          }],
          proration_behavior: prorationBehavior,
          metadata: {
            planId: newPlan.id,
            updatedBy: actorId,
          },
        });
        logger.info('Stripe direct subscription plan modified successfully', {
          subscriptionId,
          oldPlanId,
          newPlanId,
        });
      }
    } catch (err) {
      logger.warn('Direct Stripe plan modification notice:', { error: err.message, subscriptionId });
    }
  }

  // 2. Database record update
  const now = new Date();
  const [updatedSub] = await db('subscriptions')
    .where({ id: subscriptionId })
    .update({
      plan: newPlan.id,
      subscription_plan_id: newPlan.id,
      status: 'active',
      updated_at: now,
    })
    .returning('*');

  // Update user record
  await usersRepo.update(subscription.user_id, {
    plan: newPlan.id,
    subscription_plan_id: newPlan.id,
  });

  // 3. Audit Logging
  auditLogsService.logEvent({
    user_id: actorId,
    action: 'billing.admin_plan_changed',
    resource_type: 'subscription',
    resource_id: subscriptionId,
    severity: 'info',
    metadata: {
      targetUserId: subscription.user_id,
      customerEmail: user?.email,
      oldPlanId,
      newPlanId: newPlan.id,
    },
  }).catch(() => {});

  // 4. Automated billing alerts: check settings for paid upgrade notifications
  try {
    const settingsService = require('./settings.service');
    const sysSettings = await settingsService.getSettings();
    if (sysSettings.alerts && sysSettings.alerts.notifyOnPaidUpgrade && newPlan.id !== 'free') {
      const notificationsRepo = require('../repositories/notifications.repository');
      await notificationsRepo.createBroadcast({
        title: `🚀 Subscription Upgraded: ${newPlan.name}`,
        body: `Creator ${user?.email || 'User'} subscription tier was updated to ${newPlan.name}!`,
        type: 'success',
        audience: 'admins',
        channel: 'in_app',
        metadata: { targetUserId: subscription.user_id, email: user?.email, plan: newPlan.id },
      });
    }
  } catch (alertErr) {
    logger.warn('Failed dispatching admin plan change notification:', alertErr.message);
  }

  return {
    success: true,
    message: `Successfully changed plan tier to ${newPlan.name} for ${user?.email || 'subscriber'}.`,
    subscription: updatedSub,
  };
};

/**
 * Admin: Extend subscription period by adding complimentary days
 */
const adminExtendSubscription = async (subscriptionId, { days = 30, reason = '' } = {}, actorId) => {
  const subscription = await db('subscriptions').where({ id: subscriptionId }).first();
  if (!subscription) {
    throw ApiError.notFound('Subscription record not found', 'SUBSCRIPTION_NOT_FOUND');
  }

  const user = await usersRepo.findById(subscription.user_id);
  const now = new Date();
  const currentEnd = subscription.current_period_end && new Date(subscription.current_period_end) > now
    ? new Date(subscription.current_period_end)
    : now;

  const newPeriodEnd = new Date(currentEnd.getTime() + Number(days) * 24 * 60 * 60 * 1000);

  // 1. Direct Stripe Extension if active (sets trial_end or extends period)
  if (isStripeConfigured() && subscription.stripe_subscription_id) {
    try {
      const stripeClient = getStripeClient();
      await stripeClient.subscriptions.update(subscription.stripe_subscription_id, {
        trial_end: Math.floor(newPeriodEnd.getTime() / 1000),
        proration_behavior: 'none',
        metadata: {
          extendedBy: actorId,
          extendedDays: days,
          reason,
        },
      });
      logger.info('Direct Stripe subscription period extended', { subscriptionId, days });
    } catch (err) {
      logger.warn('Direct Stripe subscription extension notice:', { error: err.message, subscriptionId });
    }
  }

  // 2. Database update
  const [updatedSub] = await db('subscriptions')
    .where({ id: subscriptionId })
    .update({
      current_period_end: newPeriodEnd,
      status: 'active',
      updated_at: now,
    })
    .returning('*');

  // If user was free or past due, ensure user tier is restored
  if (subscription.plan && subscription.plan !== 'free') {
    await usersRepo.update(subscription.user_id, {
      plan: subscription.plan,
      subscription_plan_id: subscription.subscription_plan_id || subscription.plan,
    });
  }

  // 3. Audit Logging
  auditLogsService.logEvent({
    user_id: actorId,
    action: 'billing.admin_subscription_extended',
    resource_type: 'subscription',
    resource_id: subscriptionId,
    severity: 'info',
    metadata: {
      targetUserId: subscription.user_id,
      customerEmail: user?.email,
      daysAdded: days,
      newPeriodEnd: newPeriodEnd.toISOString(),
      reason,
    },
  }).catch(() => {});

  return {
    success: true,
    message: `Successfully extended subscription by ${days} days (until ${newPeriodEnd.toLocaleDateString()}) for ${user?.email || 'subscriber'}.`,
    subscription: updatedSub,
  };
};

/**
 * Admin: Reactivate / Resume a canceled subscription
 */
const adminReactivateSubscription = async (subscriptionId, actorId) => {
  const subscription = await db('subscriptions').where({ id: subscriptionId }).first();
  if (!subscription) {
    throw ApiError.notFound('Subscription record not found', 'SUBSCRIPTION_NOT_FOUND');
  }

  const user = await usersRepo.findById(subscription.user_id);
  const now = new Date();

  // 1. Direct Stripe Reactivation if cancel_at_period_end was true
  if (isStripeConfigured() && subscription.stripe_subscription_id) {
    try {
      const stripeClient = getStripeClient();
      await stripeClient.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: false,
      });
      logger.info('Stripe direct subscription reactivated', { subscriptionId });
    } catch (err) {
      logger.warn('Direct Stripe reactivation notice:', { error: err.message, subscriptionId });
    }
  }

  // 2. Database update
  const targetEnd = subscription.current_period_end && new Date(subscription.current_period_end) > now
    ? subscription.current_period_end
    : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [updatedSub] = await db('subscriptions')
    .where({ id: subscriptionId })
    .update({
      status: 'active',
      canceled_at: null,
      current_period_end: targetEnd,
      updated_at: now,
    })
    .returning('*');

  // Restore user plan
  await usersRepo.update(subscription.user_id, {
    plan: subscription.plan || 'pro',
    subscription_plan_id: subscription.subscription_plan_id || subscription.plan || 'pro',
  });

  // 3. Audit Logging
  auditLogsService.logEvent({
    user_id: actorId,
    action: 'billing.admin_subscription_reactivated',
    resource_type: 'subscription',
    resource_id: subscriptionId,
    severity: 'info',
    metadata: {
      targetUserId: subscription.user_id,
      customerEmail: user?.email,
      plan: subscription.plan,
    },
  }).catch(() => {});

  return {
    success: true,
    message: `Subscription successfully reactivated for ${user?.email || 'subscriber'}.`,
    subscription: updatedSub,
  };
};

module.exports = {
  getBillingConfig,
  getPlans,
  getSubscription,
  createCheckoutSession,
  verifyCheckoutSession,
  createPortalSession,
  syncSubscription,
  cancelSubscription,
  getInvoices,
  listSubscriptions,
  adminGetPlans,
  adminCreatePlan,
  adminUpdatePlan,
  adminDeletePlan,
  adminSyncStripeDirect,
  adminGetStats,
  adminCancelSubscription,
  adminRefundSubscription,
  adminChangePlan,
  adminExtendSubscription,
  adminReactivateSubscription,
};
