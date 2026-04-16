

# Fix Interior/Exterior Staging Generate Button Always Disabled

## Problem
The Generate button stays grey (disabled) even after selecting styles because the disabled condition checks `selectedAspectRatios.size === 0`. For interior design, the aspect ratio selector is hidden (replaced by a static "Original" badge), so `selectedAspectRatios` remains an empty Set — the button can never be enabled.

## Fix

### File: `src/components/app/generate/WorkflowSettingsPanel.tsx` (line 820)

Skip the `selectedAspectRatios.size === 0` check when `isInteriorDesign` is true, since aspect ratio is locked to "Original" and not user-selectable:

```tsx
// Before (line 820)
disabled={selectedVariationIndices.size === 0 || selectedAspectRatios.size === 0}

// After
disabled={selectedVariationIndices.size === 0 || (!isInteriorDesign && selectedAspectRatios.size === 0)}
```

This is a one-line logic fix. The interior design flow correctly uses the original image ratio at generation time (line 1208 fallback: `selectedAspectRatios.size > 0 ? ... : [aspectRatio]`), so this is purely a UI gate issue.

### Files
- `src/components/app/generate/WorkflowSettingsPanel.tsx` — 1 condition update on line 820

