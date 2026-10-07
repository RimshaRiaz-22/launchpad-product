// src/api/v1/routes/billing.routes.js — Billing routes (Zero Webhook, Direct Stripe API)
'use strict';

const { Router } = require('express');
const billingController = require('../../../controllers/billing.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { authorize } = require('../../../middlewares/rbac.middleware');
const validate = require('../../../middlewares/validate.middleware');
const {
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
} = require('../../../validators/billing.validator');

const router = Router();

// ── Public Routes ─────────────────────────────────────────────
router.get('/config', billingController.getConfig);
router.get('/plans', billingController.getPlans);

// ── Authenticated User Routes ─────────────────────────────────
router.use(authenticate);

router.get('/subscription', billingController.getSubscription);
router.post(
  '/checkout',
  validate({ body: createCheckoutSessionSchema }),
  billingController.createCheckoutSession
);
router.post(
  '/verify-session',
  validate({ body: verifySessionSchema }),
  billingController.verifyCheckoutSession
);
router.post(
  '/customer-portal',
  validate({ body: customerPortalSchema }),
  billingController.createPortalSession
);
router.post('/sync', billingController.syncSubscription);
router.post(
  '/cancel',
  validate({ body: cancelSubscriptionSchema }),
  billingController.cancelSubscription
);
router.get('/invoices', billingController.getInvoices);

// ── Admin-Only Plan Tier & Entitlements Management (Zero Webhook Direct Stripe) ──
router.get(
  '/admin/plans',
  authorize('admin'),
  billingController.adminGetPlans
);
router.post(
  '/admin/plans',
  authorize('admin'),
  validate({ body: createPlanSchema }),
  billingController.adminCreatePlan
);
router.put(
  '/admin/plans/:id',
  authorize('admin'),
  validate({ body: updatePlanSchema }),
  billingController.adminUpdatePlan
);
router.delete(
  '/admin/plans/:id',
  authorize('admin'),
  billingController.adminDeletePlan
);
router.post(
  '/admin/sync-stripe',
  authorize('admin'),
  billingController.adminSyncStripe
);

// ── Admin-Only Subscriptions Audit Listing & Direct Actions ──
router.get(
  '/admin/stats',
  authorize('admin'),
  billingController.adminGetStats
);

router.get(
  '/admin/subscriptions',
  authorize('admin'),
  validate({ query: listSubscriptionsQuerySchema }),
  billingController.listSubscriptions
);

router.post(
  '/admin/subscriptions/:id/cancel',
  authorize('admin'),
  validate({ body: adminCancelSubscriptionSchema }),
  billingController.adminCancelSubscription
);

router.post(
  '/admin/subscriptions/:id/refund',
  authorize('admin'),
  validate({ body: adminRefundSubscriptionSchema }),
  billingController.adminRefundSubscription
);

router.post(
  '/admin/subscriptions/:id/change-plan',
  authorize('admin'),
  validate({ body: adminChangePlanSchema }),
  billingController.adminChangePlan
);

router.post(
  '/admin/subscriptions/:id/extend',
  authorize('admin'),
  validate({ body: adminExtendSubscriptionSchema }),
  billingController.adminExtendSubscription
);

router.post(
  '/admin/subscriptions/:id/reactivate',
  authorize('admin'),
  billingController.adminReactivateSubscription
);

module.exports = router;
