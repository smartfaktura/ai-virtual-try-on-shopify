
# Critical UI/UX Bug Fix Plan

## Overview
After thorough analysis of the screenshot and codebase, I've identified **12 critical bugs** that severely impact the e-commerce workflow. The most glaring issue is that users have **no idea WHICH product** their images will be published to on the Results page.

---

## Critical Bug #1: NO PRODUCT CONTEXT ON RESULTS PAGE (SEVERE)

**Location:** `src/pages/Generate.tsx` (lines 647-780)

**Problem:** On the Results page (screenshot), users see "Publish 4 to Shopify" but there is:
- No product name visible
- No product thumbnail
- No reminder of which product was selected
- Users cannot verify they're about to publish to the correct product

**Impact:** Merchants could accidentally publish generated images to the wrong product, corrupting their Shopify catalog.

**Fix:** Add a persistent "Selected Product" summary card at the top of the Results step showing:
- Product thumbnail
- Product title
- Vendor name
- Current image count on that product

---

## Critical Bug #2: PUBLISH BUTTON TEXT IS AMBIGUOUS

**Location:** `src/pages/Generate.tsx` (line 776)

**Problem:** Button says "Publish 4 to Shopify" but doesn't specify:
- Which product
- Whether images will ADD or REPLACE

**Fix:** Change button text to include product context, e.g., "Publish 4 to [Product Name]"

---

## Critical Bug #3: PUBLISH MODAL MISSING PRODUCT IDENTITY

**Location:** `src/components/app/PublishModal.tsx`

**Problem:** The modal title says "Publish X Images to Shopify" but doesn't show:
- Which product is being updated
- Product thumbnail for verification
- Clear warning about what will happen

**Fix:** Add product card at the very top of the modal with:
- Product thumbnail (large)
- Product title prominently displayed
- Current live images vs. what will happen after publish

---

## Critical Bug #4: JOBS TABLE PUBLISH ACTION HAS NO CONTEXT

**Location:** `src/pages/Jobs.tsx` (lines 98-109)

**Problem:** The "Publish" button in the jobs table just shows a toast with count, but:
- No modal confirmation
- No product context shown
- No add/replace choice offered
- Could accidentally overwrite images

**Fix:** Open a PublishModal with the job's product context instead of directly publishing.

---

## Critical Bug #5: GENERATED IMAGES DON'T MATCH ACTUAL PRODUCT

**Location:** `src/pages/Generate.tsx` (lines 158-167)

**Problem:** The mock generated images are random fashion photos (hoodies, sweaters, t-shirts) that have nothing to do with the selected product (e.g., "Vitamin C Brightening Serum"). This creates massive UX confusion.

**Impact:** Users see the prompt says "Vitamin C Brightening Serum by GlowLab" but the images show random clothing items - completely breaks mental model.

**Fix:** Generate mock images that match the selected product's category (cosmetics → cosmetic images, clothing → clothing images, etc.)

---

## Critical Bug #6: PROMPT PREVIEW DOESN'T MATCH IMAGES

**Location:** `src/pages/Generate.tsx` (lines 754-764)

**Problem:** The "Prompt Used" card shows a cosmetics prompt ("Fresh beauty product with water and moisture elements. Vitamin C Brightening Serum...") but the images above are clothing items.

**Fix:** This is connected to Bug #5 - mock images must align with the product category.

---

## Critical Bug #7: NO PRODUCT REFERENCE IMAGE SHOWN

**Location:** `src/pages/Generate.tsx` (Results step)

**Problem:** When generating images FOR a product, the original product image should be visible for comparison. Users need to verify:
- The AI-generated images match their actual product
- Color accuracy
- Product shape/details

**Fix:** Add a "Reference Product" section showing the original product image(s) alongside generated results.

---

## Critical Bug #8: STEPPER SHOWS WRONG NUMBERS

**Location:** `src/pages/Generate.tsx` (lines 248-275)

**Problem:** Step 4 shows the number "4" even when on results, but the circle also contains a checkmark for completed steps. The "4" is visually confusing since it looks like image count (which is also "4" in the screenshot).

**Fix:** Show "Results" label more prominently and use a different visual indicator (checkmark or icon) instead of number "4" for the final step.

---

## Critical Bug #9: LIGHTBOX DOESN'T SHOW PRODUCT CONTEXT

**Location:** `src/components/app/ImageLightbox.tsx`

**Problem:** When viewing images full-size, there's no reminder of which product these are for, making it easy to lose context in a multi-product workflow.

**Fix:** Add product name/thumbnail to the lightbox header.

---

## Critical Bug #10: CONFIRMATION MODAL MISSING PRODUCT IMAGE

