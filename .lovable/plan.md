

## Wire up sub-family curation tabs in AdminRecommendedScenes

Finish the last missing piece from the previous plan: render a sub-family pill row beneath the family tabs in `/app/admin/recommended-scenes` so admins can curate per sub-type (Hoodies, Sneakers, Fragrance, etc.). Data plumbing (`activeSubCollection`, `dbCategory`, query key) is already in place — only the UI is missing.

### What gets added

A horizontal pill strip below the existing family tab row, showing all sub-families that belong to the currently active family. An "All {Family}" pill on the left represents "no sub-filter" (current family-level behavior).

```
[ Global | Fashion | Footwear | Beauty | Watches | Eyewear | … ]   ← existing
[ All Fashion | Clothing | Hoodies | Dresses | Jeans | Jackets …]  ← NEW
```

### Behavior

- **Source of sub-families**: `FAMILY_SUB_ORDER` from `src/lib/onboardingTaxonomy.ts` keyed by the active family (e.g. `Fashion → ['garments','hoodies','dresses',…]`). Labels resolved via `SUB_FAMILY_LABEL_OVERRIDES` / existing label helper in `sceneTaxonomy.ts`.
- **Hidden when**:
  - Active tab is `Global` (no family context)
  - Active family has only 1 sub-type (Watches, Eyewear, Tech, Wellness) — the family tab itself is already the curated bucket
- **Default state**: when an admin clicks a family tab, sub-tab resets to "All {Family}" (`activeSubCollection = null`) so existing family-level curation keeps working untouched.
- **Pill click**: sets `activeSubCollection = <slug>`. The existing `dbCategory` resolver already returns the sub slug when set, so the recommended list, the star/unstar mutations, and the React Query cache key all switch to that sub-family bucket automatically.
- **Visual selected count**: each sub-pill shows a small count badge of how many scenes are currently starred for that sub-family (one extra lightweight query: `SELECT category, count(*) FROM recommended_scenes WHERE category = ANY(<subSlugs>) GROUP BY category`). Cached 60s. Optional polish — drop if it complicates.

### Helper text

Below the strip, a one-line muted caption that updates contextually:

- All Fashion selected → "Curating family-level fallback for all Fashion users."
- Hoodies selected → "Curating sub-family scenes shown first to users who picked Hoodies."

### Styling

- Same `Tabs`/`Badge` primitives already used on the page — no new components.
- Sub-pills use `variant="outline"` with active state filled, smaller (`h-8`, `text-xs`) than the family tabs to communicate hierarchy.
- Horizontal scroll on overflow (Fashion has 9 sub-types post-Kidswear-removal) with `overflow-x-auto` and momentum scrolling.

### Files touched

```text
EDIT  src/pages/AdminRecommendedScenes.tsx   render sub-family pill strip + reset on family change + optional count badges
```

No DB migration. No taxonomy changes. No edge function changes.

### Validation

1. Open `/app/admin/recommended-scenes`. Click **Fashion** → sub-strip appears with `All Fashion · Clothing · Hoodies · Dresses · Jeans · Jackets · Activewear · Swimwear · Lingerie · Streetwear`.
2. Click **Watches** family tab → sub-strip is hidden (single sub-type family).
3. Click **Global** → sub-strip is hidden.
4. From Fashion, click **Hoodies** → list refetches, starring a scene writes a row with `category='hoodies'`. Switching to **All Fashion** shows only the family-level rows again (`category='fashion'`).
5. Switching family from Fashion → Footwear resets the sub-tab to "All Footwear" automatically.
6. A user with `product_subcategories=['hoodies']` opens the dashboard → the hoodie-starred scenes appear at the top of the recommended rail (PASS 1 of `useRecommendedScenes`).

