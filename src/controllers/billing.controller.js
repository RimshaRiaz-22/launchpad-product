// src/controllers/billing.controller.js — Billing request handlers using direct Stripe API
'use strict';

const billingService = require('../services/billing.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/v1/billing/config — Public client billing config (publishable key & plans) */
const getConfig = asyncHandler(async (_req, res) => {
  const config = await billingService.getBillingConfig();
  return ApiResponse.success(res, config, 'Billing configuration retrieved');
});

/** GET /api/v1/billing/plans — List available subscription plans */
const getPlans = asyncHandler(async (_req, res) => {
  const plans = await billingService.getPlans();
  return ApiResponse.success(res, { plans }, 'Plans retrieved successfully');
});

/** GET /api/v1/billing/subscription — Get current user's subscription */
const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await billingService.getSubscription(req.user.id);
  return ApiResponse.success(res, { subscription }, 'Subscription retrieved successfully');
});

/** POST /api/v1/billing/checkout — Create Stripe Checkout session directly */
const createCheckoutSession = asyncHandler(async (req, res) => {
  const { planId, successUrl, cancelUrl } = req.body;
  const session = await billingService.createCheckoutSession(req.user.id, {
    planId,
    successUrl,
    cancelUrl,
  });
  return ApiResponse.success(res, session, 'Checkout session created successfully');
});

/** POST /api/v1/billing/verify-session — Verify Stripe checkout payment directly (Zero Webhooks) */
const verifyCheckoutSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const result = await billingService.verifyCheckoutSession(req.user.id, sessionId);
  return ApiResponse.success(res, result, 'Checkout session verified and subscription activated');
});

/** POST /api/v1/billing/customer-portal — Open Stripe billing customer portal */
const createPortalSession = asyncHandler(async (req, res) => {
  const { returnUrl } = req.body;
  const portal = await billingService.createPortalSession(req.user.id, returnUrl);
  return ApiResponse.success(res, portal, 'Billing customer portal session created');
});

/** POST /api/v1/billing/sync — Synchronise subscription status directly from Stripe API */
const syncSubscription = asyncHandler(async (req, res) => {
  const subscription = await billingService.syncSubscription(req.user.id);
  return ApiResponse.success(res, { subscription }, 'Subscription synchronized with Stripe');
});

/** POST /api/v1/billing/cancel — Cancel active Stripe subscription */
const cancelSubscription = asyncHandler(async (req, res) => {
  const { immediately } = req.body;
  const result = await billingService.cancelSubscription(req.user.id, { immediately });
  return ApiResponse.success(res, result, result.message);
});

/** GET /api/v1/billing/invoices — List user's Stripe invoices */
const getInvoices = asyncHandler(async (req, res) => {
  const invoices = await billingService.getInvoices(req.user.id);
  return ApiResponse.success(res, { invoices }, 'Invoices retrieved successfully');
});

/** GET /api/v1/billing/admin/subscriptions — Admin filtered listing of all subscriptions */
const listSubscriptions = asyncHandler(async (req, res) => {
  const result = await billingService.listSubscriptions(req.query);
  return ApiResponse.paginated(
    res,
    result.data,
    result.meta,
    'Subscriptions retrieved successfully'
  );
});

/** GET /api/v1/billing/admin/plans — Admin listing of all plans with live subscriber counts */
const adminGetPlans = asyncHandler(async (_req, res) => {
  const plans = await billingService.adminGetPlans();
  return ApiResponse.success(res, { plans }, 'All plans and entitlements retrieved');
});

/** POST /api/v1/billing/admin/plans — Admin create plan + direct Stripe sync */
const adminCreatePlan = asyncHandler(async (req, res) => {
  const plan = await billingService.adminCreatePlan(req.body, req.user?.id);
  return ApiResponse.created(res, { plan }, 'Subscription plan created and synced to Stripe');
});

/** PUT /api/v1/billing/admin/plans/:id — Admin update plan + direct Stripe sync */
const adminUpdatePlan = asyncHandler(async (req, res) => {
  const plan = await billingService.adminUpdatePlan(req.params.id, req.body, req.user?.id);
  return ApiResponse.success(res, { plan }, 'Subscription plan updated successfully');
});

/** DELETE /api/v1/billing/admin/plans/:id — Admin delete or deactivate plan */
const adminDeletePlan = asyncHandler(async (req, res) => {
  const deactivateOnly = req.query.deactivateOnly === 'true';
  const result = await billingService.adminDeletePlan(req.params.id, req.user?.id, { deactivateOnly });
  return ApiResponse.success(res, result, result.message || 'Subscription plan removed or deactivated');
});


/** POST /api/v1/billing/admin/sync-stripe — Admin force direct Stripe synchronization (Zero Webhooks) */
const adminSyncStripe = asyncHandler(async (req, res) => {
  const result = await billingService.adminSyncStripeDirect(req.user?.id);
  return ApiResponse.success(res, result, result.message);
});

/** GET /api/v1/billing/admin/stats — Admin subscription live financial metrics (Zero Mock) */
const adminGetStats = asyncHandler(async (_req, res) => {
  const stats = await billingService.adminGetStats();
  return ApiResponse.success(res, stats, 'Subscription financial stats retrieved successfully');
});

/** POST /api/v1/billing/admin/subscriptions/:id/cancel — Admin cancel user subscription directly */
const adminCancelSubscription = asyncHandler(async (req, res) => {
  const result = await billingService.adminCancelSubscription(req.params.id, req.body, req.user?.id);
  return ApiResponse.success(res, result, result.message);
});

/** POST /api/v1/billing/admin/subscriptions/:id/refund — Admin refund user subscription/charge directly */
const adminRefundSubscription = asyncHandler(async (req, res) => {
  const result = await billingService.adminRefundSubscription(req.params.id, req.body, req.user?.id);
  return ApiResponse.success(res, result, result.message);
});

/** POST /api/v1/billing/admin/subscriptions/:id/change-plan — Admin change/upgrade subscriber plan tier */
const adminChangePlan = asyncHandler(async (req, res) => {
  const result = await billingService.adminChangePlan(req.params.id, req.body, req.user?.id);
  return ApiResponse.success(res, result, result.message);
});

/** POST /api/v1/billing/admin/subscriptions/:id/extend — Admin add complimentary period/days */
const adminExtendSubscription = asyncHandler(async (req, res) => {
  const result = await billingService.adminExtendSubscription(req.params.id, req.body, req.user?.id);
  return ApiResponse.success(res, result, result.message);
});

/** POST /api/v1/billing/admin/subscriptions/:id/reactivate — Admin resume/reactivate subscription */
const adminReactivateSubscription = asyncHandler(async (req, res) => {
  const result = await billingService.adminReactivateSubscription(req.params.id, req.user?.id);
  return ApiResponse.success(res, result, result.message);
});

module.exports = {
  getConfig,
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
  adminSyncStripe,
  adminGetStats,
  adminCancelSubscription,
  adminRefundSubscription,
  adminChangePlan,
  adminExtendSubscription,
  adminReactivateSubscription,
};
