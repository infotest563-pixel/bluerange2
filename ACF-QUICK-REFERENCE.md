# ACF Quick Reference Card

## 🚀 Quick Start

### 1. Enable ACF in WordPress

Install **"ACF to REST API"** plugin, or add to `functions.php`:

```php
add_filter('acf/settings/rest_api_enabled', '__return_true');
add_filter('acf/rest_api/page/get_fields', '__return_true');
```

### 2. Test API

```
https://your-site.com/wp-json/wp/v2/pages/21?acf_format=standard
```

### 3. Access in Next.js

```typescript
const page = await fetch(url, { cache: 'no-store' }).then(r => r.json());
const subtitle = page.acf?.subtitle || '';
```

---

## 📦 ACF Field Types → Next.js Code

### Text / Textarea / Number

```typescript
const value = page.acf?.field_name || '';
<p>{value}</p>
```

### WYSIWYG (HTML)

```typescript
const html = page.acf?.content_html || '';
<div dangerouslySetInnerHTML={{ __html: html }} />
```

### Image (URL or Object)

```typescript
import { wpAcfImg } from '@/lib/imageUtils';

const imageUrl = wpAcfImg(page.acf?.banner_image);
{imageUrl && <img src={imageUrl} alt="Banner" />}
```

### True/False (Boolean)

```typescript
const showBanner = page.acf?.show_banner || false;
{showBanner && <div>Banner content</div>}
```

### Select / Radio / Checkbox

```typescript
const layout = page.acf?.layout_type || 'default';
<div className={`layout-${layout}`}>...</div>
```

### Link

```typescript
const link = page.acf?.cta_button;
{link && <a href={link.url}>{link.title}</a>}
```

### Repeater (Array)

```typescript
const features = page.acf?.features || [];
{features.map((item: any, i: number) => (
  <div key={i}>
    <h3>{item.title}</h3>
    <p>{item.description}</p>
  </div>
))}
```

### Group (Object)

```typescript
const hero = page.acf?.hero_section || {};
<section>
  <h1>{hero.title}</h1>
  <p>{hero.subtitle}</p>
</section>
```

### Flexible Content (Dynamic Layouts)

```typescript
const sections = page.acf?.page_builder || [];
{sections.map((section: any, i: number) => {
  switch (section.acf_fc_layout) {
    case 'hero':
      return <HeroSection key={i} data={section} />;
    case 'text':
      return <TextBlock key={i} data={section} />;
    default:
      return null;
  }
})}
```

---

## ⚠️ Common Mistakes

### ❌ Don't Do This

```typescript
// Will crash if acf is undefined
const subtitle = page.acf.subtitle;

// Wrong API URL (missing acf_format)
fetch('https://site.com/wp-json/wp/v2/pages/21')

// Not checking if image exists
<img src={page.acf.banner_image} />
```

### ✅ Do This Instead

```typescript
// Safe access with fallback
const subtitle = page.acf?.subtitle || '';

// Correct API URL
fetch('https://site.com/wp-json/wp/v2/pages/21?acf_format=standard')

// Check and use helper
const img = wpAcfImg(page.acf?.banner_image);
{img && <img src={img} alt="Banner" />}
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| `acf` is `false` | Install "ACF to REST API" plugin |
| `acf` is missing | Add `?acf_format=standard` to URL |
| Some fields missing | Check "Show in REST API" in field settings |
| Image returns ID | Change return format to "Image URL" |
| Repeater is empty | Add rows in WordPress editor |
| Old data showing | Clear cache, trigger revalidation |

---

## 📝 Complete Example

```typescript
import { wpAcfImg } from '@/lib/imageUtils';

export default async function Page({ params }) {
  const { slug } = await params;
  
  // Fetch with ACF data
  const res = await fetch(
    `https://site.com/wp-json/wp/v2/pages?slug=${slug}&acf_format=standard`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  const page = data[0];

  // Extract ACF fields safely
  const acf = page.acf || {};
  const {
    subtitle = '',
    banner_image,
    features = [],
    show_cta = false,
  } = acf;

  return (
    <main>
      {/* Hero */}
      <section>
        {banner_image && (
          <img src={wpAcfImg(banner_image)} alt="Banner" />
        )}
        <h1>{page.title.rendered}</h1>
        {subtitle && <p>{subtitle}</p>}
      </section>

      {/* Features */}
      {features.length > 0 && (
        <section>
          {features.map((feature: any, i: number) => (
            <div key={i}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* CTA */}
      {show_cta && (
        <section>
          <a href="/contact" className="btn">
            Get Started
          </a>
        </section>
      )}
    </main>
  );
}
```

---

## 🔗 Quick Links

- **Full Guide:** `ACF-GUIDE.md`
- **Debugging:** `DEBUGGING-GUIDE.md`
- **Caching:** `CACHING-EXPLAINED.md`
- **Setup:** `WORDPRESS-NEXTJS-SETUP.md`

---

## ✅ Checklist

- [ ] ACF to REST API plugin installed
- [ ] Test API shows `acf` object
- [ ] Using `?acf_format=standard` in URL
- [ ] Using `cache: 'no-store'` in fetch
- [ ] Safe access with `page.acf?.field`
- [ ] Using `wpAcfImg()` for images
- [ ] Checking if arrays/objects exist before mapping

**All checked?** You're ready to use ACF with Next.js! 🎉
