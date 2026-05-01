# ACF Fields with WordPress REST API — Complete Guide

## Why `content.rendered` is Empty

### The Problem

When you fetch a WordPress page:

```javascript
const res = await fetch('https://your-site.com/wp-json/wp/v2/pages/21');
const data = await res.json();

console.log(data.content.rendered); // Empty string ""
```

### Why This Happens

**You're using ACF (Advanced Custom Fields) instead of the default WordPress content editor.**

WordPress has two ways to add content:

1. **Default Content Editor** → Saved in `post_content` → Available as `content.rendered` in API
2. **ACF Custom Fields** → Saved in `post_meta` → NOT in `content.rendered` by default

If you only use ACF fields and leave the content editor empty, `content.rendered` will be empty.

---

## Solution: Access ACF Data from REST API

### Step 1: Enable ACF in REST API

ACF fields are NOT included in the REST API by default. You need to enable them.

#### Option 1 — Install Plugin (Easiest)

1. Go to **WordPress Admin** → **Plugins** → **Add New**
2. Search for **"ACF to REST API"**
3. Click **Install Now**
4. Click **Activate**

✅ Done! ACF fields now appear in the API.

#### Option 2 — Add Code to functions.php

If you can't install plugins, add this to your theme's `functions.php`:

```php
<?php
/**
 * Enable ACF fields in WordPress REST API
 */

// Enable ACF REST API support
add_filter('acf/settings/rest_api_enabled', '__return_true');

// Include ACF fields in pages
add_filter('acf/rest_api/page/get_fields', '__return_true');

// Include ACF fields in posts
add_filter('acf/rest_api/post/get_fields', '__return_true');

// Include ACF fields in custom post types (if needed)
add_filter('acf/rest_api/your_post_type/get_fields', '__return_true');
```

---

### Step 2: Test ACF in API

Open this URL in your browser:

```
https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard
```

**Before enabling ACF:**
```json
{
  "id": 21,
  "title": { "rendered": "Cloud Services" },
  "content": { "rendered": "" },
  "acf": false  // ❌ No ACF data
}
```

**After enabling ACF:**
```json
{
  "id": 21,
  "title": { "rendered": "Cloud Services" },
  "content": { "rendered": "" },
  "acf": {  // ✅ ACF data present!
    "subtitle": "Bluerange Sustainable Datacenter...",
    "banner_image": "https://...",
    "features": [
      {
        "title": "Feature 1",
        "description": "..."
      }
    ]
  }
}
```

---

## How to Access ACF Data in Next.js

### Example 1: Simple Text Field

**WordPress ACF Setup:**
- Field Name: `subtitle`
- Field Type: Text

**Next.js Code:**

```typescript
export default async function Page() {
  const res = await fetch(
    'https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard',
    { cache: 'no-store' }
  );
  const page = await res.json();

  // Access ACF field
  const subtitle = page.acf?.subtitle || '';

  return (
    <div>
      <h1>{page.title.rendered}</h1>
      <p className="subtitle">{subtitle}</p>
    </div>
  );
}
```

---

### Example 2: Image Field

**WordPress ACF Setup:**
- Field Name: `banner_image`
- Field Type: Image
- Return Format: Image Object (or Image URL)

**Next.js Code:**

```typescript
import { wpAcfImg } from '@/lib/imageUtils';

export default async function Page() {
  const res = await fetch(
    'https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard',
    { cache: 'no-store' }
  );
  const page = await res.json();

  // Handle both URL string and image object
  const bannerImage = wpAcfImg(page.acf?.banner_image);

  return (
    <div>
      {bannerImage && (
        <img src={bannerImage} alt="Banner" />
      )}
    </div>
  );
}
```

**What `wpAcfImg()` does:**

```typescript
// Handles all ACF image formats:
wpAcfImg('https://example.com/image.jpg')           // URL string
wpAcfImg({ url: 'https://...' })                    // Image object
wpAcfImg({ source_url: 'https://...' })             // WP media object
wpAcfImg(123)                                        // Media ID (returns empty)
```

---

### Example 3: WYSIWYG Field (HTML Content)

**WordPress ACF Setup:**
- Field Name: `content_html`
- Field Type: WYSIWYG Editor

**Next.js Code:**

```typescript
export default async function Page() {
  const res = await fetch(
    'https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard',
    { cache: 'no-store' }
  );
  const page = await res.json();

  const contentHtml = page.acf?.content_html || '';

  return (
    <div>
      <h1>{page.title.rendered}</h1>
      
      {/* Render HTML content */}
      <div 
        className="content"
        dangerouslySetInnerHTML={{ __html: contentHtml }} 
      />
    </div>
  );
}
```

---

### Example 4: Repeater Field (Array)

**WordPress ACF Setup:**
- Field Name: `features`
- Field Type: Repeater
- Sub Fields:
  - `title` (Text)
  - `description` (Textarea)
  - `icon` (Image)

**Next.js Code:**

