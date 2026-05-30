Inline the GridSizeToggle into the first recommended category header row on desktop (sm+), so "Phone Cases / Recommended Shots / [grid views]" sits on one line with matching heights.

**Changes in `src/components/app/product-images/ProductImagesStep2Scenes.tsx`:**

1. Hide the standalone toolbar's GridSizeToggle on sm+ (keep it visible on mobile). Change line 423: `<span className="hidden sm:inline-flex">` → `<span className="inline-flex sm:hidden">`. If the toolbar then has no content on desktop, also hide the wrapper div so it doesn't leave empty space.

2. Add an optional `headerRight?: React.ReactNode` prop to `UnifiedCategorySectionWithSelectAll` (and `UnifiedCategorySectionProps`).

3. Render `headerRight` inside the trigger's right cluster (line 762), just before the "Recommended Shots" badge, wrapped so that clicking it doesn't toggle the collapsible (`onClick={e => e.stopPropagation()}`).

4. Pass `headerRight={<GridSizeToggle … />}` only to the FIRST item of `unifiedRecommended.map` (line 475) on sm+ (use a `hidden sm:flex` wrapper around the toggle). If there's no recommended category, pass it to the first item of `ACTIVE_CATEGORY_COLLECTIONS.map` instead.

This keeps the grid toggle accessible on every viewport, eliminates the separate row on desktop, and aligns heights since GridSizeToggle and the badge both sit inside the same flex row.