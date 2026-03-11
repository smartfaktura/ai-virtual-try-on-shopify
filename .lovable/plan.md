

## Fix: Resolution Selector for Workflows, Credit Display, and Image Quality

### Issues Found

**1. Workflows have no resolution selector — always hardcoded to 2K**
The workflow `generateImage()` function hardcodes `"OUTPUT RESOLUTION: 2048 pixels"` in the prompt text (line 554) and `imageSize: "2K"` in `image_config` (line 582). But the `image_config.imageSize` parameter is silently ignored by the Lovable AI Gateway (it's not an OpenAI-compatible parameter). The prompt instruction alone is not reliably producing 2K output — Gemini image generation models don't honor text-based resolution requests; they output at their native resolution.

**The real resolution problem**: The Lovable AI Gateway does not support an `imageSize` or resolution parameter. The prompt-based "OUTPUT RESOLUTION" instruction is a hint that the model may or may not follow. This is a fundamental limitation — we cannot guarantee exact pixel dimensions through this API. However, we can still offer the selector and use the prompt hint, which does influence output in many cases.

**2. Workflow credit display shows wrong total label**
Line 3577: `Virtual Try-On: {creditCost} credits` shows "Virtual Try-On: 32 credits" even when creditCost is 8. The `creditCost` calculation on line 1360 is: `parseInt(imageCount) * 8 * tryOnSceneCount`. For try-on, `imageCount` defaults to "1" as a string but may have a stale value. The real issue: the header says "Virtual Try-On: 32 credits" when 1 image × 1 scene = 8 credits. Need to verify the `imageCount` state — it might be "4" from a previous workflow selection.

Actually looking more carefully: `creditCost = singleProductCreditCost * multiProductCount` and `singleProductCreditCost = parseInt(imageCount) * 8 * tryOnSceneCount`. The `imageCount` state might carry over from a previous workflow. But the user's specific request is simpler: **don't show the "Virtual Try-On: 32 credits" header line — just show "Total Credits"**.

**3. Freestyle should default to 1K, not auto-set 2K for pro quality**
Currently line 140: `if (q === 'high') setResolution('2K')` auto-bumps resolution. User wants manual control — remove auto-bump.

### Plan

**A. Add resolution selector to all workflows (Generate.tsx)**
- Add `workflowResolution` state: `'1K' | '2K' | '4K'`, default `'1K'`
- Add a resolution selector UI in the workflow settings step (near aspect ratio selector)
- Update `creditCost` calculation: instead of flat 8 credits, use resolution-based pricing (4/8/12 per image) same as freestyle
- Pass `resolution` in the workflow payload to `enqueue-generation`
- Update credit display text to show resolution-based cost

**B. Fix workflow credit display (Generate.tsx)**
- Line 3577: Remove the "Virtual Try-On: {creditCost} credits" header. Just show "Total: {creditCost} credits" consistently
- Same for workflow summaries — just show total, with breakdown below

**C. Pass resolution through workflow backend (generate-workflow/index.ts)**
- Read `resolution` from payload (default '1K')
- Dynamically set the resolution instruction in the prompt based on selection
- Use pro model for 2K/4K, standard for 1K

**D. Pass resolution through try-on backend (generate-tryon/index.ts)**
- Same: read resolution from payload, dynamically set prompt instruction
- Default to 1K instead of hardcoded 2K

**E. Fix freestyle auto-bump (Freestyle.tsx)**
- Remove `if (q === 'high') setResolution('2K')` on line 140

**F. Update enqueue-generation credit calc**
- Workflows and try-on should also use resolution-based pricing (4/8/12) instead of flat 8

### Files to Change

1. **`src/pages/Generate.tsx`** — Add resolution state, selector UI, update credit calc and display
2. **`src/pages/Freestyle.tsx`** — Remove auto-bump to 2K
3. **`supabase/functions/generate-workflow/index.ts`** — Dynamic resolution in prompt
4. **`supabase/functions/generate-tryon/index.ts`** — Dynamic resolution in prompt  
5. **`supabase/functions/enqueue-generation/index.ts`** — Resolution-based pricing for workflows/tryon
6. **`src/contexts/CreditContext.tsx`** — Update `calculateCost` to accept resolution parameter

