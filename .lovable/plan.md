## Goals

1. Fix the "lingerie scene with model not wearing lingerie" class of bugs by adding sub-family-aware product/wardrobe guides that get injected into every prompt.
2. Move credit cost from **Save** → **Generate** so previews are NOT free and Regenerate also charges.

---

## Part 1 — Sub-family wardrobe / product guides

### Problem
When a user picks Family=Fashion · Sub-family=Lingerie, nothing in the compiled prompt actually tells the model the hero garment is lingerie. The outfit picker is a generic vibe/top/bottom/footwear quiz, so the model often ends up in pajamas, loungewear or a t-shirt instead of the brand's lingerie set. Same risk for swimwear, activewear, dresses, jackets, hoodies, etc.

### Fix
Create a new registry `wizard/registry/subfamilyGuides.ts` mapping `(module, sub_family) → { wardrobe?: string; mustWearProduct?: boolean; productNoun?: string; extraDirectives?: string[]; safeguards?: string[] }`.

Examples:
- `fashion / lingerie` → `productNoun: "lingerie set"`, `mustWearProduct: true`, `wardrobe: "Model wears a well-fitted lingerie set (bralette + briefs or matching slip) as the hero garment — visible, on-body, photographed as the focal product. No pajamas, no loungewear, no oversized t-shirts."`
- `fashion / swimwear` → similar, "swimsuit / bikini as hero garment".
- `fashion / activewear`, `dresses`, `jackets`, `hoodies`, `jeans`, `streetwear` → product-noun specific.
- `footwear / *` → "Model's feet/shoes are the focal point; outfit complements but never competes."
- `hats-caps-beanies / *`, `eyewear`, `bags-accessories / backpacks|belts|scarves` — analogous wearable-hero directives.

Wire into `prompt/assembleSceneDirective.ts`:
- New section `PRODUCT FOCUS` printed near the top (between SUBJECT and SCENE) when a guide exists and the cast has people.
- Append `safeguards` to the existing `NEGATIVE` block (e.g. "Do not render generic pajamas or loungewear instead of the lingerie hero piece.").
- When `mustWearProduct: true`, also inject a CAST DETAILS line `- Hero garment: ${wardrobe}` and prepend a single phrase into the existing outfit slot list so user-picked vibe doesn't override the product.

UI tweak in `Step4Cast.tsx` (outfit picker):
- When a guide with `mustWearProduct: true` resolves for the current `(module, sub_family)`, hide the standard outfit slots and show a single read-only "Hero garment" chip with the guide's wardrobe sentence, plus an optional free-text "extra outfit notes" input. Mirrors the existing scene-controlled-outfit pattern.

No DB / RLS changes. No schema migration. Purely additive prompt + UI logic.

### Files touched
- `src/features/brand-scenes/wizard/registry/subfamilyGuides.ts` (new)
- `src/features/brand-scenes/prompt/assembleSceneDirective.ts` (add PRODUCT FOCUS section + negative safeguards)
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` (hide outfit picker when guide forces hero garment)

---

## Part 2 — Pay per generation, free save

### Current behaviour
- `generate-brand-scene` edge function: free, 3 variations.
- `save-brand-scene` edge function: deducts `BRAND_SCENE_GENERATION_COST = 20` credits.
- UI says "Previewing is free", Regenerate labelled "Regenerate (free)".

### New behaviour
- `generate-brand-scene` deducts credits BEFORE calling Gemini. Refund on total failure (0 variations returned).
- `save-brand-scene` no longer deducts or refunds — just inserts the row.
- Same price (20 credits) per generation; configurable in `constants.ts`.

### Changes
1. `src/features/brand-scenes/constants.ts`
   - Rename usage: keep `BRAND_SCENE_GENERATION_COST = 20` (now actually per-generation).
   - Add `BRAND_SCENE_SAVE_COST = 0`.

2. `supabase/functions/generate-brand-scene/index.ts`
   - Check `profiles.credits_balance >= 20` → 402 `INSUFFICIENT_CREDITS` if not.
   - Call `rpc("deduct_credits", { p_user_id, p_amount: 20 })` before generation.
   - On `variations.length === 0`: `rpc("refund_credits", …)` and return existing 502/429/402.
   - On partial (1–2 of 3): no refund (matches existing product-image policy — fair given partial value).
   - Return `new_balance` in response.

3. `supabase/functions/save-brand-scene/index.ts`
   - Remove balance check, `deduct_credits`, refund-on-insert-failure block.
   - Keep auth, URL anti-spoof, insert payload (unchanged — already correct from prior fix).

4. `src/features/brand-scenes/api/brandSceneApi.ts`
   - `generateBrandScene` response type now includes optional `new_balance`; surface `INSUFFICIENT_CREDITS` error code.

5. `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`
   - Hero card copy: "3 variations · 20 credits" (drop "free preview").
   - Subtitle: "Each generation costs 20 credits. Saving the variation you like is free."
   - Generate button: `Generate 3 variations · 20 credits`.
   - Regenerate link: `Regenerate · 20 credits` (no longer "free"). Confirm dialog text updated.
   - Save button: `Save to library · free`.
   - Handle 402 from `handleGenerate` with toast `You need 20 credits to generate a scene` and bounce back to idle without losing wizard state.

### Files touched
- `src/features/brand-scenes/constants.ts`
- `supabase/functions/generate-brand-scene/index.ts`
- `supabase/functions/save-brand-scene/index.ts`
- `src/features/brand-scenes/api/brandSceneApi.ts`
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`

---

## Out of scope (deferred)
- Admin: delete / rename saved brand scenes (#1 from prior audit).
- Regenerate-from-saved-scene wizard re-open (#2).
- Lifting wizard admin gate (`isRealAdmin`) for end users (#4).
- Per-row thumbnail override on `/app/brand-scenes` (#6).

## Verification
- Smoke: open wizard → Lingerie → reach Step 6 → confirm outfit picker hides and "Hero garment" chip shows; Generate deducts 20 credits, Regenerate deducts 20 more, Save is free.
- Confirm prompt preview (Admin debug) shows new `PRODUCT FOCUS` block + lingerie safeguard in `NEGATIVE`.
- Confirm `deduct_credits` is refunded when Gemini returns zero variations (force by passing oversized prompt during test).