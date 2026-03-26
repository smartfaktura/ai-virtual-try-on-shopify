

# Clean Seedream Prompt Handling

## Problem
The prompt sent to Seedream contains Gemini-specific directives that a diffusion model interprets literally or ignores:

1. **Aspect ratio block** (line 946): `"Output aspect ratio: 1:1. CRITICAL: The image must fill the ENTIRE canvas..."` — Seedream handles this via its `size` API parameter, not prompt text
2. **Batch consistency / variation suffixes** — Gemini-specific meta-instructions that confuse diffusion models
3. **Image reference labels** like `[MODEL REFERENCE]`, `[PRODUCT REFERENCE]` — Seedream takes images as a separate `image` parameter, not inline; these labels become garbage text in the prompt
4. **No blanket "no text" rule** — user may intentionally want text rendered

## Solution

Add a `cleanPromptForSeedream()` function that strips Gemini-specific meta-instructions while preserving the user's creative intent (including any intentional text requests).

### Changes in `supabase/functions/generate-freestyle/index.ts`

**1. Add `cleanPromptForSeedream()` helper** (~15 lines):
- Strip the `"Output aspect ratio: ..."` block and everything after it (canvas-filling instructions) — Seedream handles aspect ratio via `size` param
- Strip `"BATCH CONSISTENCY: ..."` and `"Variation N: ..."` suffixes
- Strip image reference labels (`[MODEL REFERENCE]`, `[PRODUCT REFERENCE]`, `[SCENE REFERENCE]`, `[REFERENCE IMAGE]`, `[PRODUCT IMAGE]`) since Seedream receives images separately
- Keep ALL user prompt content, brand directives, quality instructions, framing, camera style — these are valid for any image model
- Do NOT add any "no text" directive — respect user intent

**2. Update `convertContentToSeedreamInput()`** (line 397):
- After joining text parts, run through `cleanPromptForSeedream()` before returning
- This is the single point where Seedream prompts are prepared, so cleanup only needs to happen here

### What stays the same
- The `polishUserPrompt()` function — its output is good photography direction that works for both models
- Brand profile, camera style, framing, quality directives — all valid for Seedream
- User's raw prompt text — never modified
- No "no text" blanket rule — if user types "add SALE text on banner", Seedream should try

### Example transformation
```text
Before (sent to Seedream today):
"Professional photography: Blonde woman in summer dress
REFERENCES:
1. MODEL: Match [MODEL REFERENCE] — same face...
2. SCENE: Use [SCENE REFERENCE] for environment...
QUALITY: Photorealistic. Shot on 85mm f/2.8...

Output aspect ratio: 1:1. CRITICAL: The image must fill the ENTIRE canvas...
BATCH CONSISTENCY: Maintain the same color palette..."

After cleanup:
"Professional photography: Blonde woman in summer dress
REFERENCES:
1. MODEL: Match the person from the reference — same face...
2. SCENE: Use the scene reference for environment...
QUALITY: Photorealistic. Shot on 85mm f/2.8..."
```

## Files Modified
- `supabase/functions/generate-freestyle/index.ts` — add cleanup helper, update `convertContentToSeedreamInput()`

