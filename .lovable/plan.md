
## Problem

The current ProductSpecsCard shows 3-5 structured dimension inputs (Length, Width, Height, etc.) per product plus a unit system toggle. This is over-engineered:
- Users naturally type "30x20x10cm" in a text field
- Most dimension fields will be left empty, adding visual clutter
- The unit toggle adds complexity for something rarely used
- For apparel, Size/Fit selects feel forced — users know their product better

## Simplified Approach

Replace all structured fields with **one smart textarea per product** that uses category-aware placeholder text to guide users on what details help accuracy.

### What changes

**1. `src/components/app/product-images/ProductSpecsCard.tsx`** — Complete rewrite:
- Remove all SpecInput rendering, Select fields, and unit toggle
- Each product gets: thumbnail + name + single textarea (3 rows, 500 char limit)
- Placeholder is category-specific, e.g.:
  - Furniture: "e.g. 180×80×75cm, oak wood, matte finish"
  - Garments/Jackets: "e.g. size M, oversized fit, mid-thigh length, 100% wool"
  - Sneakers: "e.g. EU 42, white/grey colorway, chunky sole"
  - Fragrance: "e.g. 50ml, tall rectangular bottle, gold cap"
  - Jewelry: "e.g. 45cm chain, 2cm pendant, rose gold"
  - Default: "e.g. 30×20×10cm, matte black, round shape"
- Remove `unitSystem` / `onUnitSystemChange` props entirely

**2. `src/lib/productSpecFields.ts`** — Simplify heavily:
- Remove `SpecField`, `CategorySpecConfig`, `UnitSystem`, `getDisplayUnit`, `buildDimensionsString`
- Keep `sanitizeSpecInput` (still needed)
- Add `getCategoryPlaceholder(category: string): string` — returns the hint text
- Simplify `buildSpecsPromptLine` to just take a string (the textarea value)

**3. `src/components/app/product-images/types.ts`** — Remove `specUnitSystem` from `DetailSettings`. Change `productSpecs` value type from `{ specs: Record<string, string>; notes: string }` to just `string` (the textarea content).

**4. `src/components/app/product-images/ProductImagesStep3Refine.tsx`** — Remove `unitSystem` / `onUnitSystemChange` props from the ProductSpecsCard usage.

**5. `src/pages/ProductImages.tsx`** — Update `buildInstruction` and generation handler to work with the simplified string-based specs. Update the persistence logic to save the single text value to `user_products.dimensions`.

**6. `src/lib/productImagePromptBuilder.ts`** — Simplify the spec injection to just append the raw user text as `Product specifications: {text}`.

### UI Result

The card becomes much lighter:
- Amber-bordered card with "Product Details" header + "Optional" badge
- Collapsible (same as now)
- Per product: small thumbnail, product name, category hint, single textarea
- Info note at bottom: "Details are saved and reused in future generations"
- No unit toggle, no structured fields, no selects

### Prompt injection stays the same

Whatever the user types goes into the prompt as `Product specifications: {user text}`. AI models handle natural language dimensions well.
