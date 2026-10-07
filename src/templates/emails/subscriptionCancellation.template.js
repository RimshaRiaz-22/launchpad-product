// src/templates/emails/subscriptionCancellation.template.js — Subscription cancellation email template
'use strict';

const { renderBaseLayout } = require('./baseTemplate');
const config = require('../../config/app.config');

/**
 * Compile Subscription Cancellation Email.
 *
 * @param {{
 *   name: string,
 *   planName: string,
 *   effectiveDate?: string,
 *   resubscribeUrl?: string,
 *   appName?: string,
 *   supportEmail?: string
 * }} options
 */
const compileSubscriptionCancellationEmail = ({
  name = 'Customer',
  planName = 'Pro Plan',
  effectiveDate = 'the end of your current billing cycle',
  resubscribeUrl = `${config.app.url || 'https://launchpad.dev'}/dashboard/billing`,
  appName = config.app.name || 'Launchpad',
  supportEmail = process.env.SUPPORT_EMAIL || 'support@launchpad.dev',
}) => {
  const title = `Your ${appName} subscription has been canceled`;
  const preheader = `Confirmation of your subscription cancellation for Launchpad ${planName}.`;

  const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 30px;">
      Subscription Canceled
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #8b949e; line-height: 24px;">
      Hello ${name},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #8b949e; line-height: 24px;">
      This email confirms that your subscription to <strong>Launchpad ${planName}</strong> has been canceled.
    </p>

    <!-- Details Box -->
    <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #e6edf3;">
        What happens next?
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #8b949e; line-height: 22px;">
        <li>You will retain full access to ${planName} features until <strong>${effectiveDate}</strong>.</li>
        <li>After that date, your account will seamlessly downgrade to the Free plan.</li>
        <li>None of your existing saved projects or canvas assets will be deleted.</li>
      </ul>
    </div>

    <!-- Reactivate CTA -->
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #8b949e; line-height: 22px;">
      If you changed your mind or wish to reactivate your plan at any time, you can renew your subscription with one click:
    </p>
    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${resubscribeUrl}" target="_blank" class="btn-primary" style="display: inline-block; background-color: #21262d; border: 1px solid #30363d; color: #58a6ff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
        Reactivate Subscription &rarr;
      </a>
    </div>

    <p style="margin: 0; font-size: 13px; color: #6e7681; line-height: 18px;">
      We're always looking to improve. If you have a moment, we'd love to hear your feedback on how we could make Launchpad better by replying to this email.
    </p>
  `;

  return {
    subject: `Subscription Canceled: Launchpad ${planName}`,
    html: renderBaseLayout({ title, preheader, content, appName, supportEmail }),
    text: `Hello ${name},\n\nYour subscription to Launchpad ${planName} has been canceled.\n\nYou will continue to have access until ${effectiveDate}. After this period, your account will switch to the Free plan. None of your data will be lost.\n\nReactivate anytime: ${resubscribeUrl}\n\nSupport: ${supportEmail}`,
  };
};

module.exports = {
  compileSubscriptionCancellationEmail,
};
