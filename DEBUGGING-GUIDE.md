# WordPress API Debugging Guide

Complete guide to test, debug, and verify your WordPress API data.

---

## Method 1: Test API in Browser Console

### Step 1 — Open Browser Console

1. Open your website: https://bluerange2.vercel.app
2. Press `F12` (Windows/Linux) or `Cmd+Option+I` (Mac)
3. Click **Console** tab

### Step 2 — Test WordPress API Directly

Copy and paste this into the console:

```javascript
// Test page by ID
fetch('https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Page Data:', data);
    console.log('📦 ACF Fields:', data.acf);
    console.log('📝 Title:', data.title.rendered);
    console.log('🕐 Last Modified:', data.modified);
  })
  .catch(err => console.error('❌ Error:', err));
```

**What to look for:**
- ✅ `acf` object exists and has your fields
- ✅ `title.rendered` shows your page title
- ✅ `modified` shows recent timestamp
- ❌ If `acf` is missing → ACF to REST API plugin not active

### Step 3 — Test Page by Slug

```javascript
// Test page by slug
fetch('https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages?slug=cloud-services&acf_format=standard')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Page Data:', data[0]);
    console.log('📦 ACF Fields:', data[0].acf);
  })
  .catch(err => console.error('❌ Error:', err));
```

### Step 4 — Test with Cache-Busting

Add a timestamp to bypass all caches:

```javascript
// Force fresh data (bypass all caches)
const timestamp = Date.now();
fetch(`https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard&_=${timestamp}`)
  .then(res => res.json())
  .then(data => {
    console.log('✅ Fresh Data (no cache):', data);
    console.log('🕐 Fetched at:', new Date().toISOString());
  });
```

---

## Method 2: Check Server Logs (Next.js Terminal)

### Step 1 — Run Development Server

Open terminal and run:

```bash
npm run dev
```

### Step 2 — Visit Your Page

Open: http://localhost:3000/en/cloud-services

### Step 3 — Check Terminal Output

You should see logs like this:

```
[getPageBySlug] 🔄 Fetching slug "cloud-services" (en)...
[getPageBySlug] 📍 URL: https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages?slug=cloud-services&_embed&lang=en&acf_format=standard
[getPageBySlug] ✅ Success! Slug "cloud-services": {
  id: 21,
  title: 'Cloud Services',
  slug: 'cloud-services',
  modified: '2026-05-01T12:34:56',
  has_acf: true,
  acf_fields: [ 'subtitle', 'banner_image', 'features' ],
  timestamp: '2026-05-01T12:35:00.123Z'
}
[getPageBySlug] 📦 ACF Data: {
  subtitle: 'Bluerange Sustainable Datacenter delivers...',
  banner_image: 'https://...',
  features: [...]
}
```

**What to look for:**
- ✅ `has_acf: true` → ACF data is present
- ✅ `acf_fields: [...]` → Shows which ACF fields exist
- ✅ `timestamp` → Shows when data was fetched
- ❌ `has_acf: false` → ACF data missing

---

## Method 3: Check Vercel Function Logs (Production)

### Step 1 — Open Vercel Dashboard

1. Go to https://vercel.com
2. Click your project **bluerange2**
3. Click **Functions** tab
4. Click **Logs** sub-tab

### Step 2 — Filter Logs

In the search box, type:
```
getPageBySlug
```

### Step 3 — Read the Logs

You should see entries like:

```
[getPageBySlug] 🔄 Fetching slug "cloud-services" (en)...
[getPageBySlug] ✅ Success! Slug "cloud-services": { id: 21, ... }
[getPageBySlug] 📦 ACF Data: { subtitle: '...', ... }
```

**What to look for:**
- ✅ Recent timestamps → Data is being fetched
- ✅ ACF data present → WordPress API working correctly
- ❌ Old timestamps → Cache issue
- ❌ No ACF data → Plugin not configured

---

## Method 4: Add Debug Component to Your Page

Create a debug component to show API data on the page.

### Step 1 — Create Debug Component

Create file: `components/DebugPanel.tsx`

```typescript
'use client';

import { useState } from 'react';

export default function DebugPanel({ data }: { data: any }) {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV === 'production') {
    return null; // Hide in production
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#0070f3',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {isOpen ? '❌ Close Debug' : '🐛 Debug Data'}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: 50,
          right: 0,
          width: '400px',
          maxHeight: '500px',
          overflow: 'auto',
          background: 'white',
          border: '2px solid #0070f3',
          borderRadius: '5px',
          padding: '15px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
            🐛 Debug Data
          </h3>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Page ID:</strong> {data?.id || 'N/A'}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Title:</strong> {data?.title?.rendered || 'N/A'}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Slug:</strong> {data?.slug || 'N/A'}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Last Modified:</strong> {data?.modified || 'N/A'}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Has ACF:</strong> {data?.acf ? '✅ Yes' : '❌ No'}
          </div>
          
          {data?.acf && (
            <div style={{ marginBottom: '10px' }}>
              <strong>ACF Fields:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {Object.keys(data.acf).map(key => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
            </div>
          )}
          
          <details style={{ marginTop: '15px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              📄 Full JSON Data
            </summary>
            <pre style={{
              background: '#f5f5f5',
              padding: '10px',
              borderRadius: '3px',
              fontSize: '11px',
              overflow: 'auto',
              maxHeight: '200px',
            }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
```

### Step 2 — Add to Your Page Component

Update `app/[slug]/page.tsx`:

```typescript
import DebugPanel from '@/components/DebugPanel';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug, 'sv');

  if (!page) {
    notFound();
  }

  return (
    <>
      <WordPressPageRenderer page={page} />
      <DebugPanel data={page} />
    </>
  );
}
```

