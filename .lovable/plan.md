# Full Food pass for the Brand Scenes wizard

The Food category currently runs on the generic cast/interaction vocabulary (Solo person / Two people / Group / Using / Holding / Placed beside). It also leaks cast presets that the food registry already excludes, because the Cast step ignores its own allowlist. Below is a focused pass that fixes the bug and re-anchors every food-touching dial in food-photography language.

## Root issues found

1. **`src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (lines 143-145)** builds `visibleCastPresets` from `CAST_PRESETS` directly and never intersects with `resolved.castPresets`. Result: food shows all 5 presets (Solo / Two / Group / Hands / None) instead of the registry's `["none", "hands", "solo"]`.
2. **`CAST_INTERACTIONS`** has only generic verbs (`wearing`, `holding`, `using`, `beside`, `hero`). Food-native actions (Pouring, Plating, Cutting, Garnishing, Dipping, Steaming) don't exist, so the food registry can only pick from a thin set.
3. **Cast preset labels** are body-language nouns ("Solo person", "Hands only") — wrong register for a Food shoot where the dish is the hero.
4. **Surfaces** (`SURFACES` in `sceneExtras.ts`) is missing food-photography staples: marble slab, butcher block, slate, ceramic glaze, parchment. Food's registry can only reference what exists.
5. **Step labels/helpers** in `Step4Cast.tsx` are generic ("Who's in the shot", "How the product appears", "Pick how the cast holds, wears, or stands next to the product") — food deserves "Who's at the table", "How the dish is served", etc.
6. **`FoodDrinkQuestions` (Step 4 module step)** uses tech-y presentation labels ("Top-down", "45° editorial") and a single freeform "Surface" input rather than chips of food surfaces.

## Changes

### A. Fix Cast registry leak (Step4Cast.tsx)
Intersect `visibleCastPresets` with `resolved.castPresets`:
```ts
const allowedCastSet = new Set(resolved.castPresets);
const visibleCastPresets = CAST_PRESETS
  .filter((p) => p.value !== "replicate" || isReference)
  .filter((p) => !forbiddenCast.has(p.value))
  .filter((p) => p.value === "replicate" || allowedCastSet.has(p.value));
```
Effect for Food: chips collapse from 5 → 3 (Food alone / Hands only / Person at table).

### B. Food-aware cast preset labels (Step4Cast.tsx, in the chip render)
Map labels per module without mutating `CAST_PRESETS`:
- `food-drink`: `none` → "Food alone", `hands` → "Hands & cutlery", `solo` → "Person at table".
- All other modules keep the existing labels.
Implemented as a small `labelForCastPreset(preset, module)` helper local to the file.

### C. Food-native interactions
1. Extend `CAST_INTERACTIONS` in `src/features/brand-scenes/wizard/constants/cast.ts` with food-specific verbs (still global so other categories can opt-in later):
   - `pouring` — "Pouring"
   - `plating` — "Plating / serving"
   - `cutting` — "Cutting / slicing"
   - `garnishing` — "Garnishing"
   - `dipping` — "Dipping"
   - `steaming` — "Steaming / fresh out of oven"
2. Update `interactionsForFamily` to keep these for `food-drink` and exclude them for everything else.
3. Update `categoryPresets.ts` `"food-drink"`:
   - Family `interactions: ["beside", "hero", "holding", "using", "pouring", "plating", "cutting", "garnishing", "dipping", "steaming"]`
   - Sub `beverages.interactions`: `["pouring", "holding", "beside", "hero"]` (default cast `hands`)
   - Sub `food.interactions`: `["plating", "garnishing", "cutting", "steaming", "beside", "hero"]`
   - Sub `snacks-food.interactions`: `["dipping", "holding", "beside", "hero"]`

### D. Add food-photography surfaces
Append to `SURFACES` in `sceneExtras.ts`:
- `marble_slab` — "Marble slab" → `polished marble slab`
- `butcher_block` — "Butcher block" → `thick butcher-block wood`
- `slate` — "Slate" → `dark slate slab`
- `ceramic_glaze` — "Ceramic plate" → `glazed ceramic plate`
- `parchment` — "Parchment" → `crumpled parchment paper`

Then update `categoryPresets.ts` `food-drink.surfaces` to:
`["raw_wood", "linen", "marble_slab", "butcher_block", "slate", "ceramic_glaze", "parchment", "polished_stone", "paper"]`.

### E. Food-aware step copy (Step4Cast.tsx)
When `module === "food-drink"`, swap section labels and the footer hint:
- "Who's in the shot" → "Who's at the table"
- "How the product appears" → "How the dish is served"
- Footer helper "Pick how the cast holds, wears, or stands next to the product" → "Pick how the dish is plated, poured or served"

Also update the wizard title in `BrandSceneWizard.tsx` (lines 57 & 81) to be food-aware when `module === "food-drink"`: `Who's at the table?` (small helper that picks per-module title, default keeps existing copy).

### F. Tighten FoodDrinkQuestions (module step)
In `src/features/brand-scenes/modules/food-drink/FoodDrinkQuestions.tsx` + `questions.ts`:
- Rename presentations to food-photography vocabulary:
  - `top_down` → "Top-down flat-lay"
  - `editorial_45` → "Three-quarter editorial"
  - `in_pour_motion` → "Pour / steam / drip"
  - `macro` → "Macro detail (texture)"
  - `paired_with_hands` → "Hands plating / serving"
- Replace the freeform "Surface" input with a chip row of the new food surfaces (with a fallback "Other" text input), so users don't have to type "travertine".
- Update placeholder helpers to be food-flavoured (e.g. Location placeholder → "e.g. sunlit kitchen, café counter, picnic blanket"; Mood → "e.g. fresh-from-the-oven, slow-Sunday brunch").

## Files touched

- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — A, B, E
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` — E (title only)
- `src/features/brand-scenes/wizard/constants/cast.ts` — C (new interactions + filter)
- `src/features/brand-scenes/wizard/registry/categoryPresets.ts` — C, D (food-drink block + subfamilies)
- `src/features/brand-scenes/wizard/constants/sceneExtras.ts` — D (new surfaces)
- `src/features/brand-scenes/modules/food-drink/questions.ts` — F (presentation labels)
- `src/features/brand-scenes/modules/food-drink/FoodDrinkQuestions.tsx` — F (surface chips + copy)

## What stays out of scope

- Module-step schema migration — only label changes, values stay the same so existing saved scenes don't break.
- Storytelling moments, scale presets, lens/DoF — already food-tuned and not part of the user's complaint.
- Backend / edge-function prompt assembler — the new interaction values flow through `buildCastDirective` automatically; verify by reading the cast directive after the change but no code edit needed unless a value is unmapped.

## Validation

1. Reload `/app/brand-scenes/new`, pick Food → any subfamily, advance to Cast step:
   - Expect 3 cast chips, food-aware labels.
   - Expect food-native interaction chips matching the subfamily.
   - Expect food-aware section titles and footer helper.
2. Reload Step 4 (module questions): expect new presentation labels and a surface chip row.
3. Pick "Beverages" subfamily: default cast should be Hands & cutlery, default interaction should be Pouring.
4. Generate a scene; confirm the compiled directive (admin debug panel on Step 6) renders the food-specific verbs verbatim.
