// src/services/email.service.js — Transactional email service using Nodemailer
'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/app.config');
const logger = require('../config/logger.config');
const templates = require('../templates/emails');

let transporter = null;

/**
 * Initialize or retrieve the active Nodemailer transporter.
 */
const getTransporter = () => {
  if (transporter) return transporter;

  const { host, port, secure, user, pass } = config.email;

  if (host && user && pass) {
    // Configured live/staging SMTP transport
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
    logger.info('Nodemailer SMTP transport initialized', { host, port, user });
  } else {
    // Development / Local fallback transport (logs to console/logger without failing)
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'windows',
      buffer: true,
    });
    logger.info('Nodemailer initialized with local StreamTransport (SMTP credentials not provided)');
  }

  return transporter;
};

/**
 * Send an email safely without blocking or throwing unhandled errors to the caller.
 *
 * @param {{
 *   to: string,
 *   subject: string,
 *   html: string,
 *   text?: string,
 *   from?: string,
 *   replyTo?: string
 * }} mailOptions
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
const sendEmail = async ({ to, subject, html, text, from, replyTo }) => {
  try {
    const transport = getTransporter();
    const sender = from || config.email.from;
    const recipient = to.toLowerCase().trim();

    const info = await transport.sendMail({
      from: sender,
      to: recipient,
      replyTo: replyTo || config.email.support,
      subject,
      html,
      text,
    });

    if (info.message) {
      // In streamTransport mode, log message summary
      logger.debug('Email dispatched via stream transport', {
        to: recipient,
        subject,
        messageId: info.messageId,
      });
    } else {
      logger.info('Email sent successfully', {
        to: recipient,
        subject,
        messageId: info.messageId,
        response: info.response,
      });
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send transactional email', {
      to,
      subject,
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error: error.message };
  }
};

/**
 * Send Welcome Email.
 *
 * @param {{ to: string, name?: string }} options
 */
const sendWelcomeEmail = async ({ to, name }) => {
  const { subject, html, text } = templates.compileWelcomeEmail({
    name,
    appName: config.app.name,
    appUrl: config.app.url,
    supportEmail: config.email.support,
  });

  return sendEmail({ to, subject, html, text });
};

/**
 * Send Password Reset Email.
 *
 * @param {{ to: string, name?: string, resetToken: string, resetUrl?: string }} options
 */
const sendPasswordResetEmail = async ({ to, name, resetToken, resetUrl }) => {
  const targetResetUrl = resetUrl || `${config.app.url}/reset-password?token=${encodeURIComponent(resetToken)}`;

  const { subject, html, text } = templates.compilePasswordResetEmail({
    name,
    resetUrl: targetResetUrl,
    expiresInMinutes: 60,
    appName: config.app.name,
    supportEmail: config.email.support,
  });

  return sendEmail({ to, subject, html, text });
};

/**
 * Send Email Verification Email.
 *
 * @param {{ to: string, name?: string, verificationToken: string, verificationUrl?: string }} options
 */
const sendVerificationEmail = async ({ to, name, verificationToken, verificationUrl }) => {
  const targetVerificationUrl =
    verificationUrl || `${config.app.url}/verify-email?token=${encodeURIComponent(verificationToken)}`;

  const { subject, html, text } = templates.compileVerifyEmail({
    name,
    verificationUrl: targetVerificationUrl,
    appName: config.app.name,
    supportEmail: config.email.support,
  });

  return sendEmail({ to, subject, html, text });
};

/**
 * Send Invoice Receipt Email.
 *
 * @param {{
 *   to: string,
 *   name?: string,
 *   planName: string,
 *   amount: string | number,
 *   currency?: string,
 *   invoiceId?: string,
 *   date?: string
 * }} options
 */
const sendInvoiceReceiptEmail = async ({
  to,
  name,
  planName,
  amount,
  currency = 'usd',
  invoiceId,
  date,
}) => {
  const { subject, html, text } = templates.compileInvoiceReceiptEmail({
    name,
    planName,
    amount,
    currency,
    invoiceId,
    date,
    billingUrl: `${config.app.url}/dashboard/billing`,
    appName: config.app.name,
    supportEmail: config.email.support,
  });

  return sendEmail({ to, subject, html, text });
};

/**
 * Send Subscription Cancellation Email.
 *
 * @param {{
 *   to: string,
 *   name?: string,
 *   planName: string,
 *   effectiveDate?: string
 * }} options
 */
const sendSubscriptionCancellationEmail = async ({
  to,
  name,
  planName,
  effectiveDate,
}) => {
  const { subject, html, text } = templates.compileSubscriptionCancellationEmail({
    name,
    planName,
    effectiveDate,
    resubscribeUrl: `${config.app.url}/dashboard/billing`,
    appName: config.app.name,
    supportEmail: config.email.support,
  });

  return sendEmail({ to, subject, html, text });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendInvoiceReceiptEmail,
  sendSubscriptionCancellationEmail,
  getTransporter,
};
