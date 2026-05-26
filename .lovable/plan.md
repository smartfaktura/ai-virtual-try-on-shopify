## Changes to `src/pages/ProductImages.tsx`

**1. Hide "Select All" button when products < 5** (lines 1419-1447)
The whole toolbar row currently shows whenever `userProducts.length > 0`. Change the outer guard from `> 0` to `>= 5` so the search input AND the Select All / Clear buttons all hide when there are fewer than 5 products (search and select-all aren't needed for a tiny grid that's fully visible).

The `selectedProductIds.size > 0` badge row right below (lines 1449-1454) remains, so users still see "N selected" + Clear via the badge area — actually Clear lives inside the toolbar. To preserve a way to clear selections, keep the small `Clear` button visible by moving it next to the selected badge (or leave selection clearing to per-card tap). Simpler: leave it — with <5 products, users can just tap to deselect. So the entire toolbar hides under 5.

**2. Hide Free-plan banner when products < 2** (line 1639)
Change condition from `isFree && userProducts.length > 0` to `isFree && userProducts.length >= 2`. With only 1 product there's nothing to batch-select anyway.

**3. Make Free-plan banner fully rounded** (line 1640)
Change `rounded-2xl` → `rounded-full`, and adjust padding to `px-5 py-2.5` so the pill shape looks balanced.

No logic/state changes.