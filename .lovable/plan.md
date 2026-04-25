Edit `src/components/home/HomeTransformStrip.tsx` only. All changes are within `FOOTWEAR_CARDS`, `BAGS_CARDS`, `JEWELRY_CARDS`, and the `CATEGORIES` array.

## 1. Footwear fixes

- Mark the 1st card as Original by adding `isOriginal: true` (currently missing the flag — that's why no badge shows).
- Replace the 2nd card image (`Pair Display`) with the new URL: `…/scene-previews/1776770356335-261bui.jpg?quality=75`.
- Remove the 11th card (`Studio Flex Pull` — `1776770536324-y8omd3`), leaving 10 cards total.
  - Note: cards #11 and #12 are currently hidden on mobile (`hideOnMobile` triggers when `i >= 9`), so on mobile only 9 show; on desktop the grid is 6 columns × 2 rows = 12 slots. With 10 cards the last row has 4 items (still visually fine; matches user request "only 10 image per block").
- Replace the (new) last card — currently `Sculpt Balance Edge` (`1776770351069-2defhq`) — with the new URL: `…/scene-previews/1776770349853-t3x72w.jpg?quality=75`.

## 2. Bags fixes

- Mark the 1st card as Original by adding `isOriginal: true`.
- Replace `1776239461462-cykje2` (Car Interior Still) → `1776749519182-i9w68k.jpg?quality=75`.
- Replace `1776239425806-v6xegn` (Display Dome Editorial) → `1776239462616-qs3ut8.jpg?quality=75`.
- Replace `1776239446567-7mvigz` (On-Shoulder Editorial) → `1776749773469-tqjesf.jpg?quality=75`.

## 3. Remove Jewelry

- Delete the `JEWELRY_CARDS` array.
- Remove the `{ id: 'jewelry', label: 'Jewelry', cards: JEWELRY_CARDS }` entry from `CATEGORIES`.

## Technical notes

For the new full-URL images (which already include `?quality=75`), they'll go through `getOptimizedUrl` again with `quality: 60`. This works for the existing render-image URLs in the file (e.g. the current Footwear "Original" entry uses the same pattern). No helper changes required — keep them as raw strings in the card list.

No other files affected.