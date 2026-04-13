

# Enable Image Replacement for ALL Models (Built-in + Custom)

## Problem
The Camera/Change photo button only renders for custom models (`model.isCustom`). Since the user has 53 built-in models and 0 custom, no image change buttons are visible at all. Built-in model images come from `mockData.ts` and there's no storage for overrides.

## Solution

### 1. Add `image_override_url` column to `model_sort_order` table
Run a migration to add an optional `image_override_url TEXT` column. This piggybacks on the existing table that already stores per-model admin preferences.

### 2. Update `useModelSortOrder` hook
- Fetch `image_override_url` alongside `model_id` and `sort_order`
- Expose an `imageOverrides` map (`model_id → url`) so consumers can apply overrides
- Update `useSaveModelSortOrder` to preserve `image_override_url` when re-saving order

### 3. Add a new `useSaveModelImageOverride` mutation
A small mutation that does an upsert on `model_sort_order` for a single model's `image_override_url`, so image changes save immediately (no need to click "Save Order").

### 4. Update `AdminModels.tsx`
- Remove the `if (!model.isCustom)` guard from `handleImageClick` — allow it for all models
- In `handleFileChange`, branch logic:
  - **Custom models**: existing flow (update `custom_models` table)
  - **Built-in models**: upload to `scratch-uploads/models/`, then upsert `image_override_url` in `model_sort_order`
- Show the Camera button and thumbnail hover overlay for **all** models, not just custom ones
- Replace the "read-only" label with action buttons (Camera + the existing reorder controls are already there)
- Apply `imageOverrides` to built-in model display URLs so the replacement is visible immediately

### 5. Apply overrides in consumer components
Update `buildUnifiedList` in AdminModels to check the `imageOverrides` map and use the override URL when available, so the thumbnail reflects the replacement.

## Files Changed
- **Migration**: Add `image_override_url` column to `model_sort_order`
- **`src/hooks/useModelSortOrder.ts`**: Fetch + expose image overrides, add upsert mutation
- **`src/pages/AdminModels.tsx`**: Enable Camera button for all models, branch upload logic

