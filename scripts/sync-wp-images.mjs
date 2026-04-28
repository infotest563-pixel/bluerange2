/**
 * WordPress → Next.js Image Sync Script
 * =======================================
 * Fetches all images from WordPress Media Library
 * and downloads them into /public/images/
 *
 * Run manually:   npm run sync-images
 * Run at build:   npm run build  (auto-runs via prebuild)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

// ─── Config ────────────────────────────────────────────────────────────────
const WP_BASE_URL  = 'https://dev-bluerange.pantheonsite.io';
const WP_API_URL   = `${WP_BASE_URL}/wp-json/wp/v2/media`;
const OUTPUT_DIR   = './public/images';          // where images are saved
const PER_PAGE     = 100;                        // WP API max is 100
const MANIFEST     = './public/images/manifest.json'; // tracks downloaded files

// ─── Extra images not registered in WP media library (orphaned uploads) ────
// Add any image URL here that the WP API doesn't return but exists on the server
const EXTRA_IMAGES = [
  `${WP_BASE_URL}/wp-content/uploads/2023/10/support-img.png`,
  `${WP_BASE_URL}/wp-content/uploads/2023/11/headquarter.png`,
];
// ───────────────────────────────────────────────────────────────────────────

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Ensure output directory exists */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

/** Load existing manifest (list of already-downloaded files) */
function loadManifest() {
  if (fs.existsSync(MANIFEST)) {
    try {
      return JSON.parse(fs.readFileSync(MANIFEST, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

/** Save manifest to disk */
function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
}

/** Download a single file from a URL and save it locally */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    protocol.get(url, (response) => {
      // Follow redirects (301/302)
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

/** Sanitize filename — remove special characters */
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
}

/** Extract filename from a URL */
function getFilenameFromUrl(url) {
  const parts = url.split('/');
  return sanitizeFilename(parts[parts.length - 1].split('?')[0]);
}

/** Fetch one page of media items from WordPress REST API */
async function fetchMediaPage(page) {
  const url = `${WP_API_URL}?per_page=${PER_PAGE}&page=${page}&_fields=id,source_url,slug,mime_type,date_modified`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'NextJS-Image-Sync/1.0',
    },
  });

  if (!res.ok) {
    if (res.status === 400) return []; // no more pages
    throw new Error(`WP API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/** Fetch ALL media items across all pages */
async function fetchAllMedia() {
  const allMedia = [];
  let page = 1;

  console.log('📡 Fetching media list from WordPress...');

  while (true) {
    const items = await fetchMediaPage(page);
    if (!items || items.length === 0) break;

    allMedia.push(...items);
    console.log(`   Page ${page}: ${items.length} items (total so far: ${allMedia.length})`);

    if (items.length < PER_PAGE) break; // last page
    page++;
  }

  console.log(`✅ Found ${allMedia.length} total media items\n`);
  return allMedia;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔄 WordPress → Next.js Image Sync');
  console.log('===================================\n');

  ensureDir(OUTPUT_DIR);

  const manifest = loadManifest();
  const allMedia = await fetchAllMedia();

  // Filter to images only (skip PDFs, videos, etc.)
  const images = allMedia.filter(item =>
    item.mime_type && item.mime_type.startsWith('image/')
  );

  console.log(`🖼️  Processing ${images.length} images...\n`);

  let downloaded = 0;
  let skipped    = 0;
  let failed     = 0;

  for (const item of images) {
    const sourceUrl = item.source_url;
    if (!sourceUrl) continue;

    const filename  = getFilenameFromUrl(sourceUrl);
    const destPath  = path.join(OUTPUT_DIR, filename);
    const manifestKey = String(item.id);

    // Skip if already downloaded and not modified
    if (
      manifest[manifestKey] &&
      manifest[manifestKey].filename === filename &&
      manifest[manifestKey].date_modified === item.date_modified &&
      fs.existsSync(destPath)
    ) {
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`   ⬇️  ${filename} ... `);
      await downloadFile(sourceUrl, destPath);

      // Update manifest
      manifest[manifestKey] = {
        id: item.id,
        filename,
        source_url: sourceUrl,
        local_path: `/images/${filename}`,
        date_modified: item.date_modified,
        synced_at: new Date().toISOString(),
      };

      downloaded++;
      console.log('✅');
    } catch (err) {
      // 404 means file deleted from WP server — skip silently
      if (err.message.includes('404')) {
        skipped++;
        console.log(`⏭️  skipped (404 — file not on WP server)`);
      } else {
        failed++;
        console.log(`❌ Failed: ${err.message}`);
      }
    }
  }

  // Save updated manifest
  saveManifest(manifest);

  // ── Download extra orphaned images not in WP media library ──────────────
  if (EXTRA_IMAGES.length > 0) {
    console.log(`\n📎 Downloading ${EXTRA_IMAGES.length} extra images (not in WP media library)...`);
    for (const url of EXTRA_IMAGES) {
      const filename  = getFilenameFromUrl(url);
      const destPath  = path.join(OUTPUT_DIR, filename);
      const manifestKey = `extra-${filename}`;

      if (manifest[manifestKey] && fs.existsSync(destPath)) {
        console.log(`   ⏭️  ${filename} (already exists)`);
        continue;
      }

      try {
        process.stdout.write(`   ⬇️  ${filename} ... `);
        await downloadFile(url, destPath);
        manifest[manifestKey] = {
          id: manifestKey,
          filename,
          source_url: url,
          local_path: `/images/${filename}`,
          synced_at: new Date().toISOString(),
        };
        downloaded++;
        console.log('✅');
      } catch (err) {
        failed++;
        console.log(`❌ Failed: ${err.message}`);
      }
    }
    saveManifest(manifest);
  }
  // ─────────────────────────────────────────────────────────────────────────

  console.log('\n===================================');
  console.log(`✅ Downloaded : ${downloaded}`);
  console.log(`⏭️  Skipped   : ${skipped} (already up to date)`);
  console.log(`❌ Failed     : ${failed}`);
  console.log(`📄 Manifest   : ${MANIFEST}`);
  console.log('===================================\n');

  if (failed > 0) {
    console.warn(`⚠️  ${failed} image(s) failed to download. Build will continue.`);
  }
}

main().catch((err) => {
  console.error('❌ Sync failed:', err.message);
  process.exit(1);
});
