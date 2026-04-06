/**
 * @file lib/actions.ts
 * @description Next.js Server Actions for the Link-Wise application.
 *
 * All exports in this file run exclusively on the server (`'use server'`).
 * They are called from Client Components using React's `useActionState` hook
 * or await-ed directly in form actions.
 *
 * Actions:
 *  - `login`            — Triggers Keycloak SSO login redirect.
 *  - `logout`           — Signs the user out and redirects to home.
 *  - `shortenLink`      — Validates and creates a new short link in the DB.
 *  - `deleteLink`       — Soft-deletes a link (owner or admin only).
 *  - `toggleLinkActive` — Toggles a link's active/disabled state (owner or admin).
 *  - `bulkShortenLinks` — Batch-creates multiple short links.
 *  - `sendReport`       — Validates and dispatches an analytics report email via SMTP.
 */
/** 
 * @author Naveen Chauhan (https://github.com/ncrkindia) 
 * @project Link-Wise Analytics 
 */
'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { login as authLogin, logout as authLogout, getSession, getLogoutUrl } from './auth';
import { revalidatePath } from 'next/cache';
/** 
 * @author Naveen Chauhan (https://github.com/ncrkindia) 
 * @project Link-Wise Analytics 
 */
import { query } from './db';
import { headers } from 'next/headers';
import { sendReportEmail, sendCampaignReportEmail } from './email';
import type { Link as LinkType, EmailCampaign } from './definitions';

const FormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
});

export type ShortenState = {
  message?: string | null;
  shortUrl?: string;
  qrCodeUrl?: string;
  originalUrl?: string;
  errors?: {
    url?: string[];
    password?: string[];
    expiresAt?: string[];
  };
};

export async function shortenLink(prevState: ShortenState, formData: FormData): Promise<ShortenState> {
  const session = await getSession();

  const rawPassword = formData.get('password');
  const rawExpiresAt = formData.get('expiresAt');

  const isPixel = formData.get('isPixel') === 'true';
  const rawUrl = formData.get('url');

  if (isPixel && !session?.id) {
    return {
      message: 'You must be logged in to create tracking pixels.',
      errors: { url: ['Authentication required.'] },
    };
  }

  const validatedFields = FormSchema.extend({
    url: isPixel ? z.string().min(1, 'Please enter a reference name.') : z.string().url({ message: 'Please enter a valid URL.' }),
  }).safeParse({
    url: rawUrl ? String(rawUrl) : undefined,
    password: rawPassword ? String(rawPassword) : undefined,
    expiresAt: rawExpiresAt ? String(rawExpiresAt) : undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields. Failed to shorten link.',
    };
  }

  const { url, password, expiresAt } = validatedFields.data;

  const shortId = Math.random().toString(36).substring(2, 8);
  const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

  await query(
    'INSERT INTO links (id, original_url, user_id, expires_at, password_hash, is_pixel) VALUES (?, ?, ?, ?, ?, ?)',
    [
      shortId,
      url,
      session?.id || null,
      expiresAt ? new Date(expiresAt) : null,
      password ? password : null, 
      isPixel,
    ]
  );

  return {
    message: isPixel ? 'Tracking pixel created successfully!' : 'Link shortened successfully!',
    shortUrl: isPixel ? `${domain}/p/${shortId}` : `${domain}/s/${shortId}`,
    originalUrl: url,
    qrCodeUrl: '/qr-placeholder.svg', // Placeholder
  };
}


export async function unlockLink(prevState: { message: string }, formData: FormData) {
  const password = formData.get('password') as string;
  const id = formData.get('id') as string;

  const links = await query<any[]>('SELECT * FROM links WHERE id = ? AND is_deleted = FALSE', [id]);
  
  if (links.length === 0) {
    return { message: 'Link not found' };
  }

  const target = links[0];
  
  // In a production app, decrypt hashes here (e.g., bcrypt.compareSync). Using direct compare per current model.
  if (target.password_hash !== password) {
    return { message: 'Incorrect password' };
  }

  // Record metrics securely
  const reqHeaders = await headers();
  const ip = reqHeaders.get('x-forwarded-for') || null;
  const userAgent = reqHeaders.get('user-agent') || null;
  const referer = reqHeaders.get('referer') || null;
  const country = reqHeaders.get('x-vercel-ip-country') || null;

  await query(
    'INSERT INTO clicks (link_id, ip_address, user_agent, referrer, country_code) VALUES (?, ?, ?, ?, ?)',
    [id, ip, userAgent, referer, country]
  ).catch(e => console.error('Failed to log click', e));

  // Redirect bypasses React render and shoots straight to the URL
  redirect(target.original_url);
  return { message: 'Success' };
}

