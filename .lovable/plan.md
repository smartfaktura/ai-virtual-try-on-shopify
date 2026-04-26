## Goal

On `/ai-product-photography/food-beverage`, make **Beverages** the first (default-active) chip in the "Built for every food & beverage shot" section instead of Food.

## Change

Reorder the `"food-beverage"` array in `src/data/aiProductPhotographyBuiltForGrids.ts` so Beverages groups come before Food/Snacks. The chip rail renders groups in source order, and `activeIdx` defaults to `0`, so the first group is shown by default.

New order within `"food-beverage"`:

1. `Beverages · Editorial Drink`
2. `Beverages · Creative Shots`
3. `Beverages · Aesthetic Color`
4. `Beverages · Lifestyle UGC`
5. `Food · Essential Shots`
6. `Food · Creative Shots`
7. `Snacks · Editorial`

(Subjects differ across groups, so `getBuiltForGroupsForPage` keys chips by subject — chips become: Beverages, Food, Snacks, with Beverages active by default.)

## Why this approach

- Slot keys for admin overrides are derived from `subCategory` text (`slotSlugify`), not array index — so reordering does not break any existing image overrides.
- No component logic change needed; ordering is data-driven.
- No SEO impact: same content, same URLs, same images, just visual default tab.

## Files

- `src/data/aiProductPhotographyBuiltForGrids.ts` — reorder the 7 group objects under the `"food-beverage"` key.
