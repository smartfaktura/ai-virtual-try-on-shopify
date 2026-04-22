

## Freestyle "Select Scene" — full-screen catalog modal (safe, non-breaking plan)

A new full-screen modal replaces the current Scene popover on `/app/freestyle`, surfacing all 1000+ Product Visuals scenes alongside existing Freestyle mock + custom scenes under one taxonomy. Built with **strict additive changes** — nothing existing is removed, renamed, or restructured. Every change is reversible by deleting the new files / dropping the new columns.

---

### Safety guarantees (read first)

1. **All DB changes are additive** — new nullable columns, new indexes, new table. Zero ALTER on existing columns. Zero DROP. Zero changes to existing RLS, triggers, functions.
2. **Product Visuals wizard is untouched** — `useProductImageScenes` keeps its current behaviour. The new catalog uses a *separate* hook so the wizard's slim/priority modes and React Query cache keys don't collide.
3. **Existing scene picker keeps working in parallel** — we keep `SceneSelectorChip` exported; the chip's *trigger* opens the new modal, but the popover/sheet code path stays in place behind a feature flag `VITE_SCENE_CATALOG_V2` (default on; flip off → instant rollback).
4. **No edits to generation pipeline, edge functions, RLS, or `freestyle_generations` schema.** New scenes just produce the same payload shape (`promptHint` + `previewUrl`) the generate path already consumes.
5. **Backfill SQL is idempotent and safe** — only updates rows where the new columns are NULL. Re-running the migration is a no-op.
6. **Generated Supabase types** (`src/integrations/supabase/types.ts`) regenerate automatically; no manual type edits.
7. **Token sanitizer is pure-string** — `prompt_template.replace(/\{\{[^}]+\}\}/g,'').replace(/\s+/g,' ').trim()` — can't throw, can't corrupt non-template prompts.

---

### 1. Modal — matches `/app/products` add-product style

- Built on the existing shadcn `Sheet` component (`side="right"`, full height, ~92vw desktop / 100vh mobile) — same primitives `/app/products` uses, no new dependency.
- Header: "Select Scene" + subtitle + close X.
- Sticky footer: selected scene thumb + name + 1–2 tag chips + `Cancel` / `Use scene` (primary).
- Body: top filter bar, left taxonomy rail, right scene grid.

### 2. Top filter bar

| Control | Behaviour |
|---|---|
| **Search input** | Debounced 300ms; `ilike` on `title`/`description`/`sub_category` + `filter_tags @> ARRAY[term]`; LIMIT 30; cancels in-flight on new keystroke |
| **All Scenes / Popular / New / Editorial / Product Only / With Model / Lifestyle / Outdoor / Seasonal** chips | Each toggles one value on `subject` / `shot_style` / `setting`; multi-select within an axis; "Clear all" appears when any filter active |
| **Filters ▾** (mobile) | Opens a sheet with the same controls as the left rail |

### 3. Left taxonomy rail

Three accordion groups with live counts from one grouped query:
- **PRODUCT FAMILIES** — `category_collection` grouped into ~12 readable families via a `CATEGORY_FAMILY_MAP` constant
- **SHOT TYPES** — Product Only / With Model / Editorial / Lifestyle / Close-up
- **SETTINGS** — Studio / Indoor / Outdoor / Cozy-Warm / Minimal

AND across axes, OR within an axis. Filter state mirrored in URL hash for back-button support inside the modal.

### 4. Scene grid

**Default view (no filters)** — 4 horizontal rails, each `LIMIT 12`, fetched in parallel:
1. Recommended for you (see §5)
2. Product Only — `subject = 'product-only'`
3. With Model — `subject = 'with-model'`
4. Editorial — `shot_style IN ('editorial','campaign')`

**Filtered view** — single grid (4 cols desktop / 2 mobile), `useInfiniteQuery` with `range(0,23)`, `range(24,47)`, etc. `IntersectionObserver` sentinel triggers next page 400px from bottom. Skeleton placeholders during load.

