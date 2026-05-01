# Quick Fix Checklist — WordPress Not Updating on Vercel

Use this checklist to diagnose and fix caching issues.

---

## ✅ Checklist — Follow in Order

### 1. Verify WordPress API Has Fresh Data

Open in browser:
```
https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard
```

- [ ] JSON response shows your updated content
- [ ] `acf` object is present and contains your fields
- [ ] Timestamp shows recent update

**If NO:** The problem is in WordPress, not Next.js. Check:
- Page is published (not draft)
- ACF fields are filled in
- ACF to REST API plugin is active

**If YES:** Continue to step 2.

---

### 2. Verify Next.js Fetch Uses `cache: 'no-store'`

Check `lib/wp.ts`:

```typescript
// ✅ CORRECT
const res = await fetch(url, { cache: 'no-store' });

// ❌ WRONG
const res = await fetch(url, { next: { revalidate: 30 } });
const res = await fetch(url); // uses cache by default
```

- [ ] All `getPageById`, `getPageBySlug`, `getPostBySlug` use `cache: 'no-store'`

**If NO:** Update the fetch calls to use `cache: 'no-store'`, then redeploy.

**If YES:** Continue to step 3.

---

### 3. Verify Page Uses `revalidate: 0`

Check your page files:
- `app/[slug]/page.tsx`
- `app/en/[slug]/page.tsx`
- `app/sv/[slug]/page.tsx`
- `app/en/page.tsx`
- `app/sv/page.tsx`

```typescript
// ✅ CORRECT
export const revalidate = 0;

// ❌ WRONG
export const revalidate = 60;
export const revalidate = 30;
```

- [ ] All page files have `revalidate: 0`

**If NO:** Change to `revalidate: 0`, then redeploy.

**If YES:** Continue to step 4.

---

### 4. Verify Secrets Are Set in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

- [ ] `REVALIDATE_SECRET` exists and has a value
- [ ] `NEXT_PUBLIC_WP_URL` = `https://dev-bluerange.pantheonsite.io`
- [ ] All env vars are set for Production, Preview, and Development

**If NO:** Add the missing env vars, then redeploy.

**If YES:** Continue to step 5.

---

### 5. Verify WP Webhooks Are Configured

Go to **WordPress Admin → WP Webhooks → Send Data**

- [ ] Webhook exists with URL: `https://bluerange2.vercel.app/api/revalidate`
- [ ] Method is `POST`
- [ ] Header `X-Revalidate-Secret` matches Vercel env var (exact match, no spaces)
- [ ] Trigger includes `post_updated` and `save_post`
- [ ] Webhook is active (not disabled)

**If NO:** Create/fix the webhook configuration.

**If YES:** Continue to step 6.

---

### 6. Test Webhook Manually

Run in PowerShell (replace `your_secret` with actual secret):

