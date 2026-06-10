## Super-safe indexing plan — only 2 files touched

Footer already lists 19 of 22 category pages, and the blog + every blog post are already in the sitemap. So this plan is intentionally tiny. Nothing in the running app, routing, auth, backend, or generation is touched.

## What changes

### 1. `scripts/generate-sitemap.ts` — clean the sitemap

Build-time script only (writes `public/sitemap.xml`, never runs in the browser — cannot crash the app):

- **Remove `fetchDiscoverEntries()` and its 380+ `/discover/*` URLs.** They are blocked in `robots.txt`, so Google wastes crawl budget on them and dilutes signals for everything else (including category pages and the blog).
- **Remove the `/freestyle` entry** for the same reason (`/freestyle/*` items are CSR-only and disallowed).
- **Bump the 22 `/ai-product-photography/*` entries** to `priority: 0.9`, `changefreq: weekly`.
- **Blog (already strong, small tune-up):**
  - `/blog` index stays at `priority: 0.9`, `changefreq: daily` (already set).
  - Each blog post entry stays at `priority: 0.8`. Confirm `lastmod` uses `updatedAt ?? publishedAt` (already does).
  - No other blog changes — every published post is already included.

Result: `public/sitemap.xml` shrinks from ~452 → ~70 URLs at next build, all crawlable, all worth indexing. XML format unchanged.

### 2. `src/components/landing/LandingFooter.tsx` — add 3 missing footer links

Footer is missing 3 of the 22 categories. Add them so every category page receives a sitewide internal link (same shape as the existing 19 entries — cannot break anything):

- Socks → `/ai-product-photography/socks`
- Supplements & Wellness → `/ai-product-photography/supplements-wellness`
- Bags & Accessories → `/ai-product-photography/bags-accessories`

Blog is already linked from the footer, so no footer change is needed for blog.

## What does NOT change

- No route, component, or `SEOHead` changes
- No `index.html`, `robots.txt`, or backend changes
- No prerender / SSR work
- No new dependencies
- No blog post content edits
- No removal of any existing functionality

## Verification before declaring done

1. `predev`/`prebuild` regenerates `public/sitemap.xml` with ~70 URLs.
2. All 22 category URLs present at priority 0.9.
3. `/blog` and every published blog post URL still present.
4. Footer renders with the 3 new links; page still loads.
5. No build errors.

## After deploy — actions in Google Search Console (you do these)

1. Sitemaps → resubmit `https://vovv.ai/sitemap.xml`.
2. URL Inspection → "Request Indexing" for:
   - The 22 `/ai-product-photography/*` pages.
   - `/blog` and your 5–10 most important blog posts.
   - Google rate-limits ~10/day per property; spread over 2–3 days.
3. Wait 1–3 weeks. Indexed count for both buckets should climb.

## Honest expectation

This removes technical drag and sends Google the right signals. It cannot force faster indexing than Google's own schedule. For a newer domain, full indexing of all 22 category pages and blog posts typically takes 2–6 weeks after these signals improve. Blog indexing also depends on post quality and update frequency — neither of which this plan touches.
