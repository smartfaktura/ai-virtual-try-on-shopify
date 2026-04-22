

## Merge Freestyle Originals into the main grid

Two issues to fix:

### 1. Merge Freestyle Originals into the main Freestyle Scenes grid

Today admin-curated `custom_scenes` render as a **separate section** above Recommended (carousel or sub-grid). You want them mixed into the **same pool** as the rest of the catalog so users see one unified grid.

Fix in `SceneCatalogModal.tsx`:

- Remove the dedicated "Freestyle Originals" section entirely (both the rail variant and the grid variant).
- Prepend `originalScenes` to the **first page** of the Freestyle Scenes grid, so they appear at the top of the same grid.
- Selection logic already handles `cs-` IDs correctly via `handleSelect` → no change.
- Order on default view becomes:
  ```
  Recommended for you      ← carousel
  Freestyle Scenes         ← Freestyle Originals + full catalog (one grid)
  ```
- When filters/search are active: only the filtered catalog grid shows (originals hidden, same as today's behaviour for filters).

### 2. Fix the "doesn't fit screen" styling bug

The user reports the modal layout overflows / clips at 1328×818. Likely cause: the merged grid section now sits inside a flex column with `space-y-4` but the inner `<div className="space-y-2">` wrapper around the heading + grid creates an extra nested block that, combined with the rail above, pushes the grid below the fold without proper scroll inheritance.

Fix:
- Remove the redundant `<div className="space-y-2">` wrapper around the Freestyle Scenes heading + grid; render heading + grid as direct siblings of the body's `space-y-4` flex.
- Confirm the parent `ScrollArea` has `flex-1 min-h-0` so the inner content actually scrolls inside the modal rather than expanding it.
- Recommended rail container should not enforce a min-height that pushes the grid off-screen — leave rail height to its cards.

### Files touched

- `src/components/app/freestyle/SceneCatalogModal.tsx` — drop the Freestyle Originals section; prepend `originalScenes` to grid pages; tighten the body wrapper.

### Untouched

`useCustomScenes`, `useRecommendedScenes`, `useSceneCatalog`, sidebar, filters, card design, generation pipeline, DB.

### Validation

- Open Scenes modal → only two sections: **Recommended for you** rail, then **Freestyle Scenes** grid. The first cards in the grid are admin-curated `custom_scenes` (the originals), followed seamlessly by the full catalog.
- Modal fits the 1328×818 viewport: header + filter bar + recommended rail + first row of grid all visible above the fold; remaining cards scroll inside the modal, not the page.
- Picking an original still routes through the legacy `TryOnPose` handoff (no regression).
- Filters/search hide the recommended rail and show only the filtered catalog grid (originals not injected when filters are active).

