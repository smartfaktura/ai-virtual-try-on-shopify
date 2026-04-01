

# Bulk Video Generation Fixes & Enhancements

## Changes

### 1. Fix: Show image preview during bulk analysis
**Problem**: When analyzing the first image in bulk mode, the analysis UI (lines 746-938) shows `imagePreview` which is only set for single-mode uploads. Bulk images use `bulkImages[0].preview` instead.

**Fix**: In the analysis UI section, fall back to `bulkImages[0]?.preview` when `imagePreview` is null. Update the condition on line 752 and the source image preview on line 1133.

### 2. Add "Customize per image" toggle (change settings per video)
**Current**: All bulk images share the same settings.

**New**: Add a "Customize per image" toggle below the BulkImageGrid in the post-upload form. When enabled:
- Show a horizontal tab bar with image thumbnails (1, 2, 3...)
- Selecting an image shows settings for that image
- Store per-image overrides in a `Map<imageId, SettingsOverride>` state
- When generating, pass per-image params to `runBulkAnimatePipeline`
- Update `useBulkVideoProject` to accept an optional `perImageParams` map

### 3. Improve video project naming
**Current**: All video projects are titled `'Animate Image'` (line 84 in useVideoProject.ts).

**New**: Change title to `{CameraMotionLabel}-{ProductName}-{shortId}` format:
- Camera motion label from `CAMERA_MOTIONS` lookup
- Product name from analysis `detected_product` or category label
- Short ID = first 6 chars of project UUID
- Example: `"Slow Push-in-Fashion-a3b2c1"`

### 4. File changes

**`src/pages/video/AnimateVideo.tsx`**:
- Fix analysis image preview to use `bulkImages[0]?.preview` as fallback
- Add `customizePerImage` toggle state
- Add `perImageSettings` map state
- Add image tab bar UI when customize is on
- Wire per-image settings to generation call

**`src/hooks/useBulkVideoProject.ts`**:
- Accept optional `perImageParams: Map<string, Partial<BulkAnimateParams>>` in `runBulkAnimatePipeline`
- Merge per-image overrides with shared params for each image

**`src/hooks/useVideoProject.ts`**:
- Update project title from `'Animate Image'` to `{CameraMotionLabel}-{ProductName}-{shortId}` using `CAMERA_MOTIONS` lookup and analysis data

