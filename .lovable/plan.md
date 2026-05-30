## Plan

Fix the remaining mobile keyboard auto-open in the Product Visuals model picker.

### What I will change

1. **Update the Product Visuals model picker modal**
   - File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`
   - Import the existing `preventAutoFocusOnMobile` helper
   - Add `onOpenAutoFocus={preventAutoFocusOnMobile}` to the “Select Models” `DialogContent`

2. **Keep desktop behavior unchanged**
   - The helper only prevents auto-focus on touch devices using `(pointer: coarse)`
   - Desktop keyboard/mouse users keep the normal dialog focus behavior

3. **Do not change selection logic or styling**
   - Model selection, multi-select, filters, and search behavior stay the same
   - User can still tap the search field manually to open the keyboard

### Why it is still happening

This modal does not have an explicit `autoFocus`, but Radix Dialog automatically focuses the first focusable element when it opens. In this modal, the first focusable field is the search input, so mobile Safari opens the keyboard immediately.

The fix is the same safe pattern already added to the Library and Category picker modals.