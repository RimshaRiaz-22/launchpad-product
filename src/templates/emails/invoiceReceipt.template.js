// src/templates/emails/invoiceReceipt.template.js — Invoice receipt template
'use strict';

const { renderBaseLayout } = require('./baseTemplate');
const config = require('../../config/app.config');

/**
 * Compile Invoice Receipt Email.
 *
 * @param {{
 *   name: string,
 *   planName: string,
 *   amount: string | number,
 *   currency?: string,
 *   invoiceId?: string,
 *   date?: string,
 *   billingUrl?: string,
 *   appName?: string,
 *   supportEmail?: string
 * }} options
 */
const compileInvoiceReceiptEmail = ({
  name = 'Customer',
  planName = 'Pro Plan',
  amount = '0.00',
  currency = 'USD',
  invoiceId = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
  date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  billingUrl = `${config.app.url || 'https://launchpad.dev'}/dashboard/billing`,
  appName = config.app.name || 'Launchpad',
  supportEmail = process.env.SUPPORT_EMAIL || 'support@launchpad.dev',
}) => {
  const title = `Your receipt from ${appName}`;
  const preheader = `Thank you for your payment! Here is the receipt for your ${appName} subscription.`;

  const content = `
    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 30px;">
      Payment Receipt
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #8b949e; line-height: 24px;">
      Thank you for your support, ${name}! Your payment has been processed successfully.
    </p>

    <!-- Receipt Card -->
    <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 12px; padding: 24px; margin-bottom: 28px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom: 12px; font-size: 14px; color: #8b949e;">Invoice Reference:</td>
          <td align="right" style="padding-bottom: 12px; font-size: 14px; font-family: monospace; color: #c9d1d9; font-weight: 600;">${invoiceId}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 12px; font-size: 14px; color: #8b949e;">Date:</td>
          <td align="right" style="padding-bottom: 12px; font-size: 14px; color: #c9d1d9;">${date}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 16px; font-size: 14px; color: #8b949e;">Plan:</td>
          <td align="right" style="padding-bottom: 16px; font-size: 14px; color: #10B981; font-weight: 600;">Launchpad ${planName}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-top: 1px solid #30363d; padding-top: 16px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="font-size: 16px; font-weight: 700; color: #ffffff;">Total Paid:</td>
                <td align="right" style="font-size: 20px; font-weight: 800; color: #10B981;">
                  $${Number(amount).toFixed(2)} <span style="font-size: 13px; font-weight: 500; color: #8b949e;">${currency.toUpperCase()}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${billingUrl}" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
        Manage Subscription & Invoices &rarr;
      </a>
    </div>

    <p style="margin: 0; font-size: 13px; color: #6e7681; line-height: 18px; text-align: center;">
      You can view and download all past VAT invoices from your account settings.
    </p>
  `;

  return {
    subject: `Payment Receipt: Launchpad ${planName} ($${Number(amount).toFixed(2)})`,
    html: renderBaseLayout({ title, preheader, content, appName, supportEmail }),
    text: `Payment Receipt - ${appName}\n\nInvoice: ${invoiceId}\nDate: ${date}\nPlan: ${planName}\nAmount Paid: $${Number(amount).toFixed(2)} ${currency}\n\nManage Billing: ${billingUrl}\n\nQuestions? Contact ${supportEmail}`,
  };
};

module.exports = {
  compileInvoiceReceiptEmail,
};
