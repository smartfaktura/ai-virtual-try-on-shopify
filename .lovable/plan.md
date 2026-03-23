

# Update Dashboard Discover Section

## Changes

### `src/components/app/DashboardDiscoverSection.tsx`

1. **Rename**: "Find & Recreate" → "Recreate What Works"
2. **Add subtitle**: `Click any visual to recreate it with your product.` below the heading
3. **Aspect ratio**: Change `aspectRatioOverride="4/3"` → `"3/4"` (portrait)
4. **Grid**: Change `grid-cols-2 md:grid-cols-3 lg:grid-cols-5` → `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` (max 4 per row)
5. **Skeleton**: Update skeleton aspect to `3/4` and grid to match
6. **Load more button**: Style with branded look — `bg-foreground text-background hover:bg-foreground/90 rounded-full px-6` instead of plain `variant="outline"`

### File
- `src/components/app/DashboardDiscoverSection.tsx`

