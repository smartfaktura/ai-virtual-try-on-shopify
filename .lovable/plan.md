Goal: make `/app/material-swap` preserve the original product photo as the locked canvas and only replace the material surface.

Plan:

1. Change Material Swap from “re-render” to “surgical edit”
   - In `src/hooks/useMaterialSwap.ts`, stop sending the product photo as a generated product reference.
   - Send the product photo as the image to edit: `sourceImage` + `imageRole: 'edit'`.
   - Keep the material image as the secondary material reference.
   - Remove `isPerspective: true` for this workflow so the backend uses the edit-preservation path.

2. Update the backend edit flow to accept a material reference
   - In `supabase/functions/generate-freestyle/index.ts`, include `referenceAngleImage` during edit mode too, labelled as `[MATERIAL REFERENCE]` instead of generic `[REFERENCE IMAGE]`.
   - Add a workflow-specific guard for `workflow_id: 'material-swap'` so it never treats the material image as scene/style inspiration.
   - Disable Seedream fallback for Material Swap/edit jobs, because fallback regeneration is more likely to shift product geometry, crop, scene, and tiny details.

3. Rewrite the Material Swap prompt for pixel-lock behavior
   - Replace “Re-render the EXACT product...” with “Edit the provided image surgically.”
   - Explicitly preserve: canvas size, crop, camera, background, shadows, chair dimensions, wooden frame, legs, seams, small tags/logos/labels, and all non-target areas.
   - Tell the model to modify only the upholstery pixels and to leave every hard/wood/metal/background pixel visually unchanged.

4. Add a practical limitation note in the app copy only if needed
   - Generative editing can be made much stricter, but it cannot mathematically guarantee 100% pixel-identical geometry.
   - True 100% would require masked/composited texture transfer, which is a different pipeline. This plan gives the strictest improvement within the current AI edit pipeline.

Technical outcome:
- Material Swap becomes an image-edit operation, not a fresh scene generation.
- The chair should no longer become longer/wider, the scene should not change, and small original details near the leg should be preserved unless they are directly on the material surface being edited.