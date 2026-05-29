## Scope
Fix the misleading "1,200+ curated scenes" label in the Scene Look modal on `/app/freestyle` and tighten the mobile grid to 3 columns.

## Changes

**`src/components/app/freestyle/SceneCatalogModal.tsx`**

1. Subheader (line 299): replace the hardcoded `1,200+ curated scenes` with the live total from `counts.data.total` (already loaded via `useSceneCounts`). Render as `{counts.data?.total ? \`${counts.data.total.toLocaleString()} curated scenes\` : 'Curated scenes'}` so the number always matches reality and gracefully falls back while loading.

2. Grid (line 364): change `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3` → `grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3` so mobile shows 3 columns with slightly tighter gaps.

**`src/components/app/freestyle/SceneCatalogGrid.tsx`** (lines 68 and 87)

Apply the same mobile bump: `grid-cols-2` → `grid-cols-3` on both grid wrappers, keep `sm:`/`lg:`/`xl:` breakpoints intact, tighten gap to `gap-2 sm:gap-3` on mobile.

## Out of scope
No changes to filtering, sidebar, card markup, or desktop layout.
