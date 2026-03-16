# ReferVo Website

Marketing website for ReferVo - the business referral app.

Built with [Eleventy](https://www.11ty.dev/).

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run serve

# Build for production
npm run build
```

The dev server runs at `http://localhost:8080`.

## Project Structure

```
src/
├── _data/              # Global data files
│   └── site.json       # Site config, colors, Cloudinary URLs
├── _includes/
│   ├── layouts/        # Page layouts (base, page, article, landing)
│   └── partials/       # Reusable components (header, footer, cta-box)
├── css/
│   ├── styles.css      # Base styles, typography, layout
│   ├── components.css  # Feature cards, hero, steps, etc.
│   └── utilities.css   # Helper classes
├── js/
│   └── main.js         # Navigation, animations, smooth scroll
├── images/             # Local images (most are on Cloudinary)
└── index.njk           # Homepage
```

## Deployment

Deployed via Cloudflare Pages on push to `main` branch.

**Build settings:**
- Build command: `npm run build`
- Output directory: `_site`
- Node version: 18+

## Brand

- **Colors**: Orange `#f97316`, Black `#171717`
- **Fonts**: Plus Jakarta Sans (headings), DM Sans (body)
- **Logo**: Text only - "Refer" (orange) + "Vo" (black)

## Images

All screenshots and icons are hosted on Cloudinary:
- Cloud: `dxzw1zwez`
- Folder: `refevo`

See `src/_data/site.json` for all Cloudinary URLs.

## Legacy Files

The root directory contains the old static HTML site. These files are being migrated to the Eleventy structure in `src/`. Once migration is complete, the old files will be removed.

## App Store

App Store URL: https://apps.apple.com/app/id6759116716