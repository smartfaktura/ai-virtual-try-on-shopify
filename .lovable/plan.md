

# Fix Face Consistency: Architectural Approach

## Root Cause

Seedream's multi-image `image` parameter blends ALL input images at the pixel level via `image_strength`. Sending 3 images (face + anchor + product) means the face is diluted to ~33% signal strength. No prompt text can override this pixel-level interpolation. This is why the face changes — it's not a prompt problem, it's a reference architecture problem.

## Solution: Two-Pass Derivative Generation

Split each derivative shot into two sequential API calls, each with a single clear visual reference:

### Pass 1: Generate the Shot (outfit + pose + background)
- Send ONLY the anchor outfit image (1 reference image)
- High `image_strength` (0.80) to lock outfit/styling
- Prompt focuses on pose, camera angle, background
- Result: correct outfit + pose + background, but generic/wrong face

### Pass 2: Face Swap via Inpainting
- Send the Pass 1 result as the base image
- Send the model identity photo as the reference
- Use Seedream's inpainting/edit capability to replace ONLY the face region
- Prompt: "Replace the face with the exact person from the reference image, keep everything else identical"
- Very high `image_strength` (0.90+) to preserve everything except the face

This guarantees:
- The outfit is locked from the anchor (Pass 1)
- The face comes from ONE source only — the model photo (Pass 2)
- No pixel averaging between unrelated images

## Alternative: If Seedream Lacks Inpainting

If Seedream doesn't support regional inpainting, use a simpler approach:

### Approach B: Single-Reference Per Call
- **Derivative call**: Send ONLY the model identity image (1 reference)
- Remove anchor and product from reference images entirely
- Rely purely on prompt text for outfit consistency (anchor is text-described)
- `image_strength: 0.85` — very high to lock the face
- Add the anchor outfit description as explicit text: "wearing beige straight trousers, white tank top, white sneakers"

This sacrifices some outfit precision but guarantees face lock.

## Implementation

### File: `supabase/functions/generate-catalog/index.ts`

**For derivative on-model shots (where `body.anchor_image_url` exists):**

**Option A (two-pass):**
1. First Seedream call: `referenceImages = [anchor_image_url]`, prompt = shot pose + outfit + background
2. Second Seedream call: `referenceImages = [model_identity_url]`, base image = Pass 1 result, prompt = "Apply the exact face, hair, and skin from the reference person onto this image, keep outfit, pose, background, and body identical"
3. Use the Pass 2 result as final output

**Option B (single-reference fallback):**
1. Single Seedream call: `referenceImages = [model_identity_url]` only
2. Prompt includes explicit outfit text from anchor wardrobe (not just "Image 2")
3. `image_strength: 0.85`, `guidance_scale: 10.0`

### File: `src/lib/catalogEngine.ts`

- Update `assemblePrompt` derivative section: embed the full support wardrobe as explicit text rather than referencing "Image 2"
- Remove IMAGE ROLE ASSIGNMENT for multi-image — since we're now single-reference
- Add explicit wardrobe description: "The model wears [exact wardrobe items from anchor] — do NOT deviate from this outfit"

### File: `src/hooks/useCatalogGenerate.ts`

- For Option A: pass a `twoPass: true` flag in the payload so the edge function knows to run two sequential calls
- Credits stay the same (we absorb the second API call cost)

## Recommended Path

Start with **Option B** (single-reference) because:
- Simpler implementation (no two-pass orchestration)
- Guaranteed face consistency (only 1 image = face)
- Outfit text from anchor wardrobe definitions is already very specific
- Can upgrade to two-pass later if outfit drift becomes an issue

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/generate-catalog/index.ts` | Derivative shots: send ONLY model identity as reference image; bump `image_strength` to 0.85 |
| `src/lib/catalogEngine.ts` | Update derivative prompt: remove "Image 2/Image 3" references, embed full wardrobe text inline, single IMAGE ROLE ASSIGNMENT for face-only reference |

## Expected Results
- Face stays identical across all shots (only 1 reference image = the model)
- Outfit consistency maintained via explicit text prompts
- No more pixel averaging between face and product/anchor images

