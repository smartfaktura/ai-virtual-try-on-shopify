

# Fix: No Pre-Selected Format + Validation Guard

## Problem
1. Formats default to `['1:1']` via fallback `details.selectedAspectRatios || [details.aspectRatio || '1:1']`, making it look pre-selected
2. No validation prevents generating with zero formats selected
3. No clear instruction telling users they can pick multiple formats

## Changes

### 1. `src/pages/ProductImages.tsx`
- Change `INITIAL_DETAILS` (line 62): set `selectedAspectRatios: []` explicitly (empty array = nothing pre-selected)
- Update `canProceed` for step 4 (line 908): add `(details.selectedAspectRatios?.length || 0) > 0` to the condition
- Update `handleGenerate` (line 545): keep the fallback but it won't matter since generate is blocked without selection

### 2. `src/components/app/product-images/ProductImagesStep4Review.tsx`
- Change `selectedRatios` derivation (line 101): use `details.selectedAspectRatios || []` instead of falling back to `[details.aspectRatio || '1:1']`
- Update `toggleRatio` (line 112): remove the `if (selectedRatios.length <= 1) return` guard — allow deselecting the last format
- Add helper text under the Format label: "Select one or more" in `text-[10px] text-muted-foreground`
- When `selectedRatios.length === 0`, show a subtle warning badge or muted text: "No format selected"

### 3. Files changed
- `src/pages/ProductImages.tsx` — 3 small edits
- `src/components/app/product-images/ProductImagesStep4Review.tsx` — 4 small edits

