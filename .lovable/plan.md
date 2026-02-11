

## Optimize: Trim Prompt for Speed and Reliability

### Critical Analysis of Current Prompt

The polished prompt with all layers active (selfie + model + scene + product + brand + camera style + negatives + aspect ratio + batch) can reach **~4000+ characters** of instruction text. This is excessive for an image generation model and causes:

- Slower processing (more tokens to parse)
- Higher timeout risk (504 errors)
- Instruction conflicts (repeated/contradictory rules confuse the model)
- Diminishing returns (models ignore instructions past a certain density)

### What's Redundant (Critical Findings)

**1. "Natural" camera style says the same thing 4 times**

The no-bokeh/sharp-background rule appears in:
- Line 96: `"NOT Portrait Mode. No depth-of-field blur applied."`
- Line 105: `"Deep depth of field... NOT blurred... No bokeh, no background blur, no shallow depth of field whatsoever."`
- Line 200-207: Camera Rendering Style block repeats it AGAIN in 6+ lines
- Line 207: Selfie Override repeats it a FIFTH time

**2. Product accuracy is stated 3 times**

- Line 148: `"100% fidelity — identical shape, color, texture, branding, and proportions"`
- Line 348-349: `buildContentArray` repeats the SAME instruction as an image label
- Both say "100% fidelity" — the model gets it the first time

**3. Model identity is stated 3 times**

- Line 166-168: 90-word MODEL IDENTITY block
- Line 357-359: `buildContentArray` repeats it as an image label
- Both say "EXACT same person" and "do NOT generate a different person"

**4. Scene instruction is stated 2 times**

- Line 192-194: ENVIRONMENT block (~60 words)
- Line 366-369: `buildContentArray` repeats the same as an image label (~50 words)

**5. Selfie composition block is 150+ words for one concept**

Line 108: One massive paragraph that could be 3 sentences.

**6. Camera Rendering Style "natural" block is ~200 words**

Lines 200-208: An essay with bullet points. Most image models don't benefit from this level of prose.

### Optimization Plan

#### Principle: Say it once, say it short

Each instruction should appear exactly once, either in the prompt text OR the image label — not both.

#### Changes to `supabase/functions/generate-freestyle/index.ts`

**A. Consolidate selfie instructions (lines 92-112)**

Replace the 4 selfie layers with 2 concise ones:

```
Before (~400 chars across 4 blocks):
  "Ultra high resolution, sharp focus on face, natural ambient lighting..."
  "SELFIE COMPOSITION: This image is shot FROM the smartphone's front-facing camera..."
  "SELFIE FRAMING: Subject's full head and hair..."

After (~200 chars in 2 blocks):
  Layer 1: "Authentic selfie taken with iPhone front camera: {prompt}. Ultra-sharp, natural lighting."
  Layer 2: "SELFIE: Shot from the phone's POV — direct eye contact, slight wide-angle distortion, one hand holding the phone (not visible). Frame from mid-chest up, full head visible with headroom. {natural: 'No Portrait Mode, no bokeh — everything sharp.' | pro: 'Soft natural bokeh.'}"
```

**B. Consolidate camera rendering style (lines 198-209)**

Replace the ~200-word essay with a concise directive:

```
Before: 5 bullet-point sections (LENS, COLOR SCIENCE, LIGHTING, TEXTURE, OVERALL FEEL, SELFIE OVERRIDE)

After (~80 chars):
  "CAMERA: iPhone-style rendering. Deep depth of field (everything sharp), true-to-life colors (no grading), natural ambient light only, ultra-sharp detail, authentic unprocessed look."
```

**C. Remove duplicate instructions from `buildContentArray` (lines 332-374)**

The image labels currently repeat what the polished prompt already says. Shorten them to simple identifiers:

```
Before: "PRODUCT/SOURCE REFERENCE IMAGE — reproduce this exact product with 100% fidelity (shape, color, texture, branding, proportions):"
After: "PRODUCT REFERENCE IMAGE:"

Before: "MODEL REFERENCE IMAGE — use this EXACT person's face, hair, skin tone, and body. Do NOT generate a different person:"
After: "MODEL REFERENCE IMAGE:"

Before: "SCENE/ENVIRONMENT REFERENCE IMAGE — You MUST place the subject IN this exact environment/location. Reproduce the same setting, background elements, lighting direction, color temperature, and atmosphere. Do NOT use a different environment:"
After: "SCENE REFERENCE IMAGE:"
```

The detailed instructions are already in the polished prompt — no need to say them twice.

**D. Shorten model identity block (lines 164-168)**

```
Before (~90 words): "The generated person MUST be the EXACT same person shown in the MODEL REFERENCE IMAGE. Replicate their exact face, facial features, skin tone, hair color, hair style, and body proportions with 100% fidelity. This is a specific real person — do NOT generate a different person who merely shares the same gender or ethnicity. The face must be recognizable as the same individual from the reference photo."

After (~30 words): "MODEL IDENTITY: Generate the EXACT person from the MODEL REFERENCE IMAGE — same face, features, skin tone, hair, and body. Not a similar person — the same individual."
```

**E. Shorten aspect ratio enforcement (line 459)**

```
Before: "MANDATORY OUTPUT FORMAT: This image MUST be exactly 1:1 aspect ratio (1024x1024 pixels). Do NOT add borders, padding, letterboxing, or pillarboxing. The subject must fill the entire 1:1 frame with no empty or white margins."

After: "OUTPUT: Exactly {ratio} ({dims}). No borders/padding/margins. Fill entire frame."
```

**F. Shorten negative prompt (lines 66-78)**

```
Before:
  "CRITICAL — DO NOT include any of the following:
  - No text, watermarks, logos, labels, or signatures anywhere in the image
  - No distorted or extra fingers, hands, or limbs
  - No blurry or out-of-focus areas unless intentionally bokeh
  - No AI-looking skin smoothing or plastic textures
  - No collage layouts or split-screen compositions"

After:
  "AVOID: text/watermarks/logos, distorted hands/fingers, {blur rule}, plastic AI skin, collage layouts."
```

**G. Add 504 as non-retryable + reduce retries with images (lines 260-262, 281)**

```typescript
const hasImages = !!(sourceImage || modelImage || sceneImage);
const maxRetries = hasImages ? 1 : 2;

// Inside the response handler:
if (response.status === 504) {
  throw { status: 504, message: "Generation timed out. Try fewer reference images or a simpler prompt." };
}
```

### Expected Impact

| Metric | Before | After |
|--------|--------|-------|
| Prompt length (full selfie+model+scene+brand) | ~4000 chars | ~1800 chars |
| Duplicate instructions | 10+ | 0 |
| Timeout risk | High (504s observed) | Lower |
| Retry waste on timeout | Up to 2 extra attempts | 0 (504 not retried) |

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | Consolidate redundant instructions, shorten all text blocks, trim image labels, add 504 handling, reduce retries with images |

