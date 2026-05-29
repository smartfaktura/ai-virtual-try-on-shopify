## Proposal

When AI styling mode is active **and** the user left "Add styling direction" empty, skip the `WARDROBE DIRECTION` block entirely. Let the scene/variation prompt be the only styling source. This removes one more layer of wardrobe noise and matches your intuition that less injection = better adherence to the scene.

## Behavior matrix (after change)

| Mode | Styling direction text | Scene `outfit_hint` | Result in prompt |
|---|---|---|---|
| AI | empty | none | **No wardrobe block at all** (scene prompt is sole source) |
| AI | filled | none | `STYLING PRIORITY: <text>` only (no generic WARDROBE DIRECTION) |
| AI | empty/filled | present | Scene `outfit_hint` wins (unchanged) |
| Manual | — | — | `OUTFIT LOCK — Wearing exactly: …` (unchanged) |
| Product-is-outfit category (lingerie, swimwear, activewear, kidswear) | — | — | Strict product lock (unchanged) |

Skin/anatomy realism line (`Hyper-realistic skin texture…`) gets moved into the always-on quality directives so it still appears even when no wardrobe block is emitted.

## Changes

1. **`src/lib/productImagePromptBuilder.ts`**
   - In `buildAiWardrobeDirective`:
     - If `customOutfitNote` is empty → return empty string (no `WARDROBE DIRECTION` block).
     - If filled → return only `STYLING PRIORITY: <text>` (drop the generic paragraph).
   - Move the "Hyper-realistic skin texture with visible pores, natural anatomy, correct proportions" line into the existing always-on realism/quality directive section so on-model shots always get it regardless of wardrobe block.
   - Keep AI-mode hardening from the previous fix (ignore stale `outfitConfig`/`outfitConfigByScene`).
   - Manual mode and product-is-outfit categories untouched.

2. **No UI changes.** The "Add styling direction" textarea continues to work as the only AI-mode wardrobe input.

## Verification

- AI + empty styling → final prompt has **no** `WARDROBE DIRECTION`, no `STYLING PRIORITY`, no `OUTFIT LOCK`; skin-realism line still present.
- AI + styling text "all white linen" → prompt contains `STYLING PRIORITY: all white linen`, nothing else wardrobe-related.
- Manual outfit picked → `OUTFIT LOCK — Wearing exactly: …` still present.
- Scene with built-in `outfit_hint` → hint still wins.
- Activewear/lingerie/swimwear/kidswear → strict product lock still present.
