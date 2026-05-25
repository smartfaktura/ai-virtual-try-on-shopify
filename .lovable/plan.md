## Goal

For every Brand Scene wizard sub-category, only show options that actually make sense for that product. Stop leaking irrelevant chips like "Pouring" / "Earring on ear" on Sneakers, "Holding" / "Placed beside" on Necklaces, or "Jumping" / "Walking" poses on a hands-only ring shot.

## Root causes

After tracing `Step4Cast.tsx` → `resolvePresets.ts` → `categoryPresets.ts` → `combinationGuards.ts`:

1. **`PRESETS.interactions` is treated as a sort hint, not an allowlist.** `Step4Cast.visibleInteractions` shows every `CAST_INTERACTIONS` value that isn't in `forbiddenInteractions(...)`. Only the *family* + cast + scale prune the list. So a sub-family declaring `interactions: ["wearing","hero"]` has no UI effect — the user still sees "Holding", "Placed beside".

2. **`hands_on_product` falls back to ALL gestures when undefined.** `resolveAll` does `b.hands_on_product ?? HANDS_ON_PRODUCT.map(...)`. Families/sub-families without a list show every gesture in the dropdown — so eyewear, hats, footwear, bags all surface "Necklace at neckline", "Earring on ear", "Ring on ring finger", "Pouring", "Wrist showing watch".

3. **`CAST_ACTIONS` (Pose chips) is never filtered.** Hands-only and product-only presets still see "Walking", "Jumping", "Mid-motion", "Standing" — none of which apply when there is no full body.

4. **`body_part_focus` falls back to ALL** when a sub-family doesn't define it; sub-families like `eyewear`, `bags-accessories/wallets-cardholders`, `tech` show every body-part option.

## Changes

### 1. `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — make `resolved.interactions` an allowlist
Change `visibleInteractions` from "filter by forbidden + sort by resolved" to "filter to resolved ∩ not-forbidden, in resolved order". Same shape, just stricter. Backwards-compatible because families without an override fall back to the full list in `resolveAll`.

### 2. `src/features/brand-scenes/wizard/registry/categoryPresets.ts` — per-sub-family allowlists
Fill the gaps so every sub-family has the right `interactions`, `hands_on_product`, `body_part_focus`. Highlights:

**jewelry**
- `jewellery-rings`: interactions `["wearing","hero"]` (already correct hands_on_product/body_part_focus).
- `jewellery-earrings`: interactions `["wearing","hero"]`.
- `jewellery-necklaces`: interactions `["wearing","hero"]`.
- `jewellery-bracelets`: interactions `["wearing","hero"]`.

