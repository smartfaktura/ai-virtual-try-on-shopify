

## Add "Save to My Products" Checkbox in Workflow Upload Step

### What and Why

When users upload a new product photo directly in a workflow (scratch upload), the product details are used only for that one generation and then lost. Adding an unchecked-by-default checkbox lets users optionally save the product to their library for reuse, without forcing an extra step.

### UI Change

**File: `src/components/app/UploadSourceCard.tsx`**

Below the Description textarea (after line 148), add a checkbox row:

```
☐ Save to My Products
  Save this product to your library so you can reuse it across workflows without uploading again.
```

- Checkbox is **unchecked by default**
- Only shown for `variant="product"` (not room uploads)
- State is passed up via a new `onSaveToLibraryChange` callback prop

### Logic Change

**File: `src/pages/Generate.tsx`**

In the "Continue" button handler for the upload step (around line 2220), after the existing upload logic:

- If the "Save to My Products" checkbox is checked, insert the product into `user_products` table with the uploaded image URL, title, product type, and description
- This happens alongside (not blocking) the normal workflow flow
- On success, invalidate the products query cache so the product appears in "My Products" immediately

### Props Flow

1. Add `saveToLibrary` boolean state in `Generate.tsx`
2. Pass `saveToLibrary` and `onSaveToLibraryChange` to `UploadSourceCard`
3. On "Continue" click, if `saveToLibrary` is true, insert into `user_products`

### Files Changed
- `src/components/app/UploadSourceCard.tsx` — add checkbox UI
- `src/pages/Generate.tsx` — add state, pass props, handle save on continue

