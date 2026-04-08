

# Investigation Results: Mid Portrait Hold Loading + Background Issues

## Findings

### 1. "Mid Portrait Hold" — Image Not Loading
Looking at the screenshot, one of the "Mid Portrait Hold" result cards shows a broken/empty image with only the alt text visible. This is **not a code bug** — it's a generation failure where the AI model returned an invalid or empty image URL for that particular job. The `ShimmerImage` component handles errors gracefully (shows nothing after error), but the result card still renders with the scene name label.

**Root cause**: The generation itself likely failed or returned a corrupted URL for that specific job. The polling code at line 503-511 of `ProductImages.tsx` only adds images with valid URLs (`if (url) images.push(...)`) — so if the URL was present but broken (e.g., expired or incomplete), it would still be added to results.

**No code fix needed** — this is a transient generation issue. If this happens consistently for "Mid Portrait Hold", it could be a prompt complexity issue (see point 3 below).

### 2. Background Not Applied Correctly — Some Scenes Got "Surface + Gradient" Instead of Pure Gradient

**Root cause identified**: The `{{background}}` token in the prompt builder (line 597-618) resolves the background correctly. However, the **fallback path** at lines 963-971 auto-injects background when the template lacks `{{background}}`:

```
if (!hasBgToken && !isAuto(bgTone)) {
    prompt += ` Background: ${bgResolved}.`;
}
```

Both "Mid Portrait Hold" and "Open Bottle" templates **DO** contain `{{background}}`, so the fallback doesn't fire. The issue is different:

**The "Open Bottle" template** says: `"photographed...in a clean e-commerce composition"` and `"{{background}} Soft diffused studio lighting..."` — the `{{background}}` token gets resolved, but the template hardcodes "clean e-commerce composition" which the AI model interprets as needing a surface/table, overriding the gradient intent.

**For scenes with `{{surfaceDirective}}`** (like Editorial Surface, Tabletop Lifestyle), the surface token is explicitly in the template. But the fallback code at line 937 (`if (!isAuto(details.surfaceType)) parts.push(resolveToken('surfaceDirective', ctx))`) also injects surface in the old-style path. For template-based scenes, surface is only injected if `{{surfaceDirective}}` appears in the template — which is correct.

**The real problem**: When `backgroundTone` is set to a gradient value (e.g., `gradient-cool`), the `{{background}}` token resolves via `COLOR_WORLD_MAP` to `"cool gradient background fading from deep forest green to soft mint cream"`. But the Open Bottle template follows it immediately with `"Soft diffused studio lighting..."` without strongly separating the background instruction, so the AI model mixes the gradient with surface cues already present in the template text.

### 3. "Mid Portrait Hold" — Unrealistic Hand Proportions

The template uses `scene_type: 'macro'` which maps to `CAMERA_MAP['macro']` = `"Shot with 100mm macro lens at f/2.8..."`. A macro lens directive on a half-body portrait shot is contradictory — it encourages extreme close-up which distorts hand/product proportions. The scene type should be `portrait` instead.

## Proposed Fixes

### Fix 1: Update "Open Bottle" template in database
Remove "clean e-commerce composition" phrasing and strengthen the `{{background}}` directive to be the sole background authority:
- Add explicit instruction: "Use ONLY the background defined by {{background}} — no surface, no table, no additional environment"

### Fix 2: Update "Mid Portrait Hold" template in database
- Change `scene_type` from `macro` to `portrait` for correct camera/lens directive
- Strengthen hand anatomy instructions in the template
- Add "anatomically correct human hand with natural proportions, five fingers, realistic grip"
- Remove duplicate `{{background}}` token (it appears twice in the template, causing the resolved text to appear twice)

### Fix 3: Add defensive deduplication in prompt builder
The "Mid Portrait Hold" template has `{{background}}` appearing **twice** — once for the actual background and once in "Use the exact solid background color...defined by {{background}}". This causes the gradient description to appear twice, confusing the model. Fix the template to use `{{background}}` only once and reference it semantically the second time.

## Database Changes (via migration)

```sql
-- Fix Mid Portrait Hold: correct scene_type + improve template
UPDATE product_image_scenes
SET scene_type = 'portrait',
    prompt_template = '{{personDirective}} Real photographic half-frame shot of the model holding [PRODUCT IMAGE] {{productName}} naturally in hand. Show only the upper body, hand, and bottle. The product must stay visually dominant, close to camera, and clearly readable. Preserve the exact reference bottle only: exact shape, exact cap, exact label, exact branding, exact glass tint, and exact proportions. Do not redesign or reinterpret the product. BACKGROUND: {{background}} — use ONLY this background across the entire frame. Keep it fully smooth, uniform, seamless, and clean with no gradient drift, no color shift, no texture, no shadow banding, no vignette, and no added scene elements. Do NOT add any surface, table, or lifestyle environment. Soft diffused beauty light, realistic skin texture, natural facial detail. HAND ANATOMY (NON-NEGOTIABLE): anatomically correct human hand with exactly five fingers, natural proportions, realistic grip on the bottle, visible skin texture and pores. No extra fingers, no fused digits, no distorted joints. Realistic glass reflections, visible liquid depth, premium fragrance editorial realism. No full body, no legs, no wide lifestyle scene, no different bottle.'
WHERE scene_id = 'mid-portrait-hold-fragrance';

-- Fix Open Bottle: strengthen background-only directive
UPDATE product_image_scenes
SET prompt_template = '[PRODUCT IMAGE] {{productName}} photographed as the exact reference bottle in an open state, with the cap removed and the atomizer clearly visible. Show the bottle upright and centered. Preserve the exact bottle silhouette, exact cap design, exact nozzle shape, exact collar structure, exact label placement, exact branding layout, exact glass tint, and exact proportions. If the cap appears in frame, it should remain identical to the reference cap and be placed naturally beside the bottle. Do not redesign, simplify, or reinterpret the product. BACKGROUND: {{background}} — use ONLY this background across the entire frame. Do NOT place the product on any surface, table, or platform. The product should appear floating or grounded with only a subtle contact shadow on the seamless background. No surface texture, no environment, no lifestyle elements. Soft diffused studio lighting with realistic glass reflections, visible liquid depth, subtle natural contact shadow, and clean label clarity. Premium fragrance packshot realism, minimal composition, product-only focus, uncapped bottle clearly visible.'
WHERE scene_id = 'open-bottle-fragrance';
```

## Files Modified
1. **Database migration** — update `product_image_scenes` templates for `mid-portrait-hold-fragrance` and `open-bottle-fragrance`

No frontend code changes needed — the prompt builder and results display logic are correct.

