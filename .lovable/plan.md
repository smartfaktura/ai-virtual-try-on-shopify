## Plan: Fix prerender validation failures

Quick cleanup pass to get the prerender pipeline to **0 failures, 0 warnings**, then hand off for publish + post-deploy curl report.

---

## Changes

### 1. Add `<h1>` to Freestyle pages (fixes 2 failures)

- `src/pages/Freestyle.tsx`
- `src/pages/features/FreestyleFeature.tsx`

Add a single visible `<h1>` near the top of each hero with route-appropriate copy. Follow existing typography (Inter, no terminal period on header). If hero already has a heading-styled `<div>` or `<h2>`, promote it to `<h1>` rather than stacking a duplicate. No layout shift.

### 2. Add `BlogPosting` JSON-LD to blog posts (clears 7 warnings)

- `src/pages/BlogPost.tsx`

Inject a `<script type="application/ld+json">` via the existing SEO/Helmet pattern with:
- `@type: BlogPosting`
- `headline`, `description`, `image`, `datePublished`, `dateModified`
- `author` (VOVV.AI), `publisher` (VOVV.AI + logo)
- `mainEntityOfPage` canonical URL

All values pulled from the existing `blogPosts.ts` entry — no new data sources, no schema changes.

### 3. Re-run build locally

`npm run build` to confirm: 55 routes prerendered, 0 failures, 0 warnings.

### 4. Hand-off

- Confirm green build.
- You publish.
- I run post-deploy `curl` on: `/`, `/pricing`, `/ai-product-photography`, one category page, one blog post, `/discover` → produce the before/after HTML report.

---

## Safety

- No changes to `/app/*`, `/auth/*`, or admin code paths.
- No DB / RLS / edge function changes.
- No new dependencies.
- Purely additive: one `<h1>` per Freestyle page + one JSON-LD block on blog posts.
- Fully reversible by removing the added elements.

---

**Approve and I'll implement + re-run the build.**