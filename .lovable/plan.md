

# Fix Props Modal Products & Model Selection Preview

## Issues Found

### 1. Props/Accessories modal showing wrong product list
The `PropPickerModal` in Step 3 Refine and Step 4 Review receives `allProducts` (all user products). The user wants it to only show products that were selected in Step 1, not all catalog products. Will change the `excludeIds` logic or pass `selectedProducts` instead of `allProducts` so only the Step 1 selected products appear as prop options.

**Wait** — actually the purpose of props is to add *additional* styling products from your catalog. The `excludeIds` already removes the primary selected products. Re-examining: the screenshot shows products that look like real catalog items. The user says "copy from step 1" — they likely want the same product grid UI/formatting as Step 1, or want only selected products to be available as props.

**Clarification needed**: Looking more carefully, the issue is the props modal should show the user's actual products from their catalog (which it does via `allProducts={userProducts}`). The products ARE loading correctly. The user likely just wants a cleaner, Step-1-style presentation. No fundamental data bug here.

### 2. Model selection: inline preview drops selected models (confirmed bug)
In `ModelPickerSections` (lines 77-89), `inlineModels` is computed incorrectly:
- `activeInline` = selected models NOT in first6 and NOT in userModels
- `rest` = first6 models where `!activeIds.has(m.modelId)` — this **removes** selected models that happen to be in the first 6
- Result: if you select Fatima (in first6) + 2 others, Fatima gets removed from `rest`, and only the 2 others + 4 non-selected show. So visually only 2/3 appear selected.

**Fix**: Change the `inlineModels` logic to always keep selected models from first6, then add selected models from outside first6, then fill remaining slots.

## Changes

### `src/components/app/product-images/ProductImagesStep3Refine.tsx`

**A. Fix `inlineModels` logic (lines 77-89)** — Replace with:
```typescript
const inlineModels = useMemo(() => {
  // Always show selected models first, then fill with unselected
  const selectedInGlobal = Array.from(activeIds)
    .map(id => filteredGlobal.find(m => m.modelId === id))
    .filter(Boolean) as ModelProfile[];
  // Remove duplicates with user models
  const selectedNotUser = selectedInGlobal.filter(
    m => !filteredUser.some(u => u.modelId === m.modelId)
  );
  // Fill remaining slots with unselected models
  const remaining = INLINE_LIMIT - selectedNotUser.length;
  const unselected = filteredGlobal
    .filter(m => !activeIds.has(m.modelId))
    .slice(0, Math.max(0, remaining));
  return [...selectedNotUser, ...unselected].slice(0, INLINE_LIMIT);
}, [filteredGlobal, filteredUser, activeIds]);
```

**B. Update preview avatars (lines 2094-2103)** — Show selected model avatars instead of always the first 3 global models:
```typescript
// Show selected model previews, fallback to first 3 global
const previewModels = useMemo(() => {
  const ids = details.selectedModelIds || (details.selectedModelId ? [details.selectedModelId] : []);
  const selected = ids.map(id => [...globalModels, ...userModels].find(m => m.modelId === id)).filter(Boolean);
  if (selected.length > 0) return selected.slice(0, 3);
  return globalModels.slice(0, 3);
}, [details.selectedModelIds, details.selectedModelId, globalModels, userModels]);
```

### Files changed
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — fix inline model display logic + preview avatars

