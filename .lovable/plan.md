

## Make scene + workflow visible and editable in "Add to Discover"

### Problem
When an admin clicks **Add to Discover** on a Library item that's missing `scene_name` (e.g. an item generated before metadata was populated, or one where the worker dropped the field), the published preset has no scene → Recreate from Discover can't pre-select anything → user lands in Product Images with no scene. The current modal doesn't show what scene/workflow it's about to publish, so the admin can't catch or fix it.

### Fix: turn the Add to Discover modal into a **scene + workflow confirmation step**

Replace the silent "Show scene name" / "Show model name" toggles with **visible, preselected, editable pickers** so the admin always confirms what's being published.

### New section in `AddToDiscoverModal.tsx`

Replace the current `Visibility` block with a richer **Generation Context** block:

```text
GENERATION CONTEXT  (admin can edit any field)

  Workflow         [ Product Images ▾ ]    ← combobox, preselected from workflowSlug
  Scene            [ Marble Console ▾ ]    ← searchable combobox, preselected from sceneName
                   [thumb] Marble Console Vignette · interior collection
  Model            [ None ▾ ]              ← searchable combobox, preselected from modelName
                   [thumb] (only if selected)
  Product          [✓] Show product reference   ← existing toggle, unchanged
                   [thumb] Olive Wallet
```

Behavior:
- All three pickers preselect from the props passed in (`workflowSlug`, `sceneName`, `modelName`).
- If `sceneName` is missing, picker shows `— No scene —` placeholder with subtle yellow hint: "No scene detected. Pick one so Recreate works."
- Scene picker lists **all 200+ `product_image_scenes`** (already merged in `DiscoverDetailModal` — same `useQuery` reused via a small hook), grouped by `category_collection`, plus freestyle scenes from `mockTryOnPoses` and `custom_scenes` (via `get_public_custom_scenes`).
- Model picker lists `mockModels` + `custom_models` (admin-readable).
- Workflow picker lists active rows from `workflows` table (small query, staleTime 10min, admin-only).
- Each picker has a "Clear" option → publishes `null` for that field.
- Submit uses the **picker values** instead of the raw props. If admin picks a scene with a thumbnail, that thumbnail is published as `scene_image_url` (overrides the prop).

### Shared hook for picker options

Extract `useDiscoverPickerOptions()` in `src/hooks/useDiscoverPickerOptions.ts`:
- Returns `{ scenes, models, workflows }` with all three sources merged + grouped.
- Admin-only (gated by `useIsAdmin`), `staleTime: 10min`, only fetches when `enabled`.
- Reused by both `AddToDiscoverModal` (admin direct publish) and `DiscoverDetailModal` (admin edit) — eliminates duplicate logic.

### Submit payload changes

`handlePublish` builds `presetData` from picker state:
```ts
scene_name:      pickedScene?.name ?? null,
scene_image_url: pickedScene?.imageUrl ?? null,
model_name:      pickedModel?.name ?? null,
model_image_url: pickedModel?.imageUrl ?? null,
workflow_slug:   pickedWorkflow?.slug ?? null,
workflow_name:   pickedWorkflow?.name ?? null,
```

The existing dedupe-update path (lines 281–297) already updates by `image_url` → republishing the same image with a now-correct scene **fixes** the existing preset in place. No duplicate entries.

### Light QoL: AI auto-detect scene when missing

If `sceneName` is null/empty when modal opens, send the image + `allScenes[].title` list to `describe-discover-metadata` with a new `?suggestScene=true` flag. The function already runs Gemini on the image — extend it to also return `suggested_scene_name`. Pre-select that suggestion (with a subtle "AI suggested" badge) but admin still confirms. **Strictly fallback**: if the prop has a scene name, skip the suggestion call.

This is an additive optional flag — old `describe-discover-metadata` callers (the user-facing `SubmitToDiscoverModal`) keep working unchanged.

### Files touched

```text
NEW   src/hooks/useDiscoverPickerOptions.ts
        - Admin-only merged scenes + models + workflows
        - staleTime 10min, conditional fetch

EDIT  src/components/app/AddToDiscoverModal.tsx
        - Replace Visibility block with Generation Context section
        - Three Combobox-style pickers (Workflow / Scene / Model) preselected from props
        - Submit uses picker state, not raw props
        - Yellow hint when scene is empty
        - Optional: render AI scene suggestion when prop is missing

EDIT  supabase/functions/describe-discover-metadata/index.ts
        - Accept optional `sceneOptions: string[]` in body
        - When provided, prompt Gemini to return `suggested_scene_name` matching one option
        - Backward-compatible (field is optional in response)

EDIT  src/components/app/DiscoverDetailModal.tsx
        - Refactor to use shared useDiscoverPickerOptions hook
        - (No behavior change, just dedupe — optional, can skip if risky)
```

No DB migration. No RLS changes. No changes to `LibraryDetailModal` props (already forwards everything correctly).

### Why this fixes the user's report

1. **Newly uploaded bag item with no scene metadata** → admin opens modal → sees yellow hint "No scene detected" + AI-suggested scene preselected → confirms → preset is published with the correct `scene_name` → Recreate works.
2. **Item with detected scene** → admin sees scene + thumbnail preselected → confirms → publishes as before, but admin had a chance to verify.
3. **Wrong scene detected by AI** → admin opens picker → searches → corrects → publishes with the right scene.
4. **Admin republishes a previously-broken preset** → existing dedupe path updates the same row → no duplicates.

### Safety & performance

- All three picker queries run **only when modal is open and user is admin** (gated by `enabled`).
- 10-minute staleTime → typically one fetch per admin session.
- AI suggestion call only runs when scene metadata is missing → zero extra cost for items that already have it.
- Picker state is local to the modal → no impact on Library, freestyle, or other consumers of `AddToDiscoverModal`.
- If picker queries fail, modal falls back to the raw props (current behavior) — no crash, no regression.
- No edge function signature changes are breaking — all new fields optional.

### Validation

1. Upload + generate a bag item that ends up with `scene_name = ''` → click Add to Discover → modal shows yellow hint + AI-suggested scene preselected → admin confirms → Discover preset has correct `scene_name` → Recreate from Discover lands in Product Images with that scene auto-selected.
2. Item with proper `sceneName` prop → modal shows scene preselected with thumbnail → publish unchanged.
3. Admin clears the scene and publishes → preset has `scene_name = null` (Recreate falls back to no preselection, which is current behavior for those entries).
4. Republish same image with corrected scene → existing preset row updated in place.
5. Non-admin call sites of `AddToDiscoverModal` (none today, but defensive): pickers gracefully no-op if the admin-only queries return empty.
6. `SubmitToDiscoverModal` (user-facing) unaffected — separate component, separate flow.

