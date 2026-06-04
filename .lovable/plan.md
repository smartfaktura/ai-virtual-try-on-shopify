## Plan — Surface Wedding Dress as a sub-type under Fashion

`wedding-dress` already exists everywhere downstream (CATEGORY_FAMILY_MAP maps it to Fashion, productCategories.ts groups it under Fashion & Apparel, SUB_FAMILY_LABEL_OVERRIDES already renders the label "Wedding Dress"). The only reason it's missing from onboarding sub-types, Discover's Fashion sub-pill row, and the Admin Recommended Scenes sub-tabs is that it's not listed in `FAMILY_SUB_ORDER.Fashion` inside `src/lib/onboardingTaxonomy.ts`. Once added, `SUB_TYPES_BY_FAMILY.Fashion` includes it and every consumer picks it up.

### File — `src/lib/onboardingTaxonomy.ts`

1. `FAMILY_SUB_ORDER.Fashion` (line 25-36): insert `'wedding-dress'` right after `'dresses'` so the chip order reads: garments, hoodies, dresses, wedding-dress, jeans, trousers, jackets, activewear, swimwear, lingerie, socks.
2. `SUBTYPE_NOUN` (line 173-221): add `'wedding-dress': 'wedding dress'` in the Fashion block so the dashboard headline copy (`buildMultiSubtypeHeadline`) renders correctly when a user selects it.

### What flows automatically (no other edits)

- **Onboarding Step 3** — Fashion section gets a "Wedding Dress" chip (uses `SUB_TYPES_BY_FAMILY.Fashion`).
- **Settings sub-type editor** — same source.
- **/app/discover Fashion pill** — sub-pill row pulls `getDiscoverSubtypes('fashion')`, so a Wedding Dress sub-pill appears next to Dresses.
- **/app/discover item matching** — `itemMatchesDiscoverFilter` already supports filtering items where `subcategory === 'wedding-dress'` under the Fashion family.
- **Admin Recommended Scenes** — the Fashion tab's sub-collection tabs derive from `SUB_TYPES_BY_FAMILY`, so a Wedding Dress sub-tab appears, letting the admin curate `recommended_scenes` rows tagged `category = 'wedding-dress'`.
- **Round-robin interleavers** — `interleaveByFamilyAndSubFamily` already treats each `category_collection` slug as its own sub-bucket, so wedding-dress items rotate naturally inside the Fashion family.

### Out of scope

- No DB changes — `wedding-dress` slug already exists in `product_image_scenes.category_collection` and `discover_presets.subcategory`.
- No changes to `sceneTaxonomy.ts`, `categoryConstants.ts`, `productCategories.ts`, or `categoryResolver.ts` — they already handle the slug.
- No headline override in `SUBTYPE_HEADLINES` (Fashion's family headline covers it; can revisit if specifically requested).

### Risk

Minimal. One slug added to one ordered array and one noun lookup. TypeScript build will catch any stray issues.