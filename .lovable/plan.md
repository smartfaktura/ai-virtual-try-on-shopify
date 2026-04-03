

# Improve "From one product photo to every asset you need" Section

## Problem
The section still shows placeholder gradient cards with generic icons — no real imagery. It looks like a wireframe, not a finished product. The hero above it uses real rotating images which makes this section feel disconnected and unfinished.

## Solution
Replace placeholder cards with real product images using the same crossfade rotation pattern from the hero. Show a clear visual flow: one original product photo transforms into multiple output types.

## Changes to `src/components/home/HomeTransformStrip.tsx`

### Visual Approach
- **Original card**: Show a real product photo (rotating between 3 products every 2s, same as hero center card)
- **Output cards** (Product page, Social ad, Lifestyle, Video): Each gets 5 real images rotating at 500ms with crossfade, reusing the same `hero/` assets from the hero section
- **Flow arrows**: Replace the dotted connector lines with a single subtle animated arrow or thin line between Original → outputs to show the transformation concept
- **Card styling**: Replace gradient backgrounds with the actual images filling the card, rounded corners, subtle border and shadow — matching the hero card aesthetic

### Layout
- **Desktop**: Original card on the left (slightly larger, `aspect-[3/4]`), then 4 output cards in a row to the right, connected by a subtle dashed line
- **Tablet**: Same horizontal row but smaller cards
- **Mobile**: Original card centered on top, output cards in a 2×2 grid below

### Technical
- Import `getLandingAssetUrl`, `getOptimizedUrl` from existing utils
- Reuse the `useRotatingIndex` hook pattern (or import from a shared location)
- Reuse the same image arrays from hero assets
- Remove all lucide icon imports (Camera, ShoppingBag, etc.)
- Keep `useScrollReveal` for the staggered fade-in entrance

## File Modified
- `src/components/home/HomeTransformStrip.tsx` — full rewrite

