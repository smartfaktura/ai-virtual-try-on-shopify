

# Apply Admin Model Overrides in Product Images Flow

## Problem
`ProductImages.tsx` builds its model list from raw `mockModels` without applying the admin overrides (image replacements, name changes, hidden models). The label also says "Library Models" instead of "VOVV.AI MODELS".

## Solution

### 1. Update `src/pages/ProductImages.tsx` — apply overrides to globalModelProfiles
- Import `useModelSortOrder` hook
- Apply `sortModels`, `applyOverrides`, `applyNameOverrides`, and `filterHidden` to `mockModels` before merging with custom models
- This ensures admin image/name changes and hidden models are respected

```typescript
const { sortModels, applyOverrides, applyNameOverrides, filterHidden } = useModelSortOrder();
const globalModelProfiles = useMemo(
  () => sortModels(filterHidden(applyNameOverrides(applyOverrides([...mockModels, ...(customModelProfiles || [])])))),
  [customModelProfiles, sortModels, applyOverrides, applyNameOverrides, filterHidden]
);
```

### 2. Rename "Library Models" → "VOVV.AI MODELS" in `src/components/app/product-images/ProductImagesStep3Refine.tsx`
- Update the two instances of the label text (inline preview and modal) from "Library Models" to "VOVV.AI MODELS"

### Files changed
- `src/pages/ProductImages.tsx` — import and apply model override hooks
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — rename label (2 occurrences)

