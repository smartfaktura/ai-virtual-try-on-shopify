

# Prompt Audit: All Non-Fragrance Product Image Scenes

## Methodology
I compared every non-fragrance prompt template against:
1. The proven fragrance templates (the "gold standard")
2. The prompt builder logic in `productImagePromptBuilder.ts` — how tokens are resolved, what gets auto-injected, and what doesn't
3. The server-side generation flow — how `[PRODUCT IMAGE]` and `[MODEL IMAGE]` are handled

## Critical Systemic Issues (Affect Multiple Categories)

### Issue 1: Missing `[PRODUCT IMAGE]` anchor on packshot scenes
**Affected**: Front View, Angle View, Side View, Back View across ALL categories (bags, shoes, hats, home, tech, food, supplements, other)
**Problem**: These scenes start with `{{productName}} photographed in...` but do NOT include `[PRODUCT IMAGE]`. The fragrance Front View also omits it, BUT fragrance products are more recognizable. For generic products like bags, shoes, tech — the AI has less to anchor to and may hallucinate designs.
**Fix**: Add `[PRODUCT IMAGE]` at the start of all packshot templates to anchor the AI to the actual reference photo.

### Issue 2: Missing `trigger_blocks` on portrait/model scenes
**Affected**: All scenes with `{{personDirective}}` and `[MODEL IMAGE]` references
**Problem**: Many portrait scenes have `trigger_blocks: []` (empty) instead of `['personDetails']` or `['background', 'personDetails']`. The `personDirective` token only generates meaningful output when `personDetails` is in trigger_blocks (see line 639 of promptBuilder). Without it, `{{personDirective}}` resolves to an empty string, and the model/outfit system doesn't activate.
**Scenes affected**:
- `in-hand-studio-bags` — has `{{personDirective}}` but trigger_blocks is `[]`
- `in-hand-studio-beauty` — same
- `in-hand-studio-makeup` — same
- `in-hand-studio-shoes` — same
- `in-hand-studio-hats` — same
- `in-hand-studio-tech` — same
- `in-hand-studio-food` — same
- `in-hand-studio-supplements` — same
- `in-hand-studio-other` — same
- `in-hand-lifestyle-hats` — same
- `in-hand-lifestyle-food` (if exists) — same
- `in-hand-lifestyle-supplements` — same
- `in-hand-lifestyle-other` — same
**Fix**: Add `['background', 'personDetails']` to trigger_blocks for all in-hand and portrait scenes.

### Issue 3: Missing `trigger_blocks` on model-dependent scenes
**Affected**: All on-model, worn, editorial, and application scenes
**Problem**: Scenes like `on-model-front-garments`, `worn-portrait-hats`, `on-shoulder-bags`, `application-beauty`, `application-makeup`, `on-foot-studio-shoes`, `on-foot-lifestyle-shoes`, `on-model-editorial-garments`, `movement-shot-garments`, `on-body-lifestyle-hats`, `on-model-lifestyle-garments` all have `trigger_blocks: []` but reference `{{personDirective}}`, `[MODEL IMAGE]`, and model-dependent composition.
**Fix**: Add `['background', 'personDetails']` to all of these.

