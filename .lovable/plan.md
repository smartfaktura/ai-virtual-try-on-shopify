## Goal

Remove the 362 dynamic item URLs (`/discover/:slug`, `/freestyle/:itemId`) from SEO/indexing scope so we can finish Phase 4a cleanly with just the static public pages, then move to Phase 4b (react-helmet-async).

The routes themselves stay working — users can still open and share them — they're just no longer advertised to search engines.

---

## Why this is the right call

- **362 of 417 sitemap URLs (87%)** are dynamic items. Each one currently canonicalizes back to its parent (`/discover` or `/freestyle`), which conflicts with the sitemap and creates duplicate-content signals.
- These pages depend on Supabase data fetched client-side — exactly the CSR-indexing weakness the Lovable docs warn about. Crawlers often see an empty shell.
- The static public pages (Home, Pricing, About, Blog posts, Features, etc.) are where real SEO value lives and where we can do a proper job.
- We can revisit dynamic-item SEO later with a proper SSR/prerender solution if needed.

---

## Changes (Phase 4a, revised)

### 1. Sitemap — strip dynamic items
`public/sitemap.xml`: remove all 362 `/discover/<slug>` and `/freestyle/<id>` entries. Keep:
- `/discover` (index)
- `/freestyle` (index)
- `/features/freestyle`
- All marketing/blog/static URLs (~55 entries)

### 2. Robots — disallow dynamic item paths
`public/robots.txt`: add
```
Disallow: /discover/
Disallow: /freestyle/
Allow: /discover$
Allow: /freestyle$
```
(Keeps the index pages crawlable, blocks every item URL.)

### 3. Noindex on the dynamic item pages
`src/pages/PublicDiscover.tsx` and `src/pages/PublicFreestyle.tsx`: when `itemId` is present in the URL, pass `noIndex` to `<SEOHead>` so the rendered page emits `<meta name="robots" content="noindex,follow">`.
(I'll confirm `SEOHead` already supports this prop; if not, it's a 2-line addition.)

### 4. Stale references cleanup
- `index.html`: remove the obsolete `scripts/prerender.ts` comment block.
- (`package-lock.json` was already deleted.)

### 5. Canonical audit on the remaining static pages
Quick pass on every page still in the sitemap to confirm each has an explicit, self-referencing `<SEOHead canonical={...}>`. Any missing one gets added. This is a small list now (~20 pages).

---

## What this leaves us with

- A focused sitemap of ~55 high-value static URLs
- Clean robots directives
- No duplicate-canonical conflicts
- Item pages still fully functional for sharing — just not competing in search

## Then Phase 4b (separate approval)

Install `react-helmet-async`, wrap `App.tsx` in `<HelmetProvider>`, refactor `SEOHead.tsx` + `JsonLd.tsx` to use `<Helmet>`. No caller changes. This finally gives each route real per-route `<title>`/`<meta>` instead of the current direct-DOM approach.

---

## Technical notes

- React Router routes for `/discover/:itemId` and `/freestyle/:itemId` stay registered — only their SEO surface changes.
- `noindex,follow` (not `noindex,nofollow`) so link equity still flows to the index pages.
- Sitemap edit is a single mechanical pass; I'll regenerate from the kept-list rather than line-deleting.

Approve to execute Phase 4a (revised). Phase 4b will be a separate approval afterward.