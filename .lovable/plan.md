

# Fix Discover Detail Modal Thumbnails — Thin Strip Issue

## Problem
The `object-contain` + `width=80` optimization combo causes portrait images (like model headshots) to render as thin vertical strips in the 40×40px container. The width-constrained optimized URL delivers an 80px-wide image, but for tall portraits, `object-contain` then shrinks it further to fit the height, resulting in a sliver.

## Solution
Remove the `width` parameter from `getOptimizedUrl` for these thumbnails — only keep `quality: 60`. Without a width constraint, the image transform returns the original aspect ratio at reduced quality, and `object-contain` can properly fit it into the square. This applies to all three files.

Alternatively (and more robustly): use `object-cover` for **model** thumbnails specifically (headshots always look better cropped to fill) while keeping `object-contain` for scenes. But since the user wants uniform "zoom out" fitting, the simpler fix is to drop the width param so `object-contain` has enough image data to work with.

## Changes

### `src/components/app/DiscoverDetailModal.tsx` (lines 163, 178, 193)
Remove `width: 80` from all three `getOptimizedUrl` calls — keep only `{ quality: 60 }`:
```
Before: getOptimizedUrl(url, { width: 80, quality: 60 })
After:  getOptimizedUrl(url, { quality: 60 })
```

### `src/components/app/PublicDiscoverDetailModal.tsx` — same 3 lines

### `src/components/app/DiscoverCard.tsx` — hover thumbnails
Remove `width: 56` from both `getOptimizedUrl` calls:
```
Before: getOptimizedUrl(url, { width: 56, quality: 60 })
After:  getOptimizedUrl(url, { quality: 60 })
```

Three files, removing width constraints only. `object-contain bg-muted` classes stay as-is.

