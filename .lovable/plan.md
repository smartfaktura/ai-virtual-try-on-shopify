

# Rename Grid Size Buttons & Add 4th Grid Option

## Problem
The S / M / L labels on the grid-size toggle look like clothing size selectors, which is confusing in context. Also, only 3 density options exist — user wants a 4th (4-column) option.

## Changes

**File:** `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

### 1. Add a 4th grid size and rename all labels
Replace `GridSize` type and config:

```typescript
type GridSize = 'xs' | 'small' | 'medium' | 'large';

const GRID_CLASSES: Record<GridSize, string> = {
  xs:     'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',           // 4 cols max
  small:  'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7',
  medium: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
  large:  'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
};
```

### 2. Use grid icons instead of text labels
Replace `S/M/L` with small grid-dot icons (e.g., `LayoutGrid`, `Grid3x3`, `Grid2x2`) from lucide-react, or use descriptive labels like column counts. The toggle entries become:

| ID | Icon/Label | Max columns |
|----|-----------|-------------|
| `small` | 7-col icon | 7 |
| `medium` | 6-col icon | 6 |
| `large` | 5-col icon | 5 |
| `xs` | 4-col icon | 4 |

Will use small inline SVG grid-dot patterns (3×3, 2×3, 2×2, 1×2 dot grids) to visually represent density — no text, no ambiguity with clothing sizes.

### Default stays `medium` (6 cols).