**Card** — preview image (lazy `loading="lazy"`), title, two tag chips (`shot_style` + `subject`), checkmark border when selected.

### 5. "Recommended for you" — admin curation + onboarding personalisation

Both signals merged client-side (deduped, capped at 12):
- **Admin-curated** featured set from new `recommended_scenes` table
- **Personalised** from existing `profiles.product_categories` (set at onboarding) → mapped to `category_collection` slugs via `ONBOARDING_TO_COLLECTIONS_MAP` (extends existing `categoryUtils.ts` map; no removal)

Merge order: admin-featured matching user category → remaining admin-featured → user-category-only → fallback (top 12 by `sort_order`).

Cached 10 min per user with React Query.

### 6. DB migration (additive only — safe)

```sql
-- New columns (all nullable, default empty array — zero impact on existing reads/writes)
ALTER TABLE product_image_scenes
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS shot_style text,
  ADD COLUMN IF NOT EXISTS setting text,
  ADD COLUMN IF NOT EXISTS mood text,
  ADD COLUMN IF NOT EXISTS filter_tags text[] DEFAULT '{}';

ALTER TABLE custom_scenes
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS shot_style text,
  ADD COLUMN IF NOT EXISTS setting text,
  ADD COLUMN IF NOT EXISTS mood text,
  ADD COLUMN IF NOT EXISTS filter_tags text[] DEFAULT '{}';

-- Indexes (CREATE IF NOT EXISTS — re-runnable)
CREATE INDEX IF NOT EXISTS product_image_scenes_subject_idx     ON product_image_scenes(subject);
CREATE INDEX IF NOT EXISTS product_image_scenes_shot_style_idx  ON product_image_scenes(shot_style);
CREATE INDEX IF NOT EXISTS product_image_scenes_setting_idx     ON product_image_scenes(setting);
CREATE INDEX IF NOT EXISTS product_image_scenes_category_idx    ON product_image_scenes(category_collection);
CREATE INDEX IF NOT EXISTS product_image_scenes_active_sort_idx ON product_image_scenes(is_active, sort_order);
CREATE INDEX IF NOT EXISTS product_image_scenes_filter_tags_gin ON product_image_scenes USING gin(filter_tags);

-- New table for admin-curated recommended scenes
CREATE TABLE IF NOT EXISTS recommended_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE recommended_scenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage recommended" ON recommended_scenes
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated read recommended" ON recommended_scenes
  FOR SELECT TO authenticated USING (true);
```

**Backfill (idempotent — only fills NULLs)** — multi-signal cascade so accuracy is real, not random:

```sql
-- subject (Tier 1 hard signals → Tier 2 prompt text → Tier 3 sub_category → default)
UPDATE product_image_scenes SET subject = CASE
  WHEN 'personDetails' = ANY(trigger_blocks) THEN 'with-model'
  WHEN outfit_hint IS NOT NULL THEN 'with-model'
  WHEN prompt_template ~* '\{\{(personDirective|modelDirective)\}\}' THEN 'with-model'
  WHEN prompt_template ~* '\m(model|wearing|holding|posed|body|face|walking|sitting|standing)\M' THEN 'with-model'
  WHEN COALESCE(sub_category,'') ~* '(on-body|on-skin|poses|lifestyle|ugc|selfie|carry|worn)' THEN 'with-model'
  WHEN scene_type IN ('macro','stilllife') AND prompt_template ~* '\mhands?\M'
       AND prompt_template !~* '\m(body|face|model|wearing)\M' THEN 'hands-only'
  ELSE 'product-only'
END
WHERE subject IS NULL;

-- shot_style (sub_category text wins over scene_type)
UPDATE product_image_scenes SET shot_style = CASE
  WHEN COALESCE(sub_category,'') ~* '(editorial|campaign)' THEN 'editorial'
  WHEN COALESCE(sub_category,'') ~* '(flat ?lay)' THEN 'flatlay'
  WHEN COALESCE(sub_category,'') ~* '(macro|detail|texture|close ?up)' THEN 'macro'
  WHEN COALESCE(sub_category,'') ~* '(lifestyle|ugc|selfie|social)' THEN 'lifestyle'
  WHEN COALESCE(sub_category,'') ~* '(still ?life|tabletop)' THEN 'still-life'
  WHEN COALESCE(sub_category,'') ~* '(portrait|headshot)' THEN 'portrait'
  WHEN COALESCE(sub_category,'') ~* '(essential|packshot|hero|studio pack)' THEN 'packshot'
  WHEN scene_type = 'stilllife' THEN 'still-life'
  ELSE COALESCE(scene_type, 'packshot')
END
WHERE shot_style IS NULL;

-- setting
UPDATE product_image_scenes SET setting = CASE
  WHEN shot_style IN ('packshot','portrait','macro') THEN 'studio'
  WHEN shot_style IN ('flatlay','still-life') THEN 'surface'
  WHEN shot_style = 'lifestyle' AND COALESCE(sub_category,'') ~* '(outdoor|street|park|beach|garden)' THEN 'outdoor'
  WHEN shot_style = 'lifestyle' THEN 'indoor'
  WHEN shot_style IN ('editorial','campaign') THEN 'editorial-set'
  ELSE 'studio'
END
WHERE setting IS NULL;
```

