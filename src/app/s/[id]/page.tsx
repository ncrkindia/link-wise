/**
 * @file app/s/[id]/page.tsx
 * @description Dynamic short link redirect handler.
 *
 * This Server Component is responsible for resolving a short link ID to its
 * original destination URL and performing a server-side redirect. It also
 * handles the following edge cases before redirecting:
 *
 *  - **Not found / disabled / soft-deleted**: Returns a 404 page.
 *  - **Expired**: Renders an expiry message instead of redirecting.
 *  - **Password protected**: Renders the <UnlockForm> challenge UI.
 *  - **Normal**: Logs a click analytics event and redirects via `redirect()`.
 *
 * Route: `/s/[id]`
 */
import { query } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { UnlockForm } from '@/components/unlock-form';

export default async function ShortLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const links = await query<any[]>('SELECT * FROM links WHERE id = ? AND is_deleted = FALSE AND is_active = TRUE LIMIT 1', [id]);

  if (links.length === 0) {
    notFound();
  }

  const target = links[0];

  if (target.expires_at && new Date(target.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <h1 className="text-2xl font-bold font-headline text-destructive">This link has expired.</h1>
      </div>
    );
  }

  // If password protected, intercept the auto-redirect by rendering the challenge screen natively
  if (target.password_hash) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <UnlockForm id={id} />
      </div>
    );
  }

  // Otherwise, automatically log the analytics and instantly route them
  const reqHeaders = await headers();
  const ip = reqHeaders.get('x-forwarded-for') || null;
  const userAgent = reqHeaders.get('user-agent') || null;
  const referer = reqHeaders.get('referer') || null;
  const country = reqHeaders.get('x-vercel-ip-country') || null;

  await query(
    'INSERT INTO clicks (link_id, ip_address, user_agent, referrer, country_code) VALUES (?, ?, ?, ?, ?)',
    [id, ip, userAgent, referer, country]
  ).catch(e => console.error('Failed to log click', e));

  redirect(target.original_url);
}
