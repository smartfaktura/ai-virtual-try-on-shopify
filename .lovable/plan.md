## Remove wedding-dress from dashboard recommendations

Delete all rows in `recommended_scenes` where `category = 'wedding-dress'`. This removes them from the dashboard "Steal the Look" rail (which sources from `recommended_scenes`) while keeping the underlying scenes in `product_image_scenes` so they remain reachable via the full Discover page and direct deep links.

### Steps
1. Run a quick `SELECT COUNT(*)` on `recommended_scenes WHERE category = 'wedding-dress'` to confirm scope.
2. `DELETE FROM recommended_scenes WHERE category = 'wedding-dress'` via the insert/data tool.
3. No code changes needed — `useRecommendedDiscoverItems` and `useRecommendedScenes` will simply return fewer rows.

### Not changed
- `product_image_scenes` rows with `category_collection = 'wedding-dress'` stay intact.
- `sceneTaxonomy.ts` fashion sub-family list stays as-is.