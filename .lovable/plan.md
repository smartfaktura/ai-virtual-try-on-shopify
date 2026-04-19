
## Fix product thumbnail zoom in Style & Outfit (AI Stylist card)

### Problem
In the Style & Outfit AI Stylist card (screenshot), product images sit small inside the 48×48 tile with empty padding around — same issue as before but in this second card. User wants them to fill the placeholder edge-to-edge without being over-zoomed.

### Cause
In `AiStylistCard.tsx` the tile uses `object-contain` on a transparent product image with extra background padding (`bg-muted/30` + `border`), so small/tall garments shrink to fit and leave whitespace.

### Fix
In `src/components/app/product-images/AiStylistCard.tsx` (the product list `<li>` thumbnail, ~lines 53-60):

- Switch the image from `object-contain` → `object-cover` so it fills the tile.
- Add `scale-110` (or `scale-105`) on the `<img>` to gently zoom transparent product cutouts so they reach the edges without cropping meaningful detail.
- Keep tile size at `w-12 h-12`, remove the inner `bg-muted/30` tint so the image sits flush.

Result: product fills the placeholder cleanly, just enough zoom to remove whitespace, no excessive crop.

### File
- `src/components/app/product-images/AiStylistCard.tsx`

### Validation
1. Black Ruched Crop Top → fills 48×48 tile, no empty space
2. Cream Ribbed Knit T-Shirt → same, no excessive crop
3. Wider products (bags, shoes) still fully visible
