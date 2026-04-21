

## Fix Selfie/UGC results: enforce "Wearing" + clean & luxury scenes

### Root cause of the bad batch
Three compounding problems in the Selfie/UGC pipeline:

1. **Backend ignores the user's Interaction choice.** `src/pages/Generate.tsx` correctly sends `interaction_phrase` (e.g. "wearing the item naturally as part of their outfit"), but `supabase/functions/generate-workflow/index.ts` line 483 still calls `getProductInteraction(product.productType)` and overwrites it. Result: the user picks **Wearing**, the server silently downgrades to whatever the productType map returns ("holding the product naturally near their face or chest" for unknown types).
2. **Scene instructions encourage holding.** Several scenes literally say "Product integrated into the outfit **or held naturally**", "shown casually", "shown naturally" — giving the model permission to hold instead of wear. Two scenes (`Unboxing Excitement`, `Product Holding in Hand`, `Hands-Only Demo`) are dedicated holding scenes and shouldn't run when interaction = Wearing.
3. **No hard constraint** in the prompt template that the garment must be worn on the body when wearing was selected. The model takes the easy path (hold up to camera).

### The fix

**A. Backend — honor `interaction_phrase` (single line change in `generate-workflow/index.ts`)**

```ts
// before
const interaction = getProductInteraction(product.productType);
// after
const interaction = body.interaction_phrase?.trim()
  || getProductInteraction(product.productType);
```

Plus: when `interaction_phrase` indicates wearing (string includes `wearing`), append a short **WEARING ENFORCEMENT** block to the prompt for the Selfie/UGC workflow:

> WEARING ENFORCEMENT: The product MUST be worn on the body in its correct position (top → torso, dress → full body, jewelry → on finger/wrist/neck, eyewear → on face, shoes → on feet, bag → on shoulder/in hand carried). The product MUST NOT be held up to the camera, draped over the arm, hung on a hanger, or laid on a surface. Visible body fit (shoulders, neckline, sleeves) is required.

Symmetrically, when phrase contains "applying" or "spraying" or "tasting" — add a one-line enforcement so the action is visibly happening in-frame.

**B. Backend — filter incompatible scenes when wearing is selected**

If `interaction_phrase` contains "wearing", the three "holding" scenes are not appropriate. In the workflow enqueue path, drop these scene indexes from `selected_variations` for wearing flows:
- `Unboxing Excitement`
- `Product Holding in Hand`
- `Hands-Only Demo`

(They remain available for non-wearing categories like skincare/fragrance/food.)

**C. Scene library rewrite — luxury + clean, no "hold" loopholes**

Update `workflows.generation_config.variation_strategy.variations` for slug `selfie-ugc-set` via a SQL migration. New direction for every scene:

- Strip every "or held naturally", "shown casually", "shown naturally", "shown as part of" — replace with explicit body placement matched to product type via the `{PRODUCT_INTERACTION}` token.
- Elevate the aesthetic: warm neutral palette, clean lived-in (not messy) interiors, soft natural light, considered styling. Keep authentic UGC feel (iPhone selfie, no studio) but lean **quiet luxury** — minimal, neutral tones, premium materials, uncluttered surfaces.
- Add a `wearable_only: true` flag to scenes that only make sense when the model wears the product, and `holdable_only: true` to the three holding scenes. The backend uses these flags for the filter in step B (cleaner than string-matching labels).

Refreshed scene list (12 scenes, same labels so user UI/preview thumbs unchanged):

| # | Label | New direction (summary) | Flag |
|---|---|---|---|
| 1 | Golden Hour Selfie | Clean rooftop or open balcony at magic hour, warm rim light, minimalist concrete + greenery backdrop, no clutter. | wearable_only |
| 2 | Coffee Shop / Brunch | Quiet specialty café, marble or oak table, ceramic flat-white, soft window light. Tidy, considered. | wearable_only |
| 3 | Car Selfie | Modern car interior (cream/tan leather), seatbelt visible, soft daylight through windshield. Clean dash, no clutter. | wearable_only |
| 4 | Walking Street Style | Quiet European-style street, soft daylight, neutral architecture, minimal foot traffic. Confident posture. | wearable_only |
| 5 | Gym / Workout | Boutique studio gym (light wood, white walls, plants), post-workout glow, no messy lockers. | wearable_only |
| 6 | Morning Routine / GRWM | Bright minimalist bathroom, marble counter, a few curated essentials only, soft morning light. | (any) |
| 7 | Bedroom Outfit Check | Tidy neutral bedroom, linen bedding, soft daylight, single curated outfit visible. Clear floor. | wearable_only |
| 8 | Couch / Netflix Chill | Linen couch, neutral throw, warm lamp light, minimal styling. No TV glare. | (any) |
| 9 | Kitchen Counter | Stone/oak counter, fresh fruit + ceramic mug, calm morning light. Clean surfaces. | wearable_only |
| 10 | Unboxing Excitement | Tidy desk, branded box on linen surface, tissue paper folded neatly. | holdable_only |
| 11 | Product Holding in Hand | Hand at chest level, neutral indoor backdrop, intentional framing. | holdable_only |
| 12 | Hands-Only Demo | Hands on linen or stone surface, soft top-down light, product is the hero. | holdable_only |

Each scene's new `instruction` text ends with: *"The subject is {PRODUCT_INTERACTION}."* — the placeholder is already substituted by the backend, so the per-scene instruction stops competing with the interaction directive.

**D. Negative prompt additions**

Append to `negative_prompt_additions`:
> garment held up to camera when wearing was selected, product on hanger, product on mannequin, clutter, messy table, dirty surfaces, neon colors, harsh studio shadows, plastic-looking props, busy patterns, kitsch décor, multiple unrelated brands visible

### Files touched

1. `supabase/functions/generate-workflow/index.ts` — honor `interaction_phrase`, add WEARING/APPLYING enforcement block, filter `selected_variations` by scene flags for the Selfie/UGC workflow.
2. SQL migration — `UPDATE workflows SET generation_config = … WHERE slug='selfie-ugc-set'` with the rewritten 12-scene array (new instructions + `wearable_only` / `holdable_only` flags + expanded negative prompt). Preserves `preview_url` and `label` so UI thumbnails stay the same.
3. (No frontend change required — the wiring already sends `interaction_phrase`. Optional polish: hide holdable scenes in the picker too when interaction = Wearing, to mirror backend filter.)

### Validation
- Pick the cream knit top + Model + **Wearing it** → all 9 wearable scenes show the model wearing the top on her torso, none holding.
- Pick a perfume + **Spraying on wrist** → the spray gesture is visibly happening.
- Pick beauty cream + **Applying it** → application gesture in frame.
- Visual feel across all 12 scenes is calmer, neutral, premium — no messy counters, no harsh colors.

### Out of scope
No DB schema changes, no other workflows touched, no model/provider change (still Gemini 3 Pro multi-image).

