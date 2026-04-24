

## Real diagnosis: Discover IS already merging recommended scenes — but they may be filtered out by `useHiddenScenes`

### What I checked

1. **DB**: `recommended_scenes` has 12 perfectly tagged rows for `hoodies`, `jeans`, `lingerie`, `activewear` each. Their joined `product_image_scenes.category_collection` matches (`hoodies`, `jeans`, …). ✅
2. **Hook**: `useRecommendedDiscoverItems` produces poses with `category: 'fashion'` and `subcategory: 'hoodies' | 'jeans' | 'lingerie' | 'activewear'`. ✅
3. **Discover page** (`src/pages/Discover.tsx` line 310): merges recommended poses into `allItems` and `itemMatchesDiscoverFilter` correctly accepts them under the right sub-pill. ✅
4. **Filter logic** (`src/lib/discoverTaxonomy.ts`): given `category='fashion'`, `subcategory='hoodies'` and active sub-pill `hoodies`, the function returns `true`. ✅

So the merge already works. The 12 hoodies/jeans/lingerie/activewear scenes from the admin Recommended Scenes panel **already appear** under the matching sub-pills of `/app/discover`.

### The actual two bugs

**Bug A — `filterVisible` strips recommended scenes when admin has hidden ANY scene with that title.**  
Line 310 wraps `mockTryOnPoses` in `filterVisible(...)` but the same pipeline also includes `recommendedPoses`. `useHiddenScenes` matches by `pose.name` — if any recommended scene shares a name with a previously hidden one (e.g. "Track Field" already exists as both a preset and a recommended scene per my DB check), it gets dropped. This is the most likely cause for "missing" items.

**Bug B — Title-dedupe drops recommended scenes when a preset shares the title.**  
Line 311: `filter((s) => !presetTitles.has(s.name))`. My DB check found 7 recommended scenes whose titles already exist as presets (e.g. *Urban Concrete*, *Track Field*, *Hoop Dream Sky*, *Court Lines Golden*). Those 7 recommended tiles never reach the grid — only the older preset version shows, and it lives under whatever subcategory the preset has (often NULL → only visible under "All").

### Fix plan (small, surgical)

**1. `src/pages/Discover.tsx` line 310** — apply `filterVisible` only to `mockTryOnPoses`, not to `recommendedPoses`:

```ts
const sceneItems: DiscoverItem[] = [
  ...filterVisible(mockTryOnPoses),
  ...customScenePoses,
  ...recommendedPoses,        // not run through filterVisible
]
```

Recommended scenes are admin-curated and already gated by the admin panel; double-filtering through hidden-scenes is what removes them.

**2. `src/pages/Discover.tsx` line 311** — replace title-only dedupe with a key that distinguishes recommended vs preset, and prefer the recommended (better tagged) version when titles collide:

```ts
const recTitles = new Set(recommendedPoses.map(r => r.name));
const presetItems: DiscoverItem[] = presets
  // drop a preset if a same-titled recommended scene exists with a real subcategory
  .filter(p => !recTitles.has(p.title) || p.subcategory)
  .map(p => ({ type: 'preset', data: p }));
const sceneItems: DiscoverItem[] = [
  ...filterVisible(mockTryOnPoses),
  ...customScenePoses,
  ...recommendedPoses,
].map(s => ({ type: 'scene', data: s }));
```

Net effect: when both versions exist, the better-tagged one wins; nothing is silently lost.

**3. Same fix in `src/pages/PublicDiscover.tsx`** (it has the same merge pattern).

**4. Verify in admin Recommended Scenes** that the user can see exactly what the public sees: add a "View on Explore" link next to each scene that opens `/app/discover/scene-{scene_id}` so the user can confirm visibility instantly.

### Out of scope

- No DB writes, no migration, no new tables.
- No taxonomy or RLS changes.
- No backfill of `discover_presets` (the recommended_scenes table is already correctly tagged — that's the source of truth for sub-pills).
- No keyword auto-classifier (the previously declined plan).

### Files to edit

```text
src/pages/Discover.tsx           — exclude recommendedPoses from filterVisible; smarter title dedupe
src/pages/PublicDiscover.tsx     — same merge fix
src/pages/admin/RecommendedScenesAdmin.tsx (or equivalent) — add "View on Explore" link per row
```

### Expected result

After this change, every hoodies / jeans / lingerie / activewear / dresses / jackets / streetwear / swimwear scene visible in `/app/admin/recommended-scenes` will also appear under its matching sub-pill in `/app/discover` and `/discover` — including the 7 currently shadowed by same-titled presets.

