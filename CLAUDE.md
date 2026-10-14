# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korean MICE (Meetings, Incentives, Conferences, Exhibitions) corporate website built with React + Create React App. Content is managed via a PIN-protected admin console and stored in Supabase, with images hosted on Cloudinary. Production is a Direct Upload Cloudflare Pages project named `capstone-site` in the client's account. GitHub does not automatically update production.

## Development Commands

All commands run from `capston_main/` directory:

```bash
cd capston_main
npm start          # Dev server (localhost:3000)
npm run build      # Production build to /build
npm test -- --env=jsdom   # Run tests with Jest
npm run test:contact     # Contact client, state handling and server tests
```

## Architecture

### Routing
Hash-based routing (`window.location.hash`): `#/admin` loads the admin console, everything else renders the main site.

### State & Data Flow
- `src/hooks/useSiteStore.js` — custom React hook managing all site state (no Redux/Zustand)
- On mount, fetches content JSON from Supabase (`site_content` table via `src/lib/contentApi.js`)
- Falls back to `src/data/defaultData.delivery.json` if fetch fails
- `src/data/siteData.js` normalizes and applies defaults to fetched data

### Styling System
- `src/styles/siteStyles.js` — centralized style generator producing responsive styles from viewport dimensions and data
- Layout constants: desktop padding 40/110px, mobile 16/56px, container max 1320px, header 74px
- Custom fonts: GmarketSans, KoPubWorldDotum (loaded via `src/styles/fonts.css`)
- Responsive typography via CSS `clamp()`

### Section-Based Page Structure
Main site sections in render order (all in `src/components/sections/`):
1. `IntroSection` — hero with Three.js particle animation (`LogoParticleMorphCanvas`)
2. `OrgSection` — organization/team
3. `ValuesWorkSection` — values and work description
4. `FieldsSection` — portfolio with rolling photo carousel (22 slots)
5. `CasesSection` — project cases with modal previews
6. `ContactSection` — contact form submitted to same-origin `/api/contact`; `src/lib/contact.js` checks both HTTP status and delivery reference, and failed submissions retain user input.

### Contact server
- `worker/contact-worker.js` — Cloudflare Pages module Worker entry point. `contact-handler.js` validates incoming inquiries, and `smtp.js` sends to the fixed company mailbox through the existing Daum SMTP server using TLS. Other paths are passed to `env.ASSETS.fetch`.
- `scripts/build-pages-worker.cjs` — packages `_worker.js` and `_routes.json` in the production build, supporting dashboard Direct Upload.
- Runtime settings: `SMTP_USERNAME` and `SMTP_PASSWORD` (both Secret; the password must be a Daum app password). These never belong in `REACT_APP_*` variables. SMTP acceptance is required before reporting success. A stable Message-ID assists tracking but does not guarantee retry deduplication.
- Existing apex-to-www redirect Worker and company email MX records are managed separately and are not part of the contact implementation.

### Admin Console (`src/pages/admin_console/`)
- PIN-protected (`adminAuth.js`), desktop-only (`AdminMobileGate.js`)
- Edits site content JSON and saves back to Supabase
- Image uploads compressed (max 1600px, quality 0.8) and sent to Cloudinary (`src/lib/cloudinary.js`)
- `adminPath.js` handles nested property access for the content JSON

### External Services
- **Supabase**: Content storage (env: `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`)
- **Cloudinary**: Image CDN (env: `REACT_APP_CLOUDINARY_CLOUD_NAME`, `REACT_APP_CLOUDINARY_UPLOAD_PRESET`)
- **Google Analytics GA4**: Tracking (ID in `public/index.html`)
- **Cloudflare Pages**: Hosting + same-origin contact endpoint via `_worker.js`
- **Daum SMTP**: Existing company mail service (`smtp.daum.net:465`, TLS); see README for configuration and release steps
