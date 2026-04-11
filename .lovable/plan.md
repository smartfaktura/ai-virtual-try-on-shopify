

# Fix: Collapse Conflicting Outfit Slots in UI

## The Problem

The prompt builder correctly skips conflicting slots at generation time (sweater → skip top), but the **UI still renders the full PieceField** with all garment/color/fit/material options. The tiny amber badge is easy to miss. Users think their Top selection matters when it will be silently ignored.

## Current Coverage Map

The `getConflictingSlots` function already covers a comprehensive set:

```text
Full-body (skip top + bottom):
  dress, jumpsuit, romper, bodysuit, one-piece, overalls, coverall

Bottom (skip bottom):
  skirt, shorts, trousers, pants, leggings, jeans, wide-leg,
  culottes, joggers, sweatpants

Top (skip top):
  crop top, blouse, shirt, hoodie, sweater, cardigan, tank top,
  vest, jacket, blazer, coat, parka, bomber

Footwear (skip shoes):
  sneaker, boot, heel, sandal, loafer, mule, slipper, clog,
  flat, oxford, derby, trainer, shoe
```

**Missing types to add**: `polo`, `tunic`, `cape`, `poncho`, `turtleneck`, `henley`, `pullover`, `windbreaker`, `anorak`, `gilet` (tops); `bermuda`, `chinos`, `cargo pants`, `palazzo` (bottoms); `espadrille`, `wedge`, `pump`, `brogue` (shoes); `kimono`, `kaftan`, `saree`, `gown`, `maxi dress`, `mini dress`, `co-ord set`, `suit` (full-body).

## The Fix

### Part A: Collapse conflicting slots in UI (~15 lines)

**File: `ProductImagesStep3Refine.tsx`**

In `OutfitPieceFields`, when a slot has conflicts:
- **Replace the full PieceField** with a collapsed single-line row showing a lock icon + explanation: "👕 TOP — Filled by your sweater" (using the actual garmentType)
- For mixed batches (some products conflict, some don't): show the PieceField but **dimmed with an overlay note**: "Applied only to non-sweater products"
- Remove the current tiny badge approach

Logic:
```text
allConflict (every selected product conflicts) → collapse to label
someConflict (mixed batch) → show field + dim overlay note
noConflict → show field normally
```

### Part B: Expand garment type coverage (~10 lines)

**File: `productImagePromptBuilder.ts`**

Add missing garment types to each category array in `getConflictingSlots`.

### Part C: Full-body mode for dresses

When ALL products are full-body garments (dress/jumpsuit), collapse both Top and Bottom to labels, leaving only Shoes visible. Add a header: "Full-body garment — only shoes & accessories apply."

## Files Changed

1. **`src/lib/productImagePromptBuilder.ts`** — expand `getConflictingSlots` arrays with ~20 missing types
2. **`src/components/app/product-images/ProductImagesStep3Refine.tsx`** — replace badge approach with collapsed slot rendering; add full-body mode header

No database changes.

