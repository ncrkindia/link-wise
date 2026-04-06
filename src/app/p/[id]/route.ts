import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// 1x1 transparent PNG pixel
const PIXEL_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check if link exists and is a pixel
  const links = await query<any[]>(
    'SELECT * FROM links WHERE id = ? AND is_deleted = FALSE AND is_active = TRUE AND is_pixel = TRUE LIMIT 1',
    [id]
  );

  if (links.length === 0) {
    return new NextResponse(null, { status: 404 });
  }

  // Log analytics
  const reqHeaders = await headers();
  const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0] || null;
  const userAgent = reqHeaders.get('user-agent') || null;
  const referer = reqHeaders.get('referer') || null;
  const country = reqHeaders.get('x-vercel-ip-country') || null;

  await query(
    'INSERT INTO clicks (link_id, ip_address, user_agent, referrer, country_code) VALUES (?, ?, ?, ?, ?)',
    [id, ip, userAgent, referer, country]
  ).catch(e => console.error('Failed to log pixel open', e));

  // Return the pixel image
  return new NextResponse(PIXEL_BUFFER, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': PIXEL_BUFFER.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
