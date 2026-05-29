# Edit Product — Main photo polish

Scope: `src/components/app/ManualProductTab.tsx`, the side-by-side block starting at line 994. UI only. No data/business logic.

## What's off today

- The main-photo tile is `w-[180px] h-[180px]` with `object-contain` but **no background** on the tile. Portrait shots (like the screenshot dress) sit inside an invisible square, so the image looks like it's floating with awkward empty gaps on the sides — not a framed tile.
- The hover row with **X** (remove) and ✎ (replace) is gated by `opacity-0 group-hover:opacity-100`. On mobile/touch there is no hover, so those buttons are unreachable. Same issue on the Extra Angles `X` chips (line 1093).

## Fix

1. Frame the main photo tile so any aspect ratio sits nicely
   - Keep the 180×180 square footprint (the user explicitly does not want it bigger).
   - Add `bg-muted/30` + a hairline `border border-border/60` to the tile so the letterboxed area reads as an intentional frame, not empty space. Keep `object-contain` so portraits/landscapes are never cropped.
   - Tile classes become: `relative group w-[180px] h-[180px] rounded-xl overflow-hidden flex items-center justify-center bg-muted/30 border border-border/60 mt-2` (drop the redundant `aspect-square` since width=height already).

2. Make action buttons usable on touch
   - Replace `opacity-0 group-hover:opacity-100 transition-opacity` on the main-photo action row (line 1010) with `opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity`. Buttons are always visible on mobile, hover-revealed on desktop (unchanged desktop behaviour).
   - Bump the button backdrop from `bg-background/80` to `bg-background/90 shadow-sm` so the always-on mobile chips remain legible against any image.
   - Apply the same `opacity-100 sm:opacity-0 sm:group-hover/ref:opacity-100` swap to the Extra Angles per-tile `X` button (line 1093) so users can remove an angle on mobile too.

## Safety

- Pure className changes; no state, props, handlers, or layout structure touched.
- Desktop behaviour identical (hover-reveal preserved at `sm:` and above).
- No effect on the upload empty state, the batch UI, or the form below.

## Files

- `src/components/app/ManualProductTab.tsx` (only file edited)
