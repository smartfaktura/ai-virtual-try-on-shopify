

# Fix Demo Picker — Fit All 9 Products Without Scrolling on Desktop

## Problem
With 3 columns × 3 rows and a 4:5 aspect ratio per card, the dialog overflows the viewport (90vh max). The cards are too tall.

## Fix

**Change aspect ratio from 4:5 to 1:1 (square)** on the image container. Square thumbnails are shorter and will let all 3 rows fit comfortably within the dialog's max-height.

**File: `src/components/app/product-images/DemoProductPicker.tsx`**

- Line 61: change `aspectRatio: '4/5'` → `'1/1'`
- Line 66: change `aspectRatio="4/5"` → `"1/1"`
- Reduce card padding from `p-2` to `p-1.5` and gap from `gap-3` to `gap-2` to tighten the grid slightly
- Widen dialog to `sm:max-w-2xl` so squares have more room

These changes keep the same 3-column layout but shorten each card enough that all 9 fit without scrolling on a standard desktop viewport.

## Files changed
- `src/components/app/product-images/DemoProductPicker.tsx` — aspect ratio, spacing, dialog width

