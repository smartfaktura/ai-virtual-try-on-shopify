## Diagnosis
The grey sweater text is still coming from the UI auto-preset system, not from the new AI wardrobe directive itself.

In `ProductImagesStep3Refine.tsx`, AI styling currently auto-populates `outfitConfigByScene` for scenes without a built-in `outfit_hint`. Then `ProductImages.tsx` copies that per-scene outfit into `details.outfitConfig`, which makes the prompt builder treat AI styling like a specific manual outfit. That produces:

```text
OUTFIT LOCK — Wearing exactly: Top: grey cotton relaxed-fit crewneck knit...
```

There is also one fallback branch in `productImagePromptBuilder.ts` that still wraps user outfits in a `WARDROBE NOTE` when templates omit `{{outfitDirective}}`, which can preserve the old wording path.

## Plan

1. **Remove AI-mode auto outfit injection**
   - In `ProductImagesStep3Refine.tsx`, stop auto-writing preset outfits into `details.outfitConfigByScene` when `outfitMode` is AI.
   - AI styling should only keep `outfitMode: 'ai'` and optional `customOutfitNote`.
   - Manual styling remains unchanged.

2. **Prevent per-scene outfit presets from overriding AI mode at generation time**
   - In `ProductImages.tsx`, only apply `resolvedOutfit` into `variationDetails.outfitConfig` when `details.outfitMode === 'manual'`.
   - This ensures stale `outfitConfigByScene` data from older sessions cannot leak into AI generations.

3. **Harden prompt builder fallback**
   - In `productImagePromptBuilder.ts`, update the auto-injector so AI mode always emits the shared `WARDROBE DIRECTION` helper unless the category is a strict product-is-outfit category.
   - Do not wrap AI wardrobe text in the old `WARDROBE NOTE` / outfit color wording.

4. **Keep manual and hard-lock behavior intact**
   - Manual mode still emits `OUTFIT LOCK — Wearing exactly: ...`.
   - Product-is-outfit categories still keep the strict “product is the outfit” lock unless we separately decide to loosen activewear/kidswear later.
   - Scene `outfit_hint` still wins unless user manually overrides it.

## Verification

- AI styling + necklace + empty styling direction → final prompt contains `WARDROBE DIRECTION`, no `grey cotton`, no `denim`, no `sneaker`, no `OUTFIT LOCK`.
- AI styling + necklace + styling direction → same directive plus `STYLING PRIORITY`.
- Manual styling → specific outfit lock still appears.
- Old saved state with `outfitConfigByScene` + AI mode → ignored during generation.
- Product-is-outfit category → strict product lock still appears.