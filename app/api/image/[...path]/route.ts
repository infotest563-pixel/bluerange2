/**
 * Dynamic Image Proxy API Route
 * ==============================
 * INSTANT UPDATE VERSION — WordPress image change = live immediately
 *
 * Caching layers bypassed:
 *   1. Next.js fetch cache  → cache: 'no-store'
 *   2. Next.js route cache  → export const dynamic = 'force-dynamic'
 *   3. Vercel CDN cache     → Cache-Control: no-store + Vercel-CDN-Cache-Control
 *   4. Browser cache        → Cache-Control: no-store
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

// Stop Next.js from caching this route at framework level
export const dynamic    = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (!path || path.length === 0) {
    return new NextResponse('Image path is required', { status: 400 });
  }

  const wpImageUrl = buildWpImageUrl(path);

  try {
    // Always fetch fresh from WordPress — bypass ALL fetch caches
    const wpResponse = await fetch(wpImageUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent':    'NextJS-Image-Proxy/1.0',
        'Cache-Control': 'no-cache, no-store',
        'Pragma':        'no-cache',
      },
    });

    if (!wpResponse.ok) {
      console.error(`[image-proxy] Failed: ${wpImageUrl} → ${wpResponse.status}`);
      return new NextResponse('Image not found', { status: wpResponse.status });
    }

    const imageBuffer = await wpResponse.arrayBuffer();
    const filename    = path[path.length - 1];
    const contentType = getContentType(filename);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type':    contentType,
        'Content-Length':  String(imageBuffer.byteLength),

        // Tell browser: never cache
        'Cache-Control':   'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma':          'no-cache',
        'Expires':         '0',

        // Tell Vercel Edge CDN specifically: do NOT cache this response
        // This is the KEY header that stops Vercel CDN from caching
        'CDN-Cache-Control':    'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',

        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error(`[image-proxy] Error fetching ${wpImageUrl}:`, error);
    return new NextResponse('Failed to fetch image', { status: 502 });
  }
}
