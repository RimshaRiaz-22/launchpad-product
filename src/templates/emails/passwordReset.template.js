// src/templates/emails/passwordReset.template.js — Password reset email template
'use strict';

const { renderBaseLayout } = require('./baseTemplate');

/**
 * Compile Password Reset Email.
 *
 * @param {{
 *   name: string,
 *   resetUrl: string,
 *   expiresInMinutes?: number,
 *   appName?: string,
 *   supportEmail?: string
 * }} options
 */
const compilePasswordResetEmail = ({
  name = 'User',
  resetUrl,
  expiresInMinutes = 60,
  appName = 'Launchpad',
  supportEmail = 'support@launchpad.app',
}) => {
  const title = `Reset your ${appName} password`;
  const preheader = `A request was made to reset the password for your ${appName} account.`;

  const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 30px;">
      Password Reset Request
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #8b949e; line-height: 24px;">
      Hello ${name},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #8b949e; line-height: 24px;">
      We received a request to reset the password associated with your ${appName} account. Click the button below to choose a new password:
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${resetUrl}" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
        Reset Password
      </a>
    </div>

    <!-- Security Warning Card -->
    <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #f0883e;">
        ⏱️ Important Security Notice:
      </p>
      <p style="margin: 0; font-size: 13px; color: #8b949e; line-height: 18px;">
        This password reset link will expire in <strong>${expiresInMinutes} minutes</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.
      </p>
    </div>

    <!-- Plain link fallback -->
    <p style="margin: 0 0 8px 0; font-size: 12px; color: #484f58; line-height: 18px;">
      If the button above does not work, copy and paste this link into your browser:
    </p>
    <p style="margin: 0; word-break: break-all; font-size: 12px; color: #58a6ff; line-height: 18px;">
      <a href="${resetUrl}" style="color: #58a6ff; text-decoration: underline;">${resetUrl}</a>
    </p>
  `;

  return {
    subject: `Reset your ${appName} password`,
    html: renderBaseLayout({ title, preheader, content, appName, supportEmail }),
    text: `Hello ${name},\n\nWe received a request to reset your ${appName} password.\n\nPlease use the following link to reset your password:\n${resetUrl}\n\nThis link will expire in ${expiresInMinutes} minutes. If you did not make this request, you can safely ignore this email.\n\nSupport: ${supportEmail}`,
  };
};

module.exports = {
  compilePasswordResetEmail,
};
