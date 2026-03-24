

# Move Generation Bar from Bottom-Right to Top-Right

## Problem
The loading/generation status bar at `bottom-20 right-4` overlaps action buttons (Cancel, Save, etc.) on pages like Add Product.

## Changes

### `src/components/app/GlobalGenerationBar.tsx`

1. **Reposition container** (line 166): Change `fixed bottom-20 right-4 lg:right-6` → `fixed top-20 right-4 lg:right-6`

2. **Swap expanded panel order**: Currently the detail list renders **above** the pill (using `mb-2`). At top-right, it should expand **below** the pill instead:
   - Move the pill button **before** the expanded detail panel in JSX order
   - Change `mb-2` → `mt-2` on the expanded panel
   - Swap chevron icons: `ChevronUp` when minimized (expand downward) → `ChevronDown`, and vice versa

### Files
- `src/components/app/GlobalGenerationBar.tsx` — reposition to top-right, flip expand direction

