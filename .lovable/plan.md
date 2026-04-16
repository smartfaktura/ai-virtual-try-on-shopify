

# Enable Arrow Navigation in Library Lightbox

## Problem
The Library page (`/app/library`) opens the detail modal for a single image — no left/right arrows appear. The `LibraryDetailModal` already has full multi-image navigation built in (arrows + keyboard), it just needs `items` and `initialIndex` props.

## Fix

### `src/pages/Jobs.tsx` — Line ~723-728

1. Track clicked index instead of (or alongside) the selected item
2. Pass `items={allItems}` and `initialIndex={clickedIndex}` to `LibraryDetailModal`

**Before:**
```tsx
<LibraryDetailModal
  item={selectedItem}
  open={!!selectedItem}
  onClose={() => setSelectedItem(null)}
  isUpscaling={...}
/>
```

**After:**
```tsx
<LibraryDetailModal
  item={selectedItem}
  open={!!selectedItem}
  onClose={() => setSelectedItem(null)}
  isUpscaling={...}
  items={allItems}
  initialIndex={selectedItem ? allItems.findIndex(i => i.id === selectedItem.id) : 0}
/>
```

The arrows already render on mobile (always visible) and desktop (visible on hover) — no additional mobile work needed. The component handles keyboard arrows and wrap-around navigation automatically.

| File | Change |
|------|--------|
| `src/pages/Jobs.tsx` | Pass `items` and `initialIndex` to `LibraryDetailModal` |

