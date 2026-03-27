

# Add Labels to Admin Metadata Fields + Discover Category to Add Scene Modal

## Problem
1. The admin metadata section in the Discover detail modal has no labels on the dropdowns — it's unclear what each selector controls (Category, Workflow, Model, Scene).
2. The "Add as Scene" modal doesn't have a Discover category selector, so when adding a scene it can't be categorized for the Discover feed.
3. The Discover categories (Beauty, Fashion, Fragrances, etc.) should be selectable both in the Discover detail modal and the Add Scene modal.

## Changes

### 1. Add labels to all admin metadata fields in `DiscoverDetailModal.tsx`
- Add `<p>` labels above each dropdown in the 2×2 grid (lines 348-401):
  - "Discover Category" above the category `<Select>`
  - "Workflow" above the workflow `<Select>`
  - "Model" above the model `<Select>`
  - "Scene" above the scene `<Select>`
- Add label "Prompt" above the prompt textarea
- The existing "Product" label and "Scene Display Name" / "Scene Category" labels already exist — keep as-is

### 2. Add Discover Category selector to `AddSceneModal.tsx`
- Add a new state `discoverCategory` (default `'fashion'`)
- Add a new section below the existing Scene Type / Category selectors: "Discover Category" with chip buttons for all `DISCOVER_CATEGORIES`
- Pass `discover_category` through to `addScene.mutateAsync()` so it's stored
- Update `useAddCustomScene` mutation in `useCustomScenes.ts` to accept and persist an optional `discover_category` field (this will be used when the scene is promoted to Discover)

### 3. Extract `DISCOVER_CATEGORIES` to a shared constant
- Move the `DISCOVER_CATEGORIES` array from `DiscoverDetailModal.tsx` to `src/lib/categoryConstants.ts` (already exists)
- Import from both `DiscoverDetailModal.tsx` and `AddSceneModal.tsx`

### Technical details
- No database changes needed — the `discover_presets.category` column already stores these values
- The Discover category in the Add Scene modal is informational — it sets what category the scene will appear under if/when promoted to Discover
- Labels use the existing `text-[10px] font-medium text-muted-foreground/60 mb-1` style pattern already used for "Scene Display Name"

