## Goal

Add a "Fresh scenes" section to `/app` (Dashboard) directly after the "Steal the Look" block, showing newly added public scenes grouped by category in pill tabs, 8 thumbnails per active pill.

Verified: `created_at` is readable on `product_image_scenes` under existing public RLS (confirmed via DB query), so no schema, RLS, or migration changes are needed.

## Scope (additive only)

- New component: `src/components/app/DashboardFreshScenes.tsx`
- One insert (one line + wrapper div) in `src/pages/Dashboard.tsx`
- No edits to existing components, hooks, queries, RLS, prompts, or generation logic.

## New component — `DashboardFreshScenes.tsx`

**Data fetch (own React Query key, isolated cache):**
- `queryKey: ['dashboard-fresh-scenes']`, `staleTime: 10 min`
- Selects only safe public columns: `scene_id, title, category_collection, sub_category, preview_image_url, created_at, owner_user_id, is_brand_scene`
- Filters mirror `usePublicSceneLibrary` for safety in depth: `is_active=true`, `owner_user_id IS NULL`, `is_brand_scene=false`, `category_collection != 'bundle'`, `preview_image_url IS NOT NULL`
- Order: `created_at DESC`, `limit 200`
- Client-side defense filter: drop any row where `owner_user_id` or `is_brand_scene` slipped through

**Grouping logic:**
- Group by `category_collection`
- Keep only categories with ≥4 fresh scenes
- Sort categories by most-recent `created_at`, take top 8 pills
- Cap each pill to its 8 most recent scenes

**Rendering:**
- Heading row: `<h2>Fresh scenes</h2>` + subtitle "New looks added this week, grouped by category" + a "View all" link → `/product-visual-library#catalog-grid`
- Horizontally scrollable pill row using the same pill styling already used in `ProductVisualLibrary` (rounded-full, border, active = primary). Pills are local component state.
- Grid: `grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2`, max 8 cards for the active pill
- Each card: `<Link to={\`/app/generate/product-images?sceneId=\${scene.scene_id}&from=fresh\`}>` with `ShimmerImage` + `getOptimizedUrl(url, { quality: 60 })`, aspect-[4/5], truncated title (reuses visual language from `SceneCatalogCard`)
- Skeleton placeholders while loading
- **Render nothing** if zero qualifying categories — so the dashboard never shows an empty/broken slot

## Edit `src/pages/Dashboard.tsx`

Add one import, then insert directly after the existing `<DashboardDiscoverSection />` wrapper (between lines 174 and 176):

```tsx
<div style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
  <DashboardFreshScenes />
</div>
```

No other edits to Dashboard.

## Safety checks

- **RLS:** uses the same public-readable surface as `usePublicSceneLibrary`; no new policies; verified `created_at` is returned for anon-accessible rows.
- **No PII / no sensitive fields:** selects only the columns already public on the existing scene library page.
- **No collisions with existing caches:** new query key `dashboard-fresh-scenes`.
- **Preselect plumbing:** click target uses the existing `?sceneId=` query the wizard already handles (`ProductImages.tsx`). The `&from=fresh` is purely informational and ignored if not consumed.
- **Failure mode:** if the query errors or returns nothing usable, the component renders `null`. No layout shift, no broken state on the dashboard.
- **Perf:** one extra query, ~200 rows, cached 10 min, wrapped in `contentVisibility:auto`. Negligible.
- **A11y:** pills are real `<button>`s with `aria-pressed`; cards are real `<a>` links with `alt` text on images.

## Out of scope (will NOT touch)

- `usePublicSceneLibrary`, `DashboardDiscoverSection`, `RecentCreationsGallery`
- Public `/product-visual-library` page
- Visual Studio, Product Images wizard, or any generation/prompt logic
- Any DB / RLS / migration changes

Approve and I'll implement.
