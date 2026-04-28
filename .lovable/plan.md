## Fix `/discover/:slug` flash + confirm SEO indexing

### Problem
When you open `https://vovv.ai/discover/diamond-hoop-earrings-2b9ca4` directly, the Explore grid (header + skeleton tiles) flashes for 300-800ms before the SEO detail page renders. Cause: `urlItem` is `null` until `useDiscoverPresets` resolves, so `showSeoView` is `false` and the grid branch wins on first paint.

### Plan

**1. New skeleton component** — `src/components/discover/DiscoverItemDetailSkeleton.tsx`
- Mirrors `DiscoverItemSEOView` structure: breadcrumb row, hero image block (4:5), H1 lines, chip row, prompt block, related grid placeholder.
- Pure shimmer (`bg-muted animate-pulse`), no data, no network.
- Same `pt-10 sm:pt-14` top padding so layout doesn't jump when real content swaps in.

**2. Early-return branch in `src/pages/PublicDiscover.tsx`**
- Before the existing grid render, add: if `urlItemId && !cameFromGrid && isLoading && !urlItem` → return `<PageLayout><DiscoverItemDetailSkeleton /></PageLayout>`.
- Keeps current `showSeoView` branch unchanged for the resolved state.
- Grid users (`cameFromGrid === true`) keep current behavior — modal opens over their grid, no skeleton swap.

### Will SEO crawlers index these pages correctly?

**Yes — and this fix actually improves it.** Details:

- **Routing**: `/discover/:itemId` is a real React Router route served by SPA fallback (Lovable hosting auto-rewrites unknown paths to `index.html`). Googlebot renders JS, so it executes the route and sees the SEO view.
- **No `cameFromGrid` for bots**: Crawlers arrive without `location.state`, so `cameFromGrid === false` → they hit the `showSeoView` branch (full `<h1>`, hero `<img>`, prompt text, related links), not the modal.
- **Per-page metadata**: `DiscoverItemSEOView` already renders `<SEOHead>` (title, description, canonical) and `<JsonLd>` (structured data) via React Helmet. Each slug gets unique tags.
- **Canonical URLs**: Set to `${SITE_URL}/discover/${slug}` — points to the clean slug version, dedupes UUID variants.
- **Internal links**: Related grid uses real `<a href="/discover/...">` (via `Link` from react-router) so crawlers can discover sibling items.
- **Loading skeleton is safe**: Googlebot waits for JS render before snapshotting; the skeleton is only a visual transition for humans on slow networks. It does not replace the indexed content.

**One thing to verify after merge** (not part of this code change, just a check):
- `public/sitemap.xml` (or sitemap route) should list every `/discover/<slug>` URL so Google can discover them without crawling the grid. If it doesn't exist yet, that's a separate follow-up.

### Files
- **New**: `src/components/discover/DiscoverItemDetailSkeleton.tsx`
- **Edit**: `src/pages/PublicDiscover.tsx` (one early-return block, ~5 lines)
