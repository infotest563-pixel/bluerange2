# Bluerange Headless WordPress + Next.js

## Current Setup — Fully Dynamic (No Caching)

### Configuration

All pages use:
```typescript
export const dynamic = 'force-dynamic';
```

All API calls use:
```typescript
fetch(url, { cache: 'no-store' })
```

### What This Means

✅ **WordPress updates appear instantly** — no delay, no webhooks needed
✅ **Always fresh data** — every page load fetches from WordPress
✅ **No manual redeploy** — changes go live immediately

⚠️ **Trade-off:** Slower page loads (fetches from WordPress on every request)

### How It Works

```
User visits page
     ↓
Next.js fetches from WordPress (fresh data)
     ↓
Page renders with latest content
     ↓
✅ User sees updated content
```

### Files Changed

- `app/en/page.tsx` — Homepage (English)
- `app/sv/page.tsx` — Homepage (Swedish)
- `app/[slug]/page.tsx` — Dynamic pages (Swedish)
- `app/en/[slug]/page.tsx` — Dynamic pages (English)
- `app/sv/[slug]/page.tsx` — Dynamic pages (Swedish)
- `lib/wp.ts` — WordPress API client

All use `dynamic: 'force-dynamic'` + `cache: 'no-store'`

### Deploy

```bash
git add .
git commit -m "Enable fully dynamic rendering"
git push
```

Vercel will auto-deploy. After deployment, WordPress changes appear instantly.

### Documentation

- `CACHING-EXPLAINED.md` — Understanding Next.js caching
- `ACF-GUIDE.md` — Using ACF fields with Next.js
- `DEBUGGING-GUIDE.md` — How to debug API issues
- `WORDPRESS-NEXTJS-SETUP.md` — Complete setup guide
