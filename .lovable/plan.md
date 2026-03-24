

# Match Presets Width to Prompt Bar + Scene Thumbnails

## Changes

### 1. `src/components/app/freestyle/FreestyleQuickPresets.tsx`

**Scene thumbnails instead of model**: Change `model?.previewUrl` to use the scene's preview from `mockTryOnPoses.find(p => p.poseId === preset.poseId)?.previewUrl`. The scene image shows the location/environment which is what the preset represents.

**Arrows outside the carousel**: Move arrows from `left-1`/`right-1` (inside) to `-left-10`/`-right-10` (outside the container), so they don't overlap the chips.

### 2. `src/pages/Freestyle.tsx` (~lines 961-964)

**Match prompt bar width**: Wrap `FreestyleQuickPresets` in the same width constraint as the prompt panel: `lg:max-w-2xl lg:mx-auto w-full`. This ensures the carousel aligns with the prompt bar below it.

### Files
- `src/components/app/freestyle/FreestyleQuickPresets.tsx` — scene thumbnails, arrows outside
- `src/pages/Freestyle.tsx` — width constraint on presets wrapper