export async function login() {
  await authLogin();
}

export async function handleSignOut() {
    const logoutUrl = await getLogoutUrl();
    return logoutUrl;
}

export async function logout() {
    await authLogout();
}

// Admin actions
export async function toggleUserBlock(userId: string) {
    const session = await getSession();
    if (!session?.isAdmin) {
        throw new Error("You are not authorized to perform this action.");
    }
    await query('UPDATE users SET is_blocked = NOT is_blocked WHERE id = ?', [userId]);
    revalidatePath('/admin');
    return { message: `Toggled block status for user ${userId}`};
}

export async function deleteLink(linkId: string) {
    const session = await getSession();
    if (!session?.id) {
        throw new Error("You are not authorized to perform this action.");
    }
    
    if (session.isAdmin) {
        await query('UPDATE links SET is_deleted = TRUE WHERE id = ?', [linkId]);
    } else {
        await query('UPDATE links SET is_deleted = TRUE WHERE id = ? AND user_id = ?', [linkId, session.id]);
    }

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return { message: `Deleted link ${linkId}` };
}

export async function toggleLinkActive(linkId: string) {
    const session = await getSession();
    if (!session?.id) {
        throw new Error("You are not authorized to perform this action.");
    }

    if (session.isAdmin) {
        await query('UPDATE links SET is_active = NOT is_active WHERE id = ?', [linkId]);
    } else {
        await query('UPDATE links SET is_active = NOT is_active WHERE id = ? AND user_id = ?', [linkId, session.id]);
    }

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return { message: `Toggled link ${linkId} status.` };
}

export type BulkShortenState = {
  message?: string | null;
  results?: { originalUrl: string, shortUrl: string }[];
  errors?: string[];
};

export async function bulkShortenLinks(prevState: BulkShortenState, formData: FormData): Promise<BulkShortenState> {
  const session = await getSession();
  if (!session?.id) {
    return { message: 'You must be logged in to bulk shorten links.', errors: ['Unauthorized'] };
  }

  const rawUrls = formData.get('urls') as string;
  if (!rawUrls) {
    return { message: 'No URLs provided', errors: ['Empty input'] };
  }

  // Parse lines, strip spaces, ignore empty lines
  const urls = rawUrls.split(/\r?\n/).map(u => u.trim()).filter(Boolean);
  
  if (urls.length === 0) {
    return { message: 'No valid URLs found', errors: ['Empty input'] };
  }

  if (urls.length > 500) {
     return { message: 'Maximum 500 URLs allowed per batch', errors: ['Exceeds batch limit'] };
  }

  const results: { originalUrl: string, shortUrl: string }[] = [];
  const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // While real applications would optimize exactly with a single bulk INSERT ... VALUES (?, ?), (?, ?), 
  // executing iteratively over 10-50 urls is fine for this demonstration wrapper.
  for (const url of urls) {
    try {
      // Very basic validation loop, skipping bad URLs gracefully.
      new URL(url); 
      const shortId = Math.random().toString(36).substring(2, 8);
      await query(
        'INSERT INTO links (id, original_url, user_id, expires_at, password_hash) VALUES (?, ?, ?, ?, ?)',
        [shortId, url, session.id, null, null]
      );
      results.push({ originalUrl: url, shortUrl: `${domain}/s/${shortId}` });
    } catch {
      // Ignore individually malformed urls in the batch without crashing the whole set
      console.warn(`Skipped invalid url in bulk upload: ${url}`);
    }
  }

  revalidatePath('/dashboard');

  return {
    message: `Successfully processed ${results.length} links!`,
    results
  };
}

