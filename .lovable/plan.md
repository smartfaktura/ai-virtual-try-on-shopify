

## Fix Selfie / UGC Set Workflow Flow + Add Thumbnail

Two issues to fix:

### Issue 1: Product selection skips the model step

The Selfie / UGC Set workflow has `show_model_picker: true` in its config, but the product selection "Continue" button (line 904-923 in Generate.tsx) does not check for this flag. When a user selects a product from the database list, the routing logic skips straight to `settings` (because `skip_template` is true) instead of going to the `model` step.

The `handleSelectProduct` function (line 340) already handles this correctly for the "Recent Products" path, but the product step's inline Continue handler does not.

**Fix**: In the product step Continue handler (around line 915-923), add a check for `uiConfig?.show_model_picker` before the `skip_template` check, routing to the `model` step instead.

The corrected routing order should be:
1. brand-profile (if profiles exist)
2. model (if `show_model_picker` is true) -- currently missing
3. mode (if clothing)
4. settings (if `skip_template`)
5. template (fallback)

### Issue 2: Set the workflow thumbnail image

Update the `preview_image_url` column in the workflows table for the Selfie / UGC Set to use the uploaded image. The image will be copied into the project assets and referenced in the animation data as the background for the workflow card.

Alternatively, since the WorkflowCard already uses `workflowAnimationData.tsx` for the Selfie / UGC Set background (the `ugcResult` import at `src/assets/workflows/workflow-selfie-ugc.jpg`), the simplest approach is to replace that asset file with the new uploaded image and also update the `preview_image_url` in the database for fallback display.

### Technical Details

**Files to change:**

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` (lines ~915-923) | Add `show_model_picker` check in the product step Continue handler to route to `model` step |
| `src/assets/workflows/workflow-selfie-ugc.jpg` | Replace with the uploaded selfie image |
| Database migration | Update `preview_image_url` for Selfie / UGC Set workflow to point to the new image (or null if using local asset only) |

