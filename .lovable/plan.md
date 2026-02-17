

## Generate 5 Selfie/UGC Images + New Preview Animation

### Step 1: Create a Temporary Edge Function to Generate Images

Create a new edge function `generate-ugc-previews` that:
- Generates 5 diverse selfie/UGC-style images using the Lovable AI gateway (google/gemini-2.5-flash-image)
- Each image features a different scenario: coffee shop selfie, golden hour park, bathroom mirror close-up, bedroom outfit check, rooftop sunset
- Uploads all 5 images to the `landing-assets` bucket under `workflows/ugc-preview-{1-5}.jpg`
- Returns the public URLs

Prompts will be crafted for authentic, phone-camera-style UGC content (front-facing, natural lighting, casual composition) without any specific product — just lifestyle selfie aesthetics.

### Step 2: Call the Edge Function

Deploy and invoke the function to generate and store the 5 images. Pick the best result as the new animation background.

### Step 3: Update the Selfie/UGC Animation

**File: `src/components/app/workflowAnimationData.tsx`**

Replace the current sparse Selfie/UGC scene (only 2 elements) with a richer "recipe" animation matching the Try-On and Mirror Selfie patterns:

- **Background**: New generated UGC image (best of 5)
- **Element 1** (slide-left): Product chip — lipstick/beauty product with label
- **Element 2** (pop): Plus action button in center
- **Element 3** (slide-right): Model circular avatar with "Creator" label  
- **Element 4** (slide-up): Mood badge — "Excited" with a Star icon (matching the UGC mood selector)

This creates a 4-element storytelling animation (Product + Model + Mood = Result) that visually communicates the workflow inputs, consistent with the other premium workflow animations.

### Files Modified

| File | Changes |
|---|---|
| `supabase/functions/generate-ugc-previews/index.ts` | New temporary edge function to generate 5 UGC selfie images and upload to storage |
| `src/components/app/workflowAnimationData.tsx` | Update Selfie/UGC Set scene with new background URL and 4-element animation |

