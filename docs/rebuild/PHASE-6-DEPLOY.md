# Phase 6: Deploy & Cutover

**Goal:** Deploy the new site and switch refervo.com to point to it.

**Prereq:** Phase 5 complete, all pages tested

---

## Tasks

### 6.1 Choose Hosting Platform

Options:
- **Cloudflare Pages** (recommended - already using for Blue River)
- Vercel
- Netlify

Cloudflare Pages setup:
1. Connect `mrmicaiah/refervo-website` repo
2. Build command: `npm run build`
3. Output directory: `_site`
4. Add custom domain: refervo.com

### 6.2 Configure Custom Domain

In Cloudflare (if using CF Pages):
1. Add `refervo.com` as custom domain
2. Add `www.refervo.com` redirect to `refervo.com`
3. Enable HTTPS
4. Enable caching

### 6.3 Update DNS

Current: GitHub Pages
New: Cloudflare Pages

1. Remove GitHub Pages CNAME
2. Update DNS records in Cloudflare:
   - A record or CNAME to Cloudflare Pages

### 6.4 Test Production Site

- All pages load correctly
- All links work
- Forms submit
- Analytics tracking
- Mobile responsive
- SSL working

### 6.5 Archive Old Site

Keep `mrmicaiah/ReferVo` repo but:
- Rename to `refervo-old` or archive
- Update README to point to new repo

### 6.6 Update Documentation

- Update ReferVo context document in Google Drive
- Note new repo and deployment process

---

## Rollback Plan

If issues:
1. Point DNS back to GitHub Pages
2. Re-enable CNAME file in old repo
3. Investigate and fix issues
4. Try deployment again

---

## Acceptance Criteria

- [ ] refervo.com loads new Eleventy site
- [ ] www.refervo.com redirects to refervo.com
- [ ] SSL working
- [ ] All pages load correctly
- [ ] No broken links
- [ ] Analytics tracking confirmed
- [ ] Old repo archived

---

## When Complete

🎉 ReferVo website rebuild is complete!

Notify Micaiah and update the context document.
