# Next.js + WordPress Caching — Complete Beginner's Guide

## The Problem You're Experiencing

You update content in WordPress → it shows correctly in WordPress admin → but your live Vercel website still shows the old content.

**Why?** Next.js caches everything by default for performance. Your site is showing cached (old) data instead of fetching fresh data from WordPress.

---

## Understanding Next.js Caching (Simple Explanation)

Think of caching like taking a photo of your WordPress content:

1. **First visitor** → Next.js fetches from WordPress → takes a "photo" (cache) → shows it
2. **Second visitor** → Next.js shows the "photo" (cache) → doesn't fetch from WordPress
3. **You update WordPress** → Next.js still shows the old "photo" → doesn't know about the update

**Result:** Your site shows old content until the cache expires or you manually clear it.

---

## Next.js Has 4 Different Caches

### Cache 1 — Request Memoization (during render)
**What:** Same fetch() call in one render = only fetches once
**Duration:** Single page render only
**Impact:** Low (good for performance)

### Cache 2 — Data Cache (fetch responses)
**What:** fetch() responses are cached on the server
**Duration:** Forever (until revalidated)
**Impact:** HIGH ⚠️ — This is your main problem

### Cache 3 — Full Route Cache (rendered pages)
**What:** Entire HTML pages are cached
**Duration:** Forever (until revalidated)
**Impact:** HIGH ⚠️ — This is your second problem

### Cache 4 — Router Cache (client-side)
**What:** Browser caches pages you've visited
**Duration:** 30 seconds (dynamic) or 5 minutes (static)
**Impact:** Medium (only affects navigation)

---

## How to Disable Caching — 3 Methods

### Method 1 — Disable Fetch Cache (Per Request)

```typescript
// ❌ BAD — Uses cache (default behavior)
const res = await fetch('https://wordpress.com/wp-json/wp/v2/pages/21');

// ✅ GOOD — Always fresh
const res = await fetch('https://wordpress.com/wp-json/wp/v2/pages/21', {
  cache: 'no-store' // Disables Data Cache
});
```

**Use when:** You want specific API calls to always be fresh.

---

### Method 2 — Force Dynamic Rendering (Per Page)

```typescript
// At the top of your page component
export const dynamic = 'force-dynamic';

// This disables ALL caching for this page
export default async function Page() {
  const res = await fetch('https://wordpress.com/wp-json/wp/v2/pages/21');
  // No need for { cache: 'no-store' } — already forced dynamic
}
```

**Use when:** You want the entire page to always be fresh.

---

### Method 3 — On-Demand Revalidation (Best for Production)

```typescript
// Page uses cache by default
export const revalidate = 0; // Static at build, revalidate on-demand only

export default async function Page() {
  const res = await fetch('https://wordpress.com/wp-json/wp/v2/pages/21', {
    cache: 'no-store' // Still fetch fresh data
  });
}
```

Then WordPress webhook calls `/api/revalidate` to clear cache when content changes.

**Use when:** You want performance + instant updates (best of both worlds).

---

## Your Current Setup (Already Fixed!)

I've already updated your code to use **Method 3** (on-demand revalidation). Here's what changed:

### Before (❌ Old Code — Cached for 30-60 seconds)

```typescript
// lib/wp.ts
export async function getPageById(id: number, lang: string = 'sv') {
  const res = await fetch(`${WP}/wp-json/wp/v2/pages/${id}`, { 
    next: { revalidate: 30 } // ❌ Cached for 30 seconds
  });
  return res.json();
}

// app/[slug]/page.tsx
export const revalidate = 60; // ❌ Page cached for 60 seconds
```

**Problem:** Even after updating WordPress, your site showed old content for 30-60 seconds.

---

### After (✅ New Code — Always Fresh + On-Demand Revalidation)

```typescript
// lib/wp.ts
export async function getPageById(id: number, lang: string = 'sv') {
  const res = await fetch(`${WP}/wp-json/wp/v2/pages/${id}`, { 
    cache: 'no-store' // ✅ Always fetches fresh from WordPress
  });
  return res.json();
}

// app/[slug]/page.tsx
export const revalidate = 0; // ✅ Static at build, revalidate on-demand only
```

