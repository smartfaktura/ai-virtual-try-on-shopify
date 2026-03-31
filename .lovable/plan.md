

# Fix Expression Step, Model Cards, Background Previews & Style Shots

## Issues Found

1. **Expression step says "Next: Models"** in the header button but the floating bar says "Next: Backgrounds" — the floating bar uses `STEP_NEXT_LABELS[step]` which is index-based (step=3 → index 3 → "Backgrounds"). The header button is hardcoded "Next: Models" which is correct. Fix: `STEP_NEXT_LABELS` array is off — index 0 maps to step 1, so for step 3 (Expression) it reads index 3 = "Backgrounds" instead of index 2 = "Models".
2. **Expression cards** have text below but images are too large relative to text, making descriptions hard to see. Also all moods show different-looking models — they should use same model for consistency.
3. **Model cards** show too much detail (body type badges, ethnicity, age) — user wants name only.
4. **Backgrounds** have no preview images (all `previewUrl: ''`) — need AI-generated clean studio backgrounds. User wants only clean studio colors (white, grey, beige, concrete, plus a few more). Remove surface/botanical/outdoor/living-space/retail categories.
5. **Style Shots "+" button** — clicking it calls `openStyler()` which opens a `CatalogShotStyler` dialog, but if the dialog component has issues it may error silently. Need to make the "+" button purpose clearer with a tooltip/label.

## Plan

### 1. Fix floating bar step label mismatch
In `CatalogGenerate.tsx`, the `STEP_NEXT_LABELS` array maps by index but is accessed as `STEP_NEXT_LABELS[step]` where step is 1-based. Fix the array or access pattern so step 3 (Expression) shows "Models".

### 2. Simplify Model cards — name only
In `ModelSelectorCard.tsx`, remove body type badges, ethnicity badge, and age text from the overlay. Keep only the model name.

### 3. Replace backgrounds with clean studio only + generate previews
Update `catalogPoses.ts`:
- Remove surface, botanical, outdoor, living-space, retail backgrounds
- Keep/expand clean studio: White, Light Gray, Warm Beige, Concrete Gray, Blush Pink, Sage Green, Soft Blue
- Update `CATALOG_BG_CATEGORIES` to just `['clean-studio']`

Generate 7 background preview images using `google/gemini-3.1-flash-image-preview`:
- Each: "Empty photography studio with [COLOR] seamless paper backdrop, no model, no objects, professional studio lighting, clean and minimal, wide shot"
- Colors: pure white, light gray, warm beige, raw concrete, soft blush pink, sage green, soft powder blue

### 4. Regenerate expression images with same model
Generate 5 new mood images with stronger consistency prompts using `google/gemini-3.1-flash-image-preview`:
- "Professional headshot photograph of a young Caucasian woman with brown hair pulled back in a low bun, minimal natural makeup, [EXPRESSION], clean pure white background, shoulders visible, soft studio lighting, ultra-realistic, Canon EOS R5 85mm f/1.4"

### 5. Fix Style Shots "+" clarity
- Change the "+" button to show a tooltip or label "Customize" on hover
- Ensure clicking it properly opens the styler dialog without errors

### Files to modify

| Action | File |
|--------|------|
| Generate | 7 background images + 5 mood images → `src/assets/catalog/` |
| Update | `src/data/catalogPoses.ts` — clean-studio-only backgrounds with preview URLs, new mood imports |
| Update | `src/pages/CatalogGenerate.tsx` — fix `STEP_NEXT_LABELS` indexing |
| Update | `src/components/app/ModelSelectorCard.tsx` — name only, remove badges |
| Update | `src/components/app/catalog/CatalogStepStyleShots.tsx` — clearer "+" button with tooltip |
| Update | `src/components/app/catalog/CatalogStepExpression.tsx` — fix header button label |

