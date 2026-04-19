
## Investigation: is the outfit overriding the scene's editorial direction?

User's concern: outfit now appears, but it feels like it's dominating the shot — overriding scene's color palette, pose, lighting mood, composition. Need to verify how the auto-injected directive is placed in the prompt.

### What I need to check

1. **Where in the prompt the fallback directive lands** — Phase 3a fix appends outfit at the END of the prompt with `prompt += ' ' + directive`. End-of-prompt instructions get HIGH weight in Gemini → likely the cause.
2. **What the directive string actually says** — `defaultOutfitDirective()` may be too prescriptive (e.g., dictating colors that fight scene's `aestheticColor`, or adding pose/styling language that competes with scene direction).
3. **Token-equipped scenes** — where `{{outfitDirective}}` IS placed inside templates (typically mid-prompt, framed as wardrobe note, not styling direction). Compare phrasing + position.

### Hypothesis

The fallback path does two things wrong vs. the token path:
- **Position**: appended at end → reads as the most important instruction
- **Phrasing**: likely uses imperative wardrobe language ("wearing X, Y, Z") without the softening framing that template-embedded directives have ("Wardrobe note: model wears...")

This makes Gemini treat the outfit as the hero of the shot instead of as a wardrobe spec subordinate to the scene's editorial direction (lighting, color story, pose, composition all set by the scene template).

### Proposed fix (Phase 3b — small, surgical)

Adjust the fallback injection to be **scene-subordinate**:

1. **Insert position** — place directive RIGHT AFTER the product anchor block (early in prompt, near `[PRODUCT]` / `{{personDirective}}`), not at the end. Matches where token-based templates put it.
2. **Phrasing** — wrap as a non-dominant wardrobe note: `"Wardrobe (do not alter scene mood, lighting, or color palette): model wears [outfit]. Scene direction, pose, framing, and color story below take priority."`
3. **Strip color-conflict risk** — if scene template contains `{{aestheticColor}}` or similar, the outfit color words must NOT override the resolved aesthetic palette. Add a one-liner safeguard: `"Outfit colors are accents only; overall image color palette is set by scene direction above."`
4. **Keep pose/composition out of outfit string** — `defaultOutfitDirective` should describe ONLY garments + colors + materials, never pose, framing, or mood. Audit and strip any styling adjectives that crept in.

### Files to inspect (read-only this turn)
- `src/lib/productImagePromptBuilder.ts` — the fallback injection block + `defaultOutfitDirective` function
- One token-equipped scene template from `custom_scenes` to compare phrasing/position

### Files touched (next turn, after approval)
- `src/lib/productImagePromptBuilder.ts` — adjust fallback position + wrap phrasing + audit `defaultOutfitDirective`

### Risk
Very low. Same fallback path, just better placement + softer framing. Token-equipped scenes unaffected (they bypass this path entirely).

### After fix — what user should see
- Scene's editorial mood, lighting, color palette stay intact (e.g., "Interior Window Light Editorial" keeps its warm window-light direction)
- Outfit pieces appear on the model as wardrobe, not as the styling brief
- Aesthetic color tokens still control overall palette; outfit colors read as accents
