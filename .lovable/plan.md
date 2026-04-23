

## Fix Browse Scenes: show all categories + sub-families, optimize thumbnails

### Issues found

**1. ~22 scenes missing from sidebar** — `category_collection='wallets'` (22 active rows) isn't mapped in `CATEGORY_FAMILY_MAP` so they fall into the "Other" bucket. The sidebar shows everything except the Bags & Accessories sub-family they should belong to.

**2. Sub-family chips don't show all real sub-families** — chips are derived from whatever scenes happen to be in the family, but **only render when `subSlugs.length > 1`** and the labels for some slugs (e.g. `wallets`, `furniture`) are missing from `SUB_FAMILY_LABEL_OVERRIDES`, so they appear as raw slugs ("Wallets", which is fine, but "Furniture" auto-titled). Worse, sub-families with zero matching scenes are entirely invisible — user has no way to see they exist.

**3. Thumbnails load full-size (multi-MB PNGs)** — `SceneBrowserModal` renders `<img src={scene.imageUrl} />` directly. With ~1,500 scenes and ~80–160 visible at once, the browser pulls original-resolution images. Slow + the screenshot's empty grey cards are scenes still mid-download.

### Fixes

#### 1. `src/lib/sceneTaxonomy.ts` — map orphan slug + add label

```ts
// CATEGORY_FAMILY_MAP additions
'wallets': 'Bags & Accessories',     // 22 scenes currently orphaned

// SUB_FAMILY_LABEL_OVERRIDES additions (cosmetic, kept tidy)
'wallets': 'Wallets',
'furniture': 'Furniture',
'home-decor': 'Decor',                // already present, keep
```

Result: 22 wallet scenes move from "Other" into "Bags & Accessories"; counts on left rail update automatically (Bags & Accessories goes from 125 → 147; Other drops by 22).

#### 2. `src/components/app/SceneBrowserModal.tsx` — show all sub-family chips, always

- Always render the chip row when the active family has any sub-family (drop the `subSlugs.length > 1` gate — show even a single chip for consistency).
- Display chip count badges (e.g. `Wallets · 22`) so admins immediately see what's available before clicking.
- Sort sub-family chips by **scene count descending**, then alpha — most-populated sub-families first.
- Keep the "All" chip as the default selected state.

```tsx
const subSlugCounts = useMemo(() => {
  const items = familyGroups.get(activeFamily!) ?? [];
  const counts = new Map<string, number>();
  for (const it of items) counts.set(it.category, (counts.get(it.category) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}, [familyGroups, activeFamily]);
```

Render chips from `subSlugCounts` and show the count next to each label.

#### 3. `src/components/app/SceneBrowserModal.tsx` — optimize thumbnails

- Import `getOptimizedUrl` from `@/lib/imageOptimization`.
- Wrap each thumb URL with **quality only** (`quality: 55`) — **no width / no height** per the project's no-crop image rule (`mem://style/image-optimization-no-crop`). This compresses the image server-side without forcing a crop or zoom.
- Keep `loading="lazy"` (already present) and add `decoding="async"`.
- Add a small fade-in via `onLoad` to mask the grey skeleton until the image arrives.

```tsx
import { getOptimizedUrl } from '@/lib/imageOptimization';

const thumb = getOptimizedUrl(scene.imageUrl, { quality: 55 });
// <img src={thumb} loading="lazy" decoding="async" ...
```

For external URLs (mocks, custom uploads not in Supabase Storage) the helper passes through unchanged — safe.

### Files touched

```text
EDIT  src/lib/sceneTaxonomy.ts
        - CATEGORY_FAMILY_MAP: add 'wallets' → 'Bags & Accessories'
        - SUB_FAMILY_LABEL_OVERRIDES: add 'wallets', 'furniture'

EDIT  src/components/app/SceneBrowserModal.tsx
        - Always render sub-family chip row (drop length>1 gate)
        - Compute subSlugCounts; sort by count desc; show count badge
        - getOptimizedUrl(url, { quality: 55 }) for every thumb
        - decoding="async" on <img>
```

No DB / RLS / edge function changes. No type changes. No effect on other consumers of `sceneTaxonomy.ts` (interleave helpers etc. just gain one more known mapping).

### Validation

1. Open Library → admin opens "Add to Discover" → click "Browse all" on Scene picker.
2. Left rail: same families as before, but **Bags & Accessories now ~147 (was 125)** and **Other drops by ~22**. No category appears empty.
3. Click any family with multiple sub-families → chip row visible with `Sub · count` badges, sorted by count.
4. Click a single-sub-family family (e.g. Watches) → still sees the lone chip (consistency).
5. Network tab: thumbnails load via `/storage/v1/render/image/...?quality=55` — file sizes drop ~5–10× vs originals. Initial paint completes in <1s for 80-card grid.
6. Picked thumbnail is **not zoomed/cropped** — full uncropped composition (no width/height transformation).
7. Selecting a scene works as before; modal closes; picker hydrates.

