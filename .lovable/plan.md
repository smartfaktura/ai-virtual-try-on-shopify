

# Fix: Product-Aware Outfit System for Mixed Categories

## The Problem

When you select products from different categories (e.g., a skirt + a jacket + sneakers), the outfit panel in Step 3 uses only the **first product's category** (`primaryCategory`). This means:

- If a skirt comes first → outfit defaults to "garments" → shows a `Bottom: trousers` slot that **conflicts** with the skirt
- If sneakers come first → outfit defaults to "shoes" → shows a `Shoes: sneakers` slot that conflicts with the product
- The prompt builder already receives per-product analysis at generation time, but the **UI gives no hint** that certain slots will be auto-nullified for specific products

## Two-Part Fix

### Part A: Prompt Builder — Auto-Null Conflicting Slots at Generation Time

**File: `src/lib/productImagePromptBuilder.ts`** (~25 lines)

Add a `getConflictingSlots(garmentType)` helper that returns which outfit slots should be nullified based on the product's `garmentType` from analysis:

```text
Product garmentType        → Null slots
───────────────────────────────────────
skirt, shorts, trousers    → bottom
dress, jumpsuit, romper    → bottom + top
crop top, blouse, hoodie   → top
sneakers, boots, heels     → shoes
```

Update `defaultOutfitDirective()` to check the product's `garmentType` (from `analysis`) and skip conflicting slots from the outfit string. This way, even if the UI sends `bottom: trousers`, the prompt for a skirt product will omit it.

Update `buildStructuredOutfitString()` to accept an optional `skipSlots` parameter.

### Part B: UI — Show Per-Category Awareness in Step 3

**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`** (~40 lines)

1. **Multi-category info banner**: When `hasMultipleCategories` is true, show a small info note above the outfit panel: "Outfit applies to on-model scenes. Conflicting slots are auto-adjusted per product (e.g., Bottom is skipped for skirt products)."

2. **Compute hidden slots from all selected products**: Scan all selected products' `garmentType` values to determine which slots have conflicts. If ANY product is a skirt, show a subtle badge on the Bottom field: "Skipped for skirt products".

3. **Fix the forced fallback useEffect** (lines 1094-1100): Currently forces `bottom = trousers` and `shoes = sneakers` even when the category intentionally omits them (e.g., fragrance has no bottom/shoes). Change to only add fallbacks when the slot isn't intentionally empty for that category.

4. **Dress/jumpsuit mode**: When all selected products are full-body garments, collapse the outfit panel to show only Shoes, with a label: "Full-body garment — only shoes apply."

### How It Works for Mixed Batches

Example: User selects a skirt (dresses) + a jacket (jackets) + sneakers (shoes)

**UI shows**: All 3 slots (Top, Bottom, Shoes) with badges:
- Top: "Skipped for jacket" 
- Bottom: "Skipped for skirt"
- Shoes: "Skipped for sneaker products"

**At generation time** (per-product):
- Skirt job → outfit = "Top: white t-shirt; Shoes: white sneakers" (bottom nulled)
- Jacket job → outfit = "Bottom: beige trousers; Shoes: white sneakers" (top nulled)  
- Sneakers job → outfit = "Top: white t-shirt; Bottom: beige trousers" (shoes nulled)

### Files Changed
1. `src/lib/productImagePromptBuilder.ts` — add `getConflictingSlots`, update `defaultOutfitDirective` and `buildStructuredOutfitString`
2. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — multi-category banner, slot badges, fix forced fallback
3. `src/pages/ProductImages.tsx` — pass `analyses` map to Step 3 (already available, just needs threading)

No database changes needed — uses existing `garmentType` from product analysis.