**Result:** 
- First build → pages are static (fast)
- WordPress update → webhook clears cache
- Next visitor → gets fresh content

---

## Why Vercel Shows Old Content

Vercel has **3 caching layers**:

```
Browser → Vercel Edge CDN → Next.js Server → WordPress
  ↓            ↓                ↓               ↓
Cache 1     Cache 2         Cache 3         Source
```

When you update WordPress:
1. WordPress has new content ✅
2. Next.js server still has old cache ❌
3. Vercel CDN still has old cache ❌
4. Browser still has old cache ❌

**Solution:** WordPress webhook tells Next.js "clear the cache" → Next.js tells Vercel "clear the CDN" → fresh content flows through.

---

## Complete Working Example

### Step 1 — WordPress API Fetch (lib/wp.ts)

```typescript
const WP = 'https://dev-bluerange.pantheonsite.io';

export async function getPageById(id: number, lang: string = 'sv') {
  try {
    // ✅ Always fetch fresh — no Next.js cache
    const res = await fetch(
      `${WP}/wp-json/wp/v2/pages/${id}?_embed&lang=${lang}&acf_format=standard`,
      {
        cache: 'no-store', // Disable Data Cache
        headers: {
          'User-Agent': 'NextJS-Headless/1.0',
        },
      }
    );

    if (!res.ok) {
      console.error(`Failed to fetch page ${id}: ${res.status}`);
      return null;
    }

    const page = await res.json();
    
    // Transform WordPress image URLs to local proxy URLs
    return transformPage(page);
  } catch (err) {
    console.error('Error fetching page:', err);
    return null;
  }
}
```

**Key points:**
- `cache: 'no-store'` → always fresh from WordPress
- `?acf_format=standard` → includes ACF fields
- `?_embed` → includes featured image and author data
- `transformPage()` → converts WP image URLs to `/images/...`

---

### Step 2 — Page Component (app/[slug]/page.tsx)

```typescript
import { getPageBySlug } from '@/lib/wp';
import { notFound } from 'next/navigation';

// ✅ On-demand revalidation only (no automatic timer)
export const revalidate = 0;

// ✅ Allow dynamic params (pages not in generateStaticParams)
export const dynamicParams = true;

export default async function Page({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  // Fetch page data from WordPress
  const page = await getPageBySlug(slug, 'sv');

  // 404 if page doesn't exist
  if (!page) {
    notFound();
  }

  // Access ACF fields
  const acf = page.acf || {};

  return (
    <main>
      {/* WordPress title */}
      <h1 dangerouslySetInnerHTML={{ __html: page.title.rendered }} />

      {/* ACF field example */}
      {acf.subtitle && (
        <p className="subtitle">{acf.subtitle}</p>
      )}

      {/* WordPress content */}
      <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />

      {/* ACF image example */}
      {acf.banner_image && (
        <img 
          src={wpImgUrl(acf.banner_image)} 
          alt={acf.banner_title || 'Banner'} 
        />
      )}
    </main>
  );
}
```

**Key points:**
- `revalidate: 0` → page is static at build, only revalidates when webhook fires
- `cache: 'no-store'` in fetch → always gets fresh data from WordPress
- `dynamicParams: true` → allows pages not pre-built at build time
- `page.acf` → contains all ACF fields
- `dangerouslySetInnerHTML` → renders WordPress HTML content

---

### Step 3 — Revalidation API Route (app/api/revalidate/route.ts)

This is already created in your project. WordPress calls this endpoint when content changes.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const SECRET = process.env.REVALIDATE_SECRET || '';

