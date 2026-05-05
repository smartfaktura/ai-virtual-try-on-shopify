## Add "Hats, Caps & Beanies" to Admin Recommended Scenes and Discover

The new family was added to `sceneTaxonomy.ts` and `usePublicSceneLibrary.ts` in the previous change, but the admin recommended-scenes page and discover flow still reference the old taxonomy. These files need updates:

### 1. `src/lib/categoryConstants.ts` — Add category chip
- Add `{ id: 'hats-caps-beanies', label: 'Hats, Caps & Beanies' }` after `bags-accessories` in `PRODUCT_CATEGORIES`
- Add matching headline entries in `CATEGORY_HEADLINES` and `CATEGORY_HEADLINES_RETURNING`

### 2. `src/lib/onboardingTaxonomy.ts` — Register family
- **FAMILY_SUB_ORDER**: Remove `caps`, `hats`, `beanies` from `'Bags & Accessories'` array, add new key `'Hats, Caps & Beanies': ['caps', 'hats', 'beanies']`
- **FAMILY_ID_TO_NAME**: Add `'hats-caps-beanies': 'Hats, Caps & Beanies'`
- (FAMILY_NAME_TO_ID is auto-derived, no manual change needed)

### 3. `src/lib/discoverTaxonomy.ts` — No code changes
This file re-exports from onboardingTaxonomy and sceneTaxonomy. Once those are updated, `getDiscoverFamilies()`, `getDiscoverSubtypes()`, and `itemMatchesDiscoverFilter()` will automatically include the new family.

### Result
- Admin `/app/admin/recommended-scenes` will show a new "Hats, Caps & Beanies" tab alongside the existing family tabs
- Sub-family strip under that tab will show Caps, Hats, Beanies pills for per-sub-type curation
- Discover filtering will recognize the new family for category-based display
