

# Fix Discover Thumbnails: Remove Borders + Add Width Optimization

## Problem
The scene/model/product thumbnails in the Discover detail modal and card hover show visible borders (`ring-1 ring-border/30`) and load full-resolution images despite being only 28-40px wide.

## Changes

### 1. Detail Modal Thumbnails — `src/components/app/DiscoverDetailModal.tsx` (lines 163, 178, 193)
- Remove `ring-1 ring-border/30` from all three thumbnail `<img>` classes
- Add `width: 80` to `getOptimizedUrl` calls (80px is 2x of 40px display size for retina)

### 2. Public Detail Modal — `src/components/app/PublicDiscoverDetailModal.tsx` (lines 106, 121, 136)
- Same: remove ring classes, add `width: 80` optimization

### 3. Card Hover Thumbnails — `src/components/app/DiscoverCard.tsx` (lines 79, 85)
- Remove `ring-1 ring-white/20` and `bg-black/30` from both thumbnail classes
- Change `object-contain` to `object-cover` (matches the detail modal style)
- Add `getOptimizedUrl(url, { width: 56, quality: 60 })` wrapper (56px = 2x of 28px)

### Summary of class changes

**Detail modals** (w-10 = 40px):
```
Before: "w-10 h-10 rounded-lg object-cover ring-1 ring-border/30"
After:  "w-10 h-10 rounded-lg object-cover"
```

**Card hover** (w-7 = 28px):
```
Before: "w-7 h-7 rounded-md object-contain bg-black/30 ring-1 ring-white/20"
After:  "w-7 h-7 rounded-md object-cover"
```

**Image URLs**: All thumbnail URLs get width parameter for server-side resize (80px for detail, 56px for card hover), keeping quality at 60.

Three files, cosmetic-only changes.

