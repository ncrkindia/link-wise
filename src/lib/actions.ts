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
'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { login as authLogin, logout as authLogout, getSession, getLogoutUrl } from './auth';
import { revalidatePath } from 'next/cache';
import { query } from './db';
import { headers } from 'next/headers';
import { sendReportEmail } from './email';
import type { Link as LinkType } from './definitions';

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

  const validatedFields = FormSchema.safeParse({
    url: formData.get('url'),
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
    'INSERT INTO links (id, original_url, user_id, expires_at, password_hash) VALUES (?, ?, ?, ?, ?)',
    [
      shortId,
      url,
      session?.id || null,
      expiresAt ? new Date(expiresAt) : null,
      password ? password : null, 
    ]
  );

  return {
    message: 'Link shortened successfully!',
    shortUrl: `${domain}/s/${shortId}`,
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

export async function sendReport(recipientEmail: string, links: LinkType[]): Promise<{ success: boolean; message: string; previewUrl?: string }> {
  const session = await getSession();
  if (!session?.id) {
    return { success: false, message: 'You must be logged in to send reports.' };
  }

  const emailSchema = z.string().email();
  if (!emailSchema.safeParse(recipientEmail).success) {
    return { success: false, message: 'Invalid email address.' };
  }

  try {
    const result = await sendReportEmail(recipientEmail, links);
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
