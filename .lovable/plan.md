

# Use Actual Model List on Landing Page

## Problem
`ModelShowcaseSection.tsx` has hardcoded model names and image file paths that are duplicated from `mockModels`. When admin changes a model's image or name via overrides, the landing page doesn't reflect those changes.

## Solution

### Update `ModelShowcaseSection.tsx`
- Import `mockModels` from `src/data/mockData.ts` instead of hardcoding ROW_1/ROW_2
- Split the mockModels array into two halves for the two marquee rows
- Each model card uses `model.previewUrl` and `model.name` directly
- This ensures model images/names always match the source of truth

### Apply admin overrides on public pages
- The `useModelSortOrder` hook currently requires auth (`enabled: !!user`). For the public landing page, we need to either:
  - Make it work without auth by adding a read-only RLS policy on `model_sort_order` for `anon` role
  - Or fetch overrides separately in the component
- **Approach**: Add an `anon` SELECT policy on `model_sort_order`, then use `useModelSortOrder` without the auth guard for read-only data. Update the hook's `enabled` to always be `true` for the query.
- Apply `applyOverrides`, `applyNameOverrides`, `filterHidden`, and `sortModels` to the model list before rendering

### Files changed
- **Migration**: Add `anon` SELECT policy on `model_sort_order`
- **`src/hooks/useModelSortOrder.ts`**: Remove `enabled: !!user` restriction (read-only query is safe for public)
- **`src/components/landing/ModelShowcaseSection.tsx`**: Replace hardcoded arrays with `mockModels` + override helpers, split into two rows

