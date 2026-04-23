

## Refine Step 3 — skip when no meaningful sub-choice exists

### Rule

Step 3 only renders when at least one selected family has **2 or more** sub-types. If every selected family resolves to a single sub-type, Step 3 is skipped entirely and onboarding finishes at Step 2 (progress dots collapse to 2 segments dynamically).

### Family → sub-type counts (from `sceneTaxonomy.ts`)

| Family | Sub-types | Count |
|---|---|---|
| Fashion | Clothing & Apparel, Hoodies, Dresses, Jeans, Jackets, Activewear & Sportswear, Swimwear, Lingerie, Kidswear, Streetwear | 10 |
| Footwear | Shoes, Sneakers, Boots, Heels | 4 |
| Bags & Accessories | Bags, Backpacks, Cardholders, Belts, Scarves, Hats | 6 |
| Watches | Watches | **1** |
| Eyewear | Eyewear | **1** |
| Jewelry | Rings, Necklaces, Earrings, Bracelets | 4 |
| Beauty & Fragrance | Skincare, Makeup, Fragrance | 3 |
| Home | Decor, Furniture | 2 |
| Tech | Devices | **1** |
| Food & Drink | Food, Beverages, Snacks | 3 |
| Wellness | Wellness | **1** |

Single-sub-type families: **Watches, Eyewear, Tech, Wellness**.

### Decision matrix

| Step 2 selection | Show Step 3? | Step 3 sections rendered | On finish, `product_subcategories` =  |
|---|---|---|---|
| Watches only | No | — | `['watches']` (auto-derived from family) |
| Eyewear only | No | — | `['eyewear']` |
| Tech only | No | — | `['tech-devices']` |
| Wellness only | No | — | `['supplements-wellness']` |
| Watches + Eyewear | No | — | `['watches','eyewear']` |
| Watches + Tech + Wellness | No | — | `['watches','tech-devices','supplements-wellness']` |
| Fashion only | Yes | Fashion (10 chips) | what user picked, or `[]` if Skip |
| Footwear only | Yes | Footwear (4 chips) | what user picked, or `[]` if Skip |
| Watches + Fashion | Yes | **Fashion only** (Watches auto-included silently) | picked Fashion sub-types + `'watches'`, or just `['watches']` if Skip |
| Watches + Eyewear + Fashion | Yes | **Fashion only** | picked + `'watches','eyewear'`, or `['watches','eyewear']` if Skip |
| Watches + Footwear + Tech | Yes | **Footwear only** | picked + `'watches','tech-devices'`, or `['watches','tech-devices']` if Skip |
| Fashion + Footwear | Yes | Fashion + Footwear | picked across both, or `[]` if Skip |
| All 11 families | Yes | 7 multi-sub-type families (Fashion, Footwear, Bags, Jewelry, Beauty, Home, Food) | picked + the 4 single-family slugs |

### Logic (deterministic)

```ts
const MULTI_SUB_FAMILIES = families.filter(f => SUB_TYPES_BY_FAMILY[f].length >= 2);
const SINGLE_SUB_FAMILIES = families.filter(f => SUB_TYPES_BY_FAMILY[f].length === 1);

const showStep3 = MULTI_SUB_FAMILIES.length > 0;
const totalSteps = showStep3 ? 3 : 2;

// Step 3 renders ONE section per multi-sub-type family, in FAMILY_ORDER.
// Single-sub-type families are silently auto-included on save — never shown.

const finalSubcategories = [
  ...userPickedInStep3,                                      // [] if skipped
  ...SINGLE_SUB_FAMILIES.flatMap(f => SUB_TYPES_BY_FAMILY[f]) // always added
];
```

### UX rules

- Progress dots reflect the dynamic total (2 or 3) — recomputed on every Step 2 selection change so the user sees the right count before clicking Continue.
- Step 3 still has both `Skip for now` (saves only the auto-included single-family slugs) and `Get started` (saves picks + auto-included).
- Section headers only appear for the multi-sub-type families actually shown.
- No section ever renders for Watches / Eyewear / Tech / Wellness — they live silently in `product_subcategories`.
- Settings page mirrors the same rule: sub-type editor only shows sections for multi-sub-type families the user selected.

### Edge cases covered

- Zero families in Step 2 → Continue disabled (existing rule), Step 3 never reachable
- Only single-sub-type families → Step 3 hidden, total = 2 steps, save still includes their slugs
- Mix of single + multi → Step 3 shows only the multi sections; single ones added on save
- All multi-sub-type families → Step 3 shows all 7 sections; page scrolls naturally if chips overflow viewport
- User goes back from Step 3 to Step 2 and unselects all multi-sub-type families → Step 3 disappears, total drops to 2

### Files (unchanged from prior plan)

```text
NEW   src/lib/onboardingTaxonomy.ts          family → ordered sub-type[] + helpers
                                              (export MULTI_SUB_FAMILIES helper)
EDIT  src/lib/sceneTaxonomy.ts               + 'garments' → "Clothing & Apparel",
                                              + 'activewear' → "Activewear & Sportswear",
                                              extend resolveUserCollections() optional arg
EDIT  src/pages/Onboarding.tsx               dynamic 2-or-3-step flow, optional Step 3,
                                              auto-include single-sub-type slugs on save
EDIT  src/lib/categoryConstants.ts           PRODUCT_CATEGORIES → 11 canonical families,
                                              sub-type-aware headlines
EDIT  src/hooks/useRecommendedScenes.ts      pass product_subcategories
EDIT  src/lib/conversionCopy.ts              widen matcher to sub-type slugs
EDIT  src/components/app/DashboardDiscoverSection.tsx  sub-type aware default tab
EDIT  src/pages/Settings.tsx                 mirror dynamic Step 3 logic
EDIT  supabase/functions/sync-resend-contact include product_subcategories
DB    add column profiles.product_subcategories text[] default '{}'
```

### Validation

1. Pick **Watches** only → onboarding shows 2 steps; finishing saves `['watches']`
2. Pick **Watches + Eyewear** → 2 steps; saves `['watches','eyewear']`
3. Pick **Watches + Fashion** → 3 steps; Step 3 shows only the Fashion section. Skip → saves `['watches']`. Pick "Hoodies, Dresses" + Get started → saves `['hoodies','dresses','watches']`
4. Pick **Tech + Wellness + Footwear** → 3 steps; Step 3 shows only the Footwear section. Saves include `'tech-devices','supplements-wellness'` regardless of picks
5. Pick **Fashion + Footwear** → 3 steps; Step 3 shows both sections, no auto-includes
6. Pick **all 11** → 3 steps; Step 3 shows 7 sections (Fashion, Footwear, Bags, Jewelry, Beauty, Home, Food); the 4 single-family slugs auto-included on save
7. Go back from Step 3, deselect all multi-sub-type families, Continue → progress dots animate from 3 to 2, lands on dashboard

