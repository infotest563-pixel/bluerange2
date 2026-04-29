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
  // params.path is an array of URL segments
  // e.g. /api/image/2023/09/hero.jpg → ['2023', '09', 'hero.jpg']
  const { path } = await params;

  if (!path || path.length === 0) {
    return new NextResponse('Image path is required', { status: 400 });
  }

  const wpImageUrl = buildWpImageUrl(path);

  try {
    // Fetch the image from WordPress
    const wpResponse = await fetch(wpImageUrl, {
      // Cache the WordPress response for 1 hour on the server
      // This means: if 100 users request the same image within 1 hour,
      // WordPress is only hit ONCE — the rest are served from cache.
      next: { revalidate: 3600 },

      headers: {
        // Identify ourselves to WordPress
        'User-Agent': 'NextJS-Image-Proxy/1.0',
      },
    });

    if (!wpResponse.ok) {
      console.error(
        `[image-proxy] Failed to fetch ${wpImageUrl}: ${wpResponse.status} ${wpResponse.statusText}`
      );
      return new NextResponse(`Image not found: ${path.join('/')}`, {
        status: wpResponse.status,
      });
    }

    // Get the raw image bytes from WordPress
    const imageBuffer = await wpResponse.arrayBuffer();

    // Determine the filename (last segment) for content-type detection
    const filename = path[path.length - 1];
    const contentType = getContentType(filename);

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        // Tell the browser what type of file this is
        'Content-Type': contentType,

        // Cache-Control strategy:
        //   public          — can be cached by CDN (Vercel Edge) and browsers
        //   max-age=3600    — browser caches for 1 hour
        //   s-maxage=86400  — Vercel Edge CDN caches for 24 hours
        //   stale-while-revalidate=86400 — serve stale while fetching fresh in background
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',

        // Security: prevent the image from being embedded in iframes on other sites
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error(`[image-proxy] Error fetching ${wpImageUrl}:`, error);
    return new NextResponse('Failed to fetch image', { status: 502 });
  }
}
