/**
 * On-Demand Revalidation API
 * ===========================
 * WordPress calls this endpoint when a page/post is saved.
 * Next.js immediately clears the cache for that page — no waiting for ISR timer.
 *
 * Setup in WordPress:
 *   Install "WP Webhooks" plugin → add webhook:
 *   URL:     https://your-nextjs-domain.com/api/revalidate
 *   Trigger: Post saved / Page saved / Post updated
 *   Header:  X-Revalidate-Secret: <same value as REVALIDATE_SECRET in .env.local>
 *
 * Manual trigger (for testing):
 *   curl -X POST https://your-domain.com/api/revalidate \
 *     -H "Content-Type: application/json" \
 *     -H "X-Revalidate-Secret: your_secret" \
 *     -d '{"slug": "about-bluerange", "lang": "en"}'
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const SECRET = process.env.REVALIDATE_SECRET || '';

export async function POST(req: NextRequest) {
  // 1. Verify secret
  if (SECRET) {
    const provided = req.headers.get('x-revalidate-secret');
    if (provided !== SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // body is optional — revalidate everything if no body
  }

  const revalidated: string[] = [];

  try {
    // ── Option A: Revalidate a specific page by slug ──────────────────────
    if (body.slug) {
      const slug: string = body.slug;
      const lang: string = body.lang || 'sv';

      // Revalidate the specific slug path in both languages
      const paths = [
        `/${lang}/${slug}`,
        `/en/${slug}`,
        `/sv/${slug}`,
        `/${slug}`,
      ];

      for (const p of paths) {
        revalidatePath(p);
        revalidated.push(p);
      }
    }

    // ── Option B: Revalidate homepage ─────────────────────────────────────
    if (body.type === 'homepage' || body.is_front_page) {
      revalidatePath('/en');
      revalidatePath('/sv');
      revalidatePath('/');
      revalidated.push('/en', '/sv', '/');
    }

    // ── Option C: Revalidate everything (nuclear option) ─────────────────
    if (body.revalidate_all || (!body.slug && !body.type)) {
      revalidatePath('/', 'layout');
      revalidated.push('/ (all pages via layout)');
    }

    // ── Also trigger image sync if an image was updated ───────────────────
    if (body.type === 'media' || body.post_type === 'attachment') {
      // Log it — actual sync happens via the wp-image-webhook route
      console.log('[revalidate] Media updated, consider running sync-images');
    }

    console.log('[revalidate] Revalidated:', revalidated);

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      timestamp: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error('[revalidate] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Revalidation endpoint is active',
    usage: 'POST with { slug, lang } or { revalidate_all: true }',
  });
}
