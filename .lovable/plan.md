

# Fix: Workflow Data Missing in Creative Drops Wizard (Query Key Collision)

## Problem
When selecting a workflow like Virtual Try-On Set, the config panel shows only Aspect Ratios — no Campaign Mode, Models, or Scenes. The entire inline configuration is invisible.

## Root Cause
**React Query cache collision.** Three different queries all use the same `queryKey: ['workflows']`:

1. `CreativeDrops.tsx` (line 121): `select('id, name')` — runs when the page loads
2. `CreativeDropWizard.tsx` (line 256): `select('*')` — runs when wizard opens
3. `Workflows.tsx` (line 53): `select('*')` — runs on the Workflows page

Since `CreativeDrops.tsx` runs first (it's the parent page), React Query caches the result with **only `id` and `name`**. When the wizard opens and requests `queryKey: ['workflows']`, it gets the cached minimal result. All fields like `uses_tryon`, `generation_config`, `recommended_ratios` are `undefined` — so every conditional section (Campaign Mode, Models, Scenes, Poses) evaluates to `false` and doesn't render.

## Fix

### File 1: `src/components/app/CreativeDropWizard.tsx` (line 256)
Change the queryKey to something unique:
```
queryKey: ['workflows-full']
```
This ensures the wizard always fetches the complete workflow data with `select('*')`.

### File 2: `src/pages/CreativeDrops.tsx` (line 121)
Keep as-is — it only needs `id, name` for the drop list display.

## Summary
- 1 line changed in 1 file
- Fixes the cache collision that caused all workflow configuration UI (models, scenes, campaign mode, poses) to be invisible
- No other changes needed — the rendering logic is already correct, it just wasn't receiving the data

