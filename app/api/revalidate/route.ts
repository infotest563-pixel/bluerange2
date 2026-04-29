/**
 * On-Demand Revalidation API
 * ===========================
 * WordPress calls this endpoint when a page, post, or media is saved/updated.
 * Next.js immediately clears its page cache so the next visitor gets fresh content.
 *
 * WordPress WP Webhooks setup:
 *   Tab:     Send Data
 *   URL:     https://bluerange2.vercel.app/api/revalidate
 *   Method:  POST
 *   Header:  X-Revalidate-Secret: <value of REVALIDATE_SECRET in .env.local>
 *   Trigger: post_updated, save_post, attachment_updated, add_attachment
 *   Body:    {"slug":"{{post_name}}","post_type":"{{post_type}}","lang":"sv"}
 *
 * Manual test (PowerShell):
 *   Invoke-WebRequest -Uri "https://bluerange2.vercel.app/api/revalidate" `
 *     -Method POST `
 *     -Headers @{"X-Revalidate-Secret"="your_secret";"Content-Type"="application/json"} `
 *     -Body '{"slug":"about-bluerange","lang":"en"}'
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const SECRET = process.env.REVALIDATE_SECRET || '';

export async function POST(req: NextRequest) {

  // ── 1. Verify secret ────────────────────────────────────────────────────────
  if (SECRET) {
    const provided = req.headers.get('x-revalidate-secret');
    if (provided !== SECRET) {
      console.warn('[revalidate] Rejected — wrong secret');
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }
  }

  // ── 2. Parse body (optional) ────────────────────────────────────────────────
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // No body = revalidate everything (safe default)
  }

  const revalidated: string[] = [];

  try {

    // ── Case A: Specific slug provided ────────────────────────────────────────
    // WordPress sends: {"slug":"about-bluerange","lang":"sv"}
    if (body.slug && typeof body.slug === 'string') {
      const slug = body.slug;
      const lang = typeof body.lang === 'string' ? body.lang : 'sv';

      // Revalidate in all possible URL patterns for this slug
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

    // ── Case B: Homepage updated ──────────────────────────────────────────────
    if (body.type === 'homepage' || body.is_front_page) {
      revalidatePath('/en');
      revalidatePath('/sv');
      revalidatePath('/');
      revalidated.push('/en', '/sv', '/');
    }

    // ── Case C: Media/image updated ───────────────────────────────────────────
    // When an image changes in WordPress, ALL pages that use it need to refresh.
    // The proxy fetches fresh image bytes automatically, but the page HTML
    // (which contains the image URL) is cached by Next.js and must be cleared.
    if (
      body.post_type === 'attachment' ||
      body.type === 'media' ||
      (body.post_type as string)?.includes('attachment')
    ) {
      revalidatePath('/', 'layout'); // clears ALL pages at once
      revalidated.push('/ (all pages — image updated)');
      console.log('[revalidate] Image updated → cleared all page caches');
    }

    // ── Case D: No slug, no type = revalidate everything ─────────────────────
    // This is the safe fallback — if WordPress sends an empty or unknown body,
    // just clear everything so nothing stays stale.
    if (revalidated.length === 0) {
      revalidatePath('/', 'layout');
      revalidated.push('/ (all pages — full revalidation)');
      console.log('[revalidate] Full revalidation triggered');
    }

    console.log('[revalidate] Done:', revalidated);

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      timestamp: new Date().toISOString(),
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[revalidate] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── Health check ──────────────────────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/revalidate',
    method: 'POST',
    headers_required: 'X-Revalidate-Secret',
    body_options: [
      '{ slug, lang }           → revalidate one page',
      '{ post_type: attachment } → revalidate all pages (image update)',
      '{}                        → revalidate all pages (full)',
    ],
  });
}
