

## SEO Audit & Pro-Level Optimization

After auditing every page and the current implementation, here are the gaps and improvements needed:

---

### Issues Found

**1. Pages missing `SEOHead` entirely (no title/description/canonical):**
- `/changelog` — Changelog
- `/status` — Status
- `/team` — Team
- `/discover` (public) — PublicDiscover
- `/auth` — Auth (login/signup)
- `/app/*` pages (Dashboard, Products, etc.) — these should have `noindex` set

**2. Missing `twitter:card` meta tag in `SEOHead`**
- The `SEOHead` component never sets `twitter:card` to `summary_large_image`, so Twitter/X previews may use small cards

**3. No default `og:image` fallback**
- Pages without an explicit `ogImage` prop get no OG image at all — should fall back to a site-wide default

**4. `index.html` has a hardcoded canonical `/` that never gets cleaned up**
- When navigating to `/pricing`, the SEOHead sets a new canonical, but the original `<link rel="canonical" href="https://vovvai.lovable.app/">` from `index.html` remains as a second canonical tag (the `setLink` function finds the existing one and updates it, so this is actually fine — no issue here)

**5. `NotFound` page missing `noindex` and SEOHead**
- 404 pages should have `<meta name="robots" content="noindex, nofollow">`

**6. `sitemap.xml` missing `<lastmod>` dates**
- Google recommends `lastmod` for proper crawl scheduling

**7. No `og:url` set when canonical is missing**
- Several pages set canonical but some don't, leaving `og:url` absent

**8. Blog Article JSON-LD missing `image` and `dateModified`**
- Google requires `image` for Article rich results; `dateModified` improves freshness signals

**9. No Pricing JSON-LD (Product/Offer schema)**
- The plan mentioned it but it was never added

**10. Robots.txt should `Disallow` app routes**
- `/app/`, `/auth`, `/onboarding`, `/reset-password` should be blocked from crawling

---

### Changes

**1. `src/components/SEOHead.tsx` — Harden the component**
- Always set `twitter:card` to `summary_large_image`
- Set a default `ogImage` fallback (`/favicon.png` or a proper OG image)
- Always set `og:url` using `canonical` or `window.location.href`

**2. Pages missing SEOHead — Add `SEOHead` with proper metadata:**

| Page | Title | noindex? |
|------|-------|----------|
| `/team` | Meet the VOVV AI Studio Team — Your AI Creative Crew | no |
| `/changelog` | Changelog — VOVV AI Product Updates | no |
| `/status` | System Status — VOVV AI | no |
| `/discover` (public) | Discover AI Photography Presets & Scenes — VOVV AI | no |
| `/auth` | Sign In — VOVV AI | yes |
| `NotFound` | Page Not Found — VOVV AI | yes |

**3. App pages — Add `noindex` SEOHead to all `/app/*` pages**
- Dashboard, Products, Workflows, Jobs, Settings, Generate, Freestyle, etc. should all have `noindex` to prevent indexing of authenticated content

**4. `public/robots.txt` — Block app routes**
- Add `Disallow: /app/`, `Disallow: /auth`, `Disallow: /onboarding`, `Disallow: /reset-password`, `Disallow: /mobile-upload`

**5. `public/sitemap.xml` — Add `lastmod` dates**
- Add `<lastmod>2026-03-09</lastmod>` to all URLs

**6. `src/pages/BlogPost.tsx` — Improve Article JSON-LD**
- Add `image` field (use default OG image)
- Add `dateModified` (same as `datePublished` for now)

**7. `src/data/blogPosts.ts` — Add `featuredImage` field to interface**
- Even if placeholder, having the field allows proper `og:image` per post

**8. `src/pages/Pricing.tsx` — Add Product/Offer JSON-LD**
- Add structured data for pricing tiers with `Offer` schema

---

### Files Changed

| File | Change |
|------|--------|
| `src/components/SEOHead.tsx` | Add `twitter:card`, default OG image, always set `og:url` |
| `src/pages/Team.tsx` | Add SEOHead |
| `src/pages/Changelog.tsx` | Add SEOHead |
| `src/pages/Status.tsx` | Add SEOHead |
| `src/pages/PublicDiscover.tsx` | Add SEOHead |
| `src/pages/Auth.tsx` | Add SEOHead with noindex |
| `src/pages/NotFound.tsx` | Add SEOHead with noindex |
| `src/pages/Dashboard.tsx` | Add SEOHead with noindex |
| `src/pages/Freestyle.tsx` | Add SEOHead with noindex |
| `src/pages/Generate.tsx` | Add SEOHead with noindex |
| `src/pages/Settings.tsx` | Add SEOHead with noindex |
| `src/pages/BlogPost.tsx` | Add `image` + `dateModified` to Article JSON-LD |
| `src/pages/Pricing.tsx` | Add Product/Offer JSON-LD for pricing tiers |
| `public/robots.txt` | Disallow `/app/`, `/auth`, `/onboarding`, `/reset-password` |
| `public/sitemap.xml` | Add `lastmod` to all URLs |