export async function sendReport(recipientEmail: string, links: LinkType[], filters?: Record<string, string>): Promise<{ success: boolean; message: string; previewUrl?: string }> {
  const session = await getSession();
  if (!session?.id) {
    return { success: false, message: 'You must be logged in to send reports.' };
  }

  const emailSchema = z.string().email();
  if (!emailSchema.safeParse(recipientEmail).success) {
    return { success: false, message: 'Invalid email address.' };
  }

  try {
    const result = await sendReportEmail(recipientEmail, links, { 
      name: session.name, 
      id: session.id, // Email
      isAdmin: !!session.isAdmin 
    }, filters);
    return {
      success: true,
      message: `Report sent to ${recipientEmail}!`,
      previewUrl: result.previewUrl as string | undefined,
    };
  } catch (err: any) {
    console.error('Failed to send report email:', err);
    return { success: false, message: `Failed to send report: ${err.message}` };
  }
}

export async function getAnalytics(linkId: string) {
  const session = await getSession();
  if (!session?.id) {
    throw new Error("Unauthorized");
  }

  // Verify ownership or admin status
  const links = await query<any[]>('SELECT user_id FROM links WHERE id = ?', [linkId]);
  if (links.length === 0) {
    throw new Error("Link not found");
  }

  if (links[0].user_id !== session.id && !session.isAdmin) {
    throw new Error("Unauthorized to view analytics for this link.");
  }

  const { getLinkClicks } = await import('./data');
  return await getLinkClicks(linkId);
}

/**
 * --- Email Campaign Manager Actions ---
 */

export async function saveEmailAccount(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session?.id) return { message: 'Not authenticated' };

  const id = formData.get('id') as string || crypto.randomUUID();
  const provider = formData.get('provider') as string;
  const host = formData.get('host') as string;
  const port = parseInt(formData.get('port') as string);
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const senderName = formData.get('senderName') as string;

  try {
    const existing = await query<any[]>('SELECT id FROM email_accounts WHERE id = ? AND user_id = ?', [id, session.id]);
    
    if (existing.length > 0) {
      if (password) {
        await query('UPDATE email_accounts SET provider = ?, host = ?, port = ?, username = ?, password = ?, sender_name = ? WHERE id = ?', [provider, host, port, username, password, senderName, id]);
      } else {
        await query('UPDATE email_accounts SET provider = ?, host = ?, port = ?, username = ?, sender_name = ? WHERE id = ?', [provider, host, port, username, senderName, id]);
      }
    } else {
      await query('INSERT INTO email_accounts (id, user_id, provider, host, port, username, password, sender_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, session.id, provider, host, port, username, password, senderName]);
    }

    revalidatePath('/dashboard/email-manager');
    return { success: true, message: 'Account saved successfully' };
  } catch (e) {
    console.error(e);
    return { message: 'Failed to save account' };
  }
}

export async function deleteEmailAccount(id: string) {
  const session = await getSession();
  if (!session?.id) throw new Error('Not authenticated');
  await query('DELETE FROM email_accounts WHERE id = ? AND user_id = ?', [id, session.id]);
  revalidatePath('/dashboard/email-manager');
}

export async function saveEmailTemplate(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session?.id) return { message: 'Not authenticated' };

  const id = formData.get('id') as string || crypto.randomUUID();
  const name = formData.get('name') as string;
  const subject = formData.get('subject') as string;
  const htmlContent = formData.get('htmlContent') as string;
  const textContent = formData.get('textContent') as string;

  try {
    const existing = await query<any[]>('SELECT id FROM email_templates WHERE id = ? AND user_id = ?', [id, session.id]);
    if (existing.length > 0) {
      await query('UPDATE email_templates SET name = ?, subject = ?, html_content = ?, text_content = ? WHERE id = ?', [name, subject, htmlContent, textContent, id]);
    } else {
      await query('INSERT INTO email_templates (id, user_id, name, subject, html_content, text_content) VALUES (?, ?, ?, ?, ?, ?)', [id, session.id, name, subject, htmlContent, textContent]);
    }
    revalidatePath('/dashboard/email-manager');
    return { success: true, message: 'Template saved successfully' };
  } catch (e) {
    console.error(e);
    return { message: 'Failed to save template' };
  }
}

export async function deleteEmailTemplate(id: string) {
  const session = await getSession();
  if (!session?.id) throw new Error('Not authenticated');
  await query('DELETE FROM email_templates WHERE id = ? AND user_id = ?', [id, session.id]);
  revalidatePath('/dashboard/email-manager');
}

import { sendCampaignEmail } from './email';

