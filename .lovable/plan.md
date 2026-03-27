

# Fix: Product Listing Set Workflow Generation Failing

## Root Cause

The generation failed because of an **index mismatch** between frontend and backend variation arrays.

**Frontend**: Merges all 31 DB variations + ~34 custom Freestyle scenes into one array (65 items). When you selected a custom scene, it was at index **64** in this merged array.

**Payload sent**: `selected_variations: [64]`, `extra_variations: [{the 1 selected scene}]`

**Backend**: Rebuilds `combinedVariations = [...31 DB variations, ...1 extra_variation]` = **32 items**. Index 64 is out of bounds → filtered out → **0 variations** → "Failed to generate any images".

The logs confirm this:
```
Generating 0 variations × 1 angles = 0 images
Refunded 6 credits for failed job
```

## Fix

**File: `src/pages/Generate.tsx`**

### Remap variation indices before sending payload

When building the payload, remap `selectedVariationIndices` so that:
- Indices pointing to **DB variations** (< `dbVariationCount`) stay as-is
- Indices pointing to **dynamic Freestyle scenes** (≥ `dbVariationCount`) get remapped to their position in `[...dbVariations, ...extras]`

This applies in **three places** where `selected_variations` is set in the payload:
1. **Single-job path** (~line 1131): `selected_variations: [varIdx]` — remap `varIdx`
2. **Batch path** (~line 1251): `selected_variations: Array.from(selectedVariationIndices)` — remap all indices
3. **Multi-model loop path** (~line 1344): `selected_variations: [varIdx]` — remap `varIdx`

### Remapping logic

```typescript
function remapVariationIndex(
  frontendIdx: number,
  dbCount: number,
  selectedExtras: number[] // sorted frontend indices of extras
): number {
  if (frontendIdx < dbCount) return frontendIdx; // DB variation — unchanged
  // Extra: position = dbCount + position within extras list
  const extraPosition = selectedExtras.indexOf(frontendIdx);
  return dbCount + extraPosition;
}
```

The `extra_variations` array already correctly extracts the scene data for indices ≥ `dbVariationCount`. The only bug is that `selected_variations` indices don't match the backend's combined array.

### What this fixes

Any selection of dynamic Freestyle scenes in the Product Listing Set workflow will now generate correctly instead of failing with "Failed to generate any images".

