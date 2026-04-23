

## 5-fix plan: better personalization wiring + multi-cat headlines + Resend visibility + data hygiene

### 1. Recommended scenes — extend admin curation to cover sub-categories

**Problem.** `recommended_scenes.category` only stores family-level slugs (`fashion`, `beauty`, …). When a user picks `hoodies` + `sneakers` in Step 3, the rail still pulls family-level rows, never sub-type-curated picks.

**Fix.**
- Keep one table, expand the meaning of `category`: it can now store either a **family id** (`fashion`) OR a **sub-family slug** (`hoodies`, `sneakers`, `fragrance`, `watches`, …). This is purely additive — existing rows keep working.
- `useRecommendedScenes.ts` resolution becomes 3-pass:
  1. **Sub-category curated** (only if user has `product_subcategories`): for each sub-type slug → `WHERE category = <slug>` ordered by `sort_order`.
  2. **Family curated**: for each family id → `WHERE category = <family>` (current behavior).
  3. **Global** (`category IS NULL`) top-up.
  4. Algorithmic fallback (already in place) fills any remainder.
- `AdminRecommendedScenes.tsx`: add a second tab strip below the family tabs showing sub-family slugs for the active family, so admins can curate "Hoodies", "Sneakers", "Fragrance" lists without leaving the page. `dbCategory` switches to the sub-family slug when one is active.
- No DB migration. The `category` column already accepts text.

### 2. Explore / Discover home grid — group order by user's families

**Problem.** Discover currently shows a flat reverse-chronological grid filtered by a single category tab. When a Fashion user opens Discover they don't see Fashion content first; they see whatever was added most recently.

**Fix.**
- Default tab logic in `Discover.tsx` already maps the user's first family to a discover category. Extend that with a new **"For you" sort** applied when `selectedCategory === 'all'`:
  1. Read `profiles.product_categories` + `product_subcategories` once on mount.
  2. Compute an ordered list of **discover category ids** that match the user (Fashion → `fashion`, Footwear → `fashion` + sub-type cues, etc — using the existing `FAM_TO_DISC` map already present in the dashboard).
  3. Sort items by: featured first → user-family bucket index ASC (so picked families come first, in onboarding order) → date DESC.
- Within a family bucket, sort items so any item whose `category` exactly matches a picked **sub-type** floats above the rest.
- The existing per-tab filter still works untouched. No layout change.

### 3. SceneCatalogModal — keep "show everything" but lead with the user's stuff

**Problem (per your direction).** We must NOT auto-collapse the sidebar to picked sub-types. The catalog should still display every scene.

**Fix.**
- Sidebar: keep showing every family + sub-family unchanged. No auto-expand, no hiding.
- Default grid only: `useInterleavedSceneCatalog` already orders by `FAMILY_ORDER`. Add an optional `userFamilyOrder` arg pulled from `profiles.product_categories` so the user's families appear **first** in the interleaved walk (rest follow in `FAMILY_ORDER`). One extra parameter, ~10 lines.
- Within each family, if `product_subcategories` is non-empty, items whose `category_collection` matches a picked sub-type sort to the front of that family's queue (stable, deterministic). Everything else still renders below — nothing is hidden.
- Result: a Watches+Hoodies user opens the modal and the first row is watches & hoodies scenes; scrolling down still surfaces the entire 1,200+ catalog.

### 4. Multi sub-type headline — your-product-mix copy that names the picks

**Problem.** Today, picking 2+ sub-types reverts to generic family copy. You want named multi-pick headlines.

**Fix in `categoryConstants.ts`'s `getCategoryHeadline()`:**

Add a new branch that runs BEFORE the existing fallbacks when `subcategories.length >= 2`:

- **2 sub-types of same family**: "Your hoodie & denim drops, ready in seconds." (uses `SUBTYPE_NOUN` lookup: `hoodies → hoodie`, `jeans → denim`, `sneakers → sneaker`, `fragrance → fragrance`, …)
- **3+ sub-types of same family**: "Your {Family} mix, ready in seconds — hoodies, denim, jackets and more."
- **Sub-types across 2 families**: "Your fashion & footwear edits — no photoshoot needed."
- **Sub-types across 3+ families**: existing "Turn your product mix into consistent, high-quality visuals" copy (proven good).

Implementation: one small `SUBTYPE_NOUN: Record<string,string>` map + a `buildMultiSubtypeHeadline(subs, families, isReturning)` helper. Pure function, fully unit-testable.

