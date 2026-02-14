

## Update Mirror Selfie Set Animation Chips to Match Result Image

### Problem
The Mirror Selfie Set card's floating animation chips use mismatched assets:
- **Product** chip shows a lipstick (from UGC workflow) instead of a sweater
- **Scene** chip shows the Selfie/UGC result image instead of the actual bedroom from the mirror selfie result
- **Model** chip may not visually match the model in the generated result

### Plan

#### Step 1: Generate 3 new matching assets via edge function

Create a one-time edge function that generates and uploads three images to the `landing-assets` storage bucket:

| Asset | Prompt | Storage Path |
|-------|--------|-------------|
| **Product** | A brown/beige knit sweater folded neatly on a clean white background, product flatlay photography | `products/sweater-brown.jpg` |
| **Scene** | A cozy modern bedroom interior with warm natural light, sheer curtains, full-length mirror, neutral bedding -- matching the mirror selfie result environment | `scenes/scene-bedroom-mirror.jpg` |
| **Model portrait** | A head-and-shoulders portrait of the same woman from the mirror selfie result -- brunette, warm-toned, 85mm lens aesthetic, light gray background | `models/model-mirror-selfie.jpg` |

All three will be generated using `google/gemini-3-pro-image-preview` and uploaded to storage in a single edge function call.

#### Step 2: Update animation data

**File: `src/components/app/workflowAnimationData.tsx`**

Update the Mirror Selfie Set asset URLs (lines 22-25) and element references (lines 116-139):

- `mirrorSelfieModel` -> new `models/model-mirror-selfie.jpg`
- `mirrorSelfieScene` -> new `scenes/scene-bedroom-mirror.jpg`  
- Product image -> new `products/sweater-brown.jpg`
- Product label: "Outfit" stays, but sublabel could say "Sweater"

#### Step 3: Clean up

Delete the one-time generation edge function after use.

### Result

All animation chips will visually match the background result image:
- Brown sweater product chip (matching the outfit in the photo)
- Bedroom scene chip (matching the room environment)
- Model portrait chip (matching the woman in the mirror selfie)
- "Mirror Selfie" badge (unchanged)

