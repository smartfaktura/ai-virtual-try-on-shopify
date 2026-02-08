

# Fix Generating Card Size and Polish

## Problem

The generating card is rendered at a fixed `w-60` with `aspect-square`, making it look like a small widget next to the full-sized generated images. It should match the image dimensions and feel like a proper image placeholder -- as if the image is "developing" in place.

## Solution

Make the `GeneratingCard` fill the same space as images in both layout modes:

### File: `src/components/app/freestyle/FreestyleGallery.tsx`

**GeneratingCard changes:**

1. Remove the hardcoded `aspect-square` -- instead, use the full available height via `min-h-[400px]` so it visually matches tall images in the "natural" (centered) layout
2. Remove `animate-pulse` (too generic) -- replace with a subtle animated gradient shimmer that sweeps across the card for a more modern, premium feel
3. Scale up the avatar to `w-16 h-16` and increase text sizes slightly for the larger card area
4. Widen the progress bar (`max-w-[200px]`) to fill the bigger space
5. Add a faint border (`border border-border/30`) for definition against the background

**Layout changes for the `count <= 3` (centered) mode:**

- Remove the `w-60` wrapper on generating cards -- instead use `max-h-[calc(100vh-400px)] w-auto aspect-square` to match the `ImageCard` natural sizing, giving it the same height constraint as images
- This makes the generating card occupy the same visual footprint as the image next to it

**Layout changes for the grid mode (`count > 3`):**

- The card already fills the grid cell width, but ensure it uses `aspect-square` to match grid image proportions (this part is fine as-is, just needs the visual upgrades)

### Shimmer animation

Add a custom CSS shimmer keyframe using the existing `shimmer` animation already defined in `tailwind.config.ts`:
- Apply `bg-[length:200%_100%] animate-shimmer` with a gradient like `bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40` for a smooth light sweep effect
- Remove the generic `animate-pulse` in favor of this

### Summary of visual changes

| Aspect | Before | After |
|--------|--------|-------|
| Size (centered) | Fixed `w-60` small square | Full height matching images |
| Size (grid) | Correct width, small feel | Same width, polished look |
| Animation | `animate-pulse` (flash) | Shimmer sweep gradient |
| Avatar | `w-12 h-12` | `w-16 h-16` |
| Progress bar | `max-w-[140px]` | `max-w-[200px]` |
| Border | None | Subtle `border-border/30` |
| Background | Flat gradient | Animated shimmer gradient |

### File changed

- `src/components/app/freestyle/FreestyleGallery.tsx` -- Update `GeneratingCard` styling and its wrapper in both layout branches
