

# Prompt Engineering Audit — Critical Bugs & Fixes

## Critical Bugs Found

### Bug 1: Lighting chip values don't match LIGHTING_MAP keys (BREAKS ALL LIGHTING)
The Refine UI offers: `soft-diffused`, `warm-editorial`, `crisp-studio`, `natural-daylight`, `side-lit`
The LIGHTING_MAP keys are: `soft-studio`, `directional-side`, `natural-window`, `dramatic-high-contrast`, `golden-hour`, `flat-commercial`, `rim-backlit`, `overhead-beauty`

**Zero overlap.** Every user lighting selection falls through to either the raw slug ("soft-diffused") or the category default. Users never get the rich sentences from the map.

**Fix**: Align LIGHTING_MAP keys to match UI chip values, or add the missing entries.

### Bug 2: Shadow chip values partially mismatched
UI offers: `none`, `soft`, `natural`, `defined`
SHADOW_MAP keys: `natural`, `none`, `minimal`, `dramatic`, `soft-diffused`

Only `natural` and `none` match. `soft` and `defined` resolve to raw slugs in the prompt ("soft", "defined") instead of descriptive sentences.

**Fix**: Add `soft` and `defined` entries to SHADOW_MAP.

### Bug 3: Background family selection NEVER reaches prompts (CRITICAL)
The UI stores background family in `details.negativeSpace` (line 582 of Refine). But the `{{background}}` token in the builder reads `details.backgroundTone` (line 277). These are different fields. Background family selection is completely ignored in every prompt.

**Fix**: The `{{background}}` token resolver should read `details.negativeSpace` as the background value (or rename the field for clarity).

### Bug 4: Hand style chip values mostly miss the map
UI offers: `clean-studio`, `natural-lifestyle`, `polished-beauty`, `auto`
HAND_STYLE_MAP keys: `polished-beauty`, `natural-casual`, `masculine-rugged`, `manicured-luxury`, `editorial-minimal`, `artistic-expressive`

Only `polished-beauty` matches. `clean-studio` and `natural-lifestyle` fall through to raw slug replacement.

**Fix**: Add `clean-studio` and `natural-lifestyle` to HAND_STYLE_MAP. Handle `auto` as a smart default.

### Bug 5: Nail chip values completely miss the map
UI offers: `natural`, `polished`, `minimal`, `auto`
NAIL_MAP keys: `natural-clean`, `gel-polish`, `matte-polish`, `french-tip`, `nude-neutral`, `bold-color`, `bare-minimal`

Zero matches. Every nail selection outputs a raw slug.

**Fix**: Add `natural`, `polished`, `minimal` entries to NAIL_MAP.

### Bug 6: `brandingVisibility` serves double duty — accent AND branding (SEMANTIC BUG)
The accent color chips store their value in `details.brandingVisibility`. But the `{{brandingDirective}}` token also reads `details.brandingVisibility`. So when user picks "custom" accent color, the branding directive outputs "Branding: custom." — nonsensical. When user picks "subtle" accent, branding says "Branding: subtle." which is wrong context.

**Fix**: Separate accent and branding into distinct fields, or only use `brandingVisibility` for accent (since there's no separate branding UI section).

### Bug 7: "Styling direction" stored in `mood`, pollutes mood directive
The UI label says "Styling direction" but stores the value in `details.mood` (line 605). The `{{moodDirective}}` token reads `details.mood` and outputs "minimal luxury mood and atmosphere" — but the user selected it as a styling direction, not a mood. Meanwhile `{{stylingDirective}}` reads `details.stylingDirection` which is never set by the UI.

**Fix**: Either rename the field correctly, or update `resolveToken` so that `moodDirective` outputs styling language when `mood` contains styling values, and `stylingDirective` reads from `details.mood`.

### Bug 8: `auto` values passed raw into prompts
When user selects "Auto" for presentation, age, skin, hand, nails, etc., the literal string `auto` goes into the prompt: "auto presentation, age auto, auto skin tone". This produces garbage in prompts.

**Fix**: All token resolvers should treat `auto` the same as empty/undefined — skip the token or use a smart category-based default.

### Bug 9: Surface type values resolve as raw slugs
UI values like `minimal-studio`, `stone-plaster`, `warm-wood`, `fabric`, `glossy` are inserted raw: "placed on minimal-studio surface". The hyphen replacement helps (`minimal studio surface`) but it's still not photographic.

**Fix**: Add a SURFACE_MAP similar to LIGHTING_MAP that maps chip values to descriptive phrases.

### Bug 10: Color world (`backgroundTone`) has no dedicated handling
The "Color world" UI (line 574) stores in `details.backgroundTone` with values `auto`, `warm-neutral`, `cool-neutral`, `monochrome`, `brand-led`. But `backgroundTone` is also used as the `{{background}}` token which expects BG_MAP keys like `pure-white`, `light-gray`, etc. Color world values like `warm-neutral` are not in BG_MAP, so they resolve to raw slug "warm-neutral" instead of a rich description.

**Fix**: Either merge color world values into BG_MAP, or create a separate `{{colorWorldDirective}}` token.

---

## Implementation Plan

### File 1: `src/lib/productImagePromptBuilder.ts`

**Add/fix lookup maps:**
- Add missing LIGHTING_MAP entries: `soft-diffused`, `warm-editorial`, `crisp-studio`, `natural-daylight`, `side-lit`
- Add missing SHADOW_MAP entries: `soft`, `defined`
- Add missing HAND_STYLE_MAP entries: `clean-studio`, `natural-lifestyle`, `auto`
- Add missing NAIL_MAP entries: `natural`, `polished`, `minimal`, `auto`
- Add SURFACE_MAP: `minimal-studio`, `stone-plaster`, `warm-wood`, `fabric`, `glossy`, `auto`
- Add color world entries to BG_MAP: `auto`, `warm-neutral`, `cool-neutral`, `monochrome`, `brand-led`

**Fix token resolvers:**
- `background`: Read from `details.negativeSpace` (background family) with `details.backgroundTone` (color world) as color modifier
- `moodDirective`: Output styling-appropriate language since `mood` actually stores styling direction
- `stylingDirective`: Read from `details.mood` since that's where the UI stores styling direction
- `brandingDirective`: Return empty (no separate branding UI exists; `brandingVisibility` is accent-only)
- All resolvers: Treat `'auto'` as empty/undefined — skip or use category-aware defaults
- `surfaceDirective`: Use SURFACE_MAP for rich photographic descriptions

**Fix auto handling globally:**
- Add a utility function `isAuto(val)` that returns true for `'auto'` or `undefined/empty`
- Every token resolver that receives `auto` should fall through to smart defaults

### File 2: No scene template changes needed
The templates themselves are well-structured. The bugs are entirely in the token resolution layer.

## Files Modified

| File | Change |
|------|--------|
| `src/lib/productImagePromptBuilder.ts` | Fix all 10 bugs: add missing map entries, fix field mismatches, handle `auto` values, add SURFACE_MAP |

