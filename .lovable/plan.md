

## Fix Scenes modal: remove rail, interleave grid, tighten layout

Three targeted changes to `SceneCatalogModal.tsx` + a new fetch hook for the interleaved default grid.

### 1. Remove "Recommended for you" rail from the default view

In the `showRails` branch, drop the `<SceneCatalogRail title="Recommended for you" …>` block and the "Freestyle Scenes" subheading. The default view becomes just one grid — no rail, no section headers.

The "Recommended" sidebar quick-view (left nav) keeps working — it still loads `useRecommendedScenes` and renders the dedicated grid when the user clicks it. Only the auto-rail on the main page is removed.

### 2. Make the default grid show interleaved variety (Fashion → Beauty → Fragrance → Eyewear → repeat)

Today `useSceneCatalog` paginates `product_image_scenes ORDER BY sort_order ASC` — that clusters all Fashion together, then all Beauty, etc. The "interleaved" arrangement promised in the previous plan only lives in the admin tool and the recommended fallback, **not** in the user-facing main grid.

Add a new hook `useInterleavedSceneCatalog`:

- One-shot fetch (cached 10 min): up to 1,500 active scenes with the slim columns, excluding essentials, ordered by `sort_order ASC`.
- Run `interleaveByFamily(rows, 2)` from `src/lib/sceneTaxonomy.ts` — same helper used everywhere else. Result: 2 Fashion, 2 Beauty, 2 Fragrance, 2 Eyewear, 2 Bags, 2 Watches, 2 Jewelry, 2 Home, 2 Tech, 2 Food&Drink, 2 Wellness, 2 Footwear, then repeat.
- Return as a single page: `pages: [interleavedRows]`.

In `SceneCatalogModal.tsx`, when the default view is active (no filters, no search, sort=recommended), render this interleaved set via `SceneCatalogGrid` instead of the current `useSceneCatalog` infinite query. When **any** filter, search, or sort=Newest is active, fall back to the existing `useSceneCatalog` infinite query (current behaviour).

This gives the user a curated-looking mixed grid by default, while keeping fast filtered/sorted queries unchanged.

### 3. Tighten the modal layout so cards don't feel oversized

At 1328px viewport with `w-[92vw]` (≈1221px) minus the 260px sidebar, the content area is ~960px. With `lg:grid-cols-4` cards render at ~225px each — fine. But the screenshot shows only 2 huge cards visible. Two fixes:

- Bump the grid breakpoints in `SceneCatalogGrid.tsx` so 4 columns kick in earlier:  
  `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5`. At the modal's effective content width, this guarantees 4–5 columns visible above the fold instead of relying on the viewport-based `lg` breakpoint that the inner ScrollArea ignores.
- Forward the ref properly on `SceneCatalogGrid` (wrap export in `React.forwardRef` with a no-op ref pass-through) to silence the "Function components cannot be given refs" warning currently logged.

### 4. Selecting Recommended sidebar item: keep current "grid view" behaviour

No change. That branch still shows the recommended scenes as a grid.

### Files touched

- `src/components/app/freestyle/SceneCatalogModal.tsx` — remove the rail block from `showRails`, swap default-grid source to the new interleaved hook.
- `src/components/app/freestyle/SceneCatalogGrid.tsx` — bump grid column breakpoints; forwardRef wrapper.
- `src/hooks/useSceneCatalog.ts` (or new `useInterleavedSceneCatalog.ts`) — add the one-shot interleaved fetcher returning a single page.

### Untouched

DB schema, RLS, `useRecommendedScenes`, sidebar, admin page, generation pipeline, scene card, filters bar.

### Validation

- Open `/app/freestyle` → Scenes modal default view shows **only** the Freestyle Scenes grid (no Recommended for you rail above it).
- The grid's first 12 cards visibly mix product families (lipstick, sneaker, perfume, eyewear, bag…) instead of all Fashion in a row.
- 4 cards per row visible above the fold at 1328px viewport.
- Switching sort to **Newest** still shows pure `created_at DESC` (no interleaving).
- Applying any subject chip / family / search still works through `useSceneCatalog` and shows accurate filtered results.
- Clicking sidebar **Recommended** still opens the per-onboarding-category curated grid.
- React ref warning for `SceneCatalogGrid` no longer appears in console.

