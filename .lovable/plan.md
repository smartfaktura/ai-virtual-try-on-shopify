

# Prompt Audit Round 2: Remaining Issues in Non-Fragrance Scenes

## Audit Methodology
Cross-referenced every scene's `prompt_template`, `scene_type`, and `trigger_blocks` against the prompt builder logic in `productImagePromptBuilder.ts` (lines 166-174 for camera map, 533-546 for camera resolution, 570-574 for negative prompt, 638-641 for person directive, 906-1005 for build flow).

## Issues Found

### 1. Wrong `scene_type` on Low-Angle & Negative Space scenes (22 scenes)
**All `low-angle-*` and `negative-space-*` scenes** have `scene_type: 'lifestyle'` which maps to `35mm f/4` lens (wide environmental). These are product-only studio shots — they should use `scene_type: 'packshot'` → `50mm f/8` for sharp, distortion-free product rendering.

**Affected (22 scenes)**:
- `low-angle-bags`, `low-angle-beauty`, `low-angle-makeup`, `low-angle-shoes`, `low-angle-hats`, `low-angle-home`, `low-angle-tech`, `low-angle-food`, `low-angle-supplements`, `low-angle-other`
- `negative-space-bags`, `negative-space-beauty`, `negative-space-makeup`, `negative-space-shoes`, `negative-space-hats`, `negative-space-home`, `negative-space-tech`, `negative-space-food`, `negative-space-supplements`, `negative-space-other`, `negative-space-garments`

**Fix**: Change `scene_type` to `'packshot'` for all 22.

### 2. Wrong `scene_type` on Flat Lay Styled scenes (5 scenes)
`flat-lay-styled-bags`, `flat-lay-styled-hats`, `flat-lay-styled-shoes`, `flat-lay-styled-other`, `styled-outfit-flat-lay-garments` have `scene_type: 'lifestyle'` but are overhead flat lay compositions. Should be `'flatlay'` → `35mm f/5.6 overhead`.

**Fix**: Change `scene_type` to `'flatlay'` for all 5.

### 3. Missing `trigger_blocks` on lifestyle scenes needing background control (3 scenes)
These scenes describe environmental context but have empty `trigger_blocks`, meaning the user's background settings won't apply:
- `vignette-scene-home` — describes "marble countertop, wooden shelf" but user can't override background
- `ingredients-spread-food` — overhead styled composition, user should control background
- `flat-lay-styled-bags` / `flat-lay-styled-hats` / `flat-lay-styled-shoes` / `flat-lay-styled-other` — flat lay compositions where background matters

**Fix**: Add `['background']` to `trigger_blocks` for these 6 scenes.

### 4. `in-hand-lifestyle-beauty` and `in-hand-lifestyle-makeup` — `{{personDirective}}` at END instead of START
Both templates have `{{personDirective}}` as the last token. For model injection (where `[MODEL IMAGE]` needs to be early for the AI to anchor to the face), the person directive should come first — same pattern as `near-face-hold-beauty` and `mid-portrait-hold-bags` which correctly start with `{{personDirective}}`.

**Fix**: Move `{{personDirective}}` from end to start of prompt template for both scenes.

### 5. `tabletop-lifestyle-home` still has hardcoded props
Current: `"marble countertop, wooden shelf, or linen-draped table — with minimal complementary props (plant sprig, candle, small tray)"`
This is too specific and will force the same props regardless of product type (e.g., a metal lamp doesn't need candles).

**Fix**: Generalize to `"styled surface with minimal complementary objects appropriate to the product"`.

### 6. `capsule-spill-supplements` missing `requires_extra_reference` flag
The scene says "container open and capsules spilling out" — the AI can't know what the capsules look like from the closed container photo. The user should upload an extra reference of the open container.

**Fix**: Set `requires_extra_reference = true`. (Was in the previous plan but appears not applied — currently `false`.)

### 7. `open-product-makeup` missing `requires_extra_reference` flag
Same issue — "lipstick fully extended", "compact opened" requires seeing the open state. Currently `requires_extra_reference: false`.

**Fix**: Set `requires_extra_reference = true`.

### 8. Back View scenes inconsistent token usage
`back-view-bags` uses `{{lightingDirective}} {{materialTexture}}. {{shadowDirective}}` (dynamic, user-controlled). But `back-view-food` and `back-view-supplements` skip `{{materialTexture}}` and `{{shadowDirective}}`. All back views should consistently use the full token set so user preferences apply uniformly.

**Fix**: Add `{{materialTexture}}. {{shadowDirective}}` to `back-view-food` and `back-view-supplements` prompts.

### 9. `on-foot-lifestyle-shoes` framing issue
Current prompt says `"Frame from mid-calf down"` and `"No full body above waist"` — but the prompt builder will also inject `resolveBodyFramingDirective('shoes')` = `"Three-quarter to full-body shot — model visible from head to below the knees, shoes clearly visible and in-frame."` This CONTRADICTS the template's tight framing.

**Fix**: The body framing directive is only injected if `{{bodyFramingDirective}}` token exists in the template (template-led, line 973-976). Since this template doesn't use that token, no conflict. **No fix needed** — confirmed safe.

### 10. `movement-shot-garments` scene_type should be `editorial`
Currently `scene_type: 'portrait'` (85mm f/2 — tight, shallow DOF). A walking motion shot needs wider framing: `'editorial'` → `50mm f/2.8` is better for capturing full garment movement.

**Fix**: Change `scene_type` to `'editorial'`.

### 11. Missing `[PRODUCT IMAGE]` on a few In-Hand Lifestyle scenes
`in-hand-lifestyle-beauty` starts with `[PRODUCT IMAGE]` ✅, `in-hand-lifestyle-makeup` starts with `[PRODUCT IMAGE]` ✅. These are fine.

However, checking other lifestyle scenes: `vignette-scene-home` starts with `[PRODUCT IMAGE]` ✅, `tabletop-lifestyle-home` starts with `[PRODUCT IMAGE]` ✅. All good.

### 12. `on-model-lifestyle-garments` has `scene_type: 'lifestyle'` — correct?
This scene has `trigger_blocks: ['background', 'personDetails']` and uses `{{personDirective}}`. The `lifestyle` type gives 35mm f/4 — appropriate for environmental on-model shots. ✅ Correct.

## Summary of Changes

| # | Change | Scenes Affected |
|---|--------|----------------|
| 1 | `scene_type` → `'packshot'` | 22 (low-angle + negative-space) |
| 2 | `scene_type` → `'flatlay'` | 5 (flat-lay-styled + styled-outfit) |
| 3 | `trigger_blocks` → `['background']` | 6 (vignette, ingredients, flat-lays) |
| 4 | Move `{{personDirective}}` to start | 2 (in-hand-lifestyle beauty + makeup) |
| 5 | Generalize hardcoded props | 1 (tabletop-lifestyle-home) |
| 6 | `requires_extra_reference` → `true` | 2 (capsule-spill, open-product-makeup) |
| 7 | Add missing tokens to back-view | 2 (back-view-food, back-view-supplements) |
| 8 | `scene_type` → `'editorial'` | 1 (movement-shot-garments) |
| **Total** | | **~41 UPDATE statements** |

## Implementation
All database UPDATEs via the insert tool. No frontend code changes.

