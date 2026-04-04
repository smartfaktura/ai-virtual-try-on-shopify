

# Prompt Engineering Audit — Product Images Flow

## Summary

After a thorough review of all 91 scene templates, the prompt builder (`productImagePromptBuilder.ts`), the Refine UI, and the token resolution logic, here is what's working well and what still needs fixing.

## What's Working Well

- **Category-aware smart defaults** — background, surface, shadow, styling, and lighting all produce strong, fashion-forward defaults per product category when user leaves settings on "Auto"
- **Auto-injection** — background, shadow, surface, styling, lighting, composition, and mood are all injected into templates that lack those tokens
- **Maps are comprehensive** — LIGHTING_MAP (11 entries), SHADOW_MAP (7 entries), BG_MAP (12 entries), SURFACE_MAP (9 entries), STYLING_DIRECTION_MAP (9 entries) all cover UI chip values
- **Camera directives** — every scene type gets a specific lens/aperture instruction
- **Material texture** — extracted from product analysis or description using 19 material keywords
- **Negative prompts** — 3-layer negatives (base + product + person) applied correctly
- **Quality suffix** — strong 8K commercial quality instruction appended to all prompts

## Issues Found

### Issue 1: `stylingDensity` is a dead field — never reaches the prompt

The "Scene Environment" block lets users pick `stylingDensity` (Minimal / Moderate / Fully Styled), but there is NO `resolveToken` case for it, NO map for it, and NO template uses a `{{stylingDensity}}` token. Whatever the user selects is silently ignored.

**Fix**: Add a `STYLING_DENSITY_MAP` and a `stylingDensityDirective` token, then auto-inject it.

### Issue 2: `moodDirective` token resolves to empty string — dead token in 20+ templates

Many templates include `{{moodDirective}}` (fragrance_hero_surface, beauty_shelf_placement, bag_hero_surface, etc.), but `resolveToken('moodDirective')` returns `''` always. This is correct since `details.mood` actually stores the styling direction — but it means those templates have a dead placeholder producing nothing.

