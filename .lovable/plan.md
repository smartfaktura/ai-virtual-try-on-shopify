

# Public Freestyle Gallery Page

## Overview
Create a public `/freestyle` route (separate from the authenticated `/app/freestyle`) that showcases freestyle creations from `discover_presets` filtered to freestyle-only items (no workflow_slug). Unauthenticated users see a gallery; clicking "Use This" or "Generate" opens the auth page. Authenticated users get redirected to `/app/freestyle` with the settings pre-loaded.

## Architecture

The page follows the same pattern as `PublicDiscover.tsx` — public route, `PageLayout` wrapper, `SEOHead`, masonry grid, detail modal with CTA.

## Key Considerations (debug checklist)

1. **Route conflict**: The existing `/app/freestyle` is a protected route. The new public page must be at `/freestyle` (no `/app` prefix) — same pattern as `/discover` vs `/app/discover`
2. **SEO**: Unique title/description, canonical URL, no duplicate content with `/discover`
3. **Data source**: Filter `discover_presets` where `workflow_slug IS NULL` or `workflow_name = 'Freestyle'` — these are the freestyle creations
4. **Auth gate**: Use `useAuth()` to check user status. If not authenticated, CTA navigates to `/auth?redirect=/app/freestyle&prompt=...` passing context. If authenticated, navigate directly to `/app/freestyle?prompt=...&scene=...`
5. **No RLS issues**: `discover_presets` already has anon SELECT policy
6. **Reuse existing components**: `DiscoverCard`, `PublicDiscoverDetailModal` (or a variant), `PageLayout`, `PublicDiscoverCategoryBar`
7. **Progressive rendering**: Same IntersectionObserver pattern as PublicDiscover for performance
8. **URL params for deep links**: `/freestyle/:itemId` for shareable links to specific items

## Changes

### 1. `src/pages/PublicFreestyle.tsx` — New file

- Fetch `discover_presets` filtered to freestyle items (no `workflow_slug`)
- Category bar for filtering by product category (reuse `PRODUCT_CATEGORY_MAP` from PublicDiscover)
- Masonry grid with `DiscoverCard` components (3:4 portrait ratio)
- Detail modal: reuse `PublicDiscoverDetailModal` — CTA button says "Recreate This"
  - If authenticated → navigate to `/app/freestyle?prompt=X&scene=Y&ratio=Z`
  - If not authenticated → navigate to `/auth?redirect=/app/freestyle`
- Progressive rendering with IntersectionObserver
- SEO head with unique meta for freestyle gallery

### 2. `src/App.tsx` — Add routes

- Add lazy import for `PublicFreestyle`
- Add public routes: `/freestyle` and `/freestyle/:itemId`

### Files
- `src/pages/PublicFreestyle.tsx` — new public freestyle gallery page
- `src/App.tsx` — add public `/freestyle` route

