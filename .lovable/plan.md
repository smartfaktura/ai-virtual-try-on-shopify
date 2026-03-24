

# Improve Mobile Product Picker: Taller Sheet + Sample Products

## Problem
On mobile, the "Your Products" bottom sheet shows a tiny empty state when users have no products. It's too small and offers no way to test the feature.

## Changes

### 1. `src/components/app/freestyle/MobilePickerSheet.tsx`
- Add an optional `minHeight` prop (e.g. `"half"`)
- When `minHeight="half"`, apply `min-h-[50vh]` to the sheet content so it reaches mid-screen even with little content

### 2. `src/components/app/freestyle/ProductSelectorChip.tsx`
- Pass `minHeight="half"` to the MobilePickerSheet for products
- Replace the empty state (lines 70-81) with a richer layout:
  - Keep the "No products yet" message but make it secondary
  - Show 3 sample product cards in a grid (Ring, Crop Top, Ice Roller) using the same images from `WORKFLOW_OPTIONS` (`/images/samples/sample-ring.png`, etc.)
  - Each sample card has a "Draft" badge, product image, name, and is selectable — clicking it calls `onSelect()` with a synthetic product object (id prefixed with `sample_`, matching the pattern used in StartWorkflowModal)
  - Below the samples: a prominent CTA button "Add Your Own Product →" linking to `/app/products`
  - Label above samples: "Try with a sample" in muted text

### Files
- `src/components/app/freestyle/MobilePickerSheet.tsx` — add optional `minHeight` prop
- `src/components/app/freestyle/ProductSelectorChip.tsx` — taller sheet, sample products in empty state

