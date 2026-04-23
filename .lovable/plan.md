

## Fix: Recommended rail in `/app/freestyle` cuts off at 12 even when multiple sub-categories are curated

### Root cause

In `src/hooks/useRecommendedScenes.ts` the rail is hard-capped at `MAX = 12`:

```ts
const MAX = 12;
const ingest = (rows) => {
  for (const row of rows) {
    if (orderedSceneIds.length >= MAX) break;   // ← stops here
    …
  }
};
```

You picked **Clothing** *and* **Hoodies** in onboarding. Each has 12 curated scenes in `recommended_scenes`. PASS 1 iterates sub-categories in order:

```text
Clothing (garments) → ingest 12 → cap reached → break
Hoodies            → never reached
```

So you see Clothing's 12 and 0 of Hoodies'. That's the bug.

### The fix — scale the cap to what's actually curated, and interleave sub-categories

Two surgical changes inside `useRecommendedScenes.ts`. No DB change, no UI change.

#### 1. Dynamic cap

Replace the fixed `MAX = 12` with a per-user target that grows with the number of sub-categories the user picked:

```ts
const PER_BUCKET = 12;                 // curator's per-scope budget
const HARD_CEILING = 60;               // safety so the rail never goes infinite
const targetMax = Math.min(
  HARD_CEILING,
  Math.max(
    PER_BUCKET,                        // always at least 12 (existing UX)
    userSubcategories.length * PER_BUCKET,
  ),
);
```

Examples:
- 0 sub-categories → 12 (today's behaviour, unchanged)
- 1 sub-category → 12 (unchanged)
- 2 sub-categories (Clothing + Hoodies) → **24**
- 5 sub-categories → 60 (capped by ceiling)

#### 2. Round-robin sub-categories instead of draining one before the next

PASS 1 currently calls `ingest(list)` for the first sub-category until the cap is hit. Switch to a round-robin so the rail interleaves Clothing → Hoodies → Clothing → Hoodies …

```ts
// PASS 1: sub-category curated, round-robin
if (userSubcategories.length) {
  const perSubLists = await Promise.all(
    userSubcategories.map(s => fetchRecForCategory(s)),
  );
  // Round-robin: take row 0 from each, then row 1 from each, …
  const maxLen = Math.max(...perSubLists.map(l => l.length));
  outer: for (let i = 0; i < maxLen; i++) {
    for (const list of perSubLists) {
      if (i >= list.length) continue;
      if (orderedSceneIds.length >= targetMax) break outer;
      const row = list[i];
      if (!seen.has(row.scene_id)) {
        seen.add(row.scene_id);
        orderedSceneIds.push(row.scene_id);
      }
    }
  }
}
```

PASS 2 (family curated), PASS 3 (Global), and PASS 4 (algorithmic) keep their existing logic but read the new `targetMax` instead of `MAX`. Final `.slice(0, targetMax)` replaces the existing `.slice(0, MAX)`.

### Why this matches the platform model

The recommended_scenes admin you just shipped lets curators tune **per-sub-family** (Clothing 12, Hoodies 12). The hook ought to honour that scoping by surfacing **all curated buckets the user actually maps to**, not just the first one alphabetically. Round-robin keeps the rail visually balanced — you'll see a mix of Clothing and Hoodies scenes from the very first row instead of 12 hoodies after 12 garments.

### What does **not** change

- `recommended_scenes` table, RLS, admin curation page — untouched.
- `SceneCatalogModal.tsx` and the sidebar count badge — they read `recommended.data?.length` and will simply show the new larger number (e.g. "Recommended 24") automatically.
- Family-level / Global / algorithmic fallback logic — still runs only if PASS 1 didn't fill `targetMax`.
- Cache key (`['scene-recommended', userId]`) and 10-min stale time — unchanged.

### Validation

1. As a user with `product_subcategories = ['garments', 'hoodies']`:
   - Open `/app/freestyle` → click **Recommended** in the left rail.
   - Sidebar count reads **24** (was 12).
   - Grid renders 24 scenes, **interleaved** Clothing/Hoodies, not all-Clothing-then-Hoodies.
2. As a user with only `['garments']` → Recommended shows 12 (unchanged).
3. As a user with no sub-categories but family = `fashion` → Recommended shows 12 from fashion family curation (unchanged).
4. As a user with 5 sub-categories all curated → Recommended shows up to 60, round-robin interleaved.
5. Add a 13th `recommended_scenes` row for `garments` in admin → still capped at 12 *per bucket* (the per-bucket fetch already `.limit(MAX)` = 12), so the dynamic cap stays correct.

### Files touched

```text
EDIT  src/hooks/useRecommendedScenes.ts
        - Replace const MAX = 12 with PER_BUCKET / HARD_CEILING / targetMax
        - PASS 1: replace sequential ingest with round-robin loop
        - PASS 2/3/4: read targetMax instead of MAX
        - Final slice uses targetMax
```

