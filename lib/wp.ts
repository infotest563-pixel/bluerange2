/**
 * WordPress REST API Client
 * ==========================
 * Fetches pages, posts, settings, and menus from WordPress.
 *
 * CACHING STRATEGY:
 *   - All fetches use cache: 'no-store' → always fresh from WordPress
 *   - Pages use ISR with revalidate: 0 → build-time static, on-demand revalidation
 *   - WordPress webhooks call /api/revalidate to clear cache instantly
 *
 * This ensures:
 *   ✅ WordPress content updates appear instantly on Vercel
 *   ✅ No manual redeploy needed
 *   ✅ ACF fields included automatically
 */

import { transformPage, transformWpImages } from './wpImageTransform';

const WP = process.env.NEXT_PUBLIC_WP_URL || 'https://dev-bluerange.pantheonsite.io';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WpSettings = {
  show_on_front?: string;
  page_on_front?: number;
  page_for_posts?: number;
  options?: any;
  footer_form_html?: string;
  custom_logo_url?: string;
};

// ─── Settings ─────────────────────────────────────────────────────────────────

/**
 * Fetches site-wide settings (homepage ID, logo, footer HTML, etc.)
 * Cached for 5 minutes since settings rarely change.
 */
export async function getSettings(lang: string = 'sv'): Promise<WpSettings> {
  const url = `${WP}/wp-json/headless/v1/site-settings?lang=${lang}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }, // 5 minutes — settings change rarely
      headers: {
        'User-Agent': 'NextJS-Headless/1.0',
      },
    });

    if (!res.ok) {
      console.error(`[getSettings] ${res.status} ${res.statusText}`);
      return {} as WpSettings;
    }

    const data = await res.json();
    return transformWpImages({
      show_on_front: data.show_on_front,
      page_on_front: Number(data.page_on_front),
      page_for_posts: Number(data.page_for_posts),
      options: data.options,
      footer_form_html: data.footer_form_html,
      custom_logo_url: data.custom_logo_url,
    });
  } catch (err) {
    console.error(`[getSettings] Error:`, err);
    return {} as WpSettings;
  }
}

/**
 * Fetches site metadata (name, description, etc.)
 * Cached for 1 hour since site info changes very rarely.
 */
export async function getSite(lang: string = 'sv') {
  const url = `${WP}/wp-json/headless/v1/site/?lang=${lang}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // 1 hour
      headers: {
        'User-Agent': 'NextJS-Headless/1.0',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return { name: 'Bluerange', description: '' };
    }

    const siteData = await res.json();
    return transformWpImages(siteData);
  } catch (err) {
    console.error(`[getSite] Error:`, err);
    return { name: 'Bluerange', description: '' };
  }
}

// ─── Pages ────────────────────────────────────────────────────────────────────

/**
 * Fetches a single page by ID.
 *
 * IMPORTANT:
 *   - cache: 'no-store' → always fetches fresh from WordPress
 *   - Page component uses revalidate: 0 → static at build, revalidated on-demand
 *   - WordPress webhook calls /api/revalidate → clears Next.js cache instantly
 *
 * ACF fields are included automatically via:
 *   1. acf_format=standard query param
 *   2. ACF REST API plugin enabled in WordPress
 *   3. transformPage() converts all image URLs
 */
export async function getPageById(id: number, lang: string = 'sv') {
  try {
    const url = `${WP}/wp-json/wp/v2/pages/${id}?_embed&lang=${lang}&acf_format=standard`;

    const res = await fetch(url, {
      cache: 'no-store', // ✅ Always fetch fresh — no Next.js fetch cache
      headers: {
        'User-Agent': 'NextJS-Headless/1.0',
      },
    });

    if (!res.ok) {
      console.error(`[getPageById] ${res.status} for ID ${id}`);
      return null;
    }

    const page = await res.json();
    return transformPage(page);
  } catch (err) {
    console.error(`[getPageById] Error:`, err);
    return null;
  }
}

/**
 * Fetches a single page by slug.
 * Same caching strategy as getPageById.
 */
export async function getPageBySlug(slug: string, lang: string = 'sv') {
  try {
    const url = `${WP}/wp-json/wp/v2/pages?slug=${slug}&_embed&lang=${lang}&acf_format=standard`;

    const res = await fetch(url, {
      cache: 'no-store', // ✅ Always fetch fresh
      headers: {
        'User-Agent': 'NextJS-Headless/1.0',
      },
    });

    if (!res.ok) {
      console.error(`[getPageBySlug] ${res.status} for slug "${slug}"`);
      return null;
    }

    const data = await res.json();
    return transformPage(data[0] || null);
  } catch (err) {
    console.error(`[getPageBySlug] Error:`, err);
    return null;
  }
}

// ─── Posts ────────────────────────────────────────────────────────────────────

/**
 * Fetches a single post by slug.
 * Same caching strategy as pages.
 */
export async function getPostBySlug(slug: string, lang: string = 'sv') {
  try {
    const url = `${WP}/wp-json/wp/v2/posts?slug=${slug}&_embed&lang=${lang}&acf_format=standard`;

    const res = await fetch(url, {
      cache: 'no-store', // ✅ Always fetch fresh
      headers: {
        'User-Agent': 'NextJS-Headless/1.0',
      },
    });

    if (!res.ok) {
      console.error(`[getPostBySlug] ${res.status} for slug "${slug}"`);
      return null;
    }

    const data = await res.json();
    return transformPage(data[0] || null);
  } catch (err) {
    console.error(`[getPostBySlug] Error:`, err);
    return null;
  }
}

// ─── Media ────────────────────────────────────────────────────────────────────

/**
 * Fetches a single media item by ID.
 * Used for featured images and galleries.
 */
export async function getMedia(id: number, lang: string = 'sv') {
  try {
    const url = `${WP}/wp-json/wp/v2/media/${id}?lang=${lang}`;

    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'NextJS-Headless/1.0',
      },
    });

    if (!res.ok) {
      console.error(`[getMedia] ${res.status} for ID ${id}`);
      return null;
    }

    const media = await res.json();
    return transformWpImages(media);
  } catch (err) {
    console.error(`[getMedia] Error:`, err);
    return null;
  }
}

// ─── Menus ────────────────────────────────────────────────────────────────────

/**
 * Fetches a navigation menu by slug.
 * Cached for 5 minutes since menus change rarely.
 */
export async function getMenu(slug: string, lang: string = 'sv') {
  try {
    const url = `${WP}/wp-json/headless/v1/menus/${slug}?lang=${lang}`;

    const res = await fetch(url, {
      next: { revalidate: 300 }, // 5 minutes
      headers: {
        'User-Agent': 'NextJS-Headless/1.0',
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

// ─── Shortcodes ───────────────────────────────────────────────────────────────

/**
 * Renders a WordPress shortcode via custom REST endpoint.
 * Used for contact forms, galleries, etc.
 */
export async function renderShortcode(code: string) {
  if (!code) return '';

  try {
    const res = await fetch(`${WP}/wp-json/headless/v1/shortcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Headless/1.0',
      },
      body: JSON.stringify({ code }),
      cache: 'no-store',
    });

    if (!res.ok) return '';

    const data = await res.json();

    if (typeof data === 'string') return data;
    if (data?.html) return data.html;
    if (data?.data) return data.data;

    return '';
  } catch (e) {
    console.error('[renderShortcode] Error:', e);
    return '';
  }
}
