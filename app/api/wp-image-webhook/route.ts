/**
 * WordPress Webhook — Auto Sync on New Upload
 * =============================================
 * WordPress calls this endpoint whenever a new image is uploaded.
 * It downloads that specific image immediately into /public/images/,
 * updates the manifest, busts the in-memory cache, and revalidates pages.
 *
 * Setup in WordPress:
 *   Install "WP Webhooks" plugin → add webhook URL:
 *   https://your-nextjs-domain.com/api/wp-image-webhook
 *   Trigger: "Media file uploaded" AND "Media file updated"
 *   Secret header: X-WP-Webhook-Secret: your_secret_here
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { bustManifestCache } from '../../../lib/localImage';

const OUTPUT_DIR    = path.join(process.cwd(), 'public', 'images');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');
const WEBHOOK_SECRET = process.env.WP_WEBHOOK_SECRET || '';

// ── Helpers ──────────────────────────────────────────────────────────────────

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadManifest(): Record<string, any> {
  if (fs.existsSync(MANIFEST_PATH)) {
    try { return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')); }
    catch { return {}; }
  }
  return {};
}

function saveManifest(manifest: Record<string, any>) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
}

function getFilenameFromUrl(url: string): string {
  const parts = url.split('/');
  return sanitizeFilename(parts[parts.length - 1].split('?')[0]);
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return downloadFile(response.headers.location!, destPath)
          .then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Verify secret to prevent unauthorized calls
  if (WEBHOOK_SECRET) {
    const secret = req.headers.get('x-wp-webhook-secret');
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // WordPress WP Webhooks plugin sends media data in different shapes
  // Support both direct and nested formats
  const mediaItem = body?.post_data || body?.attachment || body;

  const sourceUrl: string =
    mediaItem?.guid?.rendered ||
    mediaItem?.source_url ||
    mediaItem?.url ||
    '';

  const mimeType: string = mediaItem?.mime_type || mediaItem?.post_mime_type || '';
  const mediaId: string  = String(mediaItem?.ID || mediaItem?.id || '');

  if (!sourceUrl) {
    return NextResponse.json({ error: 'No image URL in payload' }, { status: 400 });
  }

  // Only process images
  if (mimeType && !mimeType.startsWith('image/')) {
    return NextResponse.json({ message: 'Not an image, skipped' });
  }

  try {
    ensureDir(OUTPUT_DIR);

    const filename = getFilenameFromUrl(sourceUrl);
    const destPath = path.join(OUTPUT_DIR, filename);

    await downloadFile(sourceUrl, destPath);

    // Update manifest
    const manifest = loadManifest();
    if (mediaId) {
      manifest[mediaId] = {
        id: mediaId,
        filename,
        source_url: sourceUrl,
        local_path: `/images/${filename}`,
        synced_at: new Date().toISOString(),
      };
      saveManifest(manifest);
    }

    console.log(`[webhook] Downloaded: ${filename}`);

    // ✅ Bust the in-memory manifest cache so next request uses new image
    bustManifestCache();

    // ✅ Revalidate all pages so they pick up the new image immediately
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      filename,
      local_path: `/images/${filename}`,
    });

  } catch (err: any) {
    console.error('[webhook] Download failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'WP Image Webhook is active',
    output_dir: '/public/images',
  });
}
