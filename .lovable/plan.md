

# Fix Thumbnail Aspect Ratios — Card Hover + Detail Modal

## Problems from Screenshots

1. **Card hover overlay**: Scene thumbnail uses `object-cover` (line 79) which crops the image. Model thumbnail uses `rounded-full object-cover` (line 85) which also crops. Both should be square with `object-contain`.

2. **Detail modal**: The thumbnails already have `object-contain bg-muted/30` (fixed earlier), but the scene/model images themselves may still appear dark/broken because the source images are portrait-ratio being contained in a square — the `bg-muted/30` background is too subtle on dark surfaces. Need to ensure consistent styling.

## Changes

### 1. `src/components/app/DiscoverCard.tsx` — Fix hover thumbnails

**Line 79** (scene thumbnail):
`w-7 h-7 rounded-md object-cover ring-1 ring-white/20` → `w-7 h-7 rounded-md object-contain bg-black/30 ring-1 ring-white/20`

**Line 85** (model thumbnail):
`w-7 h-7 rounded-full object-cover ring-1 ring-white/20` → `w-7 h-7 rounded-md object-contain bg-black/30 ring-1 ring-white/20`

### 2. `src/components/app/DiscoverDetailModal.tsx` — Already fixed

Thumbnails at lines 165, 180, 195 already use `object-contain bg-muted/30`. No changes needed — these should render correctly once image URLs are populated.

### 3. `src/components/app/PublicDiscoverDetailModal.tsx` — Already fixed

Same — already updated in previous round.

Two class changes in one file.

