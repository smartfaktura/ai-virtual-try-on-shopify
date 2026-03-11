

## Fix Source Product Display

### Problem
The source product thumbnail is zoomed in too much (`object-cover` on a small 14x14 container crops aggressively). The label text needs improvement.

### Changes — `src/components/landing/ChannelShowcase.tsx`

**1. Enlarge the thumbnail container** so `object-cover` doesn't over-crop:
- Change `w-14 h-14` → `w-16 h-16` (gives more room)
- Add `p-1.5 bg-muted/50` for a padded product-card feel so the image breathes

**2. Use `object-contain`** with a light background so the full product is visible without weird lines (the previous issue was the transparent PNG on a white container — adding a subtle muted bg fixes it).

**3. Fix the labels:**
- "Source product" → "Your Product"
- "White Crop Top — flat lay" → "White Crop-Top · Flat Lay"

**4. Same fix for the small overlay thumbnail** inside each card (line ~91): increase from `w-7 h-7` to `w-8 h-8`, use `object-contain`, add `bg-muted/50`, update alt text.

