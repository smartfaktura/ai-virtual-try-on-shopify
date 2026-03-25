

# Admin Model Management — Assessment & Plan

## Current State
Custom models already work end-to-end:
- **DB table** `custom_models` exists with RLS (admin insert/update/delete, authenticated read)
- **Upload + AI analysis** via `AddModelModal` + `create-model-from-image` edge function
- **Image optimization** built into `useAddCustomModel` (generates `optimized_image_url` at 1536px/80%)
- **Freestyle integration** works — `ModelSelectorChip` merges `mockModels + customModels` via `useCustomModels().asProfiles`
- **Workflow integration** works — `CreativeDropWizard` merges custom models into its picker
- **Library metadata** works — `useLibraryItems` resolves `custom-{id}` model IDs back to names/images

## Issues Found

### 1. Persisted model restoration misses custom models
`Freestyle.tsx` line 101 only searches `mockModels` when restoring from localStorage:
```typescript
return mockModels.find(m => m.modelId === _persisted.modelId) ?? null;
```
Custom models (`custom-{uuid}`) will never match. Need to also check `customModels.asProfiles` in a deferred `useEffect` (same pattern used for products/brands).

### 2. No dedicated Admin Model Manager page
Scenes have `/app/admin/scenes` with sort order, categories, hide/show, metadata editing. Models have nothing — they can only be added via the "Add as Model" button in the model picker. No way to:
- Reorder models
- Edit metadata (name, gender, body type, ethnicity)
- Deactivate/hide models
- View all models in one place

### 3. No sort order control
`custom_models` has no `sort_order` column. Models appear by `created_at DESC`, so newest first but no manual reordering.

### 4. Future user-uploaded models need `user_id` scoping
Current RLS makes all custom models visible to all authenticated users (admin-uploaded global library). For paid-plan user models, we'd need a `visibility` column (`global` vs `private`) and updated RLS so users see their own + global models.

## Proposed Plan: Admin Model Manager

### Phase 1 — Fix bugs + Add admin page (do now)

**`src/pages/Freestyle.tsx`** — Fix persisted custom model restoration
- Add deferred `useEffect` watching `customModels.asProfiles` to match `_persisted.modelId` starting with `custom-`

**Database migration** — Add `sort_order` column to `custom_models`
```sql
ALTER TABLE custom_models ADD COLUMN sort_order integer NOT NULL DEFAULT 0;
```

**`src/pages/AdminModels.tsx`** — New admin page (mirror AdminScenes pattern)
- Grid of all models (mock + custom) with drag-to-reorder
- Inline edit name, gender, body type, ethnicity, age range
- Toggle active/inactive for custom models
- "Add Model" button triggering upload + AI analysis
- Delete custom models

**`src/hooks/useCustomModels.ts`** — Add mutations
- `useUpdateCustomModel` — update metadata fields
- Model sort order hooks (similar to `useSceneSortOrder`)

**`src/App.tsx`** — Add route `/app/admin/models`

### Phase 2 — User model uploads (future, not now)
- Add `visibility` column (`global` | `private`) + `user_id` filter to RLS
- Gate behind paid plan check
- Per-user upload limit based on plan tier

## Files changed (Phase 1)
| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Fix custom model restoration from localStorage |
| `src/pages/AdminModels.tsx` | New admin model manager page |
| `src/hooks/useCustomModels.ts` | Add update mutation, sort order support |
| `src/App.tsx` | Add admin route |
| `src/components/app/AppShell.tsx` | Add sidebar link (if models link doesn't exist) |
| Migration | Add `sort_order` to `custom_models` |

