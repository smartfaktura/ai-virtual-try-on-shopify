

# Prompt Audit Round 3: Remaining Issues in Non-Fragrance Scenes

After three prior rounds of fixes, I found **8 remaining issues** across the 184 non-fragrance scenes.

---

## Issues Found

### 1. Wrong `scene_type` on garment flat lay scenes (2 scenes)
`front-flat-lay-garments` and `back-flat-lay-garments` have `scene_type: 'packshot'` (→ 50mm f/8 lens, standard angle). But their prompts say "strict overhead flat lay composition" — they are clearly overhead shots and need `scene_type: 'flatlay'` (→ 35mm f/5.6 overhead, even sharpness across the flat surface).

**Fix**: Change `scene_type` to `'flatlay'` for both.

### 2. `wellness-lifestyle-supplements` has wrong `trigger_blocks`
Currently: `{background, personDetails}`. But the prompt is a **product-only lifestyle** scene — "placed naturally beside a water bottle on a gym bench." There is no `{{personDirective}}` in the template, no `[MODEL IMAGE]` reference, and no model is needed. Having `personDetails` in the trigger causes the UI to show the model/outfit selection panel unnecessarily.

**Fix**: Change `trigger_blocks` to `{background}` only.

### 3. `ingredients-spread-food` has wrong `scene_type`
Currently `lifestyle` (35mm f/4 wide angle). But the prompt says "photographed from above in a flat lay composition" — this is an overhead shot that should use `scene_type: 'flatlay'` (35mm f/5.6 overhead, even sharpness).

**Fix**: Change `scene_type` to `'flatlay'`.

### 4. `swatch-detail-makeup` references "forearm" without `personDetails` trigger
The prompt says "color swatched on skin or a clean surface" and may show swatches on a forearm, but `trigger_blocks` is empty. If the AI renders a forearm, the `personDirective` token won't resolve and no model/skin-tone preferences will apply. Since the swatch can also be on a clean surface (not requiring a person), the safer fix is to clarify the prompt to prefer surfaces over skin.

**Fix**: Update prompt to emphasize "clean surface, marble slab, or paper" rather than skin, keeping it a product-only macro shot. This avoids needing person triggers for a color swatch.

### 5. `pair-display-shoes` — AI must generate mirrored shoe from single reference
The prompt says "both the left and right shoe arranged together as a pair." Users upload a single shoe. The AI must generate the matching pair — this should be explicitly stated.

**Fix**: Add to prompt: "Generate the matching opposite-foot shoe mirrored from the reference — same design, same color, same material."

### 6. `on-foot-lifestyle-shoes` — `scene_type: 'lifestyle'` but shows lower-leg close framing
The prompt says "Frame from mid-calf down" and "No full body above waist" — this is tight framing on the foot area. `lifestyle` (35mm f/4 wide) is too wide for this crop. Should be `portrait` (85mm f/2) for tight lower-body framing matching the prompt intent.

**Fix**: Change `scene_type` to `'portrait'`.

### 7. `in-hand-lifestyle-bags` has `{{personDirective}}` at the end
The prompt ends with `{{personDirective}}`. For model injection (where `[MODEL IMAGE]` anchoring works best early in the prompt), `{{personDirective}}` should be at the start — same pattern as the already-fixed beauty and makeup versions.

**Fix**: Move `{{personDirective}}` from end to start of the template.

### 8. `in-hand-lifestyle-*` (hats, supplements, other) — same `{{personDirective}}` position issue
`in-hand-lifestyle-hats`, `in-hand-lifestyle-supplements`, `in-hand-lifestyle-other` all have `{{personDirective}}` at the very end. Needs to be moved to the start.

**Fix**: Move `{{personDirective}}` from end to start for all three.

---

## Summary

| # | Change | Scenes |
|---|--------|--------|
| 1 | `scene_type` → `'flatlay'` | 2 (front/back-flat-lay-garments) |
| 2 | `trigger_blocks` → `{background}` only | 1 (wellness-lifestyle-supplements) |
| 3 | `scene_type` → `'flatlay'` | 1 (ingredients-spread-food) |
| 4 | Prompt update: surface-only swatch | 1 (swatch-detail-makeup) |
| 5 | Prompt update: add pair-generation instruction | 1 (pair-display-shoes) |
| 6 | `scene_type` → `'portrait'` | 1 (on-foot-lifestyle-shoes) |
| 7-8 | Move `{{personDirective}}` to start | 4 (in-hand-lifestyle bags/hats/supplements/other) |
| **Total** | | **11 UPDATE statements** |

All changes are database UPDATEs. No frontend code changes.

