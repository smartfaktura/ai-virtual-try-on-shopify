
## Investigation: outfit selections not appearing in generated image

User generated a "Black Ruched Crop Top" but the outfit pieces they picked in Step 3 (bottom, shoes, etc.) didn't show up in the final image. Let me trace why.

### Likely root causes (ranked)

**1. Most likely — Template missing `{{outfitDirective}}` token**
From memory `mem://features/product-images/product-aware-outfit-system`: outfit pieces only reach the AI when the scene template explicitly contains the `{{outfitDirective}}` token. The plan called this out as deferred work ("~509 templates missing the token"). The scene "Interior Window Light Editorial" (visible in edge logs) is likely one of them → outfit data is built correctly but never injected into the final prompt sent to Gemini.

**2. Possible — `wantsPeople` flag not triggered**
From `mem://tech-stack/generation-character-and-anatomical-consistency`: outfit only renders if the engine flags the scene as needing a person. If the scene template doesn't trigger that flag, the model generates product-only and skips outfit entirely.

**3. Possible — New extended slots not picked up by prompt builder**
Phase 1 updated `productImagePromptBuilder.ts`, but the actual string assembly may still read only the legacy `top/bottom/shoes` keys when building the directive that goes into `{{outfitDirective}}`. Worth grepping.

**4. Less likely — Crop top locks `top` slot, user only added accessories below**
If the resolver locked `top` to the crop top and the user expected the locked slot itself to add styling (it can't — it IS the product), some confusion is normal. But the user says "nothing showing as I selected" implying they did pick other slots.

### Investigation steps (read-only, this turn)

1. Grep `{{outfitDirective}}` across `custom_scenes.prompt_template` and built-in scene templates to confirm coverage gap
2. Read `productImagePromptBuilder.ts` to see if `buildStructuredOutfitString` is called, and whether the result is actually placed into the final prompt for scenes WITHOUT the token (fallback)
3. Check the latest `generation_jobs` row for this user to see the final assembled prompt that was sent
4. Check `wantsPeople` detection logic for "Interior Window Light Editorial"

### Proposed fix (Phase 3a — small, safe)

**Make outfit injection automatic when token is missing:**

If a scene needs people (`wantsPeople = true`) AND the template has no `{{outfitDirective}}` token AND the user provided outfit data → the prompt builder appends the directive automatically at the end of the prompt (e.g., "Model is wearing: black wide-leg trousers, white sneakers, gold hoops").

This:
- Fixes the immediate bug (user's selections render no matter what scene they picked)
- Avoids touching all 500+ templates
- Has zero impact on scenes that already have the token (the token-based injection still wins, fallback only activates when token is absent)
- Has zero impact on product-only scenes (`wantsPeople = false` → directive skipped, just like today)

**Files touched:**
- `src/lib/productImagePromptBuilder.ts` — single function, ~15-line addition

### After confirmation

Once I'm in default mode I'll:
1. Read the 3 files above to confirm the diagnosis
2. Pull the saved prompt from the user's last `generation_jobs` row to see exactly what was sent
3. Apply the fix only if diagnosis confirms it
4. Report back what the actual injected prompt looks like for their next generation

### Risk
Very low. Pure additive logic — adds a fallback path; doesn't change existing behavior for token-equipped scenes.
