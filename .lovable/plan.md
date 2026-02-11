

## Fix: Rewrite Freestyle to Match Try-On's Proven Architecture

### The Core Problem

The Virtual Try-On works perfectly because it sends **one clean, structured prompt** (~400 words) with inline image references like `[PRODUCT IMAGE]` and `[MODEL IMAGE]`. The images are then simply appended to the content array without verbose labels.

The Freestyle function repeats the same instructions **3 separate times**:

1. **`polishUserPrompt`** -- "PRODUCT ACCURACY: reproduce with 100% fidelity..." + "MODEL IDENTITY: must be the EXACT same person..." + "ENVIRONMENT: MUST be placed in the EXACT environment..." (~1500 words)
2. **`buildContentArray` image labels** -- "PRODUCT/SOURCE REFERENCE IMAGE -- reproduce this exact product with 100% fidelity (shape, color, texture, branding, proportions):" (~50 words each, repeated for all 3 images)
3. **TASK SUMMARY block** -- "Generate ONE cohesive image that: 1. Features the EXACT product... 2. Uses the EXACT person..." (~100 words)

Plus a **PRIORITY ORDER** block repeating the hierarchy again. Total: ~2000+ words of mostly redundant text. The AI model gets confused by all these competing directives.

### Solution

Adopt the Try-On pattern: **one unified prompt with inline `[PRODUCT IMAGE]`, `[MODEL IMAGE]`, `[SCENE IMAGE]` references**, short image labels, and no redundant blocks.

### What Changes (single file: `supabase/functions/generate-freestyle/index.ts`)

#### A. Rewrite `polishUserPrompt` for multi-reference cases

When 2+ references are present, use a **single structured prompt** modeled after Try-On's `buildPrompt`:

```text
Professional photography: [user's prompt]

Create a photorealistic image combining the provided references.

REQUIREMENTS:
1. PRODUCT: Reproduce the exact product from [PRODUCT IMAGE] -- identical shape, color, 
   texture, branding. This is the highest priority.
2. MODEL: The person must be the exact individual from [MODEL IMAGE] -- same face, hair, 
   skin tone, body proportions. (model context if any)
3. SCENE: Place everything in the exact environment from [SCENE IMAGE] -- same background, 
   lighting, atmosphere.

Quality: Ultra high resolution, sharp focus, natural lighting, commercial-grade.
[Brand style if applicable -- 1-2 lines max]
[Camera style if natural -- 1 line]

Negative prompt: [standard negatives in one line]
```

This replaces the verbose multi-section approach (~1500 words) with a focused ~300 word prompt that mirrors Try-On's structure.

For **single-reference or no-reference** cases, the existing `polishUserPrompt` logic stays as-is (it works fine for those).

#### B. Simplify image labels in `buildContentArray`

Replace the verbose multi-sentence labels with short tags (like Try-On does):

| Current (~50 words each) | New (~3 words each) |
|---|---|
| "PRODUCT/SOURCE REFERENCE IMAGE -- reproduce this exact product with 100% fidelity (shape, color, texture, branding, proportions):" | "[PRODUCT IMAGE]" |
| "MODEL REFERENCE IMAGE -- use this EXACT person's face, hair, skin tone..." | "[MODEL IMAGE]" |
| "SCENE/ENVIRONMENT REFERENCE IMAGE -- You MUST place the subject IN this exact environment..." | "[SCENE IMAGE]" |

The detailed instructions are already in the prompt -- no need to repeat them on image labels.

#### C. Remove the TASK SUMMARY block

The task summary (lines 380-390) repeats what's already in the prompt. Remove it entirely.

#### D. Remove the PRIORITY ORDER block from `polishUserPrompt`

The priority order (lines 227-232) is now integrated into the unified prompt's numbered requirements. No separate block needed.

#### E. Auto-upgrade model for 2+ references

```typescript
const refCount = [body.sourceImage, body.modelImage, body.sceneImage].filter(Boolean).length;
const aiModel = (body.quality === "high" || refCount >= 2)
  ? "google/gemini-3-pro-image-preview"
  : "google/gemini-2.5-flash-image";
```

The flash model handles single-reference fine but the pro model produces much better results when merging 3 images.

### Before vs After (Token Count)

| Component | Before | After |
|-----------|--------|-------|
| Polished prompt | ~1500 words | ~300 words |
| Image labels | ~150 words (3 x 50) | ~10 words (3 x 3) |
| Task summary | ~100 words | Removed |
| Priority order | ~50 words | Integrated |
| **Total** | **~1800 words** | **~310 words** |

### What Stays the Same

- Single-reference and no-reference freestyle generations (text-only, product-only, model-only, scene-only) keep the current detailed polish -- it works well for those simpler cases
- Selfie/UGC detection and handling unchanged
- Brand profile integration (condensed to 1-2 lines in multi-ref mode)
- Camera style (natural/pro) handling
- Negative prompt system
- Batch consistency for multi-image requests
- All error handling, retries, content safety checks
- The frontend (`Freestyle.tsx`) needs no changes

### Technical Details

**File changed:** `supabase/functions/generate-freestyle/index.ts`

**Changes:**
1. Add early return in `polishUserPrompt` (around line 90) for multi-reference cases with a condensed Try-On-style prompt
2. Simplify image labels in `buildContentArray` (lines 352-378) to short `[PRODUCT IMAGE]`, `[MODEL IMAGE]`, `[SCENE IMAGE]` tags  
3. Remove TASK SUMMARY block (lines 380-390)
4. Remove PRIORITY ORDER block (lines 227-232)
5. Change model selection logic (lines 473-475) to auto-upgrade for 2+ references

