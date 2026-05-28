You’re right — the fix should not assume which iPhone model is “correct.” If the reference case has a full camera row / large horizontal camera area, that must be copied. If it has a small square island, that must be copied. The model name is secondary and must never override the visible reference.

What I found:

- The latest batch did include phone-case analysis and the product reference image.
- The failure happens because the generator is still allowed to interpret the camera area as “phone hardware under the case,” so it sometimes invents a different iPhone-style camera module.
- The current wording over-emphasizes detected device model and lens count. That is useful metadata, but it is weaker than the actual image and can mislead generation when the AI guesses the wrong model.

Plan:

1. Make the reference image the absolute source of truth
   - Update phone-case prompts so they say: copy the visible camera/cutout geometry from `[PRODUCT IMAGE]` exactly.
   - The detected device model becomes only a weak label for debugging, not a creative instruction.
   - If text analysis and image reference conflict, the image reference wins.

2. Add a dedicated camera-detail reference for phone cases
   - In `generate-workflow`, automatically crop the camera/cutout region from the uploaded product image.
   - Attach it as `[PHONE CASE CAMERA DETAIL]` alongside the full product reference.
   - The generator will be told to copy that patch exactly: shape, size, position, orientation, row/island dimensions, lens holes, flash holes, sensor holes, border thickness, and case material around it.

3. Remove unsafe assumptions from the prompt
   - Do not forbid wide/horizontal camera rows.
   - Do not force “small top-left rounded square” unless the reference image actually shows that.
   - Do not tell the model to create a specific iPhone/Samsung/Pixel camera module from memory.

4. Change the phone-case lock wording
   - Replace “phone hardware under the case” with “camera/cutout patch visible in the reference.”
   - Add: “Do not normalize this into a generic iPhone camera. Do not redesign from device knowledge. Copy the reference geometry even if it differs from common phone models.”

5. Improve analysis fields without trusting them too much
   - Keep `deviceModel`, `lensCount`, and layout fields for search/debugging.
   - Add or emphasize a more neutral field like `cameraCutoutGeometry`, describing what is visually present rather than which phone model it might be.

6. Store the actual final prompt for future debugging
   - Save the real generated prompt used by `generate-workflow`, not just the scene instruction.
   - Include whether `[PHONE CASE CAMERA DETAIL]` was attached, so we can audit future batches accurately.

Expected result:

- Phone-case outputs should replicate the uploaded case’s camera/cutout layout directly, whether it is a full camera row, square island, vertical pill, or any other model-specific shape.
- We avoid hardcoding iPhone assumptions and make visual reference fidelity the controlling rule.