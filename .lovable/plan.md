## Problem

The stock-product default shown in Step 6 is fine for women across the board, but for **swimwear** and **lingerie** it visually misrepresents male casts (bikini / bra shown when the scene is for a man).

We don't need a general gender system — just a narrow override for these two sub-families when the first selected cast gender is `men`.

## Solution — prompt-based men override (no schema change)

Keep `brand_scene_stock_products` as-is. Add a tiny override map keyed by `(module, sub_family, gender)` that returns a **prompt + label** instead of a stock image URL. When it matches, Step 6 uses the prompt-driven preview instead of the stock product image.

### Override entries (only two)

| Module | Sub-family | Gender | Prompt | Label |
|---|---|---|---|---|
| `fashion` | `swimwear` | `men` | "Men's striped navy blue swim shorts, mid-thigh length, drawstring waist, clean studio product shot on white" | Men's swim shorts |
| `fashion` | `lingerie` | `men` | "Men's plain black cotton boxer briefs, clean studio product shot on white" | Men's boxers |

All other categories / genders fall through to the existing `brand_scene_stock_products` lookup — unchanged.

### How the preview is rendered

The existing Step 6 stock-product preview expects an image URL. Two options for the men override:

1. **Recommended — generate once, cache.** On first hit, call the existing image-gen edge function with the override prompt, upload to a new `brand-scene-stock-overrides/<sub_family>-<gender>.png` path in `scratch-uploads` (public read), and store the resulting URL in a tiny `brand_scene_stock_overrides` table keyed by `(module, sub_family, gender)`. Subsequent users just read the cached URL — no per-user generation cost.
2. **Simpler — pre-seed once.** Generate both images manually (or in a one-off script), upload to storage, and seed the two rows directly. No runtime generation path needed.

Going with **option 2** — two static rows, zero new runtime code paths, easiest to audit.

## Files touched

- `src/features/brand-scenes/wizard/hooks/useStockProductForScene.ts` — accept optional `gender`, check the override map first, then fall back to today's `(module, sub_family)` lookup.
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx` — pass `answers.cast?.gender?.[0]` to the hook.
- `src/features/brand-scenes/wizard/constants/stockOverrides.ts` *(new)* — the two-entry override map: `{ module, sub_family, gender, image_url, label }`.
- One-off image generation + storage upload for the two override PNGs (men's swim shorts, men's boxers) — done out-of-band, URLs pasted into the map.

## Out of scope

- Schema changes to `brand_scene_stock_products`
- Other categories (activewear, footwear, streetwear) — current defaults are acceptable
- Women-specific overrides (current defaults already represent women well)
- Multi-gender casts — we take the first selected gender, same as everywhere else
