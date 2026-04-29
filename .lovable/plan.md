# Fix "Steal the Look" → routes to Freestyle instead of Product Visuals

## Root cause

The dashboard's "Steal the Look" section uses its **own** `handleUseItem` function in `src/components/app/DashboardDiscoverSection.tsx` (lines 169–193), which is an **outdated copy** of the Discover page logic.

The dashboard version:
- Sends **scene-type** items to `/app/freestyle?scene=<poseId>` ❌
- For **preset** items, never checks `workflow_slug === 'product-images'` and never forwards `sceneRef`, so most cards fall through to `/app/freestyle?...` ❌

The canonical `/app/discover` page (`src/pages/Discover.tsx` lines 560–610) already does the right thing — it routes scene items and product-images presets to **`/app/generate/product-images?sceneRef=...&fromDiscover=1`**.

That's why `/discover` works correctly and the dashboard does not.

## Fix

Replace `handleUseItem` in `src/components/app/DashboardDiscoverSection.tsx` with the exact same logic used on the Discover page. Do **not** touch `/app/discover` itself.

Routing rules after the fix:

1. **Scene-type item** → `/app/generate/product-images`
   - Prefer `sceneRef` (from `item.data.scene_ref`)
   - Legacy fallback params: `scene`, `sceneImage`, `sceneName`, `sceneCategory`
   - Always append `fromDiscover=1`

2. **Preset with `workflow_slug === 'product-images'`** → `/app/generate/product-images?sceneRef=...&fromDiscover=1`

3. **Preset with another `workflow_slug`** → `/app/generate/{slug}` with `model`, `scene`, `sceneImage`, `fromDiscover=1`

4. **Free-form prompt preset (no `workflow_slug`)** → keep existing `/app/freestyle?...` route (intentional — these are free-form prompt cards).

## Files touched

- `src/components/app/DashboardDiscoverSection.tsx` — only the `handleUseItem` function body.

## Safety

- One function rewrite, ~30 lines.
- `/app/discover` is **not modified**.
- No DB / RLS / edge-function / auth changes.
- No new deps, hooks, or types.
- Card click (modal open), category bar, save, recommended hooks — all untouched.
- Logic is already battle-tested in production on `/app/discover`, so risk of regression is minimal.

## Verification

1. Dashboard → "Steal the Look" → click **Recreate this** on any Fashion card → lands on `/app/generate/product-images?sceneRef=...` with the scene pre-applied (not Freestyle).
2. Open the detail modal → click **Use** → same Product Visuals destination.
3. `/app/discover` Recreate behavior is unchanged.
