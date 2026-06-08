# Prompt Hardening — Logo/Text + Product Geometry Fidelity

## Why
Last 30 days of feedback (389 entries):
- **#1 reason for "no" votes**: "Product details off" — 63 votes
- **Long-form complaints**: logos/3-letter brand marks rendered wrong, tone-on-tone logos printed in contrasting color, product silhouette/dimensions changed
- **Secondary**: "Product changed" (11×), "Product not preserved" (4×), "Not consistent enough" (19×)

Goal: tighten the existing `CRITICAL REQUIREMENTS` block in one file to lock logo/text fidelity and product geometry — without restructuring the prompt or touching identity/background/outfit locks that already work.

## Scope
- **One file**: `supabase/functions/generate-workflow/index.ts`
- **One block**: the non-interior CRITICAL REQUIREMENTS (lines ~636–645)
- **One new negatives constant**: added near existing `outfitNegativeSaugiklis` (~line 561)
- No DB, no UI, no fallback chain, no model swap, no token system change

---

## Change 1 — Tighten rule #2 (product source-of-truth)

**Before** (line 638):
```
2. Use [PRODUCT IMAGE] as the product source of truth — preserve the same
   shape, proportions, colors, materials, texture, finish, structure, and
   visible details without redesigning it.
```

**After**:
```
2. Use [PRODUCT IMAGE] as the product source of truth — preserve EXACT
   shape, silhouette, proportions, real-world dimensions, colors, materials,
   texture, finish, hardware, stitching, and seams. Do NOT redesign,
   restyle, or "improve" the product. The output product must be visually
   interchangeable with the reference.
```

Same wording mirrored in the additional-products `.map(...)` branch on the same line so multi-product batches inherit it.

---

## Change 2 — Insert new rule #7: PRODUCT FIDELITY LOCK

Inserted between current rule #6 (background isolation) and outfit-lock (which shifts from 7 → 8).

**New block**:
```
7. PRODUCT FIDELITY LOCK (CRITICAL): Any logo, brand mark, printed text,
   label, monogram, embroidery, tag, or graphic visible on [PRODUCT IMAGE]
   MUST be reproduced character-for-character in the same position, size,
   color, and finish. Do NOT invent, translate, restyle, abbreviate, or
   substitute any letter, number, or symbol. If the reference logo is
   tone-on-tone, embossed, or debossed, keep it tone-on-tone — do NOT print
   it in a contrasting color. If unsure of a character, keep the original
   glyph exactly as shown.
```

This directly addresses every long-form logo complaint (3-letter logo wrong, tone-on-tone bag logo printed instead of embossed, etc.) and complements the existing `{{brandLogoText}}` token system without changing it.

---

## Change 3 — Extend AVOID negatives

**Add new constant** near `outfitNegativeSaugiklis` (~line 561):
```ts
const productFidelityNegatives = [
  "redesigned product",
  "altered silhouette",
  "changed proportions",
  "wrong dimensions",
  "fabricated logo",
  "fake brand text",
  "substituted letters",
  "misspelled brand name",
  "distorted text",
  "warped logo",
  "printed logo when reference is embossed",
  "contrasting logo when reference is tone-on-tone",
  "invented graphics",
  "added labels",
  "removed labels",
].join(", ");
```

**Include in `allNegatives` join** (line ~564):
```ts
[
  config.negative_prompt_additions,
  outfitNegativeSaugiklis,
  pairModeNegativeSaugiklis,
  productFidelityNegatives,           // ← new
  ...(brandProfile?.do_not_rules || []),
].filter(Boolean).join('. ');
```

---

## Side-by-side: full CRITICAL REQUIREMENTS block

**Before**
```
1. The output image MUST be {ratio} aspect ratio…
2. Use [PRODUCT IMAGE] as the product source of truth — preserve the same
   shape, proportions, colors, materials, texture, finish, structure, and
   visible details without redesigning it.
3. Ultra high resolution, professional quality, no AI artifacts.
4. This specific variation must clearly match the "{label}" direction.
5. The person MUST match [MODEL IMAGE] exactly — non-negotiable.
6. BACKGROUND ISOLATION (CRITICAL): …
7. OUTFIT CONSISTENCY (CRITICAL): …
AVOID: {negatives}
```

**After**
```
1. The output image MUST be {ratio} aspect ratio…
2. Use [PRODUCT IMAGE] as the product source of truth — preserve EXACT
   shape, silhouette, proportions, real-world dimensions, colors,
   materials, texture, finish, hardware, stitching, and seams. Do NOT
   redesign, restyle, or "improve" the product. The output product must be
   visually interchangeable with the reference.
3. Ultra high resolution, professional quality, no AI artifacts.
4. This specific variation must clearly match the "{label}" direction.
5. The person MUST match [MODEL IMAGE] exactly — non-negotiable.
6. BACKGROUND ISOLATION (CRITICAL): …
7. PRODUCT FIDELITY LOCK (CRITICAL): Any logo, brand mark, printed text,
   label, monogram, embroidery, tag, or graphic visible on [PRODUCT IMAGE]
   MUST be reproduced character-for-character… (full block above)
8. OUTFIT CONSISTENCY (CRITICAL): …
AVOID: {negatives} + redesigned product, altered silhouette, fabricated
       logo, fake brand text, substituted letters, misspelled brand name,
       distorted text, warped logo, printed logo when reference is
       embossed, contrasting logo when reference is tone-on-tone, …
```

---

## Why it's safe
- **No structural change** to prompt order — model reading pattern unchanged
- **Constraints only**, no new creative direction → cannot conflict with scene/variation instructions
- **+60–80 tokens** per prompt (~3–5% of typical length) — negligible
- **Fully reversible** — three localized edits in one file
- **Stacks with** existing `{{brandLogoText}}` token (mem) and Seedream text directives — does not replace them

## Validation
1. Sample log: render the new prompt for one product with a visible logo, confirm block ordering and negatives.
2. Deploy `generate-workflow`. Spot-check 5 product-visuals jobs from the next ~50 — compare logo rendering and silhouette to the reference.
3. After 7 days, re-query feedback and target a ≥25% drop in "Product details off" share for product-visuals.

## Files changed
- `supabase/functions/generate-workflow/index.ts` — three localized edits (lines ~561, ~638, ~643)

No other files touched.