```typescript
import { wpAcfImg } from '@/lib/imageUtils';

export default async function Page() {
  const res = await fetch(
    'https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard',
    { cache: 'no-store' }
  );
  const page = await res.json();

  const features = page.acf?.features || [];

  return (
    <div>
      <h2>Features</h2>
      
      <div className="features-grid">
        {features.map((feature: any, index: number) => (
          <div key={index} className="feature-card">
            {feature.icon && (
              <img 
                src={wpAcfImg(feature.icon)} 
                alt={feature.title} 
              />
            )}
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Example 5: Group Field (Nested Object)

**WordPress ACF Setup:**
- Field Name: `hero_section`
- Field Type: Group
- Sub Fields:
  - `title` (Text)
  - `subtitle` (Text)
  - `background_image` (Image)
  - `cta_button` (Link)

**Next.js Code:**

```typescript
import { wpAcfImg } from '@/lib/imageUtils';

export default async function Page() {
  const res = await fetch(
    'https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard',
    { cache: 'no-store' }
  );
  const page = await res.json();

  const hero = page.acf?.hero_section || {};

  return (
    <section 
      className="hero"
      style={{
        backgroundImage: `url(${wpAcfImg(hero.background_image)})`
      }}
    >
      <h1>{hero.title}</h1>
      <p>{hero.subtitle}</p>
      
      {hero.cta_button && (
        <a href={hero.cta_button.url} className="btn">
          {hero.cta_button.title}
        </a>
      )}
    </section>
  );
}
```

---

### Example 6: True/False Field (Boolean)

**WordPress ACF Setup:**
- Field Name: `show_banner`
- Field Type: True/False

**Next.js Code:**

```typescript
export default async function Page() {
  const res = await fetch(
    'https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard',
    { cache: 'no-store' }
  );
  const page = await res.json();

  const showBanner = page.acf?.show_banner || false;

  return (
    <div>
      {showBanner && (
        <div className="banner">
          Special offer available!
        </div>
      )}
    </div>
  );
}
```

---

### Example 7: Select Field (Dropdown)

**WordPress ACF Setup:**
- Field Name: `layout_type`
- Field Type: Select
- Choices: `full-width`, `boxed`, `sidebar`

**Next.js Code:**

```typescript
export default async function Page() {
  const res = await fetch(
    'https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/21?acf_format=standard',
    { cache: 'no-store' }
  );
  const page = await res.json();

  const layoutType = page.acf?.layout_type || 'full-width';

  return (
    <div className={`layout-${layoutType}`}>
      <h1>{page.title.rendered}</h1>
      {/* Content based on layout type */}
    </div>
  );
}
```

---

## Complete Working Example

Here's a full page component using multiple ACF field types:

```typescript
// app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { wpAcfImg } from '@/lib/imageUtils';

export const revalidate = 0; // On-demand revalidation

async function getPage(slug: string) {
  const res = await fetch(
    `https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages?slug=${slug}&acf_format=standard`,
    { cache: 'no-store' }
  );
  
  if (!res.ok) return null;
  
  const data = await res.json();
  return data[0] || null;
}

