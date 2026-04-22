

## Freestyle Scene Catalog — final cleanup pass

Six small, surgical fixes. UI/query only — no DB schema changes, no generation pipeline changes.

### 1. Globally hide "Essential Shots" sub_category from the Freestyle modal

Freestyle is for editorial looks; Essential Shots use dynamic-input templates that don't fit. Apply `excludeEssentials: true` to **every** query the modal makes:

- Grid (`useSceneCatalog`) — already filters `sub_category NOT ILIKE '%essential%'` when the flag is set; flag becomes always-on inside the modal.
- Both default rails (Product Only + With Model) already pass it for product-only; extend to with-model too.
- `useSceneCounts` — exclude essential rows so sidebar counts reflect what users will actually see.
- Recommended rail — drop any scene whose `sub_category` matches `Essential Shots`.

Net effect: zero scenes labelled "Essential Shots" appear anywhere in `/app/freestyle`.

### 2. Show real Freestyle custom scenes (from `/app/admin/scenes`) instead of hardcoded `mockTryOnPoses`

Replace the "Freestyle Originals" rail data source.

- New hook `useCustomScenes()` → `select * from custom_scenes where is_active = true order by created_at desc` (cached 10 min).
- Adapt each row into `CatalogScene` shape with id `cs-<uuid>` and `preview_image_url = preview_image_url || optimized_image_url || image_url`, `prompt_template = prompt_hint`.
- Rail title becomes **"Freestyle Scenes"** and sits at the top (above Recommended).
- Selection: when a `cs-` scene is picked, resolve back to the original `custom_scenes` row and emit a `TryOnPose`-shaped object via the existing `onSelectLegacy` callback so the generate handoff stays exactly as today.
- Remove `mockTryOnPoses` import and the `poseToCatalogShape`/`legacy-` rail entirely.

### 3. Lift the 1,000-row cap so all ~1,613 scenes are counted

`useSceneCounts` hits Supabase's default PostgREST 1,000-row limit. Append `.range(0, 4999)` to the count query so every active scene is included in family + sidebar totals. Grid/rail queries are paged so they're unaffected.

### 4. Sidebar — remove "Shot Types" section (already done in prior pass; verify clean)

Confirm no Shot Types block remains. Top-bar pills (Product Only / With Model) are the only place those filters live.

### 5. Auto-collapse other families when one is opened

When the user clicks a different family, the previously-expanded one collapses. Implementation: family expansion is already driven by `selectedFamily` (single-string state), so opening a new family automatically hides the previous family's sub-list. Verified by reading current sidebar code — this already works correctly. **No change needed**, just kept in the validation checklist.

### 6. Taxonomy fixes — remove "Other", reroute orphan slugs

In `src/lib/sceneTaxonomy.ts`:

- Drop `other: 'Other'` mapping entirely.
- Map `snacks-food → 'Food & Drink'` (currently falls into Other).
- `wallets` and `wallets-cardholders` already map to **Bags & Accessories** — verified, no change.
- Remove `'Other'` from `FAMILY_ORDER`.
- Sidebar fallback: if any unmapped slug ever appears, log it to console and skip rendering it (instead of bucketing into "Other"). Prevents stale slugs from polluting the UI.

Confirmed via DB query — every active `category_collection` slug now maps cleanly into one of: Fashion, Footwear, Activewear, Bags & Accessories, Jewelry, Eyewear, Watches, Beauty & Fragrance, Home, Tech, Food & Drink, Wellness. No "Other" bucket needed.

---

### Files touched

- `src/lib/sceneTaxonomy.ts` — remove `other`, add `snacks-food → Food & Drink`, prune `'Other'` from `FAMILY_ORDER`.
- `src/hooks/useSceneCounts.ts` — `.range(0, 4999)` on count query; exclude `sub_category ILIKE '%essential%'` from family/collection counts.
- `src/hooks/useSceneCatalog.ts` — no signature change; the `excludeEssentials` flag already exists.
- `src/hooks/useCustomScenes.ts` *(new)* — fetch active `custom_scenes`.
- `src/components/app/freestyle/SceneCatalogModal.tsx` — replace `freestyleOriginals` source with `useCustomScenes`; rename rail to "Freestyle Scenes"; move it to the top; pass `excludeEssentials: true` on every `useSceneRail` call and into `useSceneCatalog` filters; resolve `cs-` selections via `onSelectLegacy` adapter.
- `src/components/app/freestyle/SceneCatalogSidebar.tsx` — render-skip any unmapped slugs (defensive); no other changes.

### Untouched

DB schema, RLS, edge functions, generation pipeline, admin scene editor, `mockTryOnPoses` (still used in other surfaces), Product Visuals wizard, Workflow scene pickers.

### Validation checklist

- Open `/app/freestyle` → modal shows: **Freestyle Scenes** (live `custom_scenes`) → Recommended → Product Only → With Model. No `mockTryOnPoses` rail.
- Sidebar "All scenes" total reflects real count (excluding essentials), not capped at 1,000.
- No scene with `sub_category = 'Essential Shots'` appears in any rail, the grid, or counts.
- Sidebar shows no **Other** bucket. Snacks count rolls into Food & Drink.
- Click Fashion → expands; click Footwear → Fashion collapses, Footwear expands.
- Click Bags & Accessories → shows Bags / Backpacks / Belts / Scarves / Hats / Wallets / Cardholders (all already routed correctly).
- Picking a Freestyle Scene generates with the same `promptHint` + `previewUrl` payload Freestyle uses today (no regression).
- Picking a Product Visuals scene still uses the `pis-` prefix + sanitised template path.

