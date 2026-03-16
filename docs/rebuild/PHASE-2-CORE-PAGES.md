# Phase 2: Core Pages

**Goal:** Add all standard pages (Support, Contact, Privacy, Terms) AND app callback/redirect pages.

**Prereq:** Phase 1 complete

---

## Tasks

### 2.1 Create Page Layout (`src/_includes/layouts/page.njk`)

Simple layout for text-heavy pages:
- Extends `base.njk`
- Page header with title
- Content area with readable width (max 800px)
- Optional sidebar support

### 2.2 Create Support Page (`src/support.njk`)

```yaml
---
layout: page
title: Support
meta_description: Get help with ReferVo. Find answers to common questions or contact our support team.
---
```

Content:
- FAQ section with accordion
- Contact cards (email support@refervo.com)
- Link to App Store for app issues

FAQ Topics:
- How do I get started?
- How do referral fees work?
- How do I get paid?
- What if a referral is rejected?
- How do I connect with other businesses?
- Is my information secure?

### 2.3 Create Contact Page (`src/contact.njk`)

```yaml
---
layout: page
title: Contact Us
meta_description: Get in touch with the ReferVo team. We'd love to hear from you.
---
```

Content:
- Contact info cards (General: hello@refervo.com, Support: support@refervo.com)
- Simple contact form (can use Formspree or similar)
- Office hours / response time expectations

### 2.4 Create Privacy Policy (`src/privacy.njk`)

Port content from current `mrmicaiah/ReferVo/privacy.html`:
- Information we collect
- How we use your information
- Information sharing
- Data security
- Your rights
- Contact info
- Last updated date

### 2.5 Create Terms of Service (`src/terms.njk`)

Port content from current `mrmicaiah/ReferVo/terms.html`:
- Acceptance of terms
- Use of service
- User accounts
- Referral fees and payments
- Prohibited conduct
- Limitation of liability
- Changes to terms

### 2.6 Create 404 Page (`src/404.njk`)

- Friendly error message
- Link back to homepage
- Search suggestion or popular pages

### 2.7 Add FAQ Accordion Styles & JS

Reuse pattern from Blue River Gutters:
- Smooth expand/collapse animation
- Plus/minus or chevron icon
- Only one open at a time

---

## ⚠️ CRITICAL: App Callback/Redirect Pages

These pages are used by the ReferVo app for Stripe flows. **The app will break if these are missing.**

### 2.8 Create Stripe Return Page (`src/stripe-return.njk`)

```yaml
---
layout: page
title: Setup Complete
permalink: /stripe-return/
---
```

Content:
- Success message: "Your wallet setup is complete!"
- Instruction: "You can close this page and return to the app."
- Green checkmark icon
- "Open ReferVo" button (links to `refervo://` or App Store)

### 2.9 Create Stripe Refresh Page (`src/stripe-refresh.njk`)

```yaml
---
layout: page
title: Session Expired
permalink: /stripe-refresh/
---
```

Content:
- Message: "Your session expired. Please return to the app and try again."
- "Open ReferVo" button

### 2.10 Create Payment Success Page (`src/payment-success.njk`)

```yaml
---
layout: page
title: Card Added Successfully
permalink: /payment-success.html
---
```

**Note:** Must use `.html` permalink to match existing URL pattern.

Content:
- Success message: "Your payment method has been added!"
- Instruction: "You can close this page and return to the app."
- Green checkmark icon

### 2.11 Create Payment Cancel Page (`src/payment-cancel.njk`)

```yaml
---
layout: page
title: Setup Cancelled
permalink: /payment-cancel.html
---
```

Content:
- Message: "Payment setup was cancelled."
- Instruction: "You can close this page and try again in the app."

### 2.12 Create SMS Consent Page (`src/sms-consent.njk`)

Port content from existing `sms-consent.html`:
- SMS consent policy for Twilio A2P compliance
- Screenshots of consent flows
- Message types and frequency table
- Opt-out instructions

This page is required for Twilio A2P 10DLC campaign approval.

---

## Acceptance Criteria

- [ ] All standard pages render correctly
- [ ] FAQ accordion works
- [ ] Contact form submits (or placeholder)
- [ ] Privacy/Terms have proper legal formatting
- [ ] 404 page works for bad URLs
- [ ] All pages have proper meta descriptions
- [ ] Navigation links to all pages work
- [ ] **Stripe callback pages work at correct URLs:**
  - [ ] `/stripe-return/` or `/stripe-return`
  - [ ] `/stripe-refresh/` or `/stripe-refresh`
  - [ ] `/payment-success.html`
  - [ ] `/payment-cancel.html`
- [ ] SMS consent page renders with screenshots

---

## When Complete

Report back with confirmation, then proceed to **Phase 3: Blog System**.
