

# Fix Discover Detail Thumbnails: Letterboxing from object-contain

## Problem Identified

The thumbnails use `object-contain bg-muted`, which fits the entire image inside the 40x40px square without cropping. For non-square images (like the Editorial Movement scene or Jordan model headshot), this creates visible letterboxing — the `bg-muted` background shows through as padding around the image, making it look like the image doesn't fill the container.

Comparing the two screenshots: the first one (Canon G7X / Zara) looks correct because those source images happen to be closer to square. The second (Editorial Movement / Jordan) looks broken because those images are portrait-oriented, so `object-contain` shrinks them to fit height, leaving side padding.

## Root Cause

`object-contain` and `object-cover` are opposite trade-offs:
- `object-contain` = full image visible, but doesn't fill the container (letterboxing)
- `object-cover` = fills the container, but crops edges

The earlier "zoomed" complaint was caused by the `width` optimization parameter distorting aspect ratios on the server side — not by `object-cover` itself. That width param has since been removed.

## Fix

Switch back to `object-cover` and remove `bg-muted` / `bg-black/40`. Now that the width optimization parameter is gone, `object-cover` will receive the full-resolution image (at quality 60) and crop naturally to fill the square — no distortion, no letterboxing.

### Files & Changes

**`src/components/app/DiscoverDetailModal.tsx`** (lines 165, 180, 195):
```
Before: "w-10 h-10 rounded-lg object-contain bg-muted"
After:  "w-10 h-10 rounded-lg object-cover"
```

**`src/components/app/PublicDiscoverDetailModal.tsx`** — same 3 thumbnail lines.

**`src/components/app/DiscoverCard.tsx`** — hover thumbnails:
```
Before: "w-7 h-7 rounded-md object-contain bg-black/40"
After:  "w-7 h-7 rounded-md object-cover"
```

Three files, class-only changes. Quality optimization stays at 60.

