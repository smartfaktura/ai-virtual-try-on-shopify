

# Product Images — Mobile Polish + Props Step

## 4 Changes

### 1. Fix Mobile Sticky Bar
**File**: `ProductImagesStickyBar.tsx`

The bar overflows on small screens. Fix:
- On mobile (`sm:` breakpoint), stack the bar into two rows: top row = progress dots + summary, bottom row = buttons
- Hide the step label text on mobile (already `hidden sm:inline` but summary also needs hiding)
- Show a minimal mobile summary: just the count badge and CTA button
- Reduce padding on mobile from `p-3` to `p-2`
- Credits badge: hide "cr" text on mobile, keep just the number

### 2. Fix Product Thumbnails in Context Strip
**File**: `ProductContextStrip.tsx`

Currently uses `object-cover` which zooms/crops product images. Change to `object-contain` with a white/muted background so the full product is visible — matching the Products tab display style. Also add `p-0.5` padding inside the thumbnail container.

### 3. Scene Layout Toggle + 3-per-row Default
**File**: `ProductImagesStep2Scenes.tsx`

- Add a layout toggle (small/medium/large grid) at the top of the scenes step, similar to the grid/list toggle on products
- Default to 3 columns on mobile
- Small = `grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7` (compact)
- Medium = `grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6` (default)  
- Large = `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` (bigger cards)
- Store layout preference in local state
- Apply same grid class to category section grids

### 4. Add Props Step (Step 3.5 → becomes Step 4, shifting Settings to 5, Review to 6)
**Files**: `ProductImages.tsx`, `ProductImagesStickyBar.tsx`, new `ProductImagesStep3Props.tsx`

Add a simplified props picker step inspired by `CatalogStepProps`:
- Insert new step between Refine (3) and Settings: Products → Scenes → Refine → **Props** → Settings → Review → Generate → Results
- Update `STEP_DEFS` to include Props step with a `Gem` icon at position 4
- Shift Settings to 5, Review to 6, Generate to 7, Results to 8
- Update `PIStep` type to allow up to 8
- The Props step shows available products (excluding selected hero products) in a grid
- Users can pick additional products as styling props for the entire batch
- Store as `propProductIds: string[]` in details or separate state
- Keep it simple: global prop selection (apply to all scenes), not per-combo like Catalog Studio
- Show "Skip" option since props are optional

## Files Modified

| File | Changes |
|------|---------|
| `ProductImagesStickyBar.tsx` | Mobile-friendly stacked layout |
| `ProductContextStrip.tsx` | `object-contain` for thumbnails |
| `ProductImagesStep2Scenes.tsx` | Layout size toggle (S/M/L grid) |
| `ProductImages.tsx` | Add Props step, reorder step numbers |
| `types.ts` | Update `PIStep` type, add `propProductIds` |
| New: `ProductImagesStep3Props.tsx` | Simplified props picker |

