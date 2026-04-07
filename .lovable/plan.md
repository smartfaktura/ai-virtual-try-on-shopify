

# Fix: Remove redundant color preview block

## Problem
The `h-20` preview div (lines 130-133) shows the selected solid color, but it's redundant — users already see the color on the swatch checkmark and the small color well next to the HEX input. When white is selected it looks like a broken empty space.

## Change

**File:** `src/components/app/product-images/ColorPickerDialog.tsx`

Remove the preview div (lines 130-133):
```tsx
{/* Preview */}
<div
  className="w-full h-20 rounded-lg border border-border shadow-inner"
  style={{ background: isValidHex(hex) ? hex : '#FFFFFF' }}
/>
```

Also remove the equivalent gradient preview div in the gradient tab (the `h-20` block with `linear-gradient` background) since the gradient preset thumbnails and the two color wells already communicate the selection.

This makes the dialog more compact and removes the confusing white space.

