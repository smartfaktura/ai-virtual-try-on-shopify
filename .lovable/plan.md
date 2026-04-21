

## Fix paste/upload showing two blocks + new product not auto-selected

### Problems (Step 1, `/app/generate/product-images`)

Looking at `src/pages/ProductImages.tsx`:

1. **Two "Analyzing…" blocks appear during paste/upload**
   - The Upload Image card (lines 1174–1217) swaps its own inner UI to a spinner + "Analyzing…" while `quickUploading` is true.
   - A *separate* skeleton placeholder card (lines 1219–1229) is rendered immediately after, also showing a spinner + "Analyzing…".
   - Result: two visually identical "Analyzing…" tiles for a single upload — what the screenshot shows.

2. **Duplicate `quickUploadInputRef`**
   - `quickUploadInputRef` is attached to two `<input>` elements (lines 1112 and 1207). Only one branch is ever mounted at a time, but it makes the code brittle and confusing.

3. **New product not auto-selected after save**
   - `handleQuickUpload` (lines 113–193) does:
     ```
     await queryClient.invalidateQueries({ queryKey: ['user-products'] })
     setSelectedProductIds(prev => add newProduct.id)
     ```
   - `invalidateQueries` returns before the refetch result lands. So when `setSelectedProductIds` runs, `userProducts` doesn't yet contain `newProduct.id`. The `useEffect` at line 421 fires (selection key changed) and clears downstream state, but the card list re-renders without the new id visible.
   - When the refetch finally lands, the id is in `selectedProductIds` *but* the just-fetched product is rendered without the selected ring because the Step 1 card UI presumably re-mounts or because of timing with `prevProductIdsRef`. Either way, the user sees the new product in the grid but unselected.

### Fix

Single file: `src/pages/ProductImages.tsx`.

**1. Remove the duplicate skeleton card**

Delete the standalone "Upload progress skeleton" block (lines 1219–1229). The Upload Image card already shows progress inline, so we don't need a second tile. This eliminates the "two blocks" issue for both paste and click upload.

**2. Make the Upload Image card the single source of progress**

Keep the inline spinner + `quickUploadProgress` text inside the Upload Image tile (already implemented). It will display "Uploading…" → "Analyzing…" → "Creating product…" in one tile only.

**3. Optimistically insert the new product into the cache, then auto-select**

Replace the `invalidateQueries` + `setSelectedProductIds` sequence with an optimistic cache write so the new product is in `userProducts` before selection is set:

```ts
// After successful insert:
queryClient.setQueryData<UserProduct[]>(['user-products', user.id], (old) => {
  const list = old ?? [];
  if (list.some(p => p.id === newProduct.id)) return list;
  return [newProduct as UserProduct, ...list];
});
setSelectedProductIds(prev => {
  const next = new Set(prev);
  next.add(newProduct.id);
  return next;
});
// Background refetch to reconcile
queryClient.invalidateQueries({ queryKey: ['user-products'] });
```

Apply the same pattern to `handleDemoSelect` (lines 196–222) for consistency.

**4. Confirm the exact `user-products` query key**

Before applying step 3, read the products hook to use the exact same key shape (`['user-products']` vs `['user-products', user.id]`) so the optimistic write hits the right cache entry.

**5. De-duplicate the file input ref**

Rename the empty-state input's ref to `emptyStateUploadInputRef` (or reuse the same one — but only render one input per branch; they already are in different branches, so this is just a clarity rename, not a runtime fix).

### Validation

1. Paste an image on Step 1 → only **one** "Analyzing…" tile shows (the Upload Image card itself).
2. Click "Upload Image" + choose a file → same single-tile progress UX.
3. After analysis completes → the new product appears in the grid **with the selected ring** (blue border + check), and the Step 2 button reflects "1 selected".
4. Demo product flow → same auto-select behavior.
5. No regressions to existing multi-select, drag-drop, or "More options" modal.

### Files touched
- `src/pages/ProductImages.tsx` only. No DB, no other components.

