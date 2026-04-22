

## Two surgical fixes for the Scenes modal

### 1. Show admin Custom Scenes first (above Recommended)

Today the modal opens to: **Recommended for you** carousel → full Freestyle catalog grid. The 134 active rows admins curate at `/app/admin/scenes` (`custom_scenes` table) are loaded only to resolve `cs-` selections — they never render.

Fix in `SceneCatalogModal.tsx`:

- Add a new top section **"Freestyle Originals"** above the Recommended rail.
- Source: `useCustomScenes()` (already wired). Adapt each `CustomScene` row into the `CatalogScene` shape the rail/grid expect, with `id = cs-<uuid>`, `scene_id = <uuid>`, `preview_image_url = preview_image_url || optimized_image_url || image_url`, `prompt_template = prompt_hint`.
- Render as a **grid** (`SceneCatalogGrid`) when ≤24 items so the user sees them all immediately — no carousel hiding. Above ~24 items, switch to the `SceneCatalogRail` carousel pattern. (134 today → grid view with the existing 2/3/4 col responsive layout, height capped via the existing scrollable parent.)
- Selection already routes correctly via the existing `cs-` branch in `handleSelect` → `onSelectLegacy` (no generation-pipeline change).
- Hidden when any filter or search is active (same rule as Recommended), so the filtered grid stays clean.

New default order:
```
Freestyle Originals        ← admin /app/admin/scenes (134)
Recommended for you        ← per-category carousel (≤12)
Freestyle Scenes           ← full paged catalog grid
```

### 2. Show real total — fix the 1,000-row cap on counts

Symptom: sidebar "All scenes" shows **1000**; DB has **1,613** active (1,236 after excluding essentials). Even though `useSceneCounts` already requests `.range(0, 4999)`, PostgREST enforces a project-level `max_rows: 1000` ceiling that overrides the requested range — that's why it still caps.

Fix: page the count query in `src/hooks/useSceneCounts.ts`. Loop in 1,000-row windows until a page returns <1,000:

```ts
const all: Row[] = [];
let page = 0;
while (true) {
  const { data, error } = await supabase
    .from('product_image_scenes')
    .select('subject, shot_style, setting, category_collection, sub_category')
    .eq('is_active', true)
    .not('sub_category', 'ilike', '%essential%')
    .range(page * 1000, page * 1000 + 999);
  if (error) throw error;
  all.push(...(data ?? []));
  if (!data || data.length < 1000) break;
  page++;
  if (page > 9) break; // hard safety cap (10k rows max)
}
```

Net: sidebar "All scenes" reflects the true count (~1,236 after essentials excluded), per-family counts roll up correctly. Single load, ~80 KB total over the wire, cached 10 min — cheap.

Also update the modal subtitle copy in `SceneCatalogModal.tsx`:
> "Find the right shot for your product — over 1,000 curated scenes."
→ "Find the right shot for your product — 1,200+ curated scenes."

### Files touched

- `src/components/app/freestyle/SceneCatalogModal.tsx` — render new "Freestyle Originals" section above Recommended (grid when ≤24, rail otherwise); update subtitle copy.
- `src/hooks/useSceneCounts.ts` — paginated count fetch to bypass the PostgREST 1k cap.

### Untouched

DB schema, RLS, generation pipeline, `useCustomScenes`, `useRecommendedScenes`, sidebar, filters, admin pages.

### Validation

- Open `/app/freestyle` Scenes modal → top section is **Freestyle Originals** showing every active row from `/app/admin/scenes` (currently 134), as a grid.
- Below it: **Recommended for you** carousel → **Freestyle Scenes** full paged grid.
- Sidebar "All scenes" shows the real total (≈1,236 with essentials excluded), not 1000. Family counts add up.
- Picking a Freestyle Original generates with the existing legacy `TryOnPose` payload (no regression).
- Applying any filter/search collapses both top sections and shows only the filtered grid (today's behaviour preserved).

