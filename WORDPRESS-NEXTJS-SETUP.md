# WordPress + Next.js Real-Time Updates — Complete Guide

This guide explains how to make WordPress content changes (pages, posts, ACF fields, images) appear **instantly** on your live Vercel website without manual redeploy.

---

## Table of Contents

1. [How It Works](#how-it-works)
2. [WordPress Setup](#wordpress-setup)
3. [Next.js Setup](#nextjs-setup)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## How It Works

```
WordPress content updated
        ↓
WP Webhooks plugin fires → POST /api/revalidate
        ↓
Next.js clears page cache (revalidatePath)
        ↓
Next visitor → Next.js fetches fresh data from WordPress
        ↓
User sees updated content ✅
```

**Key concepts:**

- **ISR (Incremental Static Regeneration)** — Next.js builds pages at build time, then caches them
- **On-demand revalidation** — WordPress webhook tells Next.js "this page changed, clear the cache"
- **`cache: 'no-store'`** — fetch() always gets fresh data from WordPress (no Next.js fetch cache)
- **`revalidate: 0`** — page is static at build time, only revalidates when webhook fires

---

## WordPress Setup

### Step 1 — Install Required Plugins

Install these plugins in WordPress:

1. **WP Webhooks** (free) — sends webhooks when content changes
2. **ACF to REST API** (free) — exposes ACF fields in REST API
3. **Advanced Custom Fields (ACF)** (free or pro) — custom fields

### Step 2 — Enable ACF in REST API

Go to **WordPress Admin → Plugins → ACF to REST API → Settings**

Enable:
- ✅ Show ACF fields in REST API
- ✅ Include ACF fields in pages
- ✅ Include ACF fields in posts

**Alternative:** If using ACF Pro, add this to your theme's `functions.php`:

```php
// Enable ACF fields in REST API
add_filter('acf/settings/rest_api_enabled', '__return_true');

// Include ACF in pages and posts
add_filter('acf/rest_api/page/get_fields', '__return_true');
add_filter('acf/rest_api/post/get_fields', '__return_true');
```

### Step 3 — Configure WP Webhooks

Go to **WordPress Admin → WP Webhooks → Send Data**

#### Webhook 1 — Page/Post Updates

Click **Add Webhook URL** and configure:

| Field | Value |
|---|---|
| **Name** | `Next.js Page Revalidation` |
| **URL** | `https://bluerange2.vercel.app/api/revalidate` |
| **Method** | `POST` |
| **Trigger** | Select: `post_updated`, `save_post` |
| **Custom Headers** | Add header: `X-Revalidate-Secret` = `your_secret_here` |
| **Body** | `{"slug":"{{post_name}}","post_type":"{{post_type}}","lang":"sv"}` |

**Important:** Replace `your_secret_here` with the value of `REVALIDATE_SECRET` from your `.env.local` file.

#### Webhook 2 — Media/Image Updates

Click **Add Webhook URL** again:

| Field | Value |
|---|---|
| **Name** | `Next.js Image Revalidation` |
| **URL** | `https://bluerange2.vercel.app/api/revalidate` |
| **Method** | `POST` |
| **Trigger** | Select: `attachment_updated`, `add_attachment` |
| **Custom Headers** | Add header: `X-Revalidate-Secret` = `your_secret_here` |
| **Body** | `{"post_type":"attachment"}` |

### Step 4 — Test WordPress API

Open these URLs in your browser to verify ACF fields are included:

**Test page by ID:**
```
https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard
```

**Test page by slug:**
```
https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages?slug=about-bluerange&acf_format=standard
```

You should see:
- ✅ `acf` object in the response
- ✅ All your custom fields inside `acf`
- ✅ Image URLs in ACF fields

If `acf` is missing or empty:
- Check that ACF to REST API plugin is active
- Check that your page actually has ACF fields filled in
- Try adding `&_fields=id,title,acf` to see only specific fields

---

## Next.js Setup

### Step 1 — Environment Variables

Your `.env.local` already has:

```env
IMAGE_MODE=proxy
WP_WEBHOOK_SECRET=change_this_to_a_random_secret_string
REVALIDATE_SECRET=change_this_to_another_random_secret_string
```

**Generate secure secrets:**

Run this in PowerShell to generate random secrets:

```powershell
# Generate REVALIDATE_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Generate WP_WEBHOOK_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Update `.env.local` with the generated values.

### Step 2 — Add Secrets to Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

| Name | Value | Environment |
|---|---|---|
| `REVALIDATE_SECRET` | (your generated secret) | Production, Preview, Development |
| `WP_WEBHOOK_SECRET` | (your generated secret) | Production, Preview, Development |
| `NEXT_PUBLIC_WP_URL` | `https://dev-bluerange.pantheonsite.io` | Production, Preview, Development |
| `IMAGE_MODE` | `proxy` | Production, Preview, Development |

**Important:** After adding env vars, redeploy your site once for them to take effect.

### Step 3 — Verify Files Are Updated

The following files have been updated to use **on-demand revalidation**:

✅ `lib/wp.ts` — all fetch calls use `cache: 'no-store'`
✅ `app/[slug]/page.tsx` — uses `revalidate: 0`
✅ `app/en/[slug]/page.tsx` — uses `revalidate: 0`
✅ `app/sv/[slug]/page.tsx` — uses `revalidate: 0`
✅ `app/en/page.tsx` — uses `revalidate: 0`
✅ `app/sv/page.tsx` — uses `revalidate: 0`
✅ `app/api/revalidate/route.ts` — handles webhook calls
✅ `app/api/image/[...path]/route.ts` — proxies images with cache-busting

### Step 4 — Deploy to Vercel

```bash
git add .
git commit -m "Enable on-demand revalidation for WordPress content"
git push
```

Vercel will auto-deploy. Wait for deployment to complete.

---

## Testing

### Test 1 — Verify Revalidate Endpoint

Open this URL in your browser:

```
https://bluerange2.vercel.app/api/revalidate
```

You should see:

```json
{
  "status": "ok",
  "endpoint": "/api/revalidate",
  "method": "POST",
  "headers_required": "X-Revalidate-Secret",
  "body_options": [...]
}
```

### Test 2 — Manual Revalidation (PowerShell)

Replace `your_secret` with your actual `REVALIDATE_SECRET`:

```powershell
$headers = @{
    "X-Revalidate-Secret" = "your_secret"
    "Content-Type" = "application/json"
}

$body = @{
    slug = "about-bluerange"
    lang = "en"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://bluerange2.vercel.app/api/revalidate" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

Expected response:

```json
{
  "revalidated": true,
  "paths": ["/en/about-bluerange", "/sv/about-bluerange", ...],
  "timestamp": "2026-05-01T..."
}
```

### Test 3 — End-to-End WordPress Update

1. Go to **WordPress Admin → Pages → Edit any page**
2. Change the title or content
3. Click **Update**
4. Wait 2-3 seconds
5. Visit your Vercel site → refresh the page
6. ✅ You should see the updated content immediately

### Test 4 — ACF Field Update

1. Go to **WordPress Admin → Pages → Edit page with ACF fields**
2. Change an ACF field value (e.g., banner text, image)
3. Click **Update**
4. Wait 2-3 seconds
5. Visit your Vercel site → refresh the page
6. ✅ You should see the updated ACF data

### Test 5 — Image Update

1. Go to **WordPress Admin → Media → Upload new image** (or replace existing)
2. Wait 2-3 seconds
3. Visit your Vercel site → hard refresh (`Ctrl+Shift+R`)
4. ✅ You should see the new image

---

## Troubleshooting

### Problem: Content not updating after WordPress change

**Check 1 — Webhook fired?**

Go to **WordPress Admin → WP Webhooks → Logs**

You should see a `200 OK` response for each update. If you see `401 Unauthorized`:
- The secret in WordPress doesn't match `REVALIDATE_SECRET` in Vercel
- Check for typos, extra spaces, or quotes

**Check 2 — Vercel logs**

Go to **Vercel Dashboard → Your Project → Functions → Logs**

Filter by `/api/revalidate` — you should see:
```
[revalidate] Done: ["/en/about-bluerange", ...]
```

If you see `[revalidate] Rejected — wrong secret`:
- Update the secret in WordPress WP Webhooks to match Vercel env var

**Check 3 — Hard refresh**

Your browser may be caching the page. Try:
- `Ctrl+Shift+R` (Windows/Linux)
- `Cmd+Shift+R` (Mac)
- Open in incognito/private window

**Check 4 — Vercel deployment**

Make sure your latest code is deployed:
- Go to Vercel Dashboard → Deployments
- Check that the latest commit is deployed to Production

---

### Problem: ACF fields are empty or missing

**Check 1 — ACF to REST API plugin**

Go to **WordPress Admin → Plugins**

Make sure **ACF to REST API** is installed and active.

**Check 2 — Test the API directly**

Open this URL:
```
https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard
```

Look for the `acf` object in the JSON response. If it's missing:
- The plugin is not active
- The page has no ACF fields
- ACF fields are not set to "Show in REST API"

**Check 3 — ACF field settings**

Go to **WordPress Admin → Custom Fields → Field Groups**

Edit your field group → check that:
- ✅ "Show in REST API" is enabled (ACF Pro only)
- ✅ Fields are assigned to the correct post type (Page, Post, etc.)

**Check 4 — Check Next.js logs**

In your terminal (local dev):
```bash
npm run dev
```

Visit a page and check the console for:
```
[getPageBySlug] 200 for slug "about-bluerange"
```

If you see `[getPageBySlug] 404`:
- The slug doesn't exist in WordPress
- The language parameter is wrong

---

### Problem: Images not updating

**Check 1 — Image webhook**

Go to **WordPress Admin → WP Webhooks → Logs**

After uploading/updating an image, you should see a webhook fire with `post_type=attachment`.

**Check 2 — Hard refresh**

Images are heavily cached by browsers. Always hard refresh:
- `Ctrl+Shift+R` (Windows/Linux)
- `Cmd+Shift+R` (Mac)

**Check 3 — Check proxy logs**

Go to **Vercel Dashboard → Functions → Logs**

Filter by `/api/image` — you should see:
```
[image-proxy] 200 → https://dev-bluerange.../hero.jpg?_t=...
```

If you see `[image-proxy] 404`:
- The image doesn't exist in WordPress
- The URL path is wrong

---

### Problem: Webhook returns 401 Unauthorized

The secret in WordPress doesn't match Vercel.

**Fix:**

1. Go to **Vercel Dashboard → Settings → Environment Variables**
2. Copy the exact value of `REVALIDATE_SECRET`
3. Go to **WordPress Admin → WP Webhooks → Send Data**
4. Edit your webhook
5. Update the `X-Revalidate-Secret` header to match exactly (no extra spaces)
6. Save and test again

---

### Problem: Changes take 30-60 seconds to appear

Your code still has ISR timers (`revalidate: 30` or `revalidate: 60`).

**Fix:**

Check that all page files have:
```typescript
export const revalidate = 0; // ✅ On-demand only
```

NOT:
```typescript
export const revalidate = 60; // ❌ Old ISR timer
```

Files to check:
- `app/[slug]/page.tsx`
- `app/en/[slug]/page.tsx`
- `app/sv/[slug]/page.tsx`
- `app/en/page.tsx`
- `app/sv/page.tsx`

---

## How to Render ACF Fields in Components

### Example 1 — Simple ACF Text Field

```tsx
export default function MyPage({ page }: { page: any }) {
  const acf = page.acf || {};

  return (
    <div>
      <h1>{acf.banner_title || 'Default Title'}</h1>
      <p>{acf.banner_subtitle || ''}</p>
    </div>
  );
}
```

### Example 2 — ACF Image Field

```tsx
import { wpAcfImg } from '@/lib/imageUtils';

export default function MyPage({ page }: { page: any }) {
  const acf = page.acf || {};
  const bannerImage = wpAcfImg(acf.banner_image); // handles all ACF image formats

  return (
    <div>
      {bannerImage && (
        <img src={bannerImage} alt="Banner" />
      )}
    </div>
  );
}
```

### Example 3 — ACF Repeater Field

```tsx
export default function MyPage({ page }: { page: any }) {
  const acf = page.acf || {};
  const features = acf.features || []; // ACF repeater

  return (
    <div>
      {features.map((feature: any, index: number) => (
        <div key={index}>
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 4 — ACF WYSIWYG Field (HTML Content)

```tsx
export default function MyPage({ page }: { page: any }) {
  const acf = page.acf || {};

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: acf.content_html || '' }} />
    </div>
  );
}
```

---

## Production Best Practices

### 1. Use Environment-Specific Secrets

Generate different secrets for each environment:

- **Development** — one set of secrets for local testing
- **Preview** — different secrets for Vercel preview deployments
- **Production** — strongest secrets for live site

### 2. Monitor Webhook Logs

Regularly check **WordPress → WP Webhooks → Logs** to ensure webhooks are firing successfully.

### 3. Set Up Error Alerts

In Vercel, enable **Notifications** for function errors so you're alerted if `/api/revalidate` fails.

### 4. Use Vercel Analytics

Enable **Vercel Analytics** to monitor page load times and cache hit rates.

### 5. Test Before Publishing

Always test content changes in WordPress **Draft** mode first, then publish when ready.

---

## Summary

✅ **WordPress** sends webhook when content changes
✅ **Next.js** clears cache via `/api/revalidate`
✅ **Vercel** serves fresh content on next visit
✅ **ACF fields** included automatically via REST API
✅ **Images** proxied with cache-busting for instant updates
✅ **No manual redeploy** needed

Your site now updates in **real-time** when WordPress content changes!