### Step 3 — Test

1. Run `npm run dev`
2. Visit any page
3. Click **🐛 Debug Data** button in bottom-right corner
4. See all page data and ACF fields

---

## Method 5: Test API Response Time

Check how long API calls take:

```javascript
// In browser console
const start = Date.now();
fetch('https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard')
  .then(res => res.json())
  .then(data => {
    const duration = Date.now() - start;
    console.log(`✅ API Response Time: ${duration}ms`);
    console.log('📦 Data:', data);
  });
```

**Good response times:**
- ✅ < 500ms → Excellent
- ⚠️ 500-1000ms → Acceptable
- ❌ > 1000ms → Slow (check WordPress hosting)

---

## Method 6: Compare WordPress Admin vs API

### Step 1 — Check WordPress Admin

1. Go to WordPress Admin
2. Edit page 21
3. Note the subtitle value (e.g., "test123")
4. Note the last modified time

### Step 2 — Check API Response

Open in browser:
```
https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard
```

Look for:
```json
{
  "id": 21,
  "modified": "2026-05-01T12:34:56",
  "acf": {
    "subtitle": "...test123..."
  }
}
```

### Step 3 — Compare

- ✅ Subtitle matches → API is correct
- ✅ Modified time is recent → API is fresh
- ❌ Subtitle doesn't match → WordPress caching issue
- ❌ Old modified time → API is cached

---

## Method 7: Test Cache-Busting

Verify that `cache: 'no-store'` is working:

### Test 1 — Update Content

1. Edit page in WordPress
2. Change subtitle to include current time: "Updated at 12:34"
3. Click Update

### Test 2 — Fetch Immediately

In browser console:

```javascript
fetch('https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard')
  .then(res => res.json())
  .then(data => {
    console.log('Subtitle:', data.acf.subtitle);
    console.log('Modified:', data.modified);
  });
```

### Test 3 — Check Your Site

1. Visit your Vercel site
2. Hard refresh: `Ctrl+Shift+R`
3. Check if subtitle shows "Updated at 12:34"

**Results:**
- ✅ Shows new time → Cache-busting works
- ❌ Shows old time → Cache issue

---

## Common Issues & Solutions

### Issue 1: ACF Data Missing

**Symptoms:**
```json
{
  "id": 21,
  "title": { "rendered": "Cloud Services" },
  "acf": false  // ❌ or missing
}
```

**Solutions:**

1. **Install ACF to REST API Plugin**
   - WordPress Admin → Plugins → Add New
   - Search "ACF to REST API"
   - Install and activate

2. **Or add to functions.php:**
   ```php
   add_filter('acf/settings/rest_api_enabled', '__return_true');
   add_filter('acf/rest_api/page/get_fields', '__return_true');
   ```

3. **Check ACF fields are filled in**
   - Edit the page in WordPress
   - Make sure ACF fields have values
   - Click Update

---

### Issue 2: Old Data Showing

**Symptoms:**
- WordPress shows new content
- API shows old content
- Vercel site shows old content

**Solutions:**

1. **Check WordPress Caching**
   - Disable WordPress caching plugins temporarily
   - Clear Pantheon cache (if using Pantheon)

2. **Force API Refresh**
   ```
   https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard&_=1234567890
   ```
   (Add `&_=timestamp` to bypass cache)

3. **Trigger Revalidation**
   ```powershell
   $headers = @{"X-Revalidate-Secret"="your_secret";"Content-Type"="application/json"}
   Invoke-WebRequest -Uri "https://bluerange2.vercel.app/api/revalidate" -Method POST -Headers $headers -Body '{}'
   ```

---

### Issue 3: Slow API Response

**Symptoms:**
- API takes > 1 second to respond
- Pages load slowly

**Solutions:**

1. **Check WordPress hosting performance**
   - Contact Pantheon support
   - Check server resources

2. **Optimize WordPress**
   - Disable unused plugins
   - Use caching plugin (but exclude REST API from cache)
   - Optimize database

3. **Use CDN for images**
   - Your image proxy already does this
   - Make sure `IMAGE_MODE=proxy` in `.env.local`

---

## Quick Reference Commands

### Test API in Browser Console
```javascript
fetch('https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard')
  .then(r => r.json())
  .then(d => console.log(d));
```

### Test with Timestamp (No Cache)
```javascript
fetch(`https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard&_=${Date.now()}`)
  .then(r => r.json())
  .then(d => console.log(d));
```

### Check Response Time
```javascript
const start = Date.now();
fetch('https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard')
  .then(r => r.json())
  .then(d => console.log(`${Date.now() - start}ms`, d));
```

### Manual Revalidation (PowerShell)
```powershell
$headers = @{"X-Revalidate-Secret"="your_secret";"Content-Type"="application/json"}
Invoke-WebRequest -Uri "https://bluerange2.vercel.app/api/revalidate" -Method POST -Headers $headers -Body '{}'
```

---

## Debugging Checklist

Use this checklist to diagnose issues:

- [ ] WordPress API returns data in browser
- [ ] ACF object is present in API response
- [ ] Modified timestamp is recent
- [ ] Server logs show fetch requests
- [ ] Vercel logs show fresh data
- [ ] Hard refresh shows updated content
- [ ] Debug panel shows correct data
- [ ] Response time is < 1 second

✅ **All checked?** Your API is working correctly!

---

## Next Steps

1. **Read the logs** — Check terminal when running `npm run dev`
2. **Test in browser** — Use console to test API directly
3. **Check Vercel logs** — See production logs in Vercel dashboard
4. **Add debug panel** — See data directly on your page
5. **Compare timestamps** — Verify data is fresh

Your WordPress API is now fully debuggable! 🐛✅
