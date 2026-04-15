

# Remove List View Toggle and ⌘V Label from Product Images Step 1

## Problem
The product selection toolbar in `/app/generate/product-images` shows a grid/list view toggle and a `⌘V` keyboard shortcut badge that aren't needed.

## Changes in `src/pages/ProductImages.tsx`

**1. Remove `productViewMode` state** (line 94) — delete the state declaration, keep grid-only.

**2. Remove `⌘V` kbd element** (line 1013) — the small keyboard shortcut label next to search.

**3. Remove grid/list toggle buttons** (lines 1022-1029) — the `<div>` containing LayoutGrid and List toggle buttons.

**4. Remove list view rendering block** (lines 1092-1130) — the entire `if (productViewMode === 'list')` branch since only grid view remains.

**5. Clean up unused imports** (line 7) — remove `List` from lucide-react imports (keep `LayoutGrid` if used elsewhere, otherwise remove too).

## Impact
- 1 file changed
- Removes ~45 lines of dead code
- Grid is the only view mode, always active

