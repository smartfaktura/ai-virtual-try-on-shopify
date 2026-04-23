

## Auto-fill scene metadata when publishing from Library to Discover

### What's broken

1. **`SubmitToDiscoverModal` (user-facing "Add to Discover" — screenshot 2) drops scene/model metadata.** `LibraryDetailModal` only passes `imageUrl`, `prompt`, `aspectRatio`, `quality`, `productName`, `productImageUrl` — but `sceneName`, `modelName`, `sceneImageUrl`, `modelImageUrl`, `workflowSlug`, `workflowName` are all already on `activeItem`. They never reach the submission, so the resulting `discover_presets` row has `scene_name = null` → Recreate has nothing to pre-select.

2. **Admin "Edit Metadata" Scene Selection list (screenshot 1) is missing all `product_image_scenes`.** `allSceneOptions` only merges `mockTryOnPoses` (freestyle scenes) + `custom_scenes`. The 200+ Product Images scenes (Reflective Floral Display, etc.) are never in the picker, so admins can't pick the correct scene and auto-preselect silently fails when `scene_name` doesn't match any option in the list.

3. **Auto-preselect already exists** (`setEditSceneName(d?.scene_name || '__none__')`) but appears broken because the matching scene isn't in `allSceneOptions`. Once we add product-images scenes to the list, the existing preselect logic will work.

### Fix

**A. Pass full scene/model context from Library → SubmitToDiscoverModal**

`src/components/app/LibraryDetailModal.tsx` (lines 516–527): forward the missing props that are already on `activeItem`.

```text
<SubmitToDiscoverModal
  ...existing props...
  workflowSlug={activeItem.workflowSlug}
  workflowName={activeItem.source === 'generation' ? activeItem.label : undefined}
  sceneName={activeItem.sceneName}
  modelName={activeItem.modelName}
  sceneImageUrl={activeItem.sceneImageUrl}
  modelImageUrl={activeItem.modelImageUrl}
/>
```

**B. Persist scene/model context through the user submission flow**

`src/components/app/SubmitToDiscoverModal.tsx`:
- Accept new optional props: `workflowSlug`, `workflowName`, `sceneName`, `modelName`, `sceneImageUrl`, `modelImageUrl`.
- Show a small read-only "Scene used" / "Model used" preview row (mirrors the existing Product row pattern) so user sees what will be saved — with optional Switch toggles `showScene` / `showModel` (default ON) like `AddToDiscoverModal`.
- Include them in the `submitMutation.mutate` payload.

`src/hooks/useDiscoverSubmissions.ts`:
- Extend `useSubmitToDiscover` mutation input + insert payload with `workflow_slug`, `workflow_name`, `scene_name`, `model_name`, `scene_image_url`, `model_image_url`.
- Extend `useApproveSubmission` to copy these fields into `discover_presets` on approval (currently drops them).

`DiscoverSubmission` interface gains the same fields.

**C. Add `product_image_scenes` to the admin Scene Selection list**

`src/components/app/DiscoverDetailModal.tsx` (lines 82–88, `allSceneOptions`):
- Add a `useQuery` that fetches `product_image_scenes` (id, scene_id, title, preview_image_url, category_collection) — `staleTime: 10min`, only when `isAdmin && open`.
- Merge into `allSceneOptions` with `category` set to `category_collection ?? 'product-images'` and dedupe by name (existing `find` logic already de-dupes).
- Existing init effect at line 132 (`setEditSceneName(d?.scene_name || '__none__')`) will then correctly preselect because the name now matches an option.
- Existing grouped picker UI (line 527, `poseCategoryLabels[cat] ?? cat`) will render product-images scenes under their category collection group automatically.

**D. Database migration: add submission columns**

`discover_submissions` currently has no scene/model/workflow columns. Add (nullable, no default):
```sql
ALTER TABLE public.discover_submissions
  ADD COLUMN workflow_slug text,
  ADD COLUMN workflow_name text,
  ADD COLUMN scene_name text,
  ADD COLUMN model_name text,
  ADD COLUMN scene_image_url text,
  ADD COLUMN model_image_url text;
```
RLS unchanged (existing user-owned policies cover new columns). Zero impact on existing submissions.

### Files touched

```text
DB MIGRATION
  + 6 nullable columns on discover_submissions

EDIT  src/components/app/LibraryDetailModal.tsx
        + Forward workflowSlug/workflowName/sceneName/modelName/sceneImageUrl/modelImageUrl
          to SubmitToDiscoverModal

EDIT  src/components/app/SubmitToDiscoverModal.tsx
        + Accept 6 new optional props
        + Render read-only Scene + Model preview rows with Switch toggles
        + Include them in submission payload

EDIT  src/hooks/useDiscoverSubmissions.ts
        + Extend DiscoverSubmission interface with 6 fields
        + useSubmitToDiscover input + insert payload
        + useApproveSubmission carries fields into discover_presets

EDIT  src/components/app/DiscoverDetailModal.tsx
        + useQuery for product_image_scenes (admin only, staleTime 10min)
        + Merge into allSceneOptions with category grouping
```

No edge function changes. No changes to `describe-discover-metadata` (it's category-only AI suggestion — separate concern).

### Behaviour after fix

| Action | Before | After |
|---|---|---|
| User clicks Library image → Submit for Review | scene_name dropped → preset has no scene → Recreate broken | scene_name carried through submission → approval → preset → Recreate auto-selects scene |
| Admin opens Discover detail (product-images preset) | "Scene Selection" picker missing the actual scene → can't fix preselect | Picker lists all 200+ product-images scenes, current scene already preselected |
| Admin clicks "Recreate this" on product-images preset | Scene resolves via existing `?scene=` flow (already implemented) | Same — but now scene_name is reliably populated, so resolution succeeds |

### Safety & performance

- Library `activeItem` already carries all the new fields — zero new queries for path A/B.
- New `product_image_scenes` query: admin-only, conditional on modal open, 10min staleTime, ~200 rows fetched once per session.
- Migration: only adds nullable columns — no data backfill, no constraint changes, no RLS edits.
- `useApproveSubmission` change is purely additive — old submissions with null fields work identically.
- All new SubmitToDiscoverModal props optional → freestyle gallery's existing call site keeps working unchanged.

### Validation

1. Generate via Product Images → open in Library → Submit for Review → approve in admin → Recreate from Discover lands in Product Images with the correct scene auto-selected (existing `?scene=` resolver picks it up).
2. Open existing Product Images preset in Discover as admin → "Scene Selection" picker lists product-images scenes grouped by category collection; current scene shown as selected.
3. Submit a freestyle generation → still works, scene_name carried through (freestyle uses mockTryOnPoses names which already exist in allSceneOptions).
4. Old submissions (pre-migration) approve normally with null scene fields.
5. Non-admin users never trigger the product_image_scenes fetch.

