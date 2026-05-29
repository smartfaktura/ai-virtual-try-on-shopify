# Product Catalog Modal — sidebar + search bar cleanup

## Changes in `src/components/app/freestyle/ProductCatalogModal.tsx`

1. **Remove the "Quick" sidebar section** (lines ~241–254). Drop both the "All products" and "Samples" rows. The "Recently added" / Sort controls in the filter bar already cover sample/featured browsing; the new top entry in Category will own "show everything".

2. **Rename Category → Any to "All products"** (line ~261). Keep the same `onClick={() => setCategoryFilter(null)}` and `active={categoryFilter === null}` behavior — only the visible label changes.

3. **Round the search bar to match other freestyle search inputs.** Update the `Input` className on line 183 from `pl-9 h-9 text-sm` to `pl-10 h-10 text-sm rounded-full`, and bump the `Search` icon's left offset from `left-3` to `left-3.5` so it stays centered inside the pill. This matches `SceneCatalogFilters` (`pl-10 pr-9 h-10 text-sm rounded-full`).

## Out of scope
- No behavior change in the filter bar (All / Recently added pills, Sort dropdown).
- No grid, empty state, or sample data changes.
- No mobile sheet refactor.
