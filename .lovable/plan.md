

# Fix Multi-Model Selection Bugs in Product Images Step 3

## Problems identified

1. **Inline click doesn't sync multi-select state** — The inline `onSelect` (line 2099) only updates `selectedModelId` without clearing `selectedModelIds`, causing the two states to diverge after using the modal.
2. **Badge shows "selected" (singular)** — Line 2085-2089 only checks `details.selectedModelId`, not `selectedModelIds`, so the count badge is wrong after multi-select.
3. **No way to clear all selections** — There is no "Deselect all" or "Clear" button.
4. **Modal has no footer with count + done button** — After selecting multiple models, closing via the X is the only option, making it feel broken.

## Changes

### `src/components/app/product-images/ProductImagesStep3Refine.tsx`

**A. Remove the separate `onSelect` prop usage for inline models** — Make inline clicks also go through `onMultiSelect` so state stays in sync. Change line 2099's `onSelect` to also update `selectedModelIds`:
```typescript
onSelect={(id) => {
  const current = details.selectedModelIds || (details.selectedModelId ? [details.selectedModelId] : []);
  const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
  update({ selectedModelIds: next, selectedModelId: next[0] || undefined });
}}
```

**B. Fix the "selected" badge** (lines 2085-2089) — Show actual count from `selectedModelIds`:
```typescript
{(details.selectedModelIds?.length || (details.selectedModelId ? 1 : 0)) > 0 && (
  <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
    <Check className="w-2.5 h-2.5 mr-0.5" />
    {details.selectedModelIds?.length || 1} selected
  </Badge>
)}
```

**C. Add a "Clear all" button** next to the count badge when multiple models are selected, calling `update({ selectedModelIds: [], selectedModelId: undefined })`.

**D. Add modal footer** with selected count and a "Done" button that closes the dialog, making the multi-select flow feel complete.

## Files changed
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — all fixes in one file

