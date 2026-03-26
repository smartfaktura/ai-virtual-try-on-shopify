

# Fix: Require at least 1 aspect ratio selected before generating

## Problem
In the Virtual Try-On settings panel, users can deselect all image sizes and still click "Generate", which shouldn't be allowed.

## Changes

**File**: `src/components/app/generate/TryOnSettingsPanel.tsx`

1. **Disable Generate button when no aspect ratio is selected**: Add a `const canGenerate = selectedAspectRatios.size > 0 && balance >= creditCost;` check
2. **Update the Generate button** (line 185-190): Use `disabled={selectedAspectRatios.size === 0}` and conditionally route the click to `handleGenerateClick` vs `openBuyModal` based on balance
3. **Show "Select at least 1" hint** next to the Image Size heading when none are selected (the screenshot already shows this red text — just need to wire it to actually block generation)

Single file, ~5 lines changed.

