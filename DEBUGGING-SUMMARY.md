# WordPress API Debugging — Quick Summary

## ✅ What I Added

### 1. Enhanced Logging in `lib/wp.ts`

Now every API call logs:
- 🔄 When fetch starts
- 📍 Full API URL
- ✅ Success with page details
- 📦 ACF data (if present)
- ⚠️ Warnings if ACF missing
- ❌ Errors with details
- 🕐 Timestamp

### 2. Debug Panel Component

Created `components/DebugPanel.tsx` — a floating debug panel that shows:
- Page ID, title, slug, status
- Last modified time
- ACF fields present/missing
- Full JSON data
- Quick actions (view API, copy JSON)

**Only visible in development mode** (hidden in production)

---

## 🚀 How to Use

### Method 1: Check Terminal Logs (Easiest)

1. Run development server:
   ```bash
   npm run dev
   ```

2. Visit any page: http://localhost:3000/en/cloud-services

3. Check terminal output:
   ```
   [getPageBySlug] 🔄 Fetching slug "cloud-services" (en)...
   [getPageBySlug] ✅ Success! Slug "cloud-services": {
     id: 21,
     title: 'Cloud Services',
     has_acf: true,
     acf_fields: [ 'subtitle', 'banner_image', 'features' ]
   }
   [getPageBySlug] 📦 ACF Data: { subtitle: '...', ... }
   ```

**What to look for:**
- ✅ `has_acf: true` → ACF working
- ✅ `acf_fields: [...]` → Shows which fields exist
- ❌ `has_acf: false` → ACF plugin not configured

---

### Method 2: Use Debug Panel (Visual)

1. Add to your page component:

```typescript
import DebugPanel from '@/components/DebugPanel';

export default async function Page({ params }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug, 'sv');

  return (
    <>
      <WordPressPageRenderer page={page} />
      <DebugPanel data={page} />
    </>
  );
}
```

2. Run `npm run dev`

3. Visit any page

4. Click **🐛 Debug Data** button (bottom-right corner)

5. See all page data and ACF fields

---

### Method 3: Test API in Browser Console

1. Open your site: https://bluerange2.vercel.app

2. Press `F12` to open console

3. Run this:

```javascript
fetch('https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Page Data:', data);
    console.log('📦 ACF Fields:', data.acf);
  });
```

4. Check the output

---

### Method 4: Check Vercel Production Logs

1. Go to **Vercel Dashboard** → https://vercel.com

2. Click your project **bluerange2**

3. Go to **Functions** → **Logs**

4. Filter by: `getPageBySlug`

5. See the same logs as terminal (but from production)

---

## 🐛 Common Issues & What Logs Show

### Issue 1: ACF Data Missing

**Logs show:**
```
[getPageBySlug] ⚠️ No ACF data found for slug "cloud-services"
```

**Solution:**
- Install "ACF to REST API" plugin in WordPress
- Or add to functions.php:
  ```php
  add_filter('acf/settings/rest_api_enabled', '__return_true');
  ```

---

### Issue 2: Old Content Showing

**Logs show:**
```
[getPageBySlug] ✅ Success! Slug "cloud-services": {
  modified: '2026-04-15T10:00:00',  // ← Old timestamp
  ...
}
```

**Solution:**
- Check WordPress actually saved the changes
- Clear WordPress cache
- Trigger revalidation:
  ```powershell
  $headers = @{"X-Revalidate-Secret"="your_secret";"Content-Type"="application/json"}
  Invoke-WebRequest -Uri "https://bluerange2.vercel.app/api/revalidate" -Method POST -Headers $headers -Body '{}'
  ```

---

### Issue 3: API Not Responding

**Logs show:**
```
[getPageBySlug] ❌ 500 for slug "cloud-services"
```

**Solution:**
- Check WordPress is online
- Check API URL is correct
- Test API directly in browser:
  ```
  https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21
  ```

---

## 📋 Quick Debugging Checklist

When something doesn't work, check in this order:

1. **Check terminal logs** → See if API is being called
2. **Check API response** → Test in browser console
3. **Check ACF data** → Look for `has_acf: true` in logs
4. **Check timestamps** → Verify `modified` is recent
5. **Hard refresh browser** → Press `Ctrl+Shift+R`
6. **Check Vercel logs** → See production logs
7. **Use debug panel** → Visual inspection of data

---

## 🎯 What Each Log Means

| Log Message | Meaning |
|---|---|
| `🔄 Fetching slug...` | API call started |
| `📍 URL: https://...` | Full API URL being called |
| `✅ Success!` | API returned data |
| `has_acf: true` | ACF data is present |
| `acf_fields: [...]` | List of ACF field names |
| `📦 ACF Data: {...}` | Full ACF data object |
| `⚠️ No ACF data found` | ACF missing (plugin issue) |
| `❌ 404 for slug` | Page doesn't exist |
| `❌ 500 for slug` | WordPress server error |

---

## 🚀 Next Steps

1. **Deploy the changes:**
   ```bash
   git add .
   git commit -m "Add WordPress API debugging"
   git push
   ```

2. **Test locally:**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 and check terminal logs

3. **Test production:**
   - Visit your Vercel site
   - Check Vercel function logs

4. **Read full guide:**
   - See `DEBUGGING-GUIDE.md` for complete instructions
   - See `CACHING-EXPLAINED.md` for caching concepts

---

## 📞 Quick Reference

**Test API in browser:**
```
https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard
```

**Test in console:**
```javascript
fetch('https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard')
  .then(r => r.json())
  .then(d => console.log(d));
```

**Manual revalidation:**
```powershell
$headers = @{"X-Revalidate-Secret"="your_secret";"Content-Type"="application/json"}
Invoke-WebRequest -Uri "https://bluerange2.vercel.app/api/revalidate" -Method POST -Headers $headers -Body '{}'
```

**Hard refresh:**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

Your WordPress API is now fully debuggable with comprehensive logging! 🐛✅