### Issue 4: Inconsistent `scene_type` assignments
**Problem**: Several scenes have incorrect `scene_type` which controls the camera lens directive (line 167-174 of promptBuilder):
- `top-view-*` scenes are `lifestyle` but should be `packshot` or `flatlay` (they're overhead product shots, not environmental)
- `in-hand-lifestyle-*` scenes are `lifestyle` (35mm f/4) but show close hand+product — should be `portrait` (85mm f/2)
- `on-body-lifestyle-hats` is `portrait` which is correct
- `serving-suggestion-food` is `lifestyle` — correct
- `pour-action-food` is `lifestyle` — correct
- `capsule-spill-supplements` is `macro` — correct
- `on-foot-lifestyle-shoes` is `lifestyle` — correct (environmental)

### Issue 5: `Back View` scenes use unresolved tokens
**Affected**: `back-view-shoes`, some others
**Problem**: `back-view-shoes` uses `{{lightingDirective}} {{materialTexture}}. {{shadowDirective}}` which IS correct — these resolve via the token system. However, other Back View scenes (bags, hats, home, tech) DON'T use these tokens and instead hardcode lighting. This is inconsistent but not broken — just means shoes Back View responds to user lighting preferences while others don't.

## Category-Specific Issues

### Beauty & Skincare
| Scene | Issue | Fix |
|-------|-------|-----|
| `front-view-beauty` | Missing `[PRODUCT IMAGE]` | Add at start |
| `angle-view-beauty` | Missing `[PRODUCT IMAGE]` | Add at start |
| `side-view-beauty` | Missing `[PRODUCT IMAGE]` | Add at start |
| `in-hand-studio-beauty` | trigger_blocks empty, personDirective won't resolve | Set to `['background', 'personDetails']` |
| `near-face-hold-beauty` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `application-beauty` | trigger_blocks empty; says "applying product to the face or skin" — too vague for skincare | Set trigger_blocks to `['background', 'personDetails']`; specify "applying cream/serum to cheek, forehead, or décolletage" |
| `texture-swatch-beauty` | Good template, but missing `[PRODUCT IMAGE]` reference | Add `[PRODUCT IMAGE]` anchor |
| `in-hand-lifestyle-beauty` | trigger_blocks empty | Set to `['personDetails']` |
| `back-view-beauty` | Missing `[PRODUCT IMAGE]` | Add at start |

### Makeup & Lipsticks
| Scene | Issue | Fix |
|-------|-------|-----|
| `front-view-makeup` | Missing `[PRODUCT IMAGE]` | Add at start |
| `in-hand-studio-makeup` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `near-face-hold-makeup` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `application-makeup` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `swatch-detail-makeup` | scene_type `macro` — correct; but prompt says "color applied to a clean surface or forearm" — forearm needs person | Consider: if forearm needed, add personDetails trigger |
| `in-hand-lifestyle-makeup` | trigger_blocks empty | Set to `['personDetails']` |
| `open-product-makeup` | Good, but `requires_extra_reference` should be `true` — user needs to upload open-product reference | Set `requires_extra_reference = true` |

### Bags & Accessories
| Scene | Issue | Fix |
|-------|-------|-----|
| `front-view-bags` | Missing `[PRODUCT IMAGE]` | Add at start |
| `in-hand-studio-bags` | trigger_blocks empty; `{{personDirective}}` at END of template (should be at START for model injection) | Move `{{personDirective}}` to start; set trigger_blocks to `['background', 'personDetails']` |
| `mid-portrait-hold-bags` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `on-shoulder-bags` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `flat-lay-bags` | Missing `[PRODUCT IMAGE]` | Add at start |

### Hats & Small Accessories
| Scene | Issue | Fix |
|-------|-------|-----|
| `front-view-hats` | Missing `[PRODUCT IMAGE]` | Add at start |
| `in-hand-studio-hats` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `worn-portrait-hats` | trigger_blocks empty — critical for on-model hat shots | Set to `['background', 'personDetails']` |
| `in-hand-lifestyle-hats` | trigger_blocks empty | Set to `['personDetails']` |
| `on-body-lifestyle-hats` | trigger_blocks empty | Set to `['background', 'personDetails']` |

### Shoes
| Scene | Issue | Fix |
|-------|-------|-----|
| `front-view-shoes` | Missing `[PRODUCT IMAGE]` | Add at start |
| `in-hand-studio-shoes` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `on-foot-studio-shoes` | trigger_blocks empty — critical for on-foot shots | Set to `['background', 'personDetails']` |
| `on-foot-lifestyle-shoes` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `pair-display-shoes` | Says "both shoes arranged" but user uploads single shoe — AI must infer the pair | Add note: "Generate the matching pair from the same reference" |

### Garments
| Scene | Issue | Fix |
|-------|-------|-----|
| `on-model-front-garments` | trigger_blocks empty — ALL on-model garment scenes broken | Set to `['background', 'personDetails']` |
| `on-model-back-garments` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `on-model-editorial-garments` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `movement-shot-garments` | trigger_blocks empty; scene_type `portrait` — should maybe be `editorial` for motion feel | Set trigger_blocks; consider `editorial` scene_type |
| `on-model-lifestyle-garments` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `label-tag-garments` | `requires_extra_reference` should be `true` — user should upload label photo | Set `requires_extra_reference = true` |

### Home Decor
| Scene | Issue | Fix |
|-------|-------|-----|
| `front-view-home` | Missing `[PRODUCT IMAGE]` | Add at start |
| `in-room-styled-home` | Good concept but trigger_blocks empty — no background customization | Set trigger_blocks to `['background']` at minimum |
| `vignette-home` | Hardcodes "candle, book, plant, vase" — too specific | Generalize to "complementary decor objects appropriate for the product" |
| `scale-context-home` | "next to a common household object (book, mug, hand)" — hand mention could trigger person rendering | Remove "hand" from the prompt |

### Tech / Devices
| Scene | Issue | Fix |
|-------|-------|-----|
| `front-view-tech` | Missing `[PRODUCT IMAGE]` | Add at start |
| `in-hand-studio-tech` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `screen-interface-tech` | Good — correctly says "do NOT generate fake UI" | No change |
| `in-use-lifestyle-tech` | Hardcodes "coffee cup, notebook, plant" — too specific; also says "minimal desk accessories" then lists them | Generalize; remove duplicate instruction |

### Food & Beverage
| Scene | Issue | Fix |
|-------|-------|-----|
| `front-view-food` | Missing `[PRODUCT IMAGE]` | Add at start |
| `in-hand-studio-food` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `serving-suggestion-food` | Good concept but no trigger_blocks for background | Add `['background']` |
| `pour-action-food` | Good concept, no trigger_blocks | Add `['background']` |
| `ingredients-spread-food` | Hardcodes "fresh herbs, raw spices, fruits, grains" — too specific for all food | Generalize to "raw ingredients relevant to the product" |

### Supplements & Wellness
| Scene | Issue | Fix |
|-------|-------|-----|
| `front-view-supplements` | Missing `[PRODUCT IMAGE]` | Add at start |
| `in-hand-studio-supplements` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `capsule-spill-supplements` | Good concept; `requires_extra_reference` should be `true` — user should upload open container photo | Set `requires_extra_reference = true` |
| `in-hand-lifestyle-supplements` | trigger_blocks empty | Set to `['personDetails']` |
| `scoop-detail-supplements` | `requires_extra_reference` should be `true` — need reference of powder/scoop | Set `requires_extra_reference = true` |
| `wellness-lifestyle-supplements` | trigger_blocks empty; scene_type `lifestyle` with person — needs personDetails | Set to `['background', 'personDetails']` |

### Other / Custom
| Scene | Issue | Fix |
|-------|-------|-----|
| `front-view-other` | Missing `[PRODUCT IMAGE]` | Add at start |
| `in-hand-studio-other` | trigger_blocks empty | Set to `['background', 'personDetails']` |
| `in-hand-lifestyle-other` | trigger_blocks empty | Set to `['personDetails']` |

## Summary of Changes

1. **~40 scenes**: Add `[PRODUCT IMAGE]` anchor to prompt_template start (all Front View, Angle View, Side View, Back View packshots)
2. **~35 scenes**: Fix empty `trigger_blocks` → add `['background', 'personDetails']` or `['personDetails']` or `['background']`
3. **~4 scenes**: Set `requires_extra_reference = true` (open-product-makeup, label-tag-garments, capsule-spill-supplements, scoop-detail-supplements)
4. **~5 scenes**: Fix hardcoded props lists → generalize
5. **~3 scenes**: Fix scene_type mismatches
6. **~5 scenes**: Move `{{personDirective}}` position (should be at prompt start, not end, for model scenes)

## Implementation
All changes are database UPDATEs to `product_image_scenes`. No frontend code changes needed. Will be executed as a single migration with ~80-90 UPDATE statements.

