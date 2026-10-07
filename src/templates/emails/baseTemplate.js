// src/templates/emails/baseTemplate.js — Common responsive layout wrapper for emails
'use strict';

/**
 * Base layout wrapper for all transactional emails.
 *
 * @param {{
 *   title: string,
 *   preheader?: string,
 *   content: string,
 *   appName?: string,
 *   year?: number,
 *   supportEmail?: string
 * }} options
 * @returns {string} Fully formatted HTML email document
 */
const renderBaseLayout = ({
  title,
  preheader = '',
  content,
  appName = 'Launchpad',
  year = new Date().getFullYear(),
  supportEmail = 'support@launchpad.app',
}) => {
  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1117; color: #c9d1d9; }
    
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 16px !important; }
      .content-cell { padding: 24px 20px !important; }
      .btn-primary { display: block !important; width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; color: #e6edf3;">
  ${preheader ? `<div style="display: none; max-height: 0px; overflow: hidden;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>` : ''}
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #090d16; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <!-- Email Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px;" class="email-container">
          
          <!-- Header / Brand -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="display: flex; align-items: center; justify-content: center;">
                    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 12px; padding: 10px 14px; display: inline-block; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">
                      <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-decoration: none;">🚀 ${appName}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color: #161b22; border-radius: 16px; border: 1px solid #30363d; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45); overflow: hidden;">
              <!-- Accent Line -->
              <div style="height: 3px; background: linear-gradient(90deg, #10B981, #3B82F6, #8B5CF6); width: 100%;"></div>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="content-cell" style="padding: 36px 36px 40px 36px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 28px; padding-bottom: 20px; color: #8b949e; font-size: 13px; line-height: 20px;">
              <p style="margin: 0 0 8px 0;">
                Need help or have questions? Contact us at 
                <a href="mailto:${supportEmail}" style="color: #10B981; text-decoration: none; font-weight: 500;">${supportEmail}</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #484f58;">
                &copy; ${year} ${appName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = {
  renderBaseLayout,
};
