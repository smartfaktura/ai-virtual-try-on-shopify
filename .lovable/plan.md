

## Improve Selfie/UGC Shot Quality in Freestyle Edge Function

### Problem
Selfie-type prompts currently get the same "Professional photography" treatment as all other prompts. This produces results that look too polished, too "studio", and lack the authentic, front-facing camera feel that makes selfies look real.

### What Changes

Enhance the `generate-freestyle` edge function with **automatic selfie/UGC detection** and **specialized prompt engineering** that produces more realistic, beautiful selfie compositions.

### Approach

**1. Add selfie/UGC detection** in the edge function
- Detect keywords like "selfie", "self-portrait", "front-facing", "UGC", "phone camera", "mirror shot" in the user's prompt
- When detected, switch from "Professional photography" prefix to a selfie-optimized prefix

**2. Add selfie-specific prompt engineering layers**
- Camera perspective: front-facing smartphone camera, slight arm extension, natural selfie angle (slightly above eye level)
- Depth of field: soft smartphone-style bokeh, face in sharp focus
- Expression/posing: natural, authentic, candid expressions -- not model-posed
- Lighting: favor natural/ambient light over studio strobes
- Product interaction: when a source product is attached, add explicit instructions for how to hold/display the product naturally in a selfie context (near face, in hand, casual grip)

**3. Preserve existing quality for non-selfie shots**
- All current prompt polish logic remains unchanged for standard prompts
- The selfie layer only activates when selfie intent is detected

### Technical Details

**File: `supabase/functions/generate-freestyle/index.ts`**

Add a detection function:
```
function detectSelfieIntent(prompt: string): boolean
```
Checks for selfie-related keywords in the prompt text.

Modify `polishUserPrompt` function:
- When selfie intent is detected, replace "Professional photography:" prefix with "Authentic selfie-style photo:"
- Add a SELFIE COMPOSITION layer with specific instructions:
  - Front-facing smartphone camera perspective
  - Slight high angle (above eye level)
  - Arm-length or close-up distance
  - Natural bokeh (not studio strobe bokeh)
  - Authentic, candid expression
- When a product (source image) is present in selfie mode, add PRODUCT INTERACTION instructions:
  - Hold product casually near face or in frame
  - Product should be naturally integrated, not floating or posed stiffly
- Adjust PORTRAIT QUALITY layer for selfies:
  - Emphasize natural skin texture (not studio retouching)
  - Soft, flattering but real lighting
  - Slight imperfections that make it feel authentic

No frontend changes needed -- this is purely a backend prompt engineering improvement that will automatically improve all future selfie-type generations.

