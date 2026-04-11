

# Fix: Lingerie/Intimates Products Getting Covered by Support Clothing

## Problem
The "Nude Seamless Bra and Shorts Set" is classified as `lingerie` (matched by "bra" keyword), but the prompt builder has **no handling for `lingerie` category**. It falls through to default outfit logic which instructs the AI to dress the model in "clean neutral top, understated trousers" — literally covering the product with additional clothing. The screenshots confirm this: a t-shirt appears layered over the bra set.

## Root Cause
The `catalogEngine.ts` handles swimwear by nullifying all support wardrobe slots, but **lingerie has no equivalent treatment** in `productImagePromptBuilder.ts`. The prompt builder's `defaultPersonDirective()`, `defaultOutfitDirective()`, `categoryOutfitDefaults()`, `resolveBodyFramingDirective()`, and other category-aware functions don't have `lingerie` cases.

## Fix — `src/lib/productImagePromptBuilder.ts`

Add `lingerie` handling alongside `swimwear` in all category-aware functions:

1. **`categoryOutfitDefaults()`** — Add `case 'lingerie':` returning all-empty slots (no support clothing), same as swimwear should
2. **`defaultOutfitDirective()`** — For `lingerie` category, return a directive like: "OUTFIT LOCK — The product IS the outfit. Model wears ONLY the product — no additional clothing, no layering. Show the lingerie/intimates as-is."
3. **`defaultPersonDirective()`** — Add `case 'lingerie':` with appropriate model description for intimates photography
4. **`resolveBodyFramingDirective()`** — Add `case 'lingerie':` for full-body framing
5. **`defaultBackground()`**, **`defaultLighting()`**, **`defaultShadow()`**, **`defaultStyling()`** — Add `lingerie` cases with soft, beauty-oriented defaults

Also add same treatment for `activewear` and `swimwear` in `categoryOutfitDefaults()` since those categories also represent products that ARE the outfit.

## Technical Detail
All changes in a single file. The key insight: when the product IS what the model wears (lingerie, swimwear, activewear), the outfit directive must explicitly state "no additional clothing" instead of suggesting support garments.

