

# Product Images Flow — B2B Polish (10 UX Improvements)

These are refinements to existing UI/UX, not new features. Focused on making the flow faster, clearer, and more efficient for repeat B2B users.

## 1. Step 1: Show product count + empty state with clear CTA

**Current**: No empty state when user has 0 products — just a blank grid. No guidance.
**Fix**: Add an empty state card with illustration and "Add Your First Product" CTA button. Also show "X of 20" in the toolbar header so users always know capacity.

**File**: `ProductImages.tsx` — add empty state block when `userProducts.length === 0`

## 2. Step 1: Show sticky bar on Step 1 too (with "Next: Choose Scenes")

**Current**: Sticky bar hidden on Step 1. User has no visible "Next" button — must mentally know to proceed.
**Fix**: Show sticky bar on all steps 1-5 (revert `step >= 2` back to `step >= 1`). The bar already shows "Choose Scenes" as CTA for step 1.

**File**: `ProductImages.tsx` — change condition from `step >= 2` to `step >= 1`

## 3. Step 2: Add scene count to section headers + "Select All" per category

**Current**: Category headers show a count badge but no quick "Select All" for that category.
**Fix**: Add a small "Select All" button inside each `CategorySection` header (next to the count badge). Clicking selects all scenes in that category.

**File**: `ProductImagesStep2Scenes.tsx` — add `onSelectAll` callback to `CategorySection`

## 4. Step 3: Show live cost preview as settings change

**Current**: Settings step shows credit labels on quality chips ("3 cr" / "6 cr") but no running total.
**Fix**: Add a small summary line below the 3 cards: "5 products x 3 scenes x 2 images = 30 images — 180 credits". Updates live as user changes settings.

**File**: `ProductImagesStep3Settings.tsx` — accept `productCount`, `sceneCount` props; render summary line

## 5. Step 4 (Refine): Collapse all blocks by default, show "X customized" count

**Current**: All detail blocks are open/visible, which is overwhelming for users who want defaults.
**Fix**: Wrap each block in a `Collapsible` that starts collapsed. Show a subtle "customized" badge on blocks where user has set values. Add a "Reset All" button at the top.

**File**: `ProductImagesStep3Details.tsx` — wrap blocks in collapsibles, add reset button

## 6. Step 5 (Review): Add "Edit" links on each review card

**Current**: Review cards show products/scenes/credits as read-only. To change anything, user must click Back repeatedly.
**Fix**: Add small "Edit" text buttons on each card that jump directly to the relevant step (`setStep(1)` for products, `setStep(2)` for scenes, `setStep(3)` for settings).

**File**: `ProductImagesStep4Review.tsx` — accept `onEditStep` callback, add Edit buttons

## 7. Sticky bar: Show step label context

**Current**: Sticky bar shows product/scene/image counts but not which step user is on.
**Fix**: Add a subtle step indicator text on the left: "Step 2 of 5 — Scenes" so user always knows context.

**File**: `ProductImagesStickyBar.tsx` — add step label from STEP_DEFS

## 8. Step 6 (Generating): Add per-product progress rows

**Current**: Single progress bar for all jobs. User can't see which products are done.
**Fix**: Show a compact list below the progress bar with each product name + status icon (spinner / checkmark / X). Keeps user informed on large batches.

**File**: `ProductImagesStep5Generating.tsx` — accept `products` and `jobMap` props, render per-product status

## 9. Step 7 (Results): Add "Download All" button

**Current**: Results page shows images grouped by product with "Generate More" and "View in Library" buttons. No bulk download.
**Fix**: Add a "Download All" button that triggers downloading all result images. Use the existing `dropDownload` utility pattern.

**File**: `ProductImagesStep6Results.tsx` — add Download All button using existing download utilities

## 10. Product Context Strip: Show product names on hover

**Current**: Strip shows tiny 8x8 thumbnails — hard to tell which products are selected without clicking back.
**Fix**: Add a tooltip on each thumbnail showing the product name. Use existing `Tooltip` component.

**File**: `ProductContextStrip.tsx` — wrap each thumbnail in `Tooltip`

---

## Summary

| # | File | Change |
|---|------|--------|
| 1 | `ProductImages.tsx` | Empty state for 0 products |
| 2 | `ProductImages.tsx` | Show sticky bar on Step 1 |
| 3 | `ProductImagesStep2Scenes.tsx` | "Select All" per category |
| 4 | `ProductImagesStep3Settings.tsx` | Live cost preview line |
| 5 | `ProductImagesStep3Details.tsx` | Collapse blocks by default + reset |
| 6 | `ProductImagesStep4Review.tsx` | "Edit" jump links on cards |
| 7 | `ProductImagesStickyBar.tsx` | Step label context |
| 8 | `ProductImagesStep5Generating.tsx` | Per-product progress rows |
| 9 | `ProductImagesStep6Results.tsx` | "Download All" button |
| 10 | `ProductContextStrip.tsx` | Tooltip on product thumbnails |

All changes are refinements to existing components — no new tables, no new pages, no new features.

