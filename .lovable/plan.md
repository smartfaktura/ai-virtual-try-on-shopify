

# Fix Thumbnail Vertical Letterboxing in Discover Detail Modal

## Problem
After switching to `object-contain`, portrait images (like model headshots) show with empty space and appear as thin vertical strips. The user's original complaint was about borders, not about cropping — `object-cover` was actually fine for these small thumbnails.

## Fix
Switch back to `object-cover` for all thumbnails. Remove the `bg-muted/30` / `bg-black/20` backgrounds (no longer needed since `object-cover` fills the space). This gives clean, borderless, properly-fitted thumbnails.

### Files & Changes

**`src/components/app/DiscoverDetailModal.tsx`** (lines 165, 180, 195):
```
Before: "w-10 h-10 rounded-lg object-contain bg-muted/30"
After:  "w-10 h-10 rounded-lg object-cover"
```

**`src/components/app/PublicDiscoverDetailModal.tsx`** — same 3 lines, same change.

**`src/components/app/DiscoverCard.tsx`** — hover thumbnails:
```
Before: "w-7 h-7 rounded-md object-contain bg-black/20"
After:  "w-7 h-7 rounded-md object-cover"
```

Three files, revert fitting mode only. Borders stay removed, optimization stays.