The `{{moodDirective}}` should resolve to the same value as `{{stylingDirective}}` since both represent the overall style. Currently templates that have `{{moodDirective}}` but NOT `{{stylingDirective}}` get NO styling instruction at all (the auto-inject check for "styling" passes because the word isn't in the prompt — but `{{moodDirective}}` already resolved to empty and was cleaned up).

Wait — actually re-checking: `injectIfMissing('styling', 'stylingDirective')` would inject because the word "styling" won't appear. So this is actually handled. But it creates redundancy in templates that have BOTH `{{moodDirective}}` AND `{{stylingDirective}}` — the mood resolves to nothing and styling resolves properly. No bug, just dead code.

**Fix**: Make `moodDirective` an alias for `stylingDirective` instead of returning empty. This way templates that rely on `{{moodDirective}}` get the styling instruction directly rather than depending on auto-inject.

### Issue 3: `environmentDirective` is too weak

When a user selects "Bathroom", "Kitchen", etc., it resolves to just `"Set in a bathroom environment."` — very generic. Fashion-forward product images need richer environment descriptions.

**Fix**: Add an `ENVIRONMENT_MAP` with aesthetic descriptions per environment type.

### Issue 4: `productProminence` values lack prompt mapping

Values `hero`, `balanced`, `contextual` just get converted to `"Product prominence: hero."` — no rich description.

**Fix**: Add a `PROMINENCE_MAP` with detailed composition instructions.

### Issue 5: Scene-specific `backgroundTone` chips don't match `COLOR_WORLD_MAP`

The scene-specific background block offers chips: `white`, `light-gray`, `warm-neutral`, `cool-neutral`, `gradient`. The values `white`, `light-gray`, and `gradient` have no entry in `COLOR_WORLD_MAP`, but `backgroundTone` is read as color world. These fall through silently.

**Fix**: Add these missing entries to `COLOR_WORLD_MAP`, or better — route scene-specific tone through `BG_MAP` instead since those values are background colors, not color worlds.

### Issue 6: Person directive is weak when auto — no defaults at all

When no person details are selected, `buildPersonDirective` returns `''`. For on-model shots (garments, bags carry shot, etc.), this means the AI gets zero guidance on what the model should look like — resulting in random, inconsistent models.

**Fix**: Add a `defaultPersonDirective(category)` that returns a fashion-appropriate default when no person details are set but the scene requires a person.

### Issue 7: `outfitDirective` returns nothing when auto

For on-model scenes, if the user doesn't select outfit style/color, the prompt has no outfit guidance. The AI picks random outfits that may clash with the product.

**Fix**: Add smart default outfits per category (e.g., garments: "complementary, non-competing outfit", bags: "clean minimal outfit that doesn't distract from the bag").

## Plan

### File: `src/lib/productImagePromptBuilder.ts`

**A. Add `STYLING_DENSITY_MAP` + resolver:**
```typescript
const STYLING_DENSITY_MAP = {
  'minimal': 'Minimal styling — product alone or with 1-2 subtle props, clean negative space.',
  'moderate': 'Moderate styling — thoughtful arrangement with complementary contextual props.',
  'styled': 'Fully styled scene — rich arrangement with multiple props, textures, and lifestyle elements.',
};
```

**B. Make `moodDirective` alias `stylingDirective`:**
Instead of returning `''`, return the same resolved styling direction. This makes the 20+ templates with `{{moodDirective}}` produce actual output.

**C. Add `ENVIRONMENT_MAP`:**
```typescript
const ENVIRONMENT_MAP = {
  'bathroom': 'Set in a modern, clean bathroom — white tiles or marble surfaces, soft ambient light, spa-like calm.',
  'kitchen': 'Set in a bright, contemporary kitchen — clean countertops, natural light, curated simplicity.',
  'living-room': 'Set in a styled living room — premium furniture, warm tones, editorial interior feel.',
  'desk': 'Set at a clean, organized workspace — minimal desk accessories, focused professional aesthetic.',
  'outdoor': 'Set in a natural outdoor environment — soft daylight, organic textures, open air.',
  'shelf': 'Set on a curated display shelf — clean lines, intentional arrangement, retail-quality presentation.',
};
```

**D. Add `PROMINENCE_MAP`:**
```typescript
const PROMINENCE_MAP = {
  'hero': 'Product dominates the frame — fills 60-80% of composition, maximum visual impact.',
  'balanced': 'Product is clearly the hero but shares space with environment — fills 40-60% of frame.',
  'contextual': 'Product is identifiable but environment tells the story — product fills 20-40% of frame.',
};
```

**E. Add `defaultPersonDirective(category)` for auto person:**
Returns fashion-appropriate model descriptions when scenes require a person but user didn't customize (e.g., "Professional fashion model with natural, contemporary look and realistic skin texture").

**F. Add `defaultOutfitDirective(category)` for auto outfit:**
Returns smart outfit defaults (e.g., garments: "Wearing clean, complementary styling that doesn't compete with the product", bags: "Wearing a minimalist neutral outfit — product is the styling hero").

**G. Auto-inject `stylingDensityDirective`:**
Add to the `injectIfMissing` block.

**H. Fix `backgroundTone` scene-specific values:**
Add `'white'`, `'light-gray'`, and `'gradient'` to `COLOR_WORLD_MAP` with appropriate descriptions.

## Files to Update

| File | Change |
|------|--------|
| `src/lib/productImagePromptBuilder.ts` | Add 4 new maps (STYLING_DENSITY, ENVIRONMENT, PROMINENCE, COLOR_WORLD additions), make moodDirective alias stylingDirective, add defaultPersonDirective + defaultOutfitDirective, add stylingDensity auto-inject |

Single file change. No UI changes needed — all fixes are in prompt resolution logic.

