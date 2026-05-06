
# Bundle Visuals — Prompt Engineering Fixes

## Critical Issues Found

### 1. Double product listing (confuses AI model)
`buildBundlePrompt()` outputs a detailed `BUNDLE COMPOSITION — N PRODUCTS` block with scale calibration. But `buildVariationPrompt()` in the edge function ALSO generates its own `ADDITIONAL PRODUCTS IN COMPOSITION` block (lines 294-300). The AI receives TWO conflicting product lists with different formatting and numbering.

**Fix:** Add `is_bundle: true` flag to payload. When true, skip the `additionalProductsBlock` in `buildVariationPrompt` — the bundle prompt already handles product listing comprehensively.

### 2. Prop style override kills lifestyle scenes
When `additionalProducts` exists and `propStyle` is not set, the code defaults to `propStyle === 'clean'` (line 309). This injects a `CRITICAL COMPOSITION RULE` that says "Show ONLY products — ZERO additional items, no decorative objects." This completely contradicts lifestyle bundle scenes like "Gifting Moment" (tissue paper, gift box), "Kitchen Counter Collection" (counter context), "Picnic Basket Spread" (basket, blanket).

**Fix:** Set `prop_style: 'decorated'` in the bundle payload for lifestyle scenes, or better: add `skip_prop_override: true` flag when `is_bundle: true` so the edge function skips the propStyleBlock entirely — the bundle prompt already contains its own scene-appropriate directives.

### 3. Prop-stripping regex damages bundle prompt
Line 604 applies aggressive regex replacement on `variation.instruction` when `propStyle === 'clean'`:
```
variation.instruction.split('||PROPS||')[0]
  .replace(/\.\s*Product (arranged|displayed)?with[\s\S]*$/i, '.')
  .replace(/with\s+([...]accents|props|...)[\w\s,]*$/gi, '')
```
This can corrupt the bundle prompt by stripping text that contains keywords like "elements", "objects", etc. within the scale calibration or arrangement directives.

**Fix:** When `is_bundle: true`, use `variation.instruction` verbatim without any regex stripping.

### 4. Background isolation directive conflicts with bundle logic
Line 617 in CRITICAL REQUIREMENTS says: "Extract ONLY the product object from [PRODUCT IMAGE]." For bundles, ALL product reference images need this treatment, but the instruction implies singular product extraction. The bundle prompt already has `ANTI-HALLUCINATION` and `NO TEXT OR LOGOS` directives.

**Fix:** When `is_bundle: true`, replace requirement #7 with: "Extract ONLY the product objects from ALL [PRODUCT IMAGE] references. IGNORE any backgrounds in reference images."

## Implementation

### File: `supabase/functions/generate-workflow/index.ts`

Add an `is_bundle` check (from payload) in `buildVariationPrompt`:

```typescript
// Near line 293, after additionalProducts block:
const isBundle = (variation as any).is_bundle === true;

// Line 294-300: wrap additionalProductsBlock
const additionalProductsBlock = (!isBundle && additionalProducts?.length > 0) ? `...` : "";

// Line 308-316: wrap propStyleBlock
let propStyleBlock = "";
if (!isBundle) {
  // existing prop style logic
}

// Line 604: variation.instruction handling
isBundle 
  ? variation.instruction 
  : (propStyle === 'clean' ? /* regex strip */ : variation.instruction)
```

### File: `src/pages/BundleVisuals.tsx`

Add `is_bundle: true` to each variation entry so the edge function knows to skip conflicting blocks:

```typescript
const variationEntry = {
  label: scene.title + ...,
  instruction: promptInstruction,
  aspect_ratio: ratio,
  is_bundle: true,  // <-- NEW
  ...
};
```

## Safety
- The `is_bundle` flag is purely additive — no existing workflows are affected
- All changes are guarded by `if (isBundle)` checks
- Existing product images / flat lay / UGC workflows continue using their current logic unchanged
