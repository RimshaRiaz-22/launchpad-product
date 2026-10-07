// src/templates/emails/index.js — Modular registry of transactional email templates
'use strict';

const { renderBaseLayout } = require('./baseTemplate');
const { compileWelcomeEmail } = require('./welcomeEmail.template');
const { compilePasswordResetEmail } = require('./passwordReset.template');
const { compileVerifyEmail } = require('./verifyEmail.template');
const { compileInvoiceReceiptEmail } = require('./invoiceReceipt.template');
const { compileSubscriptionCancellationEmail } = require('./subscriptionCancellation.template');

module.exports = {
  renderBaseLayout,
  compileWelcomeEmail,
  compilePasswordResetEmail,
  compileVerifyEmail,
  compileInvoiceReceiptEmail,
  compileSubscriptionCancellationEmail,
};
