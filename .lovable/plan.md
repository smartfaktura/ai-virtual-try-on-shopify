

## Virtual Try-On Workflow Audit -- Findings and Fixes

### Summary

After examining the full Virtual Try-On flow end-to-end (Product -> Brand -> Model -> Scene -> Settings -> Generate -> Results), the backend (`generate-tryon`) is solid -- it correctly handles aspect ratio via `image_config`, framing with conditional identity blocks, jewelry guards, and model identity preservation. The credit labels on the try-on Settings step are also correct (8/16 credits).

The issues found are limited to one UI bug visible in your screenshot.

---

### Issue: Step Bar Overflow (Clipping "Results" Label)

The progress steps bar uses `overflow-x-auto` which causes the last step ("Results") to get clipped and shows a scrollbar on smaller viewports. Visible in your screenshot where "Resu..." is cut off.

**Fix in `src/pages/Generate.tsx` (line ~822):**
- Change `overflow-x-auto` to `overflow-x-hidden`
- Add `min-w-0` to each step container so labels can compress
- Add `truncate` to step label text so it clips gracefully instead of overflowing
- Reduce connector line widths slightly on smaller screens

---

### What Was Verified and Is Working Correctly

| Area | Status | Details |
|------|--------|---------|
| Aspect ratio passed to AI API | OK | `generate-tryon` passes `image_config: { aspect_ratio }` at the API level (line 244) |
| Framing prompt injection | OK | Conditional framing instructions with faceless identity logic for hand/wrist, neck, back view, etc. |
| Jewelry guard | OK | Single-item duplication prevention for rings, watches, bracelets |
| Model identity preservation | OK | Full face preservation for visible framings, skin-tone-only for faceless framings |
| Credit labels (try-on settings) | OK | Correctly shows "8 credits/img" for Standard, "16 credits/img" for High |
| Credit calculation | OK | `parseInt(imageCount) * (quality === 'high' ? 16 : 8)` is correct |
| Pose/scene prompt injection | OK | `selectedPose.promptHint` is correctly passed as the pose description |
| Model override to Pro | OK | `generate-tryon` always uses `gemini-3-pro-image-preview` regardless of quality selection |

### Note on Non-Try-On Workflows

The `generate-workflow` edge function (used by Product Listing Set, Selfie/UGC, etc.) does have missing `image_config` and framing support -- but those are separate from the Virtual Try-On flow and can be addressed separately.

---

### Files to Change

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Fix step bar overflow: replace `overflow-x-auto` with `overflow-x-hidden`, add `min-w-0` and `truncate` to step items |

