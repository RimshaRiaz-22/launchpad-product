// src/templates/emails/verifyEmail.template.js — Email verification template
'use strict';

const { renderBaseLayout } = require('./baseTemplate');

/**
 * Compile Email Verification Email.
 *
 * @param {{
 *   name: string,
 *   verificationUrl: string,
 *   appName?: string,
 *   supportEmail?: string
 * }} options
 */
const compileVerifyEmail = ({
  name = 'Creator',
  verificationUrl,
  appName = 'Launchpad',
  supportEmail = 'support@launchpad.app',
}) => {
  const title = `Verify your ${appName} email address`;
  const preheader = `Confirm your email address to unlock full access to ${appName}.`;

  const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 30px;">
      Confirm Your Email Address
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #8b949e; line-height: 24px;">
      Hi ${name},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #8b949e; line-height: 24px;">
      Thanks for signing up for ${appName}! Please confirm your email address by clicking the verification button below so we can keep your account safe and verified.
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${verificationUrl}" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
        Verify Email Address
      </a>
    </div>

    <!-- Security Information -->
    <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 13px; color: #8b949e; line-height: 18px;">
        💡 If you did not create a ${appName} account, you can disregard this email.
      </p>
    </div>

    <!-- Plain link fallback -->
    <p style="margin: 0 0 8px 0; font-size: 12px; color: #484f58; line-height: 18px;">
      Button not working? Copy and paste this link into your browser:
    </p>
    <p style="margin: 0; word-break: break-all; font-size: 12px; color: #58a6ff; line-height: 18px;">
      <a href="${verificationUrl}" style="color: #58a6ff; text-decoration: underline;">${verificationUrl}</a>
    </p>
  `;

  return {
    subject: `Verify your email for ${appName}`,
    html: renderBaseLayout({ title, preheader, content, appName, supportEmail }),
    text: `Hi ${name},\n\nPlease verify your email address for ${appName} by visiting the link below:\n${verificationUrl}\n\nIf you did not sign up, please ignore this email.\n\nSupport: ${supportEmail}`,
  };
};

module.exports = {
  compileVerifyEmail,
};
