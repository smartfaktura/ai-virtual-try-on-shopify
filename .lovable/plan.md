## Problem

The AI analysis sometimes returns `home-decor` for chairs and armchairs. Since `home-decor` is a valid category, the title-based fallback never runs, and there's no specificity override to correct it to `furniture`.

## Changes

**File: `supabase/functions/analyze-product-category/index.ts`**

1. **Add specificity overrides** from `home-decor` to `furniture` for chair/armchair patterns (around line 60-67):
   ```
   ["home-decor", /armchair|chair|sofa|couch|recliner|ottoman|bench|stool|desk|table|bookshelf|dresser|wardrobe|bed frame|nightstand|cabinet|sideboard|credenza|futon|mattress/i, "furniture"],
   ```

2. **Add FURNITURE GUIDANCE** to the AI system prompt (after HEADWEAR GUIDANCE, line 163):
   ```
   FURNITURE vs HOME-DECOR: Use "furniture" for any seating (chairs, armchairs, sofas, stools, benches, recliners), tables (dining, coffee, desk, side), storage (bookshelves, dressers, wardrobes, cabinets), and bed frames. Use "home-decor" for decorative items only: candles, vases, pillows, cushions, throws, planters, picture frames, lamps, wall art.
   ```

These two changes ensure: (a) the AI is guided to pick the right category, and (b) if it still returns `home-decor` for a chair, the specificity override corrects it.