`mockTryOnPoses` (~75 entries in TS) gets the same 3 fields hard-coded — no migration. `custom_scenes` rows get same heuristics on `category` + `name`.

**Audit query (admins run after migration; no auto-action):**
```sql
SELECT id, title, sub_category, scene_type, subject, shot_style
FROM product_image_scenes
WHERE (subject = 'product-only' AND ('personDetails' = ANY(trigger_blocks) OR outfit_hint IS NOT NULL))
   OR (subject = 'with-model' AND NOT ('personDetails' = ANY(trigger_blocks))
       AND outfit_hint IS NULL
       AND prompt_template !~* '\m(model|wearing|holding|posed|body|hands|face)\M'
       AND COALESCE(sub_category,'') !~* '(on-body|on-skin|poses|lifestyle|ugc|selfie|carry|worn)');
```
Expected < 5% of rows. Each fixed manually in admin.

### 7. Admin improvements (additive)

- **New page `/app/admin/recommended-scenes`** — searchable list of all active scenes with previews; toggle "Featured" + drag-reorder; live preview of how a sample user's rail looks.
- **Existing `/app/admin/product-image-scenes` editor** — append three dropdowns (Subject / Shot Style / Setting), one optional Mood dropdown, one chip input for `filter_tags`, and an **Auto-detect** button that re-runs the derivation logic on demand. Existing fields untouched.

### 8. Wiring on Freestyle generate path

- `Freestyle.tsx`: chip stays the trigger. On click → open new `<SceneCatalogModal>` instead of the current popover (one-line swap behind feature flag).
- IDs namespaced `pis-{id}` for Product Visuals scenes vs raw `poseId` for mock/custom — zero collision risk.
- For `pis-` selections: prompt box gets `prompt_template.replace(/\{\{[^}]+\}\}/g,'').replace(/\s+/g,' ').trim()`, scene reference image uses `preview_image_url` (same code path the existing `previewUrl` already takes).
- For mock/custom selections: behaviour unchanged.
- **Generation pipeline / edge functions / RLS / `freestyle_generations` schema: zero changes.**

### 9. Performance

- First open: 4 parallel `LIMIT 12` queries + 1 grouped count query (~30 KB total).
- Filter / scroll: `LIMIT 24` per page via `range()`.
- Search: debounced 300ms, indexed `ilike` + GIN on `filter_tags`.
- Slim columns only: `id, scene_id, title, sub_category, category_collection, scene_type, subject, shot_style, setting, preview_image_url, prompt_template`.
- React Query cache: `staleTime: 5 min` per filter key; selection survives close/reopen.
- Recommended rail cached 10 min per user.

### 10. Files

