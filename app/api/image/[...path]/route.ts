/**
 * Dynamic Image Proxy API Route
 * ==============================
 * Fetches images from WordPress and serves them through Next.js.
 * Images always come fresh — no stale cache ever shown.
 *
 * Cache layers bypassed:
 *   1. Next.js route cache    → export const dynamic = 'force-dynamic'
 *   2. Next.js fetch cache    → cache: 'no-store'
 *   3. Vercel CDN cache       → CDN-Cache-Control: no-store
 *   4. Browser cache          → Cache-Control: no-store
 *   5. Pantheon/WP CDN cache  → unique timestamp query param on every request
 */

import { type NextRequest, NextResponse } from 'next/server';

const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_URL ||
  'https://dev-bluerange.pantheonsite.io';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

/**
 * Builds the full WordPress image URL from path segments.
 *
 * Adds a unique timestamp query param on EVERY request.
 * This forces Pantheon CDN to bypass its own cache and fetch
 * fresh from WordPress origin — critical when the same filename
 * is reused after an image replacement in WordPress.
 *
 * Example:
 *   ['2023','09','hero.jpg'] → https://dev-bluerange.../wp-content/uploads/2023/09/hero.jpg?_t=1714390123456
 */
function buildWpImageUrl(pathSegments: string[]): string {
  const joined = pathSegments.join('/');

  // Unique per-request timestamp — bypasses Pantheon CDN on every call
  const ts = `?_t=${Date.now()}`;

  if (joined.startsWith('wp-content/')) {
    return `${WP_BASE_URL}/${joined}${ts}`;
  }
  return `${WP_BASE_URL}/wp-content/uploads/${joined}${ts}`;
}

// ── Route config ──────────────────────────────────────────────────────────────

// Prevent Next.js from caching this route at the framework level
export const dynamic    = 'force-dynamic';
export const revalidate = 0;

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (!path || path.length === 0) {
    return new NextResponse('Image path is required', { status: 400 });
  }

  const wpImageUrl = buildWpImageUrl(path);

  try {
    // Fetch fresh from WordPress — bypass ALL fetch-level caches
    const wpResponse = await fetch(wpImageUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent':    'NextJS-Image-Proxy/1.0',
        'Cache-Control': 'no-cache, no-store',
        'Pragma':        'no-cache',
      },
    });

    if (!wpResponse.ok) {
      console.error(`[image-proxy] ${wpResponse.status} → ${wpImageUrl}`);
      return new NextResponse('Image not found', { status: wpResponse.status });
    }

    const imageBuffer = await wpResponse.arrayBuffer();
    const filename    = path[path.length - 1];
    const contentType = getContentType(filename);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type':   contentType,
        'Content-Length': String(imageBuffer.byteLength),

        // ── Browser: never cache ──────────────────────────────────────────
        'Cache-Control':  'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma':         'no-cache',
        'Expires':        '0',

        // ── Vercel Edge CDN: never cache ──────────────────────────────────
        // Without these, Vercel CDN caches the image even if browser doesn't
        'CDN-Cache-Control':        'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',

        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error(`[image-proxy] Error fetching ${wpImageUrl}:`, error);
    return new NextResponse('Failed to fetch image', { status: 502 });
  }
}
