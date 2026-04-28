/**
 * wpImageTransform.ts
 * ====================
 * GLOBAL image URL transformer for WordPress API data.
 *
 * Instead of calling wpImgUrl() manually in every component,
 * this module transforms the entire WordPress API response object
 * ONCE — before it reaches any component.
 *
 * How it works:
 *   wp.ts fetches data → transformPageImages(data) → components get clean local paths
 *
 * Handles ALL of these automatically:
 *   - ACF image fields (string URL, object {url}, object {source_url})
 *   - Featured image (_embedded wp:featuredmedia)
 *   - HTML content (page.content.rendered, page.excerpt.rendered)
 *   - Nested arrays and objects (repeater fields, galleries)
 *   - background_image style attributes in HTML
 */

import { wpImgUrl, wpAcfImg, replaceWpImagesInHtml } from './localImage';

// ─── Known image field names in WordPress / ACF ───────────────────────────────
// Any key matching these names will be treated as an image field
const IMAGE_FIELD_KEYS = new Set([
  'url', 'src', 'href',
  'source_url', 'guid',
  'image', 'img', 'photo', 'thumbnail', 'logo',
  'banner', 'background', 'icon', 'avatar',
  // ACF common field names
  'banner_image', 'banner_background_image', 'background_image',
  'featured_image', 'hero_image', 'header_image',
  'right_image', 'left_image', 'center_image',
  'section_image', 'content_image', 'page_image',
  'card_image', 'team_image', 'partner_image',
  'logo_image', 'icon_image', 'gallery_image',
  'latest_technology_image', 'service_image', 'product_image',
  'custom_logo_url', 'custom_logo',
  // WordPress core fields
  'link', 'full', 'medium', 'thumbnail', 'medium_large',
]);

// Keys that contain HTML content — run replaceWpImagesInHtml on these
const HTML_FIELD_KEYS = new Set([
  'rendered',        // page.content.rendered, page.title.rendered
  'content',
  'excerpt',
  'description',
  'html',
  'body',
  'footer_form_html',
]);

// Keys to completely skip (not image-related, avoid false positives)
const SKIP_KEYS = new Set([
  'id', 'ID', 'slug', 'status', 'type', 'date', 'modified',
  'author', 'parent', 'menu_order', 'comment_status',
  'ping_status', 'password', 'template', 'format',
  'meta', 'categories', 'tags', 'acf_fc_layout',
  'lang', 'translations', 'pll_sync_post',
  'title',  // title.rendered is handled separately
]);

// ─── Type helpers ─────────────────────────────────────────────────────────────

type AnyObject = Record<string, unknown>;

/**
 * Checks if a string looks like a WordPress image URL
 */
function isWpImageUrl(value: string): boolean {
  return (
    value.includes('/wp-content/uploads/') ||
    value.includes('pantheonsite.io') ||
    /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i.test(value)
  );
}

/**
 * Checks if a string looks like HTML content
 */
function looksLikeHtml(value: string): boolean {
  return value.includes('<') && value.includes('>') && value.length > 50;
}

// ─── Core recursive transformer ───────────────────────────────────────────────

/**
 * Recursively walks any WordPress API response object and:
 * 1. Converts image URL strings → local /images/ paths
 * 2. Replaces WP URLs inside HTML content strings
 * 3. Handles nested objects and arrays
 *
 * Returns a new object — does NOT mutate the original.
 */
export function transformWpImages<T>(data: T, depth = 0): T {
  // Prevent infinite recursion on deeply nested structures
  if (depth > 15) return data;

  // null / undefined / primitives that aren't strings
  if (data === null || data === undefined) return data;
  if (typeof data === 'number' || typeof data === 'boolean') return data;

  // String — check if it's an image URL or HTML
  if (typeof data === 'string') {
    if (!data.trim()) return data;
    if (isWpImageUrl(data)) return wpImgUrl(data) as unknown as T;
    if (looksLikeHtml(data)) return replaceWpImagesInHtml(data) as unknown as T;
    return data;
  }

  // Array — transform each element
  if (Array.isArray(data)) {
    return data.map(item => transformWpImages(item, depth + 1)) as unknown as T;
  }

  // Object — transform each value
  if (typeof data === 'object') {
    const obj = data as AnyObject;
    const result: AnyObject = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip non-image keys to avoid false positives
      if (SKIP_KEYS.has(key)) {
        result[key] = value;
        continue;
      }

      // HTML content fields — replace WP URLs inside HTML
      if (HTML_FIELD_KEYS.has(key) && typeof value === 'string') {
        result[key] = replaceWpImagesInHtml(value);
        continue;
      }

      // Known image field names with string value
      if (IMAGE_FIELD_KEYS.has(key) && typeof value === 'string' && value.startsWith('http')) {
        result[key] = wpImgUrl(value);
        continue;
      }

      // ACF image object { url, width, height, ... } or { source_url, ... }
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        (
          (value as AnyObject).url ||
          (value as AnyObject).source_url
        )
      ) {
        const imgUrl = wpAcfImg(value);
        if (imgUrl) {
          // Keep the object but replace the url/source_url inside it
          const inner = value as AnyObject;
          result[key] = {
            ...transformWpImages(inner, depth + 1),
            url: imgUrl,
            source_url: imgUrl,
          };
          continue;
        }
      }

      // Recurse into nested objects and arrays
      result[key] = transformWpImages(value, depth + 1);
    }

    return result as unknown as T;
  }

  return data;
}

/**
 * Transforms a single WordPress page/post object.
 * Handles: ACF fields, content HTML, featured image, excerpt.
 */
export function transformPage(page: AnyObject | null): AnyObject | null {
  if (!page) return null;
  return transformWpImages(page);
}

/**
 * Transforms an array of WordPress pages/posts.
 */
export function transformPages(pages: AnyObject[]): AnyObject[] {
  if (!Array.isArray(pages)) return [];
  return pages.map(transformPage).filter(Boolean) as AnyObject[];
}
