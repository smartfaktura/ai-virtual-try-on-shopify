

# Fix Save/Discard Buttons Visibility After URL Import

## Problem
After importing a product from a URL, the extracted product preview (title, images, role assignment, reference angle slots) is tall enough to push the "Discard / Save Product" buttons below the visible area of the modal. Users must scroll down to find the CTA.

## Fix

### File: `src/components/app/StoreImportTab.tsx`

Make the Save/Discard button row sticky at the bottom of the extracted product section:

**Line 595** — Change the button container from:
```
<div className="flex justify-end gap-2">
```
to:
```
<div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-3 pb-1 -mb-1 z-10 border-t border-border/40">
```

This pins the buttons to the bottom of the scrollable area so they're always visible regardless of content height. The `bg-background` ensures content scrolls behind the buttons cleanly.

## Impact
- 1 file, 1 line change
- Applies to both the modal (AddProductModal) and the full page (AddProduct) since both render StoreImportTab inside scrollable containers

