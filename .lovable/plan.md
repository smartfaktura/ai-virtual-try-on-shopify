

## Sidebar — Family → Sub-families (grounded in real data)

Sidebar shows **Product Family + its direct collection slugs** (one level deep). Slugs are taken verbatim from `category_collection` in the DB — no invented names.

### Real sub-families per family (from live DB)

| Family | Sub-families (slug → label) | Scenes |
|---|---|---|
| Fashion | garments, dresses, hoodies, jeans, jackets, lingerie, swimwear | 7 items |
| Footwear | sneakers, shoes, boots, high-heels | 4 items |
| Activewear | activewear | 1 (no expand) |
| Bags & Accessories | bags-accessories, backpacks, belts, scarves, hats-small, wallets, wallets-cardholders | 7 items |
| Jewelry | jewellery-rings, jewellery-bracelets, jewellery-necklaces, jewellery-earrings | 4 items |
| Eyewear | eyewear | 1 (no expand) |
| Watches | watches | 1 (no expand) |
| Beauty | beauty-skincare, makeup-lipsticks | 2 items |
| Fragrance | fragrance | 1 (no expand) |
| Home | home-decor, furniture | 2 items |
| Tech | tech-devices | 1 (no expand) |
| Food & Drink | beverages, food, snacks-food | 3 items |
| Wellness | supplements-wellness | 1 (no expand) |

If a family has only **one** collection, the sidebar shows just the family row (no expand arrow, no nested item) — clicking it filters that one collection directly.

### Label rendering

Slugs are humanised at render time with a small `SUB_FAMILY_LABEL_OVERRIDES` map for non-obvious cases. Everything else falls back to `slug.replace(/-/g,' ')` title-cased.

```ts
// src/lib/sceneTaxonomy.ts
export const SUB_FAMILY_LABEL_OVERRIDES: Record<string, string> = {
  'garments': 'Tops & Shirts',
  'hats-small': 'Hats',
  'wallets-cardholders': 'Cardholders',
  'bags-accessories': 'Bags',
  'beauty-skincare': 'Skincare',
  'makeup-lipsticks': 'Makeup',
  'jewellery-rings': 'Rings',
  'jewellery-bracelets': 'Bracelets',
  'jewellery-necklaces': 'Necklaces',
  'jewellery-earrings': 'Earrings',
  'high-heels': 'Heels',
  'home-decor': 'Decor',
  'tech-devices': 'Devices',
  'snacks-food': 'Snacks',
  'supplements-wellness': 'Wellness',
};
```

Output examples:
- Bags & Accessories → Bags / Backpacks / Belts / Scarves / Hats / Wallets / Cardholders
- Footwear → Sneakers / Shoes / Boots / Heels
- Fashion → Tops & Shirts / Dresses / Hoodies / Jeans / Jackets / Lingerie / Swimwear

### Click behaviour

- Family with 1 collection → click filters grid to that collection. No expand.
- Family with 2+ collections → click expands the list inline + filters grid to whole family. Click a sub-family row → filters grid to just that collection.
- Click active sub-family again → clears it, returns to whole-family view.
- Switching families clears any active sub-family.
- "Essential" `sub_category` rows still pushed to bottom of grid (existing behaviour, unchanged).

### Files touched

- `src/lib/sceneTaxonomy.ts` — add `SUB_FAMILY_LABEL_OVERRIDES` + `getSubFamilyLabel(slug)` helper.
- `src/hooks/useSceneCounts.ts` — already returns `byCollection`; expose derived `bySubFamilyByFamily` (one extra grouping pass over the existing payload, no new query).
- `src/components/app/freestyle/SceneCatalogSidebar.tsx` — render sub-families under the active family; skip expand UI when only 1 sub-family exists.
- `src/components/app/freestyle/SceneCatalogModal.tsx` — wire `categoryCollection` filter; clear it when family changes.
- `src/hooks/useSceneCatalog.ts` — accept `categoryCollection?: string` (`.eq('category_collection', value)`).

### Untouched

DB schema, RLS, generation pipeline, edge functions, admin pages, top-bar filters, card design, "All scenes / Recommended / New" sidebar section.

### Validation

- Click Eyewear → grid filters to 56 eyewear scenes; **no** "Sunglasses" sub-row appears (because it doesn't exist).
- Click Bags & Accessories → expands to 7 real sub-families with correct counts.
- Click Footwear → Sneakers / Shoes / Boots / Heels with correct counts (84 / 60 / 47 / 36).
- Counts add up: family count = sum of its sub-family counts.
- Generation behaviour unchanged.

