# Phase 3: Blog System

**Goal:** Set up a scalable blog/article system with templates, collections, and category pages.

**Prereq:** Phase 2 complete

---

## Tasks

### 3.1 Create Article Layout (`src/_includes/layouts/article.njk`)

```yaml
# Example article front matter:
---
layout: article
title: How Contractors Earn Passive Income with Referrals
date: 2026-03-15
author: ReferVo Team
category: contractors
tags:
  - article
  - contractors
  - tips
meta_description: Learn how contractors can turn their professional network into a passive income stream with ReferVo.
featured_image: https://res.cloudinary.com/dxzw1zwez/image/upload/...
---
```

Layout includes:
- Hero with title, date, author, category badge
- Featured image (optional)
- Article content with good typography
- Related articles at bottom
- CTA to download app
- Social share buttons (optional)

### 3.2 Create Blog Index (`src/blog/index.njk`)

- Lists all articles from `collections.articles`
- Grid or list layout with cards
- Pagination (if >10 articles)
- Category filter links

### 3.3 Create Category Pages

Create dynamic category pages:

```
src/blog/category/
├── contractors.njk
├── realtors.njk
├── agencies.njk
├── tips.njk
└── news.njk
```

Each filters `collections.articles` by category.

Alternatively, use Eleventy pagination to generate these dynamically.

### 3.4 Create Article Card Partial (`src/_includes/partials/article-card.njk`)

Reusable card component:
- Featured image
- Category badge
- Title (linked)
- Excerpt (first 150 chars or custom)
- Date
- Read more link

### 3.5 Create Sample Articles

Create 3 sample articles to test the system:

```
src/blog/
├── how-contractors-earn-passive-income.md
├── getting-started-with-refervo.md
└── 5-tips-for-quality-referrals.md
```

### 3.6 Add Related Articles Logic

In article layout, show 2-3 related articles:
- Same category
- Exclude current article
- Limit to 3

### 3.7 Add Blog Styles

- Article typography (headings, paragraphs, lists, blockquotes)
- Code blocks (if needed)
- Images with captions
- Article card hover effects

---

## Acceptance Criteria

- [ ] `/blog/` shows list of articles
- [ ] Individual article pages render correctly
- [ ] Category pages filter correctly
- [ ] Article cards are reusable
- [ ] Related articles appear
- [ ] Good reading typography
- [ ] Mobile responsive

---

## When Complete

Report back with confirmation, then proceed to **Phase 4: Landing Page Templates**.
