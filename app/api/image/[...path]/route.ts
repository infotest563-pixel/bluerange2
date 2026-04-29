/**
 * Dynamic Image Proxy API Route
 * ==============================
 * Fetches images from WordPress and serves them under your own domain.
 *
 * URL pattern:  /api/image/[...path]
 * Examples:
 *   /api/image/hero.jpg
 *   /api/image/2023/09/hero.jpg
 *   /api/image/wp-content/uploads/2023/09/hero.jpg
 *
 * The browser always sees /images/hero.jpg (via rewrite in next.config.ts).
 * This route secretly fetches the real image from WordPress.
 */

import { NextRequest, NextResponse } from 'next/server';

// Your WordPress base URL — reads from environment variable
// Set NEXT_PUBLIC_WP_URL in Vercel environment variables
const WP_BASE_URL =
  process.env.NEXT_PUBLIC_WP_URL ||
  'https://dev-bluerange.pantheonsite.io';

/**
 * Maps a file extension to its MIME content type.
 * This tells the browser what kind of file it's receiving.
 */
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
 * Builds the WordPress image URL from the path segments.
 *
 * Examples:
 *   ['hero.jpg']                          → .../wp-content/uploads/hero.jpg
 *   ['2023', '09', 'hero.jpg']            → .../wp-content/uploads/2023/09/hero.jpg
 *   ['wp-content', 'uploads', 'hero.jpg'] → .../wp-content/uploads/hero.jpg (no double prefix)
 */
function buildWpImageUrl(pathSegments: string[]): string {
  const joined = pathSegments.join('/');

  // If the path already includes wp-content, don't add it again
  if (joined.startsWith('wp-content/')) {
    return `${WP_BASE_URL}/${joined}`;
  }

  return `${WP_BASE_URL}/wp-content/uploads/${joined}`;
}

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
    // ── Speed Optimization 1: Browser Cache Hit ───────────────────────────
    // If browser sends If-None-Match header (ETag), check if image changed.
    // If NOT changed → return 304 (empty body) → browser uses cached version.
    // This is the FASTEST possible response — no image data transferred at all.
    const ifNoneMatch = request.headers.get('if-none-match');

    const wpResponse = await fetch(wpImageUrl, {
      next: { revalidate: 60 }, // recheck WordPress every 60 seconds
      headers: {
        'User-Agent': 'NextJS-Image-Proxy/1.0',
        // Forward ETag check to WordPress
        ...(ifNoneMatch ? { 'If-None-Match': ifNoneMatch } : {}),
      },
    });

    // WordPress says image not changed → tell browser to use its cache
    if (wpResponse.status === 304) {
      return new NextResponse(null, { status: 304 });
    }

    if (!wpResponse.ok) {
      console.error(`[image-proxy] Failed: ${wpImageUrl} → ${wpResponse.status}`);
      return new NextResponse(`Image not found`, { status: wpResponse.status });
    }

    const imageBuffer = await wpResponse.arrayBuffer();
    const filename    = path[path.length - 1];
    const contentType = getContentType(filename);

    // ── Speed Optimization 3: ETag for future requests ────────────────────
    // ETag = unique fingerprint of the image.
    // Next visit: browser sends ETag → if image unchanged → 304 (instant).
    const etag = wpResponse.headers.get('etag') ??
      `"${path.join('-')}-${imageBuffer.byteLength}"`;

    // ── Speed Optimization 4: Smart Caching Strategy ─────────────────
    // max-age=0                 → Browser ALWAYS checks server (but uses ETag for instant 304)
    // s-maxage=31536000         → Vercel Edge CDN caches 1 year (but revalidates via ETag)
    // stale-while-revalidate    → Serve cached instantly, refresh in background
    //
    // Result: FAST (CDN cached) + FRESH (ETag checks if changed every request)
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type':           contentType,
        'Cache-Control':          'public, max-age=0, s-maxage=31536000, stale-while-revalidate=31536000',
        'ETag':                   etag,
        'X-Content-Type-Options': 'nosniff',
        // ── Speed Optimization 5: Tell browser image size upfront ─────────
        'Content-Length':         String(imageBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error(`[image-proxy] Error fetching ${wpImageUrl}:`, error);
    return new NextResponse('Failed to fetch image', { status: 502 });
  }
}
