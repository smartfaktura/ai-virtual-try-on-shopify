

## Fix Zoomed-In / Mis-Cropped Workflow Preview Images

### Problem

Two issues causing the "zoomed in" and wrongly-cropped appearance:

1. **Model circle portraits** (e.g. Charlotte shows just chin/lips): The `getOptimizedUrl({ width: 200 })` resizes the source image server-side to 200px wide. When the browser then applies `object-cover` on a 60x60 circle, the crop focal point shifts — showing torso/chin instead of the face. The project's own convention (documented in memory) states that tiny circular avatars should use quality-only optimization without width constraints.

2. **Background images** (showing mid-body instead of face): Changing from `object-top` to `object-center` moved the crop anchor. These are portrait photos of models where the face is in the upper portion. With `object-center` on a 3:4 container, the crop centers on the torso.

### Changes

**`src/components/app/WorkflowAnimatedThumbnail.tsx`**

1. **Model circle images (FloatingEl, line 77):** Split optimization by element type. For `model` type elements, use quality-only optimization (no width param) so the browser handles the circular crop on the full-resolution image. For `product`/`scene` chips, keep `width: 200` since they display at 56px and work fine.

2. **Background images in recipe mode (line 323):** Revert from `object-center` back to `object-top`. Portrait photos of people have the face at the top — `object-top` preserves head and face visibility in the 3:4 crop.

3. **Background images in carousel mode (lines 184, 191):** Also revert to `object-top` for consistency.

4. **Element preloader URLs (lines 157, 282):** Match the same split — model images use quality-only, product/scene use width: 200.

### What this fixes
- Charlotte's circle will show her face instead of just chin
- Background photos will show the model's head/face instead of being anchored to the center of the body
- Product and scene chips remain correctly sized thumbnails

### What stays the same
- All animations, transitions, shimmer placeholders
- The tiered loading approach (backgrounds render immediately, overlays wait for element images)
- The carousel crossfade behavior
