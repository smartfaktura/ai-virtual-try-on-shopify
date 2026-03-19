

# Clarify Model Count in Creative Drops Wizard

## Problem
When "Random / Diverse" is toggled on, the description only says "AI will randomly select from all available models" — giving no indication of how many models will be used across the drop's images. Users don't understand the relationship between model count and image count.

When manually selecting models, the badge shows "X selected" but there's no guidance on how those models map to the total images (e.g., 25 images across 3 models = ~8 images per model).

## Changes

**File: `src/components/app/CreativeDropWizard.tsx`**

### 1. Improve Random/Diverse description (line 1101)
Change the subtitle to explain distribution:
- `"Each image will feature a different model, selected randomly from all available"`

### 2. Add model distribution hint when manually selecting (line ~1088)
Update the badge or add a small helper line showing distribution, e.g.:
- When 3 models selected and `imagesPerDrop` = 25: `"~8 images per model"`
- Formula: `Math.round(imagesPerDrop / wfModels.length)` images per model

### 3. Add helper text below manual model grid (after line ~1145)
Add a subtle note:
```
<p className="text-xs text-muted-foreground">
  Select models to include. {imagesPerDrop} images will be distributed evenly across {wfModels.length} selected model{wfModels.length !== 1 ? 's' : ''} (~{Math.round(imagesPerDrop / wfModels.length)} each).
</p>
```
Only show when `wfModels.length > 0`.

