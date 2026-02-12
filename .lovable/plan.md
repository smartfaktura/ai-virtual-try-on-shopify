

## Selfie / UGC Set Workflow -- Complete Overhaul

This is NOT just a database config update. The Selfie / UGC Set is fundamentally different from Product Listing Set because it requires a **model reference image** (the influencer's face), but the current workflow pipeline completely ignores it. Three layers need fixing.

---

### Problem 1: The pipeline drops the model image

The `handleWorkflowGenerate()` function in `Generate.tsx` only sends `product.imageUrl` to the backend. The `generate-workflow` edge function only passes a single product image to Gemini. For the Selfie / UGC Set, the selected model's face is never sent -- so Gemini generates a random person every time.

### Problem 2: The prompt engineering is generic

The current `generation_config` prompt template says "Create an authentic, user-generated content photograph" -- a vague instruction that produces stock-photo-like results. Meanwhile, the Freestyle Studio already has battle-tested selfie prompt engineering (iPhone front-camera POV, deep depth of field, 26mm focal length, Smart HDR color science, skin texture rules) that should be reused here.

### Problem 3: Only 4 variations

The workflow only has Mirror Selfie, Unboxing, In-Use Close-up, and Casual Lifestyle. Missing popular UGC scenarios like Golden Hour, Coffee Shop, Car Selfie, and Morning Routine.

---

### The Fix (3 layers)

#### Layer 1: Frontend -- Pass model image in workflow generation

**File: `src/pages/Generate.tsx`**

Update `handleWorkflowGenerate()` to include the selected model's image when the workflow has `show_model_picker: true` in its UI config. Add a `model` field to the payload with the model's base64 image and metadata.

#### Layer 2: Edge function -- Accept and use model reference image

**File: `supabase/functions/generate-workflow/index.ts`**

1. Extend `WorkflowRequest` interface to accept an optional `model` field with `imageUrl`, `name`, `gender`, etc.
2. Update `generateImage()` to accept multiple reference images (product + model) and pass both to Gemini as separate `image_url` entries in the message content array
3. Update `buildVariationPrompt()` to include `[MODEL IMAGE]` identity instructions when a model is provided -- reusing the proven identity-preservation prompt logic from the Freestyle function

#### Layer 3: Database -- Rewrite the generation_config

**Database migration on the `workflows` table**

Update the `generation_config` JSONB for the Selfie / UGC Set (id: `3b54d43a-a03a-49a6-a64e-bf2dd999abc8`) with:

**Prompt template** -- iPhone front-camera DNA:
- 26mm equivalent focal length, deep depth of field
- Apple Smart HDR color science, neutral white balance
- Ultra-sharp 48MP sensor detail, natural skin texture with pores
- "Phone is the camera" POV -- device never visible
- Direct eye contact with the lens

**System instructions** -- Influencer photographer persona:
- Every image must look like an iPhone front-camera shot
- One hand always holding the phone (the camera)
- Candid, genuine expressions only
- Natural ambient lighting, no studio setups

**8 variations** (expanded from 4):
1. Mirror Selfie -- bathroom/bedroom mirror, reflection shows phone
2. Golden Hour Selfie -- outdoor, honey-toned side light, park/rooftop
3. Coffee Shop Selfie -- cafe table, warm lighting, "showing my haul"
4. Morning Routine -- bathroom vanity, fresh-faced, GRWM vibe
5. Car Selfie -- driver's seat, windshield daylight, on-the-go
6. Unboxing Excitement -- desk/bed, packaging materials, surprised expression
7. Shelfie / Collection -- shelf display, person partially visible
8. In-Use Close-up -- product being applied, hands visible, tutorial-style

**Negative prompts** -- comprehensive exclusions:
- Professional/studio lighting, bokeh, shallow DOF
- Visible phone/device anywhere in image
- Airbrushed skin, heavy retouching
- Fashion magazine quality, editorial styling
- Collage layouts, watermarks, text overlays

**Composition rules** -- front-camera framing:
- Subject looking directly into lens
- One arm holding the phone (partially visible at frame edge)
- Full head/hair visible with natural headroom
- Mid-chest upward framing, face in upper-third
- Slight wide-angle smartphone distortion

---

### Technical Details

#### Files Changed

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Update `handleWorkflowGenerate()` to include `model.imageUrl` (base64) in the payload when a model is selected |
| `supabase/functions/generate-workflow/index.ts` | Add optional `model` field to request interface; pass model image as second reference to Gemini; add identity-preservation prompt block to `buildVariationPrompt()` |
| Database migration | UPDATE `workflows` SET `generation_config` for the Selfie / UGC Set with rewritten prompts, 8 variations, and selfie-specific settings |

#### How it flows

```text
User selects product + model
        |
        v
Generate.tsx sends {product.imageUrl, model.imageUrl} to queue
        |
        v
generate-workflow edge function receives both images
        |
        v
buildVariationPrompt() constructs selfie-specific prompt
with [PRODUCT IMAGE] and [MODEL IMAGE] tags
        |
        v
generateImage() sends prompt + both reference images to Gemini
        |
        v
Gemini generates authentic selfie with correct face + product
```