**watches** (no sub-families)
- interactions `["wearing","hero"]` (drop "holding"/"beside" — watches don't read worn unless on a wrist).

**eyewear**
- family: `hands_on_product: ["cradle","pinch"]`, `body_part_focus: ["face","detail"]`.
- interactions `["wearing","hero","beside"]` (drop "holding" — eyewear in hand is rare/awkward; leave "beside" for tabletop kits).

**hats-caps-beanies**
- family: `hands_on_product: ["cradle","pinch"]`, interactions `["wearing","hero"]`.
- per sub already constrains interactions to wearing/holding/hero — narrow further: `caps`/`hats`/`beanies` all `interactions: ["wearing","hero"]`.

**fashion** (and subs)
- family: `hands_on_product: []` (empty array → resolver should treat as "none allowed"; alternatively just don't show this field — see step 3 below). Garments aren't a hand-gesture context. interactions `["wearing","hero"]`.
- sub-families inherit; lingerie/swimwear already restricted via outfit hides.

**footwear**
- family: `hands_on_product: ["cradle","pinch"]` (for unboxing/in-hand sneakers shots).
- interactions `["wearing","holding","beside","hero"]` (current) — keep.
- sub `sneakers`/`boots`/`shoes`/`high-heels`: inherit.

**bags-accessories**
- family: `hands_on_product: ["cradle","pinch"]`.
- `backpacks`: `hands_on_product: ["cradle"]`, interactions `["wearing","holding","hero"]`.
- `wallets-cardholders`: `hands_on_product: ["pinch","cap","tap"]` (already constrained interactions).
- `belts`/`scarves`: `hands_on_product: ["cradle","pinch"]`, interactions `["wearing","hero"]`.

**beauty-fragrance** sub-families already declare correct `hands_on_product`. Add `body_part_focus: ["hands","face","detail"]` at family level.

**home / tech / food-drink / wellness**
- Already mostly correct. Add `body_part_focus: ["hands","detail"]` to bags/tech/food-drink where missing.

### 3. `src/features/brand-scenes/wizard/registry/resolvePresets.ts` — respect empty arrays
Currently `b.hands_on_product ?? ALL` collapses `[]` into nothing (good) but still fires `??`. Change to: if the resolved bundle declared the key (even as empty array), keep it as-is; only fall back to ALL when `undefined`. Apply the same rule to `body_part_focus`, `interactions`, `wardrobe_colors`. That lets a sub-family explicitly opt out of an entire field.

### 4. New: per-cast-preset Pose filter
Add a helper `posesForCast(preset, scale)` in `wizard/constants/cast.ts`:
- `hands` / `none`: return `[]` (pose section is already hidden for these in the UI because `hasPeople` is false — confirm and leave as-is).
- `solo` / `two` / `group` + scale `pocket`: drop `walking`, `jumping`, `motion` (you can't capture a jump while holding a 30mm ring on macro).
- otherwise: return all `CAST_ACTIONS`.
Wire into `Step4Cast.InteractionTab` `<ChipRowWithOther options={posesForCast(preset, scalePreset)} ... />`.

### 5. New: per-sub-family `wardrobe_colors` audit pass
A quick audit: `jewelry`, `watches`, `eyewear` already inherit ALL colors via the resolver — fine. `fashion/lingerie` and `fashion/swimwear` hide wardrobe entirely (already done). No code changes here unless an obvious mismatch surfaces during testing.

### 6. Tighten `combinationGuards.ts` — sub-family-aware bans
Add a small `forbiddenInteractionsBySubFamily(family, sub)` returning e.g. `{ "jewelry/jewellery-necklaces": ["holding","beside"] }`. Mostly redundant after step 1 + step 2, but acts as a safety net for any code path that bypasses `resolved.interactions`.

## Out of scope

- No changes to the scene aesthetic step (Step3) — settings, palettes, surfaces are already category-tuned.
- No new copy or visual redesign of the wizard.
- No backend / edge function / DB changes.

## Validation

For each of these sub-families, open `/app/brand-scenes/new`, pick the category, choose **Design the look**, walk through Essentials → People → Interaction, and confirm only the listed chips appear:

| Sub-family | Interactions | Hands-on-product | Pose (when hands preset) |
|---|---|---|---|
| jewelry / rings | Wearing, Product only | Ring on ring finger, Fingertip pinch, Both hands cradling | section hidden |
| jewelry / earrings | Wearing, Product only | Earring on ear | section hidden |
| jewelry / necklaces | Wearing, Product only | Necklace at neckline | section hidden |
| jewelry / bracelets | Wearing, Product only | Bracelet on wrist, Wrist showing watch, Fingertip pinch | section hidden |
| watches | Wearing, Product only | Wrist showing watch, Fingertip pinch | section hidden |
| eyewear | Wearing, Placed beside, Product only | Both hands cradling, Fingertip pinch | n/a (default solo) |
| footwear / sneakers | Wearing, Holding, Placed beside, Product only | Both hands cradling, Fingertip pinch | poses with no Walking/Jumping when hands preset |
| bags-accessories / backpacks | Wearing, Holding, Product only | Both hands cradling | n/a |
| beauty-fragrance / fragrance | Holding, Placed beside, Product only | Both hands cradling, Fingertip pinch, Pinching cap | n/a |
| fashion / dresses | Wearing, Product only | section hidden (scale not pocket/handheld) | full pose list (solo) |

Spot-check Auto-cast on Rings, Necklaces, Sneakers, Fragrance — the seeded gesture should pick the first allowlisted value (which is now correct per category).
