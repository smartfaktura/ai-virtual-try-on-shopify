
## Problem

When all selected scenes have an `outfit_hint` (curated styling direction), the user's outfit selection is ignored. The current behavior:

1. The outfit picker panel is **hidden** behind an "Edit outfit" toggle when all scenes have hints
2. Even if `outfitConfig` is populated (auto-applied from the first built-in preset), the scene's `outfit_hint` always wins unless `outfitOverrideEnabled` is explicitly toggled
3. The user sees outfits that vary per scene (each scene's hint drives different clothes), not the outfit they selected

The `resolveOutfitHintText()` function in `productImagePromptBuilder.ts` (line 895) only bypasses the scene hint when **both** `details.outfitOverrideEnabled === true` AND the user has defined outfit slots. Since `outfitOverrideEnabled` defaults to `false`, the scene hints always take priority.

## Fix

Two changes to make the system behave more intuitively:

### 1. Auto-enable override when user explicitly changes outfit config

In `ProductImagesStep3Refine.tsx`, when the user manually changes any outfit slot or loads a preset **while the override panel is visible**, auto-set `outfitOverrideEnabled: true`. This ensures that explicit user action always takes effect.

Affected update calls:
- `update({ outfitConfig: next })` in slot change handlers
- `update({ outfitConfig: { ...preset.config } })` in preset load handlers

Change these to also include `outfitOverrideEnabled: true` when scenes have hints.

### 2. Show clearer indication when outfit is overridden

The current UI already handles this with the "Custom outfit active" / "Outfit is directed by your selected shots" messaging. No change needed here — just the auto-enable logic above.

## Technical Details

**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**
- In the outfit slot update functions, when `allModelScenesHaveOutfitHint` is true and user modifies outfit, also set `outfitOverrideEnabled: true`
- This applies to: slot card changes, preset loading, AI stylist assignment

**File: `src/lib/productImagePromptBuilder.ts`**  
- No changes needed — the override logic is correct, just not triggered because `outfitOverrideEnabled` wasn't being set

This is a minimal fix that preserves the existing architecture while making outfit selection work as users expect.
