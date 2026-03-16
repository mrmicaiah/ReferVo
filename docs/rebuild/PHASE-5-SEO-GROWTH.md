# Phase 5: SEO & Growth

**Goal:** Add SEO infrastructure, analytics, email capture, and growth tools.

**Prereq:** Phase 4 complete

---

## Tasks

### 5.1 Create Sitemap (`src/sitemap.njk`)

```yaml
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
```

Generate XML sitemap with all pages, articles, and landing pages.

### 5.2 Create RSS Feed (`src/feed.njk`)

```yaml
---
permalink: /feed.xml
eleventyExcludeFromCollections: true
---
```

Atom/RSS feed for blog articles.

### 5.3 Create robots.txt (`src/robots.txt`)

```
User-agent: *
Allow: /

Sitemap: https://refervo.com/sitemap.xml
```

### 5.4 Add Google Analytics

Add GA4 tracking to base layout:
- Property ID: (get from Micaiah)
- Include in production only (optional env check)

### 5.5 Add Email Capture Component

Create `src/_includes/partials/email-capture.njk`:
- "Get notified when Android launches"
- Connect to Courier list (or Mailchimp)
- Can be embedded on any page

### 5.6 Add Schema.org Markup

Add structured data to:
- Homepage (SoftwareApplication)
- Articles (Article schema)
- FAQ pages (FAQPage schema)

### 5.7 Add Open Graph & Twitter Cards

Enhance SEO partial:
- og:title, og:description, og:image, og:url
- twitter:card, twitter:title, twitter:description, twitter:image
- Default image from Cloudinary

### 5.8 Add Canonical URLs

Ensure all pages have:
```html
<link rel="canonical" href="https://refervo.com{{ page.url }}">
```

### 5.9 Create _redirects File

For Cloudflare Pages / Netlify:
```
/app  https://apps.apple.com/app/id6759116716  302
/download  https://apps.apple.com/app/id6759116716  302
```

### 5.10 Performance Audit

- Lazy load images below fold
- Preconnect to Google Fonts, Cloudinary
- Minimize CSS/JS
- Test with Lighthouse

---

## Acceptance Criteria

- [ ] Sitemap accessible at /sitemap.xml
- [ ] RSS feed at /feed.xml
- [ ] Google Analytics tracking
- [ ] Email capture form works
- [ ] Schema markup validates (schema.org validator)
- [ ] Lighthouse score >90 for performance
- [ ] Redirects work

---

## When Complete

Report back with confirmation, then proceed to **Phase 6: Deploy & Cutover**.
