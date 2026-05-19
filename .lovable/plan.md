## Show "Campaign Statements" first on /ai-product-photography/bags

The chip tabs in the "Built for every bags shot" section are rendered in the order their groups appear in the raw data array. Currently "Bags · On-Body Editorial" is first for the `bags-accessories` slug, so it loads selected by default.

### Change
- **File:** `src/data/aiProductPhotographyBuiltForGrids.ts`
- **Action:** Within the `"bags-accessories"` array, move the `"Bags · Campaign Statements"` group (lines ~1109–1145) to be the first entry, before `"Bags · On-Body Editorial"`.
- No other slugs, image IDs, or labels change. All admin slot keys (e.g. `builtFor_campaign-statements_*`) stay the same because they're derived from the subCategory name, not its index.

Result: visiting `/ai-product-photography/bags-accessories` lands on the **Campaign Statements** tab with its 8-image grid pre-selected.