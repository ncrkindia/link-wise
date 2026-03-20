/**
 * @file lib/email.ts
 * @description SMTP email utility for Link-Wise report delivery via Nodemailer.
 *
 * This module provides two primary exports:
 *
 * - `createMailer()`: Returns a configured Nodemailer transporter.
 *   - If `SMTP_HOST` is set in `.env.local`, it uses the provided SMTP credentials.
 *   - If `SMTP_HOST` is NOT set, it auto-creates an Ethereal test account, allowing
 *     you to preview sent emails at the URL logged in the server console.
 *
 * - `sendReportEmail(emailAddress, links)`: Composes and sends an HTML analytics
 *   report email matching the Link-Wise brand (dark heading, table with badge
 *   styling for statuses, branded footer). Falls back to a plaintext body.
 *
 * Required environment variables (optional — falls back to Ethereal):
 *   SMTP_HOST  — e.g. smtp.gmail.com
 *   SMTP_PORT  — e.g. 587
 *   SMTP_USER  — SMTP authentication username
 *   SMTP_PASS  — SMTP authentication password
 */
import nodemailer from 'nodemailer';
import { type Link as LinkType } from './definitions';

export async function createMailer() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test account for Ethereal if no SMTP config is provided
    const testAccount = await nodemailer.createTestAccount();
    console.log("Created Ethereal Email test account:", testAccount.user);
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    // Attach the account to the transporter so we can log it later
    (transporter as any).testAccount = testAccount;
    return transporter;
  }
}

export async function sendReportEmail(emailAddress: string, links: LinkType[]) {
  const transporter = await createMailer();
  
  // Format HTML Email matching Link-Wise theme
  const trs = links.map(link => {
      const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
      const status = !link.isActive ? 'Disabled' : (isExpired ? 'Expired' : 'Active');
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;"><strong>/${link.id}</strong></td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${link.originalUrl}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${link.clicks}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">
             <span style="display:inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; background-color: ${status === 'Active' ? '#f1f5f9' : (status === 'Expired' ? '#fee2e2' : '#f3f4f6')}; color: ${status === 'Active' ? '#475569' : (status === 'Expired' ? '#ef4444' : '#9ca3af')};">
                ${status}
             </span>
          </td>
        </tr>
      `;
  }).join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 28px; letter-spacing: -0.05em; font-weight: 800;">Link-Wise</h1>
        <p style="color: #64748b; margin-top: 8px;">Your Dashboard Report</p>
      </div>

      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Link Performance Summary</h2>
        <p style="color: #475569; margin-bottom: 24px;">Here are your filtered links and their current analytics performance:</p>
        
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr>
              <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #0f172a; font-weight: 600;">Short Link</th>
              <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #0f172a; font-weight: 600;">Original URL</th>
              <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #0f172a; font-weight: 600;">Clicks</th>
              <th style="padding: 12px; border-bottom: 2px solid #cbd5e1; color: #0f172a; font-weight: 600;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${trs}
          </tbody>
        </table>

        ${links.length === 0 ? '<p style="text-align: center; color: #64748b; padding: 20px;">No links match your report criteria.</p>' : ''}
      </div>

      <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 14px;">
        <p>&copy; ${new Date().getFullYear()} Link-Wise App. All rights reserved.</p>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: '"Link-Wise" <reports@linkwise.app>',
    to: emailAddress,
    subject: `Report: Your Link-Wise Analytics (${new Date().toLocaleDateString()})`,
    text: "Please view this email in an HTML compatible client.", // plaintext fallback
    html: html,
  });

  console.log("Message sent: %s", info.messageId);
  // Preview only available when sending through an Ethereal account
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("Preview URL: %s", previewUrl);
  }

  return { messageId: info.messageId, previewUrl };
}
