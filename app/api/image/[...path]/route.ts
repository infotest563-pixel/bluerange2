/**
 * Dynamic Image Proxy API Route
 * ==============================
 * Fetches images from WordPress and serves them under your own domain.
 *
 * CACHING STRATEGY:
 *   - no-store on fetch  → ALWAYS get fresh image from WordPress (no stale cache)
 *   - ETag support       → If image unchanged, browser gets instant 304 (no data transfer)
 *   - Cache-Control      → Browser caches 60s, CDN caches 60s, then revalidates
 *
 * Result: Fresh images within 60 seconds of WordPress update. Fast on repeat visits.
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

// Tell Next.js: do NOT cache this route at the framework level
// This ensures every request actually runs this function
export const dynamic = 'force-dynamic';
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
    // ── ETag: If browser has cached version, check if image changed ──────
    // Browser sends: If-None-Match: "abc123"
    // WordPress says: still same → we return 304 → browser uses cache (instant!)
    const ifNoneMatch   = request.headers.get('if-none-match');
    const ifModifiedSince = request.headers.get('if-modified-since');

    const wpResponse = await fetch(wpImageUrl, {
      // ⚠️ KEY FIX: cache: 'no-store' means ALWAYS fetch fresh from WordPress
      // This bypasses Vercel's fetch cache completely
      // Without this, Vercel caches the fetch result and old image is returned
      cache: 'no-store',

      headers: {
        'User-Agent': 'NextJS-Image-Proxy/1.0',
        // Forward browser's cache headers to WordPress
        ...(ifNoneMatch     ? { 'If-None-Match':     ifNoneMatch     } : {}),
        ...(ifModifiedSince ? { 'If-Modified-Since': ifModifiedSince } : {}),
      },
    });

    // Image not changed → browser uses its cached copy instantly
    if (wpResponse.status === 304) {
      return new NextResponse(null, { status: 304 });
    }

    if (!wpResponse.ok) {
      console.error(`[image-proxy] Failed: ${wpImageUrl} → ${wpResponse.status}`);
      return new NextResponse('Image not found', { status: wpResponse.status });
    }

    const imageBuffer = await wpResponse.arrayBuffer();
    const filename    = path[path.length - 1];
    const contentType = getContentType(filename);

    // Use ETag from WordPress if available, otherwise generate one
    const etag         = wpResponse.headers.get('etag') ??
      `"${Buffer.from(wpImageUrl).toString('base64').slice(0, 16)}-${imageBuffer.byteLength}"`;
    const lastModified = wpResponse.headers.get('last-modified') ?? new Date().toUTCString();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type':     contentType,
        'Content-Length':   String(imageBuffer.byteLength),

        // ── Cache-Control explained ────────────────────────────────────────
        // max-age=60              → Browser caches for 60 seconds
        // s-maxage=60             → Vercel CDN caches for 60 seconds
        // stale-while-revalidate=30 → Serve stale for 30s while fetching fresh
        //
        // After 60s: next request fetches fresh from WordPress automatically
        // WordPress image change → live on site within 60 seconds ✅
        'Cache-Control':    'public, max-age=60, s-maxage=60, stale-while-revalidate=30',

        // ETag + Last-Modified → enables instant 304 responses (no data transfer)
        'ETag':             etag,
        'Last-Modified':    lastModified,

        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error(`[image-proxy] Error fetching ${wpImageUrl}:`, error);
    return new NextResponse('Failed to fetch image', { status: 502 });
  }
}
