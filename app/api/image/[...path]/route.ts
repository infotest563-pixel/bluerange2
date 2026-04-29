/**
 * Dynamic Image Proxy API Route
 * ==============================
 * INSTANT UPDATE VERSION — WordPress image change = live immediately
 *
 * Caching layers we bypass:
 *   1. Next.js fetch cache     → cache: 'no-store'
 *   2. Next.js route cache     → export const dynamic = 'force-dynamic'
 *   3. Vercel CDN cache        → Cache-Control: no-store
 *   4. Browser cache           → Cache-Control: no-store
 */

import { NextRequest, NextResponse } from 'next/server';

const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_URL ||
  'https://dev-bluerange.pantheonsite.io';

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const types: Record<string, string> = {
    jpg:  'image/jpeg',
    jpeg: 'image/jpeg',
    png:  'image/png',
    gif:  'image/gif',
    webp: 'image/webp',
    svg:  'image/svg+xml',
    ico:  'image/x-icon',
    avif: 'image/avif',
  };
  return types[ext] ?? 'application/octet-stream';
}

function buildWpImageUrl(pathSegments: string[]): string {
  const joined = pathSegments.join('/');
  if (joined.startsWith('wp-content/')) {
    return `${WP_BASE_URL}/${joined}`;
  }
  return `${WP_BASE_URL}/wp-content/uploads/${joined}`;
}

// Layer 1 fix: Stop Next.js from caching this route
export const dynamic   = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (!path || path.length === 0) {
    return new NextResponse('Image path is required', { status: 400 });
  }

  const wpImageUrl = buildWpImageUrl(path);

  try {
    // Layer 2 fix: cache: 'no-store' → ALWAYS fetch fresh from WordPress
    // Never use Vercel's internal fetch cache
    const wpResponse = await fetch(wpImageUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent':               'NextJS-Image-Proxy/1.0',
        'Cache-Control':            'no-cache',       // tell WordPress: give fresh image
        'Pragma':                   'no-cache',       // old browsers/servers
      },
    });

    if (!wpResponse.ok) {
      console.error(`[image-proxy] Failed: ${wpImageUrl} → ${wpResponse.status}`);
      return new NextResponse('Image not found', { status: wpResponse.status });
    }

    const imageBuffer = await wpResponse.arrayBuffer();
    const filename    = path[path.length - 1];
    const contentType = getContentType(filename);

    // Layer 3 + 4 fix: Tell Vercel CDN and browser — do NOT cache this
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type':           contentType,
        'Content-Length':         String(imageBuffer.byteLength),

        // no-store = nothing is cached anywhere
        // Every request fetches fresh from WordPress
        'Cache-Control':          'no-store, no-cache, must-revalidate',
        'Pragma':                 'no-cache',
        'Expires':                '0',

        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error(`[image-proxy] Error fetching ${wpImageUrl}:`, error);
    return new NextResponse('Failed to fetch image', { status: 502 });
  }
}
