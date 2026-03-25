

# Fix: Brand Models Not Showing in Workflow Model Selection

## Problem
The model selection step in Generate.tsx (used by Virtual Try-On, Selfie/UGC, and Mirror Selfie workflows) only renders `mockModels` from the static mock data. It never fetches or merges custom models (admin-uploaded brand models) or user-generated models from the database.

The Freestyle model selector (`ModelSelectorChip.tsx`) works correctly because it imports `useCustomModels` and `useUserModels` and merges all three sources: `[...mockModels, ...customModels, ...userModelProfiles]`.

## Solution
Mirror the Freestyle approach in `Generate.tsx`:

### File: `src/pages/Generate.tsx`
1. **Import hooks**: Add `useCustomModels` and `useUserModels` imports
2. **Import `useModelSortOrder`** for consistent ordering
3. **Call hooks** inside the component to get `asProfiles` from both
4. **Replace `mockModels`** with a merged+sorted list everywhere it's used:
   - `filteredModels` definition (~line 647) — use `allModels` instead of `mockModels`
   - `prefillModelName` lookup (~line 592) — search `allModels`
   - `popularCombinations` (~line 664) — use `allModels`
5. **Build `allModels`**: `sortModels([...mockModels, ...customModels, ...userModelProfiles])`

No database or edge function changes needed — the hooks and data already exist, they're just not wired into this page.