export async function launchCampaign(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session?.id) return { message: 'Not authenticated' };

  const campaignId = crypto.randomUUID();
  const name = formData.get('name') as string;
  const templateId = formData.get('templateId') as string;
  const accountId = formData.get('accountId') as string;
  const recipientStr = formData.get('recipients') as string;
  
  const emails = recipientStr.split(/[\s,;]+/).filter(e => e.includes('@'));

  if (emails.length === 0) return { message: 'No valid recipients found.' };

  try {
    const templates = await query<any[]>('SELECT * FROM email_templates WHERE id = ? AND user_id = ?', [templateId, session.id]);
    const accounts = await query<any[]>('SELECT * FROM email_accounts WHERE id = ? AND user_id = ?', [accountId, session.id]);

    if (templates.length === 0 || accounts.length === 0) {
        return { message: 'Invalid template or account selected.' };
    }
    
    const template = templates[0];
    const account = accounts[0];

    await query('INSERT INTO email_campaigns (id, user_id, name, template_id, account_id, recipients, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [campaignId, session.id, name, templateId, accountId, recipientStr, 'SENDING']);

    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD format
    const sanitizedCampaignName = name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');

    for (const email of emails) {
       const pixelId = Math.random().toString(36).substring(2, 8);
       const referenceName = `CT-${dateStr}-${sanitizedCampaignName}-${email}`;
       
       // Set is_active = true so tracking route picks it up
       await query('INSERT INTO links (id, original_url, user_id, is_pixel, is_active) VALUES (?, ?, ?, ?, ?)', [pixelId, referenceName, session.id, true, true]);
       await query('INSERT INTO campaign_sends (campaign_id, recipient, pixel_id) VALUES (?, ?, ?)', [campaignId, email, pixelId]);

       const pixelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://linkwise.slpro.in'}/p/${pixelId}`;
       await sendCampaignEmail(email, { 
         subject: template.subject, 
         html: template.html_content || '', 
         text: template.text_content || '' 
       }, account as any, pixelUrl, session.name || undefined);
    }

    await query("UPDATE email_campaigns SET status = 'COMPLETED' WHERE id = ?", [campaignId]);
    revalidatePath('/dashboard/email-manager');
    return { success: true, message: `Campaign launched successfully to ${emails.length} recipients.` };
  } catch (e) {
    console.error(e);
    await query("UPDATE email_campaigns SET status = 'FAILED' WHERE id = ?", [campaignId]);
    return { message: 'Campaign launch failed.' };
  }
}

export async function toggleCampaignActive(id: string) {
  const session = await getSession();
  if (!session?.id) throw new Error('Not authenticated');
  
  if (session.isAdmin) {
    await query('UPDATE email_campaigns SET is_active = NOT is_active WHERE id = ?', [id]);
  } else {
    await query('UPDATE email_campaigns SET is_active = NOT is_active WHERE id = ? AND user_id = ?', [id, session.id]);
  }
  revalidatePath('/dashboard/email-manager');
  revalidatePath('/admin');
}

export async function deleteCampaign(id: string) {
  const session = await getSession();
  if (!session?.id) throw new Error('Not authenticated');
  
  if (session.isAdmin) {
    await query('UPDATE email_campaigns SET is_deleted = TRUE WHERE id = ?', [id]);
  } else {
    await query('UPDATE email_campaigns SET is_deleted = TRUE WHERE id = ? AND user_id = ?', [id, session.id]);
  }
  revalidatePath('/dashboard/email-manager');
  revalidatePath('/admin');
}

export async function sendCampaignReport(recipientEmail: string, campaigns: EmailCampaign[], filters?: Record<string, string>): Promise<{ success: boolean; message: string; previewUrl?: string }> {
  const session = await getSession();
  if (!session?.id) {
    return { success: false, message: 'You must be logged in to send reports.' };
  }

  const emailSchema = z.string().email();
  if (!emailSchema.safeParse(recipientEmail).success) {
    return { success: false, message: 'Invalid email address.' };
  }

  try {
    const result = await sendCampaignReportEmail(recipientEmail, campaigns, {
      name: session.name,
      id: session.id, // Email
      isAdmin: !!session.isAdmin
    }, filters);
    return {
      success: true,
      message: `Campaign report sent to ${recipientEmail}!`,
      previewUrl: result.previewUrl as string | undefined,
    };
  } catch (err: any) {
    console.error('Failed to send campaign report:', err);
    return { success: false, message: `Failed to send report: ${err.message}` };
  }
}