```powershell
$headers = @{
    "X-Revalidate-Secret" = "your_secret"
    "Content-Type" = "application/json"
}

$body = '{"slug":"cloud-services","lang":"sv"}' | ConvertTo-Json

Invoke-WebRequest -Uri "https://bluerange2.vercel.app/api/revalidate" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

Expected response:
```json
{
  "revalidated": true,
  "paths": ["/sv/cloud-services", "/en/cloud-services", ...],
  "timestamp": "2026-05-01T..."
}
```

- [ ] Response is `200 OK`
- [ ] Response shows `"revalidated": true`

**If NO (401 Unauthorized):** Secret mismatch. Check Vercel env var vs webhook header.

**If NO (404 Not Found):** Route doesn't exist. Check `app/api/revalidate/route.ts` exists and is deployed.

**If YES:** Continue to step 7.

---

### 7. Check Vercel Deployment

Go to **Vercel Dashboard → Your Project → Deployments**

- [ ] Latest commit is deployed to Production
- [ ] Deployment status is "Ready" (not "Building" or "Error")
- [ ] Deployment was after you made code changes

**If NO:** Push your code and wait for deployment to complete.

**If YES:** Continue to step 8.

---

### 8. Hard Refresh Browser

Your browser caches pages aggressively.

- [ ] Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- [ ] Or open in incognito/private window

**If content still old:** Continue to step 9.

**If content is fresh:** ✅ Problem solved! Browser cache was the issue.

---

### 9. Check Vercel Function Logs

Go to **Vercel Dashboard → Your Project → Functions → Logs**

Filter by `/api/revalidate`

- [ ] Logs show recent requests
- [ ] Logs show `[revalidate] Done: [...]`
- [ ] No errors in logs

**If logs show errors:** Read the error message and fix the issue.

**If no logs at all:** Webhook is not firing. Check WordPress webhook logs.

---

### 10. Check WordPress Webhook Logs

Go to **WordPress Admin → WP Webhooks → Logs**

- [ ] Recent webhook fires show `200 OK` response
- [ ] Webhook fired when you updated the page

**If 401 Unauthorized:** Secret mismatch. Fix webhook header.

**If no logs:** Webhook trigger is not configured correctly. Check trigger settings.

**If 200 OK:** Webhook is working. Continue to step 11.

---

### 11. Verify Fresh Data in Vercel Logs

Go to **Vercel Dashboard → Functions → Logs**

Filter by your page route (e.g., `/sv/cloud-services`)

Look for fetch logs showing fresh data:
```
[getPageById] Fetched: { id: 21, subtitle: "...test123", ... }
```

- [ ] Logs show your updated content
- [ ] Timestamp is recent

**If logs show old content:** Next.js is still using cached data. Try:
- Manually trigger revalidation (step 6)
- Redeploy the site
- Check if `cache: 'no-store'` is actually deployed

**If logs show fresh content but site shows old:** Browser cache. Hard refresh again.

---

## 🚨 Emergency Fix — Force Revalidation

If nothing else works, force a full revalidation:

```powershell
$headers = @{
    "X-Revalidate-Secret" = "your_secret"
    "Content-Type" = "application/json"
}

# Revalidate everything
Invoke-WebRequest -Uri "https://bluerange2.vercel.app/api/revalidate" `
    -Method POST `
    -Headers $headers `
    -Body '{}'
```

Then hard refresh your browser.

---

## 🔍 Still Not Working?

### Check These Common Issues

**Issue 1 — Old deployment is live**

Go to Vercel → Deployments → check the commit hash matches your latest code.

**Issue 2 — Env vars not set**

Go to Vercel → Settings → Environment Variables → verify all secrets are set.

**Issue 3 — Wrong Vercel project**

Make sure you're checking the correct Vercel project (not a preview or different project).

**Issue 4 — WordPress caching plugin**

Some WordPress caching plugins cache the REST API. Disable caching plugins temporarily to test.

**Issue 5 — Pantheon CDN cache**

Pantheon has its own CDN cache. The image proxy adds `?_t=timestamp` to bypass it, but pages might still be cached. Check Pantheon dashboard for cache settings.

---

## ✅ Success Criteria

After following all steps, you should have:

- [ ] WordPress API returns fresh data
- [ ] Next.js fetch uses `cache: 'no-store'`
- [ ] Pages use `revalidate: 0`
- [ ] Webhooks configured and firing
- [ ] Vercel env vars set correctly
- [ ] Latest code deployed to Vercel
- [ ] Manual revalidation works
- [ ] Browser hard refresh shows fresh content

**If all checked:** Your setup is correct! WordPress changes should now appear instantly on Vercel.

---

## 📞 Need More Help?

1. Check `CACHING-EXPLAINED.md` for detailed explanations
2. Check `WORDPRESS-NEXTJS-SETUP.md` for complete setup guide
3. Check Vercel function logs for error messages
4. Check WordPress webhook logs for failed requests

---

## Quick Reference — Key Commands

**Generate secret (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Test revalidation (PowerShell):**
```powershell
$headers = @{"X-Revalidate-Secret"="your_secret";"Content-Type"="application/json"}
Invoke-WebRequest -Uri "https://bluerange2.vercel.app/api/revalidate" -Method POST -Headers $headers -Body '{}'
```

**Test WordPress API (browser):**
```
https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard
```

**Hard refresh browser:**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
