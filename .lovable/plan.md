

# Remove Auto-Preselected Aspect Ratio + Add Validation

## Problem
Perspectives page auto-selects "1:1" on load (`new Set(['1:1'])`). User wants no preselection and proper error handling when none are selected.

## Changes — `src/pages/Perspectives.tsx`

### 1. Initialize with empty set (line 86)
```
new Set(['1:1']) → new Set()
```

### 2. Allow deselecting all ratios (lines 352-357)
Remove the `next.size > 1` guard so users can deselect the last ratio:
```typescript
const toggleRatio = (ratio: string) => {
  const next = new Set(selectedRatios);
  if (next.has(ratio)) next.delete(ratio);
  else next.add(ratio);
  setSelectedRatios(next);
};
```

### 3. Add validation toast on generate (line 425-426)
Before the existing `if (!canGenerate) return`, add specific error messages:
```typescript
if (selectedRatios.size === 0) {
  toast.error('Please select at least one aspect ratio.');
  return;
}
if (selectedVariations.size === 0) {
  toast.error('Please select at least one perspective angle.');
  return;
}
```

`canGenerate` already checks `selectedRatios.size > 0`, so the button stays disabled — the toast is a safety net if somehow triggered.

