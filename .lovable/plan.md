

# Fix Discover Detail Thumbnails: Fit Full Image in Square Container

## Problem
`object-cover` crops images to fill the square, cutting off parts of portrait/landscape thumbnails. The user wants the full image visible, fitted 1:1 into the container — like `object-contain` but with a background fill so there's no awkward empty space or thin strips.

## Solution
Use `object-contain` with a subtle `bg-muted` background on the container. The key difference from the previous failed attempt: ensure the background is opaque enough to look intentional (not transparent), creating a clean "matted" look.

### Files & Changes

**`src/components/app/DiscoverDetailModal.tsx`** (lines 165, 180, 195):
```
Before: "w-10 h-10 rounded-lg object-cover"
After:  "w-10 h-10 rounded-lg object-contain bg-muted"
```

**`src/components/app/PublicDiscoverDetailModal.tsx`** — same 3 thumbnail lines, same change.

**`src/components/app/DiscoverCard.tsx`** — hover thumbnails:
```
Before: "w-7 h-7 rounded-md object-cover"
After:  "w-7 h-7 rounded-md object-contain bg-black/40"
```
(Card hover is on dark overlay, so darker bg)

Three files, class-only changes. Optimization and borderless design preserved.

