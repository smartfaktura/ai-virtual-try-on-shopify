

## Fix Browse Scenes: stop dedupe loss + surface `sub_category` chips

### Root causes

**Bug 1 — name-based dedupe drops 60–70% of scenes** (`src/hooks/useDiscoverPickerOptions.ts:71`)

```ts
if (!items.find(i => i.name === ps.title)) { ... }
```

Many scenes share the same `title` across different `category_collection`s ("Top View", "Sunlit Glow", "Pickup Gesture Detail", etc.). The `find` uniqueness check throws away all but the first occurrence, so:

- Beverages DB: **64 active** → modal shows **25**
- Snacks DB: **24** → shows **24** (lucky)
- Food DB: **27** → shows **3**
- Across the catalog this hides ~600+ scenes silently.

**Bug 2 — `sub_category` isn't fetched, so "Creative Shots" can't appear**

The picker query selects only `id, scene_id, title, preview_image_url, category_collection`. The DB column `sub_category` (which holds "Creative Shots", "Essential Shots", "Editorial Drink Studio", "Aesthetic Color Beverage Stories", etc.) is dropped before reaching the modal. The modal groups the right pane by `category_collection` only, so the rich curated buckets the user expects are invisible.

### Fixes

#### 1. `src/hooks/useDiscoverPickerOptions.ts` — fetch `sub_category`, dedupe by stable key

- Add `sub_category` to the SELECT.
- Replace the O(n²) `find()` dedupe with a `Set` keyed on **`title + category_collection + sub_category`** so distinct curated rows survive.
- Add `subCategory` to `PickerSceneOption`.

```ts
.select('id, scene_id, title, preview_image_url, category_collection, sub_category')

// dedupe across mocks + custom + product_image_scenes
const seen = new Set<string>();
const push = (item: PickerSceneOption) => {
  const key = `${item.name}::${item.category}::${item.subCategory ?? ''}`;
  if (seen.has(key)) return;
  seen.add(key);
  items.push(item);
};
```

`PickerSceneOption` gains `subCategory?: string | null`. `mockTryOnPoses` and `customSceneProfiles` pass `subCategory: undefined` (already work today; nothing breaks).

#### 2. `src/components/app/SceneBrowserModal.tsx` — three-level navigation: Family → Sub-family → Sub-category

- Keep left rail (families) as-is.
- Replace the current sub-family chip row with a **two-row chip header**:
  - **Row 1:** sub-family chips (existing behavior — `category_collection` slugs sorted by count).
  - **Row 2:** `sub_category` chips for whatever is selected above (e.g. "All", "Creative Shots", "Essential Shots", "Editorial Drink Studio", …) sorted by count.
- "All" on either row clears that level's filter; the grid then shows everything matching the higher levels.
- Sub-category chips use the raw `sub_category` string as the label (it's already human-readable like "Creative Shots").

```tsx
const subCategoryCounts = useMemo<Array<[string, number]>>(() => {
  if (!activeFamily) return [];
  let list = familyGroups.get(activeFamily) ?? [];
  if (activeSub) list = list.filter(s => s.category === activeSub);
  const counts = new Map<string, number>();
  for (const s of list) {
    const key = s.subCategory?.trim() || 'Other';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}, [familyGroups, activeFamily, activeSub]);
```

Filter pipeline becomes: family → optional sub-family → optional sub-category → search.

Existing `getOptimizedUrl({ quality: 55 })` thumb path stays unchanged.

### Files touched

```text
EDIT  src/hooks/useDiscoverPickerOptions.ts
        - SELECT now includes sub_category
        - PickerSceneOption gains subCategory?: string | null
        - dedupe key = name + category + subCategory (Set, not find())

EDIT  src/components/app/SceneBrowserModal.tsx
        - Add second chip row for sub_category (within active family + sub-family)
        - Counts + sort desc; "All" clears that level
        - Filter pipeline gains the new level
```

No DB / RLS / edge function changes. No other consumer of `PickerSceneOption` relies on dedupe semantics — the existing inline grids in Add/Edit Discover modals just iterate the array.

### Validation

1. Open Library → "Add to Discover" → "Browse all" on Scene picker.
2. Sidebar counts jump significantly: e.g. **Food & Drink** goes from ~52 → ~115; **Fashion** ~161 → ~400+. Total grid scenes match `SELECT count(*) FROM product_image_scenes WHERE is_active=true` (~1,500).
3. Click **Food & Drink → Beverages**. A second chip row appears: `All · Editorial Drink Studio 17 · Creative Shots 14 · Essential Shots 12 · Social Lifestyle / Sport / Party UGC 9 · Fruit / Pour / Surface Still Life 6 · Aesthetic Color Beverage Stories 6`. Clicking each filters the grid.
4. Click **Activewear → Creative Shots** → 24 scenes show up (matches DB).
5. Search still works within the active family + sub-family + sub-category context.
6. Selecting any scene closes the modal and hydrates the picker with the correct preview / name (no regression).
7. Network: still one query per cache window (10 min stale). Thumbnails still load `?quality=55` (no crop).

