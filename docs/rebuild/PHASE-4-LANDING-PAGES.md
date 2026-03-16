# Phase 4: Landing Page Templates

**Goal:** Create reusable landing page templates for industries, use-cases, and campaigns.

**Prereq:** Phase 3 complete

---

## Tasks

### 4.1 Create Landing Layout (`src/_includes/layouts/landing.njk`)

Flexible layout with optional sections:
- Hero (customizable headline, subhead, CTA)
- Features grid
- How it works
- Testimonials
- FAQ
- CTA box

Each section is toggleable via front matter.

### 4.2 Create Section Partials

```
src/_includes/partials/sections/
├── hero-landing.njk
├── features-grid.njk
├── how-it-works.njk
├── testimonials.njk
├── faq-section.njk
├── cta-section.njk
└── stats-section.njk
```

Each partial accepts data from front matter.

### 4.3 Create Industry Landing Pages

```
src/industries/
├── contractors.njk
├── realtors.njk
├── consultants.njk
├── agencies.njk
└── index.njk (lists all industries)
```

Example front matter:

```yaml
---
layout: landing
title: ReferVo for Contractors
meta_description: The referral app built for contractors. Send leads to your network and earn referral fees automatically.
slug: contractors
hero:
  headline: Get Paid for Every Referral You Send
  subhead: You're already recommending roofers, plumbers, and electricians. Now get paid for it.
  cta_text: Download Free
  cta_url: https://apps.apple.com/app/id6759116716
features:
  - icon: 🏠
    title: Built for the Trades
    description: Connect with other contractors you trust.
  - icon: 💰
    title: Automatic Payments
    description: No chasing down referral fees.
faq:
  - q: How much can I earn?
    a: You set your own rates with each partner.
---
```

### 4.4 Create Use-Case Pages

```
src/use-cases/
├── send-referrals.njk  ("For people who send")
├── receive-referrals.njk  ("For people who receive")
└── index.njk
```

### 4.5 Create Campaign Template

For marketing campaigns (ads, partnerships):

```
src/go/
├── welcome.njk
├── partner-promo.njk
└── [campaign-slug].njk
```

Minimal design, focused on conversion.

### 4.6 Add Landing Page Styles

- Hero variations (centered, left-aligned, with image)
- Testimonial card styles
- Industry-specific accent colors (optional)

---

## Acceptance Criteria

- [ ] Industry pages render with custom content
- [ ] Section partials are reusable
- [ ] Landing layout is flexible
- [ ] Use-case pages work
- [ ] Campaign pages are minimal and fast
- [ ] All CTAs link to App Store

---

## When Complete

Report back with confirmation, then proceed to **Phase 5: SEO & Growth**.
