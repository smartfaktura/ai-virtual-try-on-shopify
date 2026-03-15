

## Product Perspectives: Prompt Engineering Audit & Fixes

### Issues Found

#### Bug 1 — Generic polisher overrides perspective instructions
The hook sends `polishPrompt: true`, so the freestyle function runs the generic `polishUserPrompt()` which injects "Use a creative product photography angle — overhead, 45-degree, low-angle, or dramatic perspective" (line 305). This **directly contradicts** the specific angle instruction like "Rear view" or "Left side profile at 90 degrees". The AI gets conflicting directives.

#### Bug 2 — Reference image treated as "scene inspiration" instead of "same product, different angle"
When a user uploads a back-view reference photo, it's sent as `sourceImage`. The condensed multi-ref path (line 160) labels it: *"[REFERENCE IMAGE] is ONLY for setting/mood/style/scene inspiration"*. But this reference IS the same product from a different angle — the model should use it for product identity, not scene mood.

#### Bug 3 — Workflow `system_instructions` are completely ignored
The DB stores: *"Generate a photorealistic product image from the specified angle/perspective. Maintain the exact product identity..."* — but the hook never reads or passes `system_instructions` to the generation function.

#### Bug 4 — Flash model used by default, perspectives need precision
Without a reference image, `refCount = 1`, so the AI model defaults to `gemini-3.1-flash-image-preview`. Perspective accuracy (maintaining product identity from a new angle) requires the pro model.

#### Bug 5 — No cross-angle consistency
Each angle is enqueued as a separate job with no shared context. There's no instruction to maintain consistent lighting, environment, or color grading across the set.

#### Bug 6 — "Reimagine the visual" instruction fights product fidelity
The polisher adds: *"Create a NEW photograph... Do NOT replicate the reference photo's framing or camera angle. Reimagine it with fresh creative direction."* For perspectives, we **want** a specific camera angle — the variation instruction defines it precisely.

---

### Fix Plan

#### 1. `src/hooks/useGeneratePerspectives.ts` — Flag perspective jobs + pass system instructions

- Add `isPerspective: true` to the payload so the freestyle function can detect and handle it
- Pass `systemInstructions` from the workflow config
- Rewrite `variationPrompt` to be the **sole** creative directive (no generic wrapping)
- Set `polishPrompt: false` to skip the generic polisher entirely — instead, build the full prompt here with perspective-specific rules
- Force `quality: 'high'` equivalent model hint via a `forceProModel: true` flag
- When reference image exists, pass it as `referenceAngleImage` (new field) instead of `sourceImage` to distinguish "same product, different angle" from "scene inspiration"

New prompt structure built in the hook:
```
[System instructions from workflow config]

PERSPECTIVE DIRECTIVE: {variation.instruction}

PRODUCT IDENTITY — STRICT: The product in this image must be the EXACT same product 
from [PRODUCT IMAGE]. Preserve every detail: shape, material, color, texture, logo, 
hardware, stitching. Do NOT alter, simplify, or "reimagine" any design element. 
The ONLY change is the camera angle/perspective as described above.

{if referenceImage} ANGLE REFERENCE: [REFERENCE IMAGE] shows the same product from 
the requested angle. Use it to understand the product's appearance from this 
perspective — back construction, side profile shape, etc. This is NOT scene 
inspiration — it is a product identity reference for this specific angle. {/if}

ENVIRONMENT CONSISTENCY: Maintain a clean, professional studio environment with 
neutral lighting. The lighting direction, color temperature, and background must 
be consistent as if all angles were shot in the same session.

Photography DNA + negatives (appended directly, not via polisher)
```

#### 2. `supabase/functions/generate-freestyle/index.ts` — Handle perspective jobs

- Detect `isPerspective: true` in the payload
- Skip `polishUserPrompt()` entirely for perspective jobs — the hook already built the full prompt
- Force `google/gemini-3-pro-image-preview` model for perspective jobs regardless of ref count
- When `referenceAngleImage` is present, label it `[REFERENCE IMAGE]` in `buildContentArray` but with angle-aware semantics (the prompt already handles this)

#### 3. `src/pages/Perspectives.tsx` — Default quality to high

- Change `quality` initial state from `'standard'` to `'high'`

### File changes

| File | Change |
|------|--------|
| `src/hooks/useGeneratePerspectives.ts` | Build perspective-specific prompt with strict identity rules, skip polisher, add `isPerspective`/`forceProModel` flags, pass system instructions |
| `supabase/functions/generate-freestyle/index.ts` | Detect `isPerspective`, skip polish, force pro model, handle `referenceAngleImage` |
| `src/pages/Perspectives.tsx` | Default quality to `'high'` |

