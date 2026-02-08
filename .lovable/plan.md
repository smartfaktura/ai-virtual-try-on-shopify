

# Fix Add Product Modal Horizontal Overflow

## Problem

The "Add Product" modal content overflows to the right, clipping the "Import" button and "Save Product" button. This happens because:

1. The dialog base styles use `w-full max-w-lg` but don't include `overflow-hidden`
2. The AddProductModal overrides width to `sm:max-w-[580px]` but the inner flex layout (URL input + Import button) can push beyond the container width
3. Long URL text in the input field expands the flex container beyond the dialog boundary

## Changes

### File: `src/components/app/AddProductModal.tsx`
- Add `overflow-hidden` to the DialogContent className to prevent any horizontal overflow at the container level
- This ensures all child content (StoreImportTab, ManualProductTab, CsvImportTab, MobileUploadTab) respects the dialog's width boundary

### File: `src/components/app/StoreImportTab.tsx`
- Add `min-w-0` to the flex container wrapping the URL input so that the input properly shrinks within the flex layout instead of pushing the "Import" button off-screen
- Add `min-w-0` to the extracted product preview's text container (`flex-1 min-w-0` is already there -- confirmed)
- Add `overflow-hidden` to the extracted product preview wrapper so long titles/descriptions don't push the "Discard" / "Save Product" buttons off-screen

These are minimal, targeted CSS fixes -- no structural or logic changes needed.
