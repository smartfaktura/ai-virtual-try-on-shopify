## Summary
Append " · optional" to field labels in the Brand Scenes wizard:
1. **Pose energy** label in the Cast step (Step 4)
2. **All field labels** in the "How is the photo taken?" step (Step 5)

## Changes

### File: `src/features/brand-scenes/wizard/constants/extras.ts`
- `pose_energy` label: `"Pose energy"` → `"Pose energy · optional"`
- All SCENE_EXTRAS_FIELDS rendered in Step 5 via `PHOTO_EXTRAS_KEYS`:
  - `"Motion / energy"` → `"Motion / energy · optional"`
  - `"Composition energy"` → `"Composition energy · optional"`
  - `"Crop-safe zones (for copy)"` → `"Crop-safe zones (for copy) · optional"`
  - `"Camera angle"` → `"Camera angle · optional"`
  - `"Apparel-specific angle"` → `"Apparel-specific angle · optional"`
  - `"Footwear-specific angle"` → `"Footwear-specific angle · optional"`
  - `"Eyewear-specific angle"` → `"Eyewear-specific angle · optional"`
  - `"Jewelry-specific angle"` → `"Jewelry-specific angle · optional"`

### File: `src/features/brand-scenes/wizard/steps/Step5Photography.tsx`
- All hardcoded `<Section label="...">` labels in Step 5:
  - `"Lens"` → `"Lens · optional"`
  - `"Background blur"` → `"Background blur · optional"`
  - `"Focus"` → `"Focus · optional"`
  - `"Shadows"` → `"Shadows · optional"`
  - `"Composition"` → `"Composition · optional"`
  - `"Negative space"` → `"Negative space · optional"`
  - `"Realism"` → `"Realism · optional"`
  - `"Color palette"` → `"Color palette · optional"`
  - `"Contrast"` → `"Contrast · optional"`
  - `"Saturation"` → `"Saturation · optional"`
  - `"Finish"` → `"Finish · optional"`