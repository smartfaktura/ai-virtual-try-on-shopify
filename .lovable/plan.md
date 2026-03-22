

# Fix Zoomed Thumbnails — Use object-contain Instead of object-cover

## Problem
`object-cover` crops images to fill the square, causing a "zoomed in" look on scene/model thumbnails. The user wants the full image visible without cropping.

## Fix
Change `object-cover` → `object-contain` on all scene/model/product thumbnails. Add a subtle `bg-muted/30` background so the empty space around non-square images doesn't look broken.

### Files & Changes

**`src/components/app/DiscoverDetailModal.tsx`** (lines 165, 180, 195):
```
Before: "w-10 h-10 rounded-lg object-cover"
After:  "w-10 h-10 rounded-lg object-contain bg-muted/30"
```

**`src/components/app/PublicDiscoverDetailModal.tsx`** — same 3 thumbnail lines, same change.

**`src/components/app/DiscoverCard.tsx`** (lines 79, 85):
```
Before: "w-7 h-7 rounded-md object-cover"
After:  "w-7 h-7 rounded-md object-contain bg-black/20"
```
(Card hover is on dark overlay, so `bg-black/20` instead of `bg-muted/30`)

Keep `getOptimizedUrl` width optimization — that's fine, it's just the fitting mode that's wrong.

Three files, one-word change per thumbnail.