The same function powers Settings preview + Dashboard headline + first-gen empty state.

### 5. Resend audience — explicit, segmentable properties

**Problem.** Right now `sync-resend-contact` forwards a generic `properties` blob. Sub-categories ride along but aren't easy to segment on.

**Fix.**
- `Onboarding.tsx` and `Settings.tsx` already call `sync-resend-contact` after save. Standardise the `properties` payload to:
  ```
  {
    families: ["Fashion","Footwear"],            // human-readable names
    subtypes: ["hoodies","sneakers","watches"],   // slugs
    families_csv: "Fashion, Footwear",            // for Resend filters that need string
    subtypes_csv: "hoodies, sneakers, watches",
    primary_family: "Fashion",
    primary_subtype: "hoodies"
  }
  ```
- This gives marketing 6 first-class fields visible in the Resend contact view, and CSV variants for filter rules that don't support arrays.
- Edge function: pass-through (already does). One tiny enrichment: if caller forgets `families_csv`, derive it from the array.
- Backfill script (one-shot SQL via the migration tool) is **not** needed — the next time each user logs in or edits Settings, the sync runs. We'll also extend `Settings.tsx`'s save hook to re-sync on every save (it already does for opt-in changes).

### One small data-hygiene note on `product_subcategories`

We saw it: 0 users currently have `product_subcategories` populated (the column was added recently). Two cleanups worth doing now while volume is zero:

1. **Normalise on write.** Wrap every write to `product_subcategories` (Onboarding + Settings) with a tiny helper:
   ```ts
   const cleanSubs = (xs: string[]) =>
     Array.from(new Set(
       xs.map(s => s.trim().toLowerCase())
         .filter(Boolean)
         .filter(s => s in SUB_TYPE_SLUG_SET)   // built from SUB_TYPES_BY_FAMILY
     ));
   ```
   Prevents typos, casing drift, and slugs that no longer exist after taxonomy edits.

2. **Keep families & subs consistent.** When a user removes a family in Settings, drop any `product_subcategories` slugs that belong only to that family (single source: `CATEGORY_FAMILY_MAP`). Same helper, runs in the Settings save handler. Zero migration needed because no current data is dirty.

Optional later: a daily Postgres function that strips invalid slugs from any future drift, but that's not needed yet.

### Files touched

```text
EDIT  src/hooks/useRecommendedScenes.ts                3-pass: subtype → family → global
EDIT  src/pages/AdminRecommendedScenes.tsx             sub-family tab strip per active family
EDIT  src/pages/Discover.tsx                           "For you" ordering on All tab
EDIT  src/hooks/useSceneCatalog.ts                     userFamilyOrder + subtype-first sort
EDIT  src/components/app/freestyle/SceneCatalogModal.tsx  pass user prefs to interleaved hook
EDIT  src/lib/categoryConstants.ts                     buildMultiSubtypeHeadline + SUBTYPE_NOUN
EDIT  src/pages/Onboarding.tsx                         use cleanSubs helper, richer Resend props
EDIT  src/pages/Settings.tsx                           cleanSubs + family-removal cleanup, richer Resend props
EDIT  src/lib/onboardingTaxonomy.ts                    export SUB_TYPE_SLUG_SET + cleanSubs helper
EDIT  supabase/functions/sync-resend-contact/index.ts  derive families_csv if missing
```

No DB migrations.

### Validation

1. Admin opens `/app/admin/recommended-scenes`, picks **Fashion** family tab, then sub-tab **Hoodies**, stars 6 hoodie scenes. A user with `product_subcategories=['hoodies']` sees those 6 first in the dashboard rail.
2. Discover with onboarding `Fashion` + `Footwear`: All tab now shows fashion items, then footwear items, then everything else (featured items still float above).
3. SceneCatalogModal still shows every family in the sidebar; the default grid leads with the user's families and within each family the user's sub-types come first.
4. Picking **hoodies + jeans** in Step 3 → dashboard headline reads *"Your hoodie & denim drops, ready in seconds."* Picking **hoodies + sneakers** → *"Your fashion & footwear edits — no photoshoot needed."*
5. Resend: visiting Settings and saving creates/updates a contact whose properties include `families`, `subtypes`, `primary_family`, `primary_subtype`, plus the CSV variants — visible in the Resend dashboard contact panel and usable in segment rules.
6. In Settings, unselecting **Footwear** automatically drops `sneakers`/`boots`/etc from `product_subcategories` on save; the row only ever stores valid, lower-case, deduped slugs.

