

# Fix: Outfit Slot Conflict Detection When garmentType is Missing

## The Problem

The slot-collapse logic in Step 3 depends on `analysis.garmentType`, but this field is only returned by the AI for fashion-category products — and even then, not always reliably. For cached analyses or when the AI omits it, `garmentType` is `undefined`, so `getConflictingSlots()` returns an empty set and the TOP/BOTTOM/SHOES fields remain fully visible even for sweaters, skirts, etc.

## The Fix

Add a fallback chain in `getConflictingSlots` so it works even without `garmentType`:

**File: `src/lib/productImagePromptBuilder.ts`** (~15 lines)

1. Change `getConflictingSlots` signature to accept the full analysis object (or at least `garmentType`, `category`, `productSubcategory`, and `productType`/`title` as fallbacks)
2. If `garmentType` is present, use it (current behavior)
3. If not, try `productSubcategory` (e.g. "Sweater", "Skirt") — run the same keyword matching
4. If still nothing, try the product's `product_type` or `title` from the product record as a last resort
5. Export a helper `resolveGarmentType(analysis, product?)` that returns the best guess

**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`** (~5 lines)

Update `OutfitPieceFields` to pass more context to `getConflictingSlots`:
- Instead of just `a.garmentType`, pass the full analysis + the product's `product_type` / `title` as fallback
- This ensures even older cached analyses trigger correct slot collapsing

**File: `src/pages/ProductImages.tsx`** — no changes needed, `allProducts` and `selectedProductIds` are already passed

## How It Works After the Fix

User adds a sweater → analysis has `category: "garments"`, `productSubcategory: "Sweater"` but `garmentType` might be missing → fallback reads `productSubcategory` → matches "sweater" → TOP slot collapses with "Filled by your sweater"

## Files Changed

1. `src/lib/productImagePromptBuilder.ts` — add `resolveGarmentType` fallback helper, update `getConflictingSlots` to use it
2. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — pass full analysis + product info to conflict detection

