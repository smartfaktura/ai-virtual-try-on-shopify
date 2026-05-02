
## Goal

Redesign the "Create Product Visuals" hero card with a 3-image collage layout, increase container height, remove grid layout toggle buttons, and add section dividers between the hero and the remaining Visual Types grid.

## Changes

### 1. Redesign `WorkflowHeroCard` (`src/components/app/WorkflowHeroCard.tsx`)

Replace the single animated thumbnail with a **3-image collage** using the `pvImages` URLs from `workflowAnimationData.tsx`:

**Desktop layout** (horizontal):
- Left side (~50%): 3-image collage grid -- one large image on the left (2/3 height), two smaller stacked on the right. Images auto-rotate every 3s.
- Right side: title, description, pills, CTA. Min-height increased (~380px on lg).

**Mobile layout** (stacked):
- Top: 3-image collage in a horizontal row (3 equal columns, `aspect-[4/5]` each) -- NOT portrait full-width.
- Below: title, description, full-width CTA button.
- No duplicate tag pills on mobile.

Import `pvImages` array from `workflowAnimationData.tsx` (export it). Use 3 images that rotate with a cycling index.

### 2. Export pvImages from animation data (`src/components/app/workflowAnimationData.tsx`)

Add `export` to the existing `pvImages` array so the hero card can import it.

### 3. Update Workflows page layout (`src/pages/Workflows.tsx`)

- **Remove** the grid layout toggle (`ToggleGroup` block with rows/2col/3col).
- **Remove** `LayoutList, Grid2X2, Grid3X3` imports and `layout`/`effectiveLayout` state (simplify to always use compact grid: 2col on mobile, 3col on desktop).
- **Add section divider** between hero card and grid: a subtle line with "Explore More Visual Types" label.
- Clean up unused imports (`ToggleGroup`, `ToggleGroupItem`).

### 4. Simplified grid rendering (`src/pages/Workflows.tsx`)

Always render `WorkflowCardCompact` in a fixed `grid-cols-2 md:grid-cols-3` grid (no layout switching). Remove `WorkflowCard` row layout rendering and its import.

### Files changed
- `src/components/app/WorkflowHeroCard.tsx` -- collage layout, taller container
- `src/components/app/workflowAnimationData.tsx` -- export pvImages
- `src/pages/Workflows.tsx` -- remove toggle, add divider, simplify grid
