# Bluerange Headless WordPress + Next.js

## ✅ FULLY DYNAMIC SETUP (NO CACHING)

### What Changed

1. **`app/layout.tsx`** — Added `dynamic = 'force-dynamic'` to root layout
2. **`next.config.ts`** — Disabled static optimization
3. **All page files** — Added `revalidate = 0` + removed `generateStaticParams`
4. **`lib/wp.ts`** — Already using `cache: 'no-store'`

### How It Works Now

```
User visits page
     ↓
Next.js fetches from WordPress (NO CACHE)
     ↓
Page renders with FRESH data
     ↓
✅ User sees LATEST content from WordPress
```

### Deploy to Vercel

```bash
# 1. Commit changes
git add .
git commit -m "Force fully dynamic rendering - disable all caching"
git push

# 2. Wait for Vercel deployment (2-3 minutes)

# 3. Test
# - Update page in WordPress
# - Visit Vercel site
# - ✅ Changes appear immediately
```

### After Deployment

1. Go to WordPress
2. Edit page 2182 (Front page)
3. Change "About Us Title" to "TEST 456"
4. Click Update
5. Visit https://bluerange2.vercel.app/sv
6. ✅ Should show "TEST 456" immediately

### Configuration Summary

| File | Setting | Effect |
|---|---|---|
| `app/layout.tsx` | `dynamic = 'force-dynamic'` | Entire app is dynamic |
| All pages | `revalidate = 0` | No time-based revalidation |
| `lib/wp.ts` | `cache: 'no-store'` | No fetch caching |
| `next.config.ts` | No static export | Allows dynamic rendering |

### Result

✅ **WordPress updates appear INSTANTLY on Vercel**
✅ **No webhooks needed**
✅ **No manual redeploy needed**
✅ **Every request fetches fresh data**

⚠️ **Trade-off:** Slower page loads (fetches from WordPress on every request)

### Troubleshooting

If changes still don't appear:

1. **Hard refresh browser:** `Ctrl + Shift + R`
2. **Check Vercel deployment:** Make sure latest commit is deployed
3. **Check WordPress API:** Open `https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/2182` in browser
4. **Check Vercel logs:** Functions → Logs → Look for fetch requests

### API URL

WordPress REST API: `https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages`

Test specific page: `https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/2182?acf_format=standard`
