

## Unify Discover taxonomy with onboarding (families + sub-types everywhere)

You're right — I was keeping Discover on the old 11-bucket list. The fix is to make Discover speak the **same language** as onboarding/Settings: the full family + sub-type taxonomy from `onboardingTaxonomy.ts`. One source of truth across Step 3, Settings, Add to Discover modal, /app/discover, /discover, and the dashboard "Steal the Look" rail.

### The taxonomy everyone will share

Pulled directly from `FAMILY_ORDER` + `SUB_TYPES_BY_FAMILY` in `src/lib/onboardingTaxonomy.ts`. Example shape rendered in every Discover surface:

```text
Fashion & Apparel   → Clothing · Hoodies · Dresses · Jeans · Jackets ·
                      Activewear · Swimwear · Lingerie · Streetwear
Footwear            → Sneakers · Boots · Heels · Flats · Sandals
Beauty & Fragrance  → Skincare · Makeup · Haircare · Fragrance
Bags & Accessories  → Bags · Backpacks · Belts · Scarves · Hats · Wallets · Eyewear
Watches             → Watches
Jewelry             → Rings · Necklaces · Earrings · Bracelets
Tech                → Devices
Home                → Home Decor · Furniture
Food & Drink        → Food · Beverages · Snacks
Wellness            → Supplements
```

(Exact list = whatever `onboardingTaxonomy.ts` defines today; nothing hand-maintained.)

### How each surface uses it

**1. Add to Discover modal** — currently a flat 10-pill row that's missing Lifestyle and doesn't match Settings.

New layout: a **family selector** (chips, single-select) + a **sub-type selector** (chips, single-select) underneath, populated from the chosen family. The AI auto-fill (`describe-discover-metadata`) returns BOTH `family` + `subtype` and we pre-select them. We persist both onto the discover row:

- `category` = family id (existing column, keeps current filtering working)
- `subcategory` = sub-type slug (new column on `discover_presets`, nullable)

If a family has only one sub-type (Watches, Tech, Wellness), the sub-type strip is hidden and `subcategory` is auto-set.

**2. /app/discover and /discover (PublicDiscover)** — currently a single-row category bar.

New layout (matches the screenshot you sent of Settings):

```
[All] [Fashion & Apparel] [Footwear] [Beauty & Fragrance] [Bags & Acc.] [Watches] …    ← family row
                                                                                        ← sub-row appears
[All Fashion] [Clothing] [Hoodies] [Dresses] [Jeans] [Jackets] …                       ← when a family is active
```

Filter logic:
- `All` → everything
- Family selected, no sub-type → items where `category = family OR subcategory ∈ family's sub-types`
- Sub-type selected → items where `subcategory = slug` (with old rows that lack a sub-type still showing if their `category` matches the family — backward compatible)

The existing "For you" sort (user's families first, then user's sub-types within each family) keeps working — it now has real sub-type data to sort against.

**3. Dashboard "Steal the Look" (`DashboardDiscoverSection.tsx`)** — same two-row bar as `/app/discover`. Default selection still derives from the user's onboarding families/sub-types via the existing `FAM_TO_DISC` mapper, but now it can land directly on a sub-type pill (e.g., `hoodies`) instead of just a family.

**4. AI metadata edge function (`describe-discover-metadata`)** — system prompt + tool schema rewritten to return `{ title, family, subtype, tags }`. The `family` enum = full `FAMILY_ORDER`. The `subtype` enum is dynamic per-family in the prompt, validated server-side against `SUB_TYPES_BY_FAMILY[family]`. If the model picks an invalid subtype we fall back to the family's first sub-type. Lifestyle is no longer a separate category — it's a *tag* (`tags: ["lifestyle"]`), which is what it always should have been.

### Single source of truth

New file `src/lib/discoverTaxonomy.ts` re-exports thin helpers that wrap `onboardingTaxonomy.ts` so we never duplicate the list:

```ts
export { FAMILY_ORDER, FAMILY_ID_TO_NAME, SUB_TYPES_BY_FAMILY } from './onboardingTaxonomy';
export const getDiscoverFamilies = () => FAMILY_ORDER.map(id => ({ id, label: FAMILY_ID_TO_NAME[id] }));
export const getDiscoverSubtypes = (familyId: string) => SUB_TYPES_BY_FAMILY[familyId] ?? [];
export const isMultiSubFamily = (familyId: string) => getDiscoverSubtypes(familyId).length > 1;
```

Every surface imports from here. If onboarding ever adds a family or sub-type, Discover updates automatically.

### DB migration (one tiny addition)

```sql
ALTER TABLE public.discover_presets
  ADD COLUMN IF NOT EXISTS subcategory text;

CREATE INDEX IF NOT EXISTS idx_discover_presets_subcategory
  ON public.discover_presets (subcategory);
```

No backfill required — old rows render under their family bucket as before; new rows get richer tagging.

### Files touched

```text
NEW   src/lib/discoverTaxonomy.ts                                family/sub helpers wrapping onboardingTaxonomy
EDIT  src/components/app/AddToDiscoverModal.tsx                  family + sub chip rows, persists subcategory
EDIT  src/pages/Discover.tsx                                     two-row category bar + sub-type-aware filter & sort
EDIT  src/pages/PublicDiscover.tsx                               same two-row bar (read-only feed)
EDIT  src/components/app/DashboardDiscoverSection.tsx            two-row bar; default lands on user's sub-type
EDIT  src/components/app/DiscoverCategoryBar.tsx                 supports optional sub-row (or new SubCategoryBar sibling)
EDIT  supabase/functions/describe-discover-metadata/index.ts     returns {family, subtype}; full taxonomy from shared list
NEW   supabase migration                                         add discover_presets.subcategory + index
```

No onboarding/Settings changes. No types regeneration beyond the auto-generated `discover_presets.subcategory` field.

### Validation

1. **Add to Discover** modal: family chips list every onboarding family; picking *Fashion & Apparel* reveals *Clothing · Hoodies · Dresses · Jeans · Jackets · Activewear · Swimwear · Lingerie · Streetwear*. AI auto-fill pre-selects both rows.
2. Saving a Hoodie shot writes `category='fashion'`, `subcategory='hoodies'`.
3. `/app/discover`, `/discover`, and dashboard "Steal the Look" all show the same two-row bar matching Settings exactly.
4. Clicking *Fashion → Hoodies* filters the grid to hoodie-tagged items; clicking *Fashion* alone shows hoodies + jeans + everything Fashion.
5. A user with `product_subcategories=['hoodies']` opens `/app` → "Steal the Look" defaults straight to the *Hoodies* pill, not just *Fashion*.
6. Old discover rows with no subcategory still appear under their family pill (backward compatible).