export default async function Page({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  // Extract ACF fields
  const acf = page.acf || {};
  const {
    subtitle,
    banner_image,
    banner_title,
    features = [],
    show_cta,
    cta_text,
    cta_link,
    content_sections = [],
  } = acf;

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        {banner_image && (
          <img 
            src={wpAcfImg(banner_image)} 
            alt={banner_title || page.title.rendered}
            className="hero-image"
          />
        )}
        <div className="hero-content">
          <h1>{page.title.rendered}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
      </section>

      {/* Features Section */}
      {features.length > 0 && (
        <section className="features">
          <h2>Features</h2>
          <div className="features-grid">
            {features.map((feature: any, index: number) => (
              <div key={index} className="feature-card">
                {feature.icon && (
                  <img 
                    src={wpAcfImg(feature.icon)} 
                    alt={feature.title}
                    className="feature-icon"
                  />
                )}
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content Sections (Flexible Content) */}
      {content_sections.map((section: any, index: number) => {
        switch (section.acf_fc_layout) {
          case 'text_section':
            return (
              <section key={index} className="text-section">
                <h2>{section.heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              </section>
            );
          
          case 'image_text':
            return (
              <section key={index} className="image-text">
                <img src={wpAcfImg(section.image)} alt={section.heading} />
                <div>
                  <h2>{section.heading}</h2>
                  <p>{section.text}</p>
                </div>
              </section>
            );
          
          default:
            return null;
        }
      })}

      {/* CTA Section */}
      {show_cta && cta_text && (
        <section className="cta">
          <a href={cta_link} className="btn-primary">
            {cta_text}
          </a>
        </section>
      )}

      {/* Fallback: Show default content if exists */}
      {page.content.rendered && (
        <section className="default-content">
          <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
        </section>
      )}
    </main>
  );
}
```

---

## Best Practices for ACF with Headless WordPress

### 1. Always Check if ACF Data Exists

```typescript
// ❌ BAD — Will crash if acf is undefined
const subtitle = page.acf.subtitle;

// ✅ GOOD — Safe access with fallback
const subtitle = page.acf?.subtitle || '';
```

### 2. Use TypeScript Types

```typescript
interface ACFFields {
  subtitle?: string;
  banner_image?: string | { url: string };
  features?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  show_banner?: boolean;
}

interface WordPressPage {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  acf?: ACFFields;
}
```

### 3. Create Reusable ACF Components

```typescript
// components/ACFImage.tsx
import { wpAcfImg } from '@/lib/imageUtils';

export default function ACFImage({ 
  field, 
  alt 
}: { 
  field: any; 
  alt: string;
}) {
  const src = wpAcfImg(field);
  
  if (!src) return null;
  
  return <img src={src} alt={alt} />;
}

// Usage
<ACFImage field={acf.banner_image} alt="Banner" />
```

### 4. Handle Missing ACF Data Gracefully

```typescript
export default async function Page() {
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  // Check if ACF data exists
  if (!page.acf) {
    return (
      <div>
        <h1>{page.title.rendered}</h1>
        <p>⚠️ ACF data not configured for this page</p>
        {/* Fallback to default content */}
        <div dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
      </div>
    );
  }

  // Render ACF fields
  return <div>{/* ACF content */}</div>;
}
```

### 5. Use Flexible Content for Dynamic Layouts

**WordPress Setup:**
- Field Name: `page_builder`
- Field Type: Flexible Content
- Layouts: `hero`, `text_block`, `image_gallery`, `cta`

**Next.js Code:**

```typescript
export default async function Page() {
  const page = await getPage(slug);
  const sections = page.acf?.page_builder || [];

  return (
    <main>
      {sections.map((section: any, index: number) => {
        switch (section.acf_fc_layout) {
          case 'hero':
            return <HeroSection key={index} data={section} />;
          case 'text_block':
            return <TextBlock key={index} data={section} />;
          case 'image_gallery':
            return <ImageGallery key={index} data={section} />;
          case 'cta':
            return <CTASection key={index} data={section} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
```

### 6. Cache ACF Field Definitions

If you need to know which fields exist:

```typescript
// lib/acf-fields.ts
export const ACF_FIELDS = {
  page: [
    'subtitle',
    'banner_image',
    'features',
    'show_cta',
  ],
  post: [
    'author_bio',
    'featured_quote',
    'related_posts',
  ],
};
```

### 7. Use Environment Variables for API URL

```typescript
// .env.local
NEXT_PUBLIC_WP_URL=https://dev-bluerange.pantheonsite.io

// lib/wp.ts
const WP = process.env.NEXT_PUBLIC_WP_URL;
```

---

## Troubleshooting

### Problem 1: `acf` is `false` or missing

**Cause:** ACF to REST API plugin not installed/configured

**Solution:**
1. Install "ACF to REST API" plugin
2. Or add filter to functions.php (see Step 1 above)
3. Test API: `https://your-site.com/wp-json/wp/v2/pages/21?acf_format=standard`

---

### Problem 2: Some ACF fields missing

**Cause:** Fields not set to show in REST API

**Solution:**

In WordPress, edit the field group:
1. Go to **Custom Fields** → **Field Groups**
2. Edit your field group
3. Scroll to **Settings**
4. Check **"Show in REST API"** (ACF Pro only)

Or use the plugin method (works with free ACF).

---

### Problem 3: Image fields return ID instead of URL

**Cause:** ACF image field return format set to "Image ID"

**Solution:**

Change in WordPress:
1. Edit the image field
2. Set **Return Format** to **"Image URL"** or **"Image Object"**

Or handle in Next.js:

```typescript
// If image field returns ID
const imageId = acf.banner_image;
const imageUrl = await fetch(
  `https://your-site.com/wp-json/wp/v2/media/${imageId}`
).then(r => r.json()).then(d => d.source_url);
```

---

### Problem 4: Repeater fields are empty array

**Cause:** No rows added in WordPress

**Solution:**
1. Edit the page in WordPress
2. Click **"Add Row"** in the repeater field
3. Fill in the fields
4. Click **Update**

---

## Summary

### Why `content.rendered` is Empty
- You're using ACF fields instead of the default content editor
- WordPress saves ACF data separately from `post_content`

### How to Fix
1. **Enable ACF in REST API** → Install plugin or add filter
2. **Access via `page.acf`** → Not `page.content.rendered`
3. **Always check if exists** → Use `page.acf?.field_name`
4. **Use helper functions** → `wpAcfImg()` for images

### Key Points
- ✅ ACF data is in `page.acf`, not `page.content`
- ✅ Must enable ACF in REST API first
- ✅ Use `?acf_format=standard` in API URL
- ✅ Always check if ACF data exists before accessing
- ✅ Use `wpAcfImg()` for image fields

Your ACF fields are now fully accessible in Next.js! 🎉
