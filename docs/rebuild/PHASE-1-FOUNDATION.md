# Phase 1: Foundation & Scaffold

**Goal:** Create the new Eleventy-based ReferVo website repo with all foundational structure in place.

**Repo:** `mrmicaiah/refervo-website` (NEW - create this repo)

---

## Prerequisites

- GitHub access to `mrmicaiah` organization
- Reference: `mrmicaiah/bluerivergutters` for Eleventy patterns
- Reference: `mrmicaiah/ReferVo` for current site content/copy

---

## Tasks

### 1.1 Create Repository Structure

Create `refervo-website` repo with this structure:

```
refervo-website/
├── src/
│   ├── _data/
│   │   └── site.json          # Global site data
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk        # Base HTML template
│   │   │   ├── page.njk        # Standard page layout
│   │   │   ├── article.njk     # Blog article layout
│   │   │   └── landing.njk     # Landing page layout
│   │   └── partials/
│   │       ├── header.njk      # Site header/nav
│   │       ├── footer.njk      # Site footer
│   │       ├── cta-box.njk     # Reusable CTA component
│   │       ├── feature-card.njk
│   │       ├── screenshot-gallery.njk
│   │       └── seo-head.njk    # SEO meta tags partial
│   ├── css/
│   │   ├── styles.css          # Main styles
│   │   ├── components.css      # Reusable component styles
│   │   └── utilities.css       # Utility classes
│   ├── js/
│   │   └── main.js             # Navigation, animations
│   ├── images/                 # Local images (mostly use Cloudinary)
│   ├── index.njk               # Homepage
│   └── _redirects              # Cloudflare/Netlify redirects
├── eleventy.config.js
├── package.json
├── .gitignore
└── README.md
```

### 1.2 Create `package.json`

```json
{
  "name": "refervo-website",
  "version": "1.0.0",
  "description": "ReferVo marketing website - Eleventy static site",
  "scripts": {
    "build": "eleventy",
    "serve": "eleventy --serve",
    "watch": "eleventy --watch"
  },
  "keywords": ["refervo", "referral", "business"],
  "author": "Untitled Publishers",
  "license": "UNLICENSED",
  "private": true,
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0"
  }
}
```

### 1.3 Create `eleventy.config.js`

```javascript
module.exports = function(eleventyConfig) {
  // Passthrough copy
  eleventyConfig.addPassthroughCopy({"src/css": "css"});
  eleventyConfig.addPassthroughCopy({"src/js": "js"});
  eleventyConfig.addPassthroughCopy({"src/images": "images"});
  eleventyConfig.addPassthroughCopy({"src/_redirects": "_redirects"});

  // Watch targets
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  // Date filters
  eleventyConfig.addFilter("dateFormat", function(dateString, format) {
    const date = new Date(dateString);
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    if (format === "MMMM D, YYYY") {
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
    if (format === "YYYY-MM-DD") {
      return date.toISOString().slice(0, 10);
    }
    return dateString;
  });

  eleventyConfig.addFilter("isoDate", function(date) {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
  });

  // Blog collection
  eleventyConfig.addCollection("articles", function(collectionApi) {
    return collectionApi.getFilteredByTag("article").sort((a, b) => {
      return new Date(b.data.date) - new Date(a.data.date);
    });
  });

  // Industry landing pages collection
  eleventyConfig.addCollection("industries", function(collectionApi) {
    return collectionApi.getFilteredByTag("industry");
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
```

### 1.4 Create `src/_data/site.json`

