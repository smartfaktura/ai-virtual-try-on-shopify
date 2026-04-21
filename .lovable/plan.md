

## Replace "Brand" step with an "Interaction" step on `/app/generate/selfie-ugc-set`

### What's wrong today
- Step 2 of the Selfie/UGC flow shows the generic **Brand** profile picker — but brand doesn't change anything meaningful for UGC (the look is iPhone selfie + model + scene).
- The verb in `{PRODUCT_INTERACTION}` is hard-coded server-side from the product type (`PRODUCT_INTERACTIONS` map in `generate-workflow/index.ts`). User has zero control. For a beauty product they always get "applying / holding near face" even if they wanted a "showing on camera" shot. For garments they always get "wearing" even if it's a scarf they want to hold up.
- For **beauty/skincare/fragrance/food**, "wearing" is never valid — but the current map can still produce odd phrasing if categories are misclassified.

### The fix (UX)

Replace the Selfie/UGC "Brand" step (step 2) with a new **"Interaction"** step:

```text
Step 1 Product   →   Step 2 Interaction   →   Step 3 Model   →   Step 4 Settings   →   Step 5 Results
```

The Interaction step asks one question:
> **How should the creator engage with your product?**

…and shows 2–5 large, image-style option cards. The available options are filtered by product **category** (from `analysis_json.category`, falling back to the keyword map already in `categoryUtils.ts`).

#### Category → allowed interactions

| Category | Options shown (label → server verb phrase) |
|---|---|
| beauty / makeup / skincare | Applying it · Holding near face · Showing the texture/shade · Showing the packaging |
| fragrance | Spraying on wrist/neck · Holding the bottle · Showing the packaging |
| haircare | Running through hair · Holding near hair · Showing the bottle |
| garments / apparel / activewear / swimwear / lingerie / dresses / hoodies / jeans / jackets | Wearing it · Holding it up · Styling it |
| shoes / sneakers / boots / high-heels | Wearing on feet · Holding them up · Showing the sole/detail |
| jewellery-* / watches / eyewear | Wearing it · Holding it up to camera · Showing the detail |
| bags-accessories / backpacks / wallets / belts / scarves | Wearing/carrying it · Holding it up · Showing inside / detail |
| food / beverages | Tasting / sipping · Holding the package · Showing the label |
| supplements / wellness | Holding the bottle · Pouring into hand · Showing the label |
| tech-devices | Using / demonstrating · Holding it up · Showing the screen/feature |
| furniture / home-decor | Showing it in their space · Pointing it out · Holding/placing it |
| other / unknown | Holding it · Showing it to camera · Pointing it out |

Rules:
- "Wearing" is hidden for beauty / fragrance / food / beverages / supplements / tech / furniture / home decor.
- Always include a safe **"Holding it"** fallback so every category has ≥2 options.
- Default selection = first option in the list (sensible for the category).
- Selection is required to proceed.

UI: same card style as the existing scene picker (4-up grid on desktop, 2-up on mobile). Each card shows an emoji/icon + label + one-line description. Single-select.

### The fix (server)

In `supabase/functions/generate-workflow/index.ts`:
- Accept a new optional `interaction_phrase` (or `interaction_id`) in the workflow request payload.
- When present **and** the workflow is `selfie-ugc-set`, use it directly for `{PRODUCT_INTERACTION}` instead of `getProductInteraction(productType)`.
- Keep `getProductInteraction()` as the fallback (back-compat for any legacy clients).

The verb phrases are short, natural, and directly match the labels above (e.g. "applying the product to their skin", "wearing the item naturally as part of their outfit", "holding the bottle near their wrist as if just sprayed").

### Frontend wiring (`src/pages/Generate.tsx`)

1. New state: `ugcInteraction: string | null`.
2. New constant `UGC_INTERACTION_OPTIONS` keyed by normalized category, each option = `{ id, label, description, phrase, icon }`.
3. Helper `getInteractionOptionsForProduct(product)` → reads `analysis_json.category` first, then falls back to `detectProductCategory()` from `categoryUtils.ts`, returns the option list (always ≥2).
4. Replace Selfie/UGC's step-2 routing:
   - `getCurrentStepNumber` map: `'interaction': 2` (drop `'brand-profile': 2`, `'mode': 2`).
   - `getSteps()` for `isSelfieUgc`: `[Product, Interaction, Model, Settings, Results]`.
   - Step navigation: after Product → go to `interaction` (not `brand-profile`); after `interaction` → `model`.
5. New render block: `{currentStep === 'interaction' && isSelfieUgc && ( … cards … )}` with Continue button disabled until one is picked.
6. Pass `interaction_phrase: UGC_INTERACTION_OPTIONS[…].phrase` in the workflow payload (both single-product and multi-product enqueue paths around lines 1246 and 1379).
7. Brand-profile step continues to exist for all OTHER workflows — only `isSelfieUgc` skips it.

### Files touched
- `src/pages/Generate.tsx` — new step, new state, new option set, payload field, step counter/labels.
- `supabase/functions/generate-workflow/index.ts` — accept `interaction_phrase` and prefer it over the hard-coded map for the UGC workflow.
- (Optional polish) `src/data/learnContent.ts` — update the Selfie/UGC guide steps to mention "Interaction" instead of "Brand".

### Out of scope
- No DB schema change. No changes to other workflows. Brand profile defaults still apply globally elsewhere.

### Result
Users explicitly choose **how** the model interacts with the product — 100% logical per category, never offers "Wearing" for beauty/food/tech, and finally gives the user real control over the single most important variable in a UGC shot.

