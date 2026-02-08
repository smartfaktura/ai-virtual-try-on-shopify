

## Generate Professional AI Images for All Workflow Previews

### What We'll Do
Generate 10 high-quality, professional background images -- one for each workflow card -- using the premium AI image model (`google/gemini-3-pro-image-preview`). These replace the current static asset photos with purpose-built, ultra-sharp, bright editorial images that match each workflow's theme.

### Image Prompts (What Gets Generated)

Each workflow gets a tailored prompt designed for bright, sharp, premium aesthetics:

| Workflow | Image Concept |
|---|---|
| **Virtual Try-On** | Editorial fashion: model in a cream knit outfit, soft studio light, warm tones |
| **Social Media Pack** | Vibrant lifestyle grid: golden hour portrait, styled flat lay, aspirational |
| **Product Listing** | Clean e-commerce: luxury skincare on white marble, crisp studio lighting |
| **Lifestyle** | Home editorial: candle and decor in cozy setting, warm ambient light |
| **Website Hero** | Cinematic fashion: model in flowing dress, botanical garden, golden hour |
| **Ad Refresh** | Dynamic streetwear: bold outfit, vibrant urban backdrop, high energy |
| **Selfie / UGC** | Authentic mirror selfie: warm coffee shop, skincare product, natural feel |
| **Flat Lay** | Styled overhead: cosmetics and accessories on white marble, gold accents |
| **Seasonal Campaign** | Four-season split: same product across spring, summer, autumn, winter |
| **Before and After** | Skincare transformation: clean split composition, soft clinical aesthetic |

### How It Works

```text
Edge Function                              Storage
+---------------------------------+       +-----------------+
| generate-workflow-preview       |       | workflow-       |
|                                 |       | previews bucket |
| For each workflow:              |       |                 |
|   1. Build premium prompt       | ----> | workflow-id.png |
|   2. Call gemini-3-pro-image    |       |                 |
|   3. Upload to storage          |       +-----------------+
|   4. Save URL to DB             |
+---------------------------------+
                                           Frontend
                                    +-------------------+
                                    | WorkflowCard      |
                                    |   background =    |
                                    |   preview_image_  |
                                    |   url (from DB)   |
                                    +-------------------+
```

### Technical Changes

**1. Update the Edge Function (`generate-workflow-preview/index.ts`)**
- Switch from `google/gemini-2.5-flash-image` to `google/gemini-3-pro-image-preview` for higher quality output
- Enhance all 10 prompts with brighter, sharper, more editorial language (adding "bright natural lighting", "ultra sharp", "premium aesthetic", etc.)
- Add a `regenerate` flag so existing previews can be overwritten

**2. Update Animation Data (`workflowAnimationData.tsx`)**
- Make the `background` field accept either a static import or a dynamic URL string
- Add a helper function `getSceneWithDynamicBg(workflowName, dynamicUrl?)` that returns the scene with the dynamic URL as background when available, falling back to the static asset

**3. Update Workflow Card (`WorkflowCard.tsx`)**
- Pass `workflow.preview_image_url` into the scene data so the animated thumbnail uses the AI-generated background when available
- Fall back to the existing static asset if no generated URL exists yet

**4. Update Workflows Page (`Workflows.tsx`)**
- Change the "Generate Previews" button to also offer "Regenerate All" so all 10 can be refreshed
- Sequential generation (one at a time) to avoid rate limits, with progress feedback via toasts

### Execution Flow
1. User clicks "Generate 10 Previews" button on the Workflows page
2. Edge function generates images one at a time using the premium model
3. Each image is uploaded to the `workflow-previews` storage bucket
4. The `preview_image_url` column is updated in the database
5. The frontend refreshes after each successful generation, showing images as they appear
6. The animated thumbnail uses the new AI-generated image as its background