```json
{
  "name": "ReferVo",
  "tagline": "Connect. Refer. Earn.",
  "description": "The business referral app that helps you get paid for the referrals you're already making.",
  "url": "https://refervo.com",
  "appStoreUrl": "https://apps.apple.com/app/id6759116716",
  "email": {
    "hello": "hello@refervo.com",
    "support": "support@refervo.com"
  },
  "colors": {
    "primary": "#f97316",
    "primaryDark": "#ea580c",
    "primaryLight": "#fb923c",
    "black": "#171717",
    "grayText": "#6b7280",
    "grayLight": "#f3f4f6",
    "grayBorder": "#e5e7eb"
  },
  "cloudinary": {
    "base": "https://res.cloudinary.com/dxzw1zwez/image/upload",
    "icon512": "v1771393717/RV_Icon_Transparent_512_yooqnl.png",
    "icon1024": "v1771393717/RV_Icon_Transparent_1024_r8cbpj.png",
    "iconMaster": "v1771393716/RV_Icon_Master_2048_gzrlct.png"
  },
  "screenshots": [
    {"id": "IMG_1186_st4u68", "caption": "Home Dashboard"},
    {"id": "IMG_1180_t7bdvz", "caption": "Your Network"},
    {"id": "IMG_1171_pwii0m", "caption": "Send a Referral"},
    {"id": "IMG_1170_lsyfrz", "caption": "Manage Leads"},
    {"id": "IMG_1174_ilwkx3", "caption": "Track Earnings"},
    {"id": "IMG_1176_npe7k9", "caption": "Business Profile"}
  ]
}
```

### 1.5 Create Base Layout (`src/_includes/layouts/base.njk`)

Port the current ReferVo site design into Nunjucks:
- Use CSS variables from `site.colors`
- Include SEO partial
- Include header/footer partials
- Google Fonts: Plus Jakarta Sans + DM Sans
- Responsive design with mobile menu

Reference the current `styles.css` from `mrmicaiah/ReferVo`.

### 1.6 Create Header Partial (`src/_includes/partials/header.njk`)

- Text-only logo: `<span class="logo-refer">Refer</span><span class="logo-vo">Vo</span>`
- Nav links: Features, How It Works, Screenshots, Blog, Support
- CTA button: "Get the App" → `{{ site.appStoreUrl }}`
- Mobile hamburger menu

### 1.7 Create Footer Partial (`src/_includes/partials/footer.njk`)

- Logo + description
- Product links
- Company links (Support, Contact, Privacy, Terms)
- Contact emails
- Copyright

### 1.8 Create Homepage (`src/index.njk`)

Port the current homepage content:
- Hero section with badge, headline, CTAs
- Floating cards animation
- Phone mockup with screenshot
- Features grid (6 cards)
- How It Works (3 steps)
- Screenshot gallery (horizontal scroll)
- Why ReferVo section
- CTA box with App Store link

### 1.9 Create CSS Files

Split current monolithic `styles.css` into:
- `styles.css` - Base styles, typography, layout
- `components.css` - Feature cards, steps, phone frames, etc.
- `utilities.css` - Helper classes

### 1.10 Create Main JS (`src/js/main.js`)

- Mobile menu toggle
- Scroll animations (fade in on scroll)
- Smooth scroll for anchor links
- Nav background on scroll

---

## Acceptance Criteria

- [ ] `npm run serve` works and shows homepage
- [ ] Homepage matches current refervo.com design
- [ ] Mobile responsive
- [ ] All links work (internal and App Store)
- [ ] No console errors
- [ ] Fast load time (no unnecessary assets)

---

## Cloudinary Assets

Use these URLs from the `refevo` folder:

| Asset | URL |
|-------|-----|
| Icon 512 | `https://res.cloudinary.com/dxzw1zwez/image/upload/v1771393717/RV_Icon_Transparent_512_yooqnl.png` |
| Dashboard | `https://res.cloudinary.com/dxzw1zwez/image/upload/v1773425248/IMG_1186_st4u68.jpg` |
| Network | `https://res.cloudinary.com/dxzw1zwez/image/upload/v1773425251/IMG_1180_t7bdvz.jpg` |
| Send Referral | `https://res.cloudinary.com/dxzw1zwez/image/upload/v1773425258/IMG_1171_pwii0m.jpg` |
| Leads | `https://res.cloudinary.com/dxzw1zwez/image/upload/v1773425262/IMG_1170_lsyfrz.jpg` |
| Earnings | `https://res.cloudinary.com/dxzw1zwez/image/upload/v1773425255/IMG_1174_ilwkx3.jpg` |
| Profile | `https://res.cloudinary.com/dxzw1zwez/image/upload/v1773425268/IMG_1176_npe7k9.jpg` |

---

## When Complete

Report back with:
1. Confirmation repo is created
2. Screenshot of homepage running locally
3. Any issues or decisions made

Then proceed to **Phase 2: Core Pages**.
