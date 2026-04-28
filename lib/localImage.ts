/**
 * Local Image Resolver
 * ====================
 * Converts WordPress image URLs → local /images/ paths.
 *
 * How it works:
 *   1. Extracts the filename from the WP URL  (e.g. "hero.jpg")
 *   2. Looks it up in the manifest (built by `npm run sync-images`)
 *   3. Returns "/images/hero.jpg" if found locally
 *   4. Falls back to the original WP URL if not found
 *
 * Works on both Server Components and Client Components.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type ManifestEntry = {
  id: string | number;
  filename: string;
  source_url: string;
  local_path: string;
  synced_at: string;
};

type Manifest = Record<string, ManifestEntry>;

// ─── Manifest loader (server-side only) ──────────────────────────────────────

/**
 * Builds a fast lookup map: filename → local_path
 * e.g. { "hero.jpg": "/images/hero.jpg", "logo.svg": "/images/logo.svg" }
 *
 * This runs only on the server (Node.js). On the client, the map is
 * pre-built at build time and passed down as props or used in Server Components.
 */
function buildFilenameMap(): Record<string, string> {
  // Only runs in Node.js (server / build time)
  if (typeof window !== 'undefined') return {};

  try {
    // Dynamic require so this doesn't break client bundles
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs   = require('fs')   as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');

    const manifestPath = path.join(process.cwd(), 'public', 'images', 'manifest.json');
    if (!fs.existsSync(manifestPath)) return {};

    const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const map: Record<string, string> = {};

    for (const entry of Object.values(manifest)) {
      if (entry.filename && entry.local_path) {
        // Key by filename (lowercase) for case-insensitive lookup
        map[entry.filename.toLowerCase()] = entry.local_path;
        // Also key by source_url for direct URL lookup
        map[entry.source_url] = entry.local_path;
      }
    }

    return map;
  } catch {
    return {};
  }
}

// ─── Mode switch ──────────────────────────────────────────────────────────────
// Set IMAGE_MODE=local in .env.local to serve from /public/images/ (requires sync)
// Set IMAGE_MODE=wp   in .env.local to serve directly from WordPress (always fresh)
// Default is 'wp' — images always up to date, no sync needed
const IMAGE_MODE = (
  typeof process !== 'undefined' &&
  process.env?.IMAGE_MODE === 'local'
) ? 'local' : 'wp';


let _filenameMap: Record<string, string> | null = null;

function getFilenameMap(): Record<string, string> {
  if (_filenameMap) return _filenameMap;
  _filenameMap = buildFilenameMap();
  return _filenameMap;
}

/**
 * Clears the in-memory manifest cache.
 * Call this after downloading a new image via webhook so the next
 * request rebuilds the map from the updated manifest.json on disk.
 */
export function bustManifestCache(): void {
  _filenameMap = null;
}

// ─── Core conversion function ─────────────────────────────────────────────────

/**
 * Sanitizes a filename the same way the sync script does.
 * e.g. "Hero Banner.jpg" → "hero-banner.jpg"
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
}

/**
 * Extracts the filename from any URL or path.
 * e.g. "https://example.com/wp-content/uploads/2023/09/hero.jpg" → "hero.jpg"
 */
function extractFilename(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1].split('?')[0]; // strip query string
}

/**
 * THE MAIN FUNCTION — use this everywhere in your components.
 *
 * IMAGE_MODE=wp    → always returns the WordPress URL (images update instantly)
 * IMAGE_MODE=local → returns /images/filename if synced, WP URL as fallback
 *
 * Set IMAGE_MODE in .env.local. Default is 'wp'.
 *
 * @example
 * wpImgUrl('https://dev-bluerange.pantheonsite.io/wp-content/uploads/2023/09/hero.jpg')
 * // IMAGE_MODE=wp    → 'https://dev-bluerange.pantheonsite.io/.../hero.jpg'
 * // IMAGE_MODE=local → '/images/hero.jpg'  (if synced)
 */
export function wpImgUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';

  // Upgrade http → https
  let normalized = url.trim();
  if (normalized.startsWith('http://')) {
    normalized = normalized.replace('http://', 'https://');
  }

  // Handle relative /wp-content/ paths — always expand to full URL first
  if (normalized.startsWith('/wp-content/') || normalized.startsWith('wp-content/')) {
    normalized = `https://dev-bluerange.pantheonsite.io/${normalized.replace(/^\//, '')}`;
  }

  // Already a local path — return as-is
  if (normalized.startsWith('/images/') || normalized.startsWith('/public/')) {
    return normalized;
  }

  // Non-WP external URL — return as-is
  if (normalized.startsWith('http') && !normalized.includes('pantheonsite.io') && !normalized.includes('wp-content')) {
    return normalized;
  }

  // ── IMAGE_MODE=wp: serve directly from WordPress, always fresh ────────────
  if (IMAGE_MODE === 'wp') {
    return normalized; // return the full WP URL — no local lookup needed
  }

  // ── IMAGE_MODE=local: serve from /public/images/ with WP fallback ─────────
  const map = getFilenameMap();

  // 1. Try direct source_url match (most accurate)
  if (map[normalized]) return map[normalized];

  // 2. Try by sanitized filename
  const rawFilename  = extractFilename(normalized);
  const safeFilename = sanitizeFilename(rawFilename);
  if (map[safeFilename]) return map[safeFilename];

  // 3. Try original filename (case-insensitive)
  if (map[rawFilename.toLowerCase()]) return map[rawFilename.toLowerCase()];

  // 4. Fallback — return the original WP URL
  return normalized;
}

/**
 * Resolves an ACF image field to a local path.
 * ACF can return: string URL | { url: string } | { source_url: string } | number (ID)
 *
 * @example
 * wpAcfImg(acf.banner_image)  // handles any ACF image field shape
 */
export function wpAcfImg(field: unknown): string {
  if (!field) return '';

  if (typeof field === 'string') {
    return wpImgUrl(field);
  }

  if (typeof field === 'object' && field !== null) {
    const obj = field as Record<string, unknown>;
    const url = (obj.url || obj.source_url || obj.guid) as string | undefined;
    if (url) return wpImgUrl(url);
  }

  // number (media ID) — can't resolve without fetching, return empty
  return '';
}

/**
 * Returns true if the image has been synced locally.
 * Useful for conditional rendering or debugging.
 */
export function isLocalImage(url: string | null | undefined): boolean {
  if (!url) return false;
  const resolved = wpImgUrl(url);
  return resolved.startsWith('/images/');
}

/**
 * Replaces all WordPress image URLs inside an HTML string with local paths.
 * Use this for WordPress page content rendered via dangerouslySetInnerHTML.
 *
 * @example
 * const html = replaceWpImagesInHtml(page.content.rendered);
 * <div dangerouslySetInnerHTML={{ __html: html }} />
 */
export function replaceWpImagesInHtml(html: string | null | undefined): string {
  if (!html) return '';

  // In wp mode — no replacement needed, WP URLs work directly
  if (IMAGE_MODE === 'wp') return html;

  const map = getFilenameMap();
  if (Object.keys(map).length === 0) return html;

  // Replace all WP image URLs in src="..." and url('...') patterns
  return html.replace(
    /https?:\/\/[^"'\s)]+\/wp-content\/uploads\/[^"'\s)]+/g,
    (match) => {
      const local = wpImgUrl(match);
      return local || match;
    }
  );
}

// Legacy aliases — keep backward compatibility with old code
export const getLocalImagePath = wpImgUrl;
export const resolveAcfImageUrl = wpAcfImg;
