

## Update Mirror Selfie Set Workflow Preview Assets

Replace all three animation "ingredient" images and the background result image for the Mirror Selfie Set with the new pictures you provided.

### Steps

1. **Upload 3 ingredient images** to the `landing-assets` storage bucket, replacing the existing ones:
   - `user-uploads://model.png` --> `models/model-mirror-selfie-blonde.jpg` (brunette model portrait)
   - `user-uploads://bedroomscene.png` --> `scenes/scene-cozy-bedroom.jpg` (mirror reflection of bedroom)
   - `user-uploads://product.png` --> `products/crop-top-white.jpg` (beige knit sweater)

2. **Upload the generated result image** to the `workflow-previews` bucket:
   - `user-uploads://generatedresult.png` --> replaces the current Mirror Selfie Set preview

3. **Update the workflow database row** with the new preview URL

4. **Update `workflowAnimationData.tsx`** to point the background to the new result image URL, and update labels to match the new visuals (e.g., "Sweater" instead of "Crop Top")

### Technical Details

**Files modified:**
- `src/components/app/workflowAnimationData.tsx` -- update the `background` URL for `'Mirror Selfie Set'` to the newly uploaded result image, and update product label from "Crop Top" to "Sweater"

**Storage uploads (4 files):**
- `landing-assets/models/model-mirror-selfie-blonde.jpg` (upsert)
- `landing-assets/scenes/scene-cozy-bedroom.jpg` (upsert)
- `landing-assets/products/crop-top-white.jpg` (upsert)
- `workflow-previews/<workflow_id>_<timestamp>.png` (new result image)

**Database update:**
- Update `workflows` table `preview_image_url` for the Mirror Selfie Set row with the new result image public URL

