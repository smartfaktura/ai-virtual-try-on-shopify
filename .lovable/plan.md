

## Align search bar + Select All on Product Images Step 1

### Issue
On `/app/generate/product-images` Step 1 (Products), the search `Input` uses default `h-9` with `rounded-lg` corners, while nearby buttons use `rounded-full` (platform default for `Button`). They don't match — different radius, different height.

### Fix (one file)

**`src/components/app/product-images/ProductImagesStep1Products.tsx`**

- Search `Input`: `h-9 text-sm` → `h-10 rounded-full text-sm` (matches the platform pattern already used in `ProductMultiSelect.tsx`: `pl-9 h-10 rounded-full text-sm`).
- Type filter `SelectTrigger`: `text-sm` → `h-10 rounded-full text-sm` so all three controls share the same height + radius.
- "Clear" ghost button: bump from `h-7` → `h-8` (use `size="sm"` default) so the selected-count chip row reads consistently. Keep `Badge` as-is.
- Search icon stays `absolute left-3 top-1/2 -translate-y-1/2` — already vertically centered, no change needed.

That's it. No new components, no token changes, no logic touched. Reuses the exact pattern already shipped in `ProductMultiSelect`.

### Out of scope
- No changes to `Input` / `Button` / `Select` base components.
- No changes to grid, filtering, selection, or modal logic.
- No changes to other steps or other pages.

### Expected result
Search bar, type filter, and any adjacent buttons all render at `h-10` with `rounded-full` — matching the rest of VOVV.AI's input/button language. Search and Select All functionality unchanged.

