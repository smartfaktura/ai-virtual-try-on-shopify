

## Mirror Selfie Set: New Preview Image + Recipe Animation

### 1. Generate a New Preview Image

Trigger the `generate-workflow-preview` edge function with an updated prompt specifically describing:
- Full-height beautiful blonde top model
- Taking a mirror selfie with her phone visible in reflection
- Cozy bedroom setting
- No text, no overlays, no labels, no UI elements -- just the photograph

Update the prompt for "Mirror Selfie Set" in the edge function to match this description before calling it.

### 2. Upload Matching Animation Assets to Storage

The recipe animation needs three "ingredient" images uploaded to the `landing-assets` bucket:

- **Model portrait** -- a blonde model headshot (will use an existing model from the library or generate one)
- **Bedroom scene** -- the cozy bedroom environment without the model (will generate or source)
- **White crop top on white background** -- clean product shot (will generate or source)

These will be uploaded to paths like:
- `models/model-mirror-selfie-blonde.jpg`
- `scenes/scene-cozy-bedroom.jpg`  
- `products/crop-top-white.jpg`

### 3. Re-add Mirror Selfie Set Animation Data

Add the Mirror Selfie Set entry back into `workflowAnimationData.tsx` with the recipe pattern:

- **Background**: The newly generated mirror selfie result image (from `preview_image_url`)
- **Element 1** (0.3s, slide-left): Product chip -- white crop top on white background, labeled "Crop Top"
- **Element 2** (0.9s, pop): Plus icon action button in center
- **Element 3** (1.4s, slide-right): Model circle -- blonde model portrait, labeled "Model"  
- **Element 4** (2.0s, slide-up): Scene chip -- bedroom without model, labeled "Cozy Bedroom"

This follows the exact same "Virtual Try-On Set" recipe pattern: Product + Model + Scene combine into the generated result.

### Technical Details

#### Edge function prompt update (`supabase/functions/generate-workflow-preview/index.ts`)
Update the Mirror Selfie Set prompt to:
```
"Full height photograph of a beautiful blonde top model taking a mirror selfie 
with her smartphone visible in the reflection, standing in a cozy decorated 
bedroom with warm ambient lighting. Natural casual pose, phone held at chest 
level, soft bokeh background. 3:4 portrait orientation, realistic smartphone 
camera aesthetic, no text, no watermarks, no overlays, no labels, no UI 
elements, no graphics, just the photograph."
```

#### Animation data update (`src/components/app/workflowAnimationData.tsx`)
- Add new asset URL constants for the three ingredient images
- Add `'Mirror Selfie Set'` entry to `workflowScenes` with 4 elements following the recipe pattern

#### Asset generation
Will need to generate or source 3 small ingredient images for the animation chips. These can be generated via the AI gateway and uploaded to the `landing-assets` storage bucket, or we can reuse existing assets where appropriate.

