// src/templates/emails/welcomeEmail.template.js — Welcome email template
'use strict';

const { renderBaseLayout } = require('./baseTemplate');
const config = require('../../config/app.config');

/**
 * Compile Welcome Email.
 *
 * @param {{
 *   name: string,
 *   appName?: string,
 *   appUrl?: string,
 *   supportEmail?: string
 * }} options
 */
const compileWelcomeEmail = ({
  name = 'Creator',
  appName = config.app.name || 'Launchpad',
  appUrl = config.app.url || 'https://launchpad.dev',
  supportEmail = process.env.SUPPORT_EMAIL || 'support@launchpad.dev',
}) => {
  const title = `Welcome to ${appName}! Let's build something extraordinary`;
  const preheader = `Get started with modern design tools, presets, and export capabilities.`;

  const content = `
    <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 32px;">
      Welcome to ${appName}, ${name}! 👋
    </h1>
    <p style="margin: 0 0 20px 0; font-size: 15px; color: #8b949e; line-height: 24px;">
      We're thrilled to have you here. Launchpad is built from the ground up to give designers, founders, and developers the fastest, most expressive canvas for digital product mockups and app store assets.
    </p>

    <!-- Highlight Box -->
    <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
      <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #e6edf3;">
        Here is what you can do right now:
      </p>
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #8b949e; line-height: 20px;">
            ✨ <strong style="color: #c9d1d9;">Select high-res device mockups</strong> — Apple iPhones, iPads, and MacBooks.
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #8b949e; line-height: 20px;">
            🎨 <strong style="color: #c9d1d9;">Curated gradients & palettes</strong> — Instant modern color harmonies with one click.
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #8b949e; line-height: 20px;">
            📦 <strong style="color: #c9d1d9;">Cloud Project Saving</strong> — Seamless cloud persistence and frame syncing.
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 14px; color: #8b949e; line-height: 20px;">
            ⚡ <strong style="color: #c9d1d9;">Multi-format export</strong> — Download single frames or full zip archives at 2x/3x.
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${appUrl}" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
        Open Launchpad Studio &rarr;
      </a>
    </div>

    <p style="margin: 0; font-size: 14px; color: #6e7681; line-height: 20px;">
      Need any tips getting started? Simply reply to this email or visit our documentation.
    </p>
  `;

  return {
    subject: `Welcome to ${appName} — Let's build!`,
    html: renderBaseLayout({ title, preheader, content, appName, supportEmail }),
    text: `Welcome to ${appName}, ${name}!\n\nWe're thrilled to have you here. Launchpad is your workspace for high-resolution app store mockups and designs.\n\nOpen Studio: ${appUrl}\n\nQuestions? Contact ${supportEmail}`,
  };
};

module.exports = {
  compileWelcomeEmail,
};
