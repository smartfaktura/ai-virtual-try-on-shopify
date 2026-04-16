

# Enable Arrow Navigation in Freestyle Lightbox

## Problem
The Freestyle detail modal opens for a single image with no way to navigate to adjacent images. The `LibraryDetailModal` already supports multi-image navigation (left/right arrows + keyboard) via `items` and `initialIndex` props — they're just not being passed.

## Fix

### `src/pages/Freestyle.tsx` — Lines 1225-1261

Pass the full `savedImages` array as `LibraryItem[]` and the current `lightboxIndex` to the modal:

1. Build a `libraryItems` array from all `savedImages` (same mapping logic already used for the single item)
2. Pass `items={libraryItems}` and `initialIndex={lightboxIndex}` to `LibraryDetailModal`
3. Keep `item={libraryItems[lightboxIndex]}` as the fallback single item

This enables:
- Left/right arrow buttons in the modal
- Keyboard arrow key navigation
- Wrap-around at list boundaries

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Build `libraryItems` array from `savedImages`, pass `items` + `initialIndex` to `LibraryDetailModal` |