**Location:** `src/components/app/GenerateConfirmModal.tsx` (lines 73-94)

**Problem:** The "Product" summary card shows only a tiny `small` thumbnail. For a generation confirmation, users need to see their product clearly to verify they selected the right one.

**Fix:** Use a larger thumbnail or medium size for the product image in confirmation.

---

## Critical Bug #11: DASHBOARD "VIEW" ACTIONS DON'T SHOW PRODUCT

**Location:** `src/pages/Dashboard.tsx` (line 51)

**Problem:** Clicking "View" on a recent job navigates to `/jobs/:id` but there's no job detail page implemented - it will 404 or show nothing.

**Fix:** Either implement job detail page or open a modal with job details.

---

## Critical Bug #12: NO LOADING/EMPTY STATES FOR PRODUCT IMAGES

**Location:** Multiple files

**Problem:** If a product has no images (empty images array), fallback is a generic Shopify placeholder. This should be more contextual.

**Fix:** Use a better empty state that says "No product images yet" with appropriate icon.

---

## Implementation Summary

### Files to Modify:

1. **`src/pages/Generate.tsx`**
   - Add product summary card to Results step (top of step)
   - Add product name to Publish button text
   - Add product reference images section
   - Fix mock generated images to match product category
   - Improve stepper visual for step 4

2. **`src/components/app/PublishModal.tsx`**
   - Add prominent product card at modal top
   - Show product thumbnail (larger)
   - Add product title to modal title

3. **`src/components/app/ImageLightbox.tsx`**
   - Add product context to header

4. **`src/components/app/GenerateConfirmModal.tsx`**
   - Use larger product thumbnail
   - Make product identity more prominent

5. **`src/pages/Jobs.tsx`**
   - Change Publish button to open PublishModal
   - Add PublishModal import and state

6. **`src/data/mockData.ts`**
   - Add category-appropriate mock image URLs for generated results

---

## Code Changes Detail

### 1. Generate.tsx - Add Product Context to Results

Add a product summary card at the top of the Results step:

```text
Location: After line 648, inside Results BlockStack

Add:
- Card with product thumbnail (medium size)
- Product title and vendor
- Badge showing "Publishing to this product"
- Current image count from product.images.length
```

### 2. Generate.tsx - Update Publish Button

Change line 776 from:
```
Publish {selectedForPublish.size > 0 ? `${selectedForPublish.size} ` : ''}to Shopify
```
To:
```
Publish {selectedForPublish.size} to "{selectedProduct?.title}"
```

### 3. PublishModal.tsx - Add Product Header

Add at the very top of Modal.Section (after line 71):
```text
- Product card with:
  - Large thumbnail (80x80)
  - Product title (heading size)
  - Vendor name
  - Divider after
```

### 4. Generate.tsx - Category-Based Mock Images

Create a mapping function that returns appropriate mock image URLs based on the selected template's category:
```text
- clothing → fashion/apparel images
- cosmetics → beauty product images
- food → food photography images
- home → interior/decor images
- supplements → health product images
- universal → generic product images
```

### 5. Jobs.tsx - Add Publish Modal

Add:
- Import PublishModal component
- State for publishModalOpen and selectedJobForPublish
- Change onClick to set state and open modal
- Add PublishModal component with proper props

### 6. ImageLightbox.tsx - Add Product Prop

Add:
- `productName` prop to interface
- Display product name in modal title
```
title={`Image ${currentIndex + 1} of ${images.length} • ${productName}`}
```

### 7. GenerateConfirmModal.tsx - Larger Product Thumbnail

Change line 82:
- From `size="small"` to `size="large"`
- Add more visual emphasis to the product section

---

## Visual Changes Summary

### Before (Results Page):
```text
+---------------------------+
| Generated Images          |
| [img] [img] [img] [img]   |
| Selected: 4 of 4          |
| [Publish 4 to Shopify]    | ← WHERE?!
+---------------------------+
```

### After (Results Page):
```text
+---------------------------+
| Publishing to:            |
| [PRODUCT IMG] Vitamin C   |
|              Serum        |
|              by GlowLab   |
|              (2 existing) |
+---------------------------+
| Generated Images          |
| [matching cosmetic imgs]  |
| Selected: 4 of 4          |
| [Publish 4 to "Vitamin C  |
|  Brightening Serum"]      |
+---------------------------+
```

---

## Testing Checklist

After implementation, verify:
1. Product name/image visible on Results page
2. Publish button shows product name
3. Publish modal shows which product will be updated
4. Jobs page publish opens confirmation modal
5. Generated mock images match product category
6. Lightbox shows product context
7. Confirmation modal shows product clearly
8. All actions show appropriate product context before credit-consuming or data-modifying actions