export async function POST(req: NextRequest) {
  // Verify secret
  const provided = req.headers.get('x-revalidate-secret');
  if (provided !== SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  // Parse body
  const body = await req.json();

  // Clear cache for specific page
  if (body.slug) {
    revalidatePath(`/${body.slug}`);
    revalidatePath(`/en/${body.slug}`);
    revalidatePath(`/sv/${body.slug}`);
  } else {
    // Clear all pages
    revalidatePath('/', 'layout');
  }

  return NextResponse.json({ revalidated: true });
}
```

**How it works:**
1. WordPress updates page → WP Webhooks fires
2. Webhook calls `POST /api/revalidate` with secret header
3. Next.js calls `revalidatePath()` → clears cache for that page
4. Next visitor → Next.js fetches fresh data from WordPress

---

## WordPress Setup — Enable ACF in REST API

### Option 1 — Install Plugin (Easiest)

1. Go to **WordPress Admin → Plugins → Add New**
2. Search for **"ACF to REST API"**
3. Install and activate
4. Done! ACF fields now appear in REST API

### Option 2 — Add Code to functions.php

```php
// Enable ACF fields in REST API
add_filter('acf/settings/rest_api_enabled', '__return_true');

// Include ACF in pages
add_filter('acf/rest_api/page/get_fields', '__return_true');

// Include ACF in posts
add_filter('acf/rest_api/post/get_fields', '__return_true');
```

### Test ACF is Working

Open this URL in your browser:
```
https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard
```

You should see:
```json
{
  "id": 21,
  "title": { "rendered": "Cloud Services" },
  "acf": {
    "subtitle": "Bluerange Sustainable Datacenter...",
    "banner_image": "https://...",
    "features": [...]
  }
}
```

If `acf` is missing or empty:
- ACF to REST API plugin is not active
- The page has no ACF fields
- ACF fields are not set to show in REST API

---

## How to Render ACF Fields

### Text Field

```typescript
const acf = page.acf || {};
<p>{acf.subtitle || 'Default text'}</p>
```

### Image Field (URL string)

```typescript
import { wpImgUrl } from '@/lib/imageUtils';

const acf = page.acf || {};
const imageUrl = wpImgUrl(acf.banner_image);

{imageUrl && <img src={imageUrl} alt="Banner" />}
```

### Image Field (ACF object)

```typescript
import { wpAcfImg } from '@/lib/imageUtils';

const acf = page.acf || {};
const imageUrl = wpAcfImg(acf.banner_image); // handles all formats

{imageUrl && <img src={imageUrl} alt="Banner" />}
```

### WYSIWYG Field (HTML)

```typescript
const acf = page.acf || {};
<div dangerouslySetInnerHTML={{ __html: acf.content_html || '' }} />
```

### Repeater Field (Array)

```typescript
const acf = page.acf || {};
const features = acf.features || [];

{features.map((feature: any, index: number) => (
  <div key={index}>
    <h3>{feature.title}</h3>
    <p>{feature.description}</p>
  </div>
))}
```

### True/False Field (Boolean)

```typescript
const acf = page.acf || {};

{acf.show_banner && (
  <div className="banner">Banner content</div>
)}
```

---

## Debugging — How to Verify Fresh Data

### Test 1 — Check WordPress API Directly

Open in browser:
```
https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard
```

Look for your updated content in the JSON response. If it's there, WordPress is working correctly.

### Test 2 — Check Next.js Fetch

Add console.log to your fetch function:

```typescript
export async function getPageById(id: number) {
  const res = await fetch(`${WP}/wp-json/wp/v2/pages/${id}`, {
    cache: 'no-store'
  });
  
  const data = await res.json();
  
  // ✅ Log to verify fresh data
  console.log('[getPageById] Fetched:', {
    id: data.id,
    title: data.title.rendered,
    subtitle: data.acf?.subtitle,
    timestamp: new Date().toISOString()
  });
  
  return data;
}
```

Run `npm run dev` locally and check the terminal — you should see fresh data on every page load.

### Test 3 — Check Vercel Function Logs

Go to **Vercel Dashboard → Your Project → Functions → Logs**

Filter by your page route (e.g., `/sv/cloud-services`)

You should see:
```
[getPageById] Fetched: { id: 21, title: "Cloud Services", subtitle: "...test123", ... }
```

If the subtitle still shows old text in logs:
- `cache: 'no-store'` is not applied
- You're looking at an old deployment
- WordPress API is returning cached data

### Test 4 — Hard Refresh Browser

Your browser caches pages aggressively. Always test with:
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`
- **Or:** Open in incognito/private window

---

## Common Mistakes & How to Avoid Them

### Mistake 1 — Forgetting `cache: 'no-store'`

```typescript
// ❌ BAD — Uses cache
const res = await fetch(url);

// ✅ GOOD — Always fresh
const res = await fetch(url, { cache: 'no-store' });
```

### Mistake 2 — Using ISR Timer Instead of On-Demand

```typescript
// ❌ BAD — Revalidates every 60 seconds (old content for up to 60s)
export const revalidate = 60;

// ✅ GOOD — Only revalidates when webhook fires (instant updates)
export const revalidate = 0;
```

### Mistake 3 — Not Setting Up Webhooks

Without webhooks, `revalidate: 0` means pages are cached forever until manual redeploy.

**Fix:** Set up WP Webhooks plugin to call `/api/revalidate` on content changes.

### Mistake 4 — Wrong Secret in Webhook

If the secret doesn't match, revalidation fails silently.

**Fix:** Copy exact value from Vercel env vars to WordPress webhook header (no extra spaces).

### Mistake 5 — Not Hard Refreshing Browser

Browser caches pages even when server sends fresh data.

**Fix:** Always test with `Ctrl+Shift+R` or incognito window.

---

## Production Best Practices

### 1. Use On-Demand Revalidation (Not ISR Timers)

```typescript
// ✅ GOOD
export const revalidate = 0; // On-demand only
fetch(url, { cache: 'no-store' });

// ❌ BAD
export const revalidate = 60; // 60-second delay
```

### 2. Set Up Webhooks for All Content Types

- Pages → `post_updated`, `save_post`
- Posts → `post_updated`, `save_post`
- Media → `attachment_updated`, `add_attachment`
- Menus → `wp_update_nav_menu`

### 3. Monitor Webhook Logs

Check **WordPress → WP Webhooks → Logs** regularly to ensure webhooks are firing successfully.

### 4. Use Environment-Specific Secrets

Different secrets for dev/preview/production environments.

### 5. Enable Vercel Function Logs

Monitor `/api/revalidate` logs to catch failures early.

---

## Summary — What You Need to Do

### ✅ Already Done (I Fixed These)

- ✅ All fetch calls use `cache: 'no-store'`
- ✅ All pages use `revalidate: 0`
- ✅ `/api/revalidate` route created
- ✅ Image proxy with cache-busting

### 🔧 You Need to Do (5-10 minutes)

1. **Generate secrets** (PowerShell):
   ```powershell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```

2. **Add to Vercel** → Settings → Environment Variables:
   - `REVALIDATE_SECRET` = your generated secret

3. **Configure WP Webhooks** → Send Data:
   - URL: `https://bluerange2.vercel.app/api/revalidate`
   - Header: `X-Revalidate-Secret: your_secret`
   - Trigger: `post_updated`, `save_post`, `attachment_updated`

4. **Enable ACF in REST API**:
   - Install "ACF to REST API" plugin

5. **Deploy to Vercel**:
   ```bash
   git push
   ```

6. **Test**:
   - Update page in WordPress
   - Wait 2-3 seconds
   - Hard refresh Vercel site (`Ctrl+Shift+R`)
   - ✅ Should see updated content

---

## Your Specific Issue (From Screenshots)

You updated the subtitle to include "test123" in WordPress, but Vercel still shows the old text.

**Why:** The webhook hasn't been set up yet, so Next.js doesn't know to clear the cache.

**Fix:**

1. Set up the webhook (see above)
2. Update the page again in WordPress
3. Webhook fires → clears cache
4. Refresh Vercel site → see "test123"

**Or manually trigger revalidation:**

```powershell
$headers = @{
    "X-Revalidate-Secret" = "your_secret"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "https://bluerange2.vercel.app/api/revalidate" `
    -Method POST `
    -Headers $headers `
    -Body '{}'
```

Then hard refresh your site — you should see "test123".

---

**Read `WORDPRESS-NEXTJS-SETUP.md` for the complete step-by-step setup guide!**
