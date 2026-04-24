## Goal

Improve `/home` "Built for every category." section:

1. Add **4 new pills** — Jackets, Footwear (sneakers), Bags, Jewelry — using preview images from the same scenes shown in `/app/generate/product-images` Step 2 for those categories. Total = 7 pills.
2. Add a clear **"Preview all categories"** CTA button inside the "All categories" popover and a secondary **"Browse the visual library"** button below the grid — both link to `/product-visual-library`.
3. Add proper **`<Skeleton>`-based loading states** per image card (shared in-app primitive) so each tile shimmers until the image paints — not the current static placeholder icon.
4. Make the **mobile pill row** look good with 7+ pills: convert to a full-bleed horizontal scroll rail with edge fades, individual rounded pills (no contained chip group at this width), and the "All" pill at the end.

## Mobile pill design

```text
─────────────────────────────────────────
[Swimwear][Fragrance][Eyewear][Jackets]→
                                  fade →
─────────────────────────────────────────
```

- Individual rounded pills with `bg-muted/60` + active = `bg-foreground text-background`.
- Soft gradient fades on left/right edges hint at scrollability.
- Hidden scrollbar, smooth horizontal scroll.
- "All" pill at the end opens the popover.

Desktop keeps the existing centered chip-group look (the contained pill row works well at lg where all 7+1 fit).

## Image source mapping

Pulled live from `product_image_scenes` table (same images used in Step 2 of Product Images wizard) for each new category:

| Pill | Source `category_collection` | # tiles |
|---|---|---|
| Jackets | `jackets` | 12 |
| Footwear | `sneakers` | 12 |
| Bags | `bags-accessories` | 12 |
| Jewelry | `jewellery-necklaces` + `jewellery-earrings` mix | 12 |

Scene IDs are hardcoded into the existing `PREVIEW(id)` helper that resolves to the public Supabase storage URL (`product-uploads/.../scene-previews/{id}.jpg`). Same pattern as today's Swimwear/Fragrance/Eyewear arrays.

## Skeleton loading

Each `GridCard` gets local `loaded` state. Until `<img onLoad>` fires, an absolute `<Skeleton className="absolute inset-0 rounded-2xl" />` overlays the tile (matching the in-app `<Skeleton>` primitive used everywhere else). Image fades in with `transition-opacity` once loaded. State resets on `card.src` change (so category switches re-trigger the skeleton).

## CTA placement

- **Inside the "All categories" popover** (mobile + desktop): below the grid of 35+ category names, add a primary `Preview all categories →` button linking to `/product-visual-library`.
- **Below the main grid**: keep existing "Try it on my product" primary CTA, add a secondary outline `Browse the visual library` button next to it (stacked on mobile, inline on sm+).

## Files to change

- `src/components/home/HomeTransformStrip.tsx` — only file touched. Adds 4 new card arrays, expands `CATEGORIES`, adds skeleton state to `GridCard`, splits the pill bar into mobile-scrollable + desktop-contained variants, extracts the popover body into an `AllCategoriesPanel` component containing the new "Preview all categories" button, adds the secondary library CTA below the grid.

## Out of scope

- No data/API changes (images come from already-public scene previews).
- `/product-visual-library` page itself is unchanged.
- Hero, FAQ, other home sections untouched.
