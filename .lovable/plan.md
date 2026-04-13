

# Show Edit & Delete Buttons for ALL Models (Built-in + Custom)

## Problem
The actions column in AdminModels.tsx (lines 553-619) conditionally renders edit/delete buttons only when `model.isCustom` is true. Since all 53 models are built-in, only the Camera button appears.

## Solution

### Update `src/pages/AdminModels.tsx` — Actions section (lines 610-619)
Replace the built-in model branch (currently only Camera) with the full set of action buttons:
- **Camera** — change photo (already works for built-in via image_override_url)
- **Pencil** — edit model info (for built-in models, this would need metadata override storage — but we can show the button and store overrides similarly to image overrides)
- **Eye/EyeOff** — toggle visibility (for built-in models, use the `hidden_scenes` pattern or a new column in `model_sort_order`)
- **Trash2** — hide/remove from the list (for built-in models, mark as hidden rather than truly deleting)

### Database migration
Add two columns to `model_sort_order`:
- `name_override TEXT` — overrides the display name
- `is_hidden BOOLEAN DEFAULT false` — hides built-in models from the list

### Update `src/hooks/useModelSortOrder.ts`
- Fetch and expose `name_override` and `is_hidden` alongside existing fields
- Add `applyNameOverrides()` helper
- Add `useSaveModelMetadataOverride` mutation
- Add `useToggleModelHidden` mutation

### Update `src/pages/AdminModels.tsx`
- Remove the `model.isCustom` guard around edit/delete buttons — show them for all models
- For built-in model edit: save name/gender/body_type/ethnicity/age_range overrides to `model_sort_order`
- For built-in model delete: set `is_hidden = true` in `model_sort_order` instead of actual deletion
- Filter out hidden built-in models from the main list (with an "Show hidden" toggle)
- Apply name overrides in `buildUnifiedList`

### Update consumers
Apply `applyNameOverrides` alongside `applyOverrides` in Generate.tsx, ModelSelectorChip.tsx, and CreativeDropWizard.tsx so renamed models display correctly everywhere.

## Files Changed
- **Migration**: Add `name_override`, `gender_override`, `body_type_override`, `ethnicity_override`, `age_range_override`, `is_hidden` columns to `model_sort_order`
- **`src/hooks/useModelSortOrder.ts`**: Fetch + expose metadata overrides and hidden state, add mutations
- **`src/pages/AdminModels.tsx`**: Enable all action buttons for all models, branch save/delete logic

