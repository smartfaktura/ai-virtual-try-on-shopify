

# Change Model & Scene Grids to 3 Columns on Mobile

## Changes

### `src/components/app/freestyle/ModelSelectorChip.tsx` (line 131)
Change `grid-cols-2` to `grid-cols-3` for mobile:
```tsx
// Before
isMobile ? "grid-cols-2" : "grid-cols-3"
// After
"grid-cols-3"
```

### `src/components/app/freestyle/SceneSelectorChip.tsx` (line 175)
Change `grid-cols-2` to `grid-cols-3` for mobile:
```tsx
// Before
isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:gap-2'
// After
isMobile ? 'grid-cols-3' : 'grid-cols-3 lg:gap-2'
```

Two files, 1 line each.