**New (no risk to existing code)**
- `src/components/app/freestyle/SceneCatalogModal.tsx`
- `src/components/app/freestyle/SceneCatalogFilters.tsx`
- `src/components/app/freestyle/SceneCatalogSidebar.tsx`
- `src/components/app/freestyle/SceneCatalogRail.tsx`
- `src/components/app/freestyle/SceneCatalogGrid.tsx`
- `src/components/app/freestyle/SceneCatalogCard.tsx`
- `src/hooks/useSceneCatalog.ts` — `useInfiniteQuery` over `product_image_scenes`
- `src/hooks/useRecommendedScenes.ts` — admin-featured + personalisation merge
- `src/hooks/useSceneCounts.ts` — single grouped count query
- `src/lib/sceneTaxonomy.ts` — `CATEGORY_FAMILY_MAP`, `ONBOARDING_TO_COLLECTIONS_MAP`, label maps, token sanitizer
- `src/pages/AdminRecommendedScenes.tsx`
- `supabase/migrations/<ts>_scene_catalog_taxonomy.sql`

**Edited (minimal, additive)**
- `src/components/app/freestyle/SceneSelectorChip.tsx` — chip trigger opens new modal when flag on (one branch added; old code path retained for rollback)
- `src/pages/Freestyle.tsx` — accept `pis-` prefix in generate handler (1-line guard); apply token sanitizer when populating prompt box
- `src/pages/AdminProductImageScenes.tsx` — append new field controls to the editor card; no edits to existing fields
- `src/data/mockData.ts` — add 3 optional fields per pose entry
- `src/types/index.ts` — extend `TryOnPose` with 3 optional fields
- `src/App.tsx` — add `/app/admin/recommended-scenes` route
- Admin sidebar — append "Recommended Scenes" link

**Untouched (explicit)**
- Product Visuals wizard, Catalog Studio, generation pipeline, all edge functions, RLS on existing tables, `useProductImageScenes`, `freestyle_generations` schema, `categoryConstants.ts` core mappings, generated Supabase types.

### 11. Rollback plan

If anything misbehaves:
1. Set `VITE_SCENE_CATALOG_V2=false` → chip reverts to the existing popover instantly. Zero deploy needed.
2. Drop the new columns / table:
   ```sql
   DROP TABLE IF EXISTS recommended_scenes;
   ALTER TABLE product_image_scenes DROP COLUMN IF EXISTS subject, DROP COLUMN IF EXISTS shot_style, DROP COLUMN IF EXISTS setting, DROP COLUMN IF EXISTS mood, DROP COLUMN IF EXISTS filter_tags;
   ALTER TABLE custom_scenes DROP COLUMN IF EXISTS subject, DROP COLUMN IF EXISTS shot_style, DROP COLUMN IF EXISTS setting, DROP COLUMN IF EXISTS mood, DROP COLUMN IF EXISTS filter_tags;
   ```
   No data loss elsewhere — these columns are read by new code only.

### 12. Validation

- `/app/freestyle` Scene chip → modal slides in from right (matches `/app/products`).
- Network: 4 small queries on open, no 1000-row payload.
- Filter "With Model + Footwear" → grid loads 24 rows; scroll loads next 24; never bulk loads.
- Search "marble" → ~8 matches.
- Recommended rail prioritises user's onboarding categories, then admin-featured.
- Toggle a scene "Featured" in `/app/admin/recommended-scenes` → reopen Freestyle modal as user → it appears within 10s.
- Pick Product Visuals scene → prompt box populates with cleaned text, preview thumb shows, generation succeeds with same payload shape as today.
- Product Visuals wizard at `/app/generate/product-images` opens, picks scenes, generates — identical behaviour.
- Audit query returns < 5% conflicts; admins fix manually.
- Feature flag off → chip behaves exactly as today.

### Out of scope
- Mood values backfill (admin curation later).
- Migrating `mockTryOnPoses` into DB.
- Workflow scene pickers reusing the modal (component built shareable; wiring is a separate PR).
- "Saved filter sets" personalisation v2.

