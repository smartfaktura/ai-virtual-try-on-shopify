

# Debug Report: New Category Scenes

## What's Working (34 categories, all present)

All 22 new categories were created successfully with scenes:

| Category | Scenes | Unique Shots | Status |
|---|---|---|---|
| backpacks | 24 | 3 (Back Panel, Straps & Harness, Packed/Loaded) | OK |
| wallets-cardholders | 24 | 3 (Open Interior, Card Slot, Pocket Fit) | OK |
| belts | 24 | 3 (Buckle Close-Up, Coiled Display, On-Waist Crop) | OK |
| scarves | 24 | 3 (Draped Fabric, Knot/Wrap, Folded Display) | OK |
| jewellery-necklaces | 24 | 3 | OK |
| jewellery-earrings | 24 | 3 | OK |
| jewellery-bracelets | 24 | 3 | OK |
| jewellery-rings | 24 | 3 | OK |
| watches | 19 | 3 (Dial Macro, On-Wrist, Crown & Pushers) | OK |
| eyewear | 19 | 3 (Lens Detail, On-Face, Folded Temple) | OK |
| sneakers | 21 | 3 | OK |
| boots | 21 | 3 | OK |
| high-heels | 21 | 3 | OK |
| dresses | 21 | 3 | OK |
| hoodies | 21 | 3 | OK |
| streetwear | 21 | 3 | OK |
| jeans | 21 | 3 | OK |
| jackets | 21 | 3 | OK |
| activewear | 21 | 3 | OK |
| swimwear | 21 | 3 | OK |
| lingerie | 21 | 3 | OK |
| kidswear | 21 | 3 | OK |

No empty prompts, no missing scene_ids. Classification code and keyword matching are in place.

---

## Issues Found

### Issue 1: Irrelevant bag-specific scenes cloned into jewellery, belts, scarves, wallets

All 4 jewellery categories, belts, scarves, and wallets inherited **every** bags-accessories scene — including scenes that make no sense for those products:

- **"Interior View"** — designed for bag interiors (lining, compartments). Irrelevant for earrings, rings, belts, scarves.
- **"On Shoulder Editorial"** — bag held on shoulder. Makes no sense for rings, earrings, wallets, belts.
- **"Strap Detail"** — bag strap close-up. Irrelevant for rings, earrings, scarves, wallets.
- **"Arm Cradle Hold"** — bag cradled in arm. Doesn't apply to small jewellery, belts, scarves.
- **"Hanging Strap"** — bag dangling from strap. Irrelevant for all these categories.
- **"Hardware Close-Up"** — somewhat OK for some, but the prompt template references bag hardware.
- **"Mid Portrait Hold"** — person holding a bag at mid-body. Odd for rings/earrings.

That's ~5-7 scenes per category that will produce bad/confusing results because the **prompt templates still reference bags** (e.g., "the bag displayed from the back showing stitching details").

### Issue 2: `categoryUtils.ts` maps to old generic category slugs

The detection rules in `categoryUtils.ts` map some categories to old slugs that don't match `category_collection` values in the DB:

- `'cosmetics'` (line 36, 39) — no `category_collection` called `cosmetics`; should be `beauty-skincare` or `fragrance`
- `'clothing'` (line 38) — no `category_collection` called `clothing`; should be `garments`
- `'food'` (line 40) — should be `food-beverage`
- `'home'` (line 41) — should be `home-decor`
- `'supplements'` (line 42) — should be `supplements-wellness`
- `'universal'` (lines 43-49) — no `category_collection` called `universal`; should be `shoes`, `bags-accessories`, `tech-devices`, `other`, etc.

These mismatches mean products that don't match a specific new category will fall into slugs that have **zero scenes** in the DB, showing nothing or falling back to the hardcoded `FALLBACK_ALL`.

### Issue 3: `makeup` vs `makeup-lipsticks` mismatch

`categoryUtils.ts` line 35 maps to `'makeup'`, but `CATEGORY_KEYWORDS` in Step2 and the DB both use `'makeup-lipsticks'`. The classification won't find the right DB collection.

---

## Fix Plan

### Step 1: Remove irrelevant inherited scenes from jewellery, belts, scarves, wallets (DB UPDATEs)

Deactivate (`is_active = false`) the following scene types from these 8 categories: `jewellery-necklaces`, `jewellery-earrings`, `jewellery-bracelets`, `jewellery-rings`, `belts`, `scarves`, `wallets-cardholders`:

Scenes to remove:
- Interior View (title)
- On Shoulder Editorial
- Strap Detail
- Arm Cradle Hold
- Hanging Strap

Additionally for `belts` and `scarves` specifically, also deactivate:
- Mid Portrait Hold (doesn't make sense for a belt)

For `wallets-cardholders`, keep Mid Portrait Hold (holding wallet is fine).

This is ~35-42 DELETE/deactivate operations across these categories.

### Step 2: Fix `categoryUtils.ts` slug mapping

Update the generic fallback rules to use correct DB `category_collection` slugs:

| Current | Should be |
|---|---|
| `'cosmetics'` (beauty products) | `'beauty-skincare'` |
| `'cosmetics'` (fragrance) | `'fragrance'` |
| `'clothing'` | `'garments'` |
| `'food'` | `'food-beverage'` |
| `'home'` | `'home-decor'` |
| `'supplements'` | `'supplements-wellness'` |
| `'universal'` (shoes) | `'shoes'` |
| `'universal'` (bags) | `'bags-accessories'` |
| `'universal'` (tech) | `'tech-devices'` |
| `'universal'` (other groups) | `'other'` |
| `'makeup'` | `'makeup-lipsticks'` |

### Step 3: Update `TemplateCategory` type if needed

Ensure the union type in `types/index.ts` includes all the correct DB slugs and doesn't include orphan values.

### Summary

- ~40 scene deactivations (DB data updates)
- 1 file fix: `categoryUtils.ts` — fix ~12 slug mappings
- 1 file fix: `types/index.ts` — align type values

