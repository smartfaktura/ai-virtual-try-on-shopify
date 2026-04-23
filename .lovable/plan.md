
## Fix `/app/admin/scene-performance` count windows and thumbnail cropping

### What is actually wrong

1. **“Scenes used” is still stuck at 1,000**
   - `src/pages/admin/SceneUsage.tsx` currently does:
     ```ts
     supabase.rpc('get_scene_popularity', { p_days: windowDays }).range(0, 9999)
     ```
   - That does **not** guarantee more than 1,000 rows here because this project already documents a project-level PostgREST row ceiling in `useSceneCounts.ts`.
   - Result: the page still receives only the first 1,000 popularity rows, so:
     - KPI `Scenes used` is wrong
     - table is truncated
     - CSV export is truncated

2. **Requested time windows are missing**
   - `SceneUsage.tsx` only supports:
     ```ts
     type Window = 30 | 60 | 90;
     [30, 60, 90]
     ```
   - User needs **1d, 7d, 360d** added.

3. **Thumbnails can still look zoomed**
   - Current page uses:
     ```ts
     getOptimizedUrl(url, { width: 80, quality: 60 })
     ```
     with fixed portrait boxes.
   - Even after switching boxes to 4:5, width-only transforms are still risky for these admin scene previews because:
     - not every preview image is guaranteed to match the same aspect
     - width-only render transforms can still crop/zoom on the image service side
     - CSS `object-cover` will crop anything that does not match the box exactly
   - That is why the screenshot still shows “too close” previews.

### Implementation

#### 1) Page through popularity RPC results instead of relying on one oversized range
**File:** `src/pages/admin/SceneUsage.tsx`

Add a local helper for the admin page, e.g.:
```ts
async function fetchAllScenePopularity(p_days: number, hardCap = 10000) { ... }
```

Behavior:
- request RPC pages in chunks of 1000:
  - `.range(0, 999)`
  - `.range(1000, 1999)`
  - etc.
- append until returned rows `< pageSize`
- stop at a safe hard cap
- reuse this helper for the **main popularity dataset**

This fixes:
- true `Scenes used` count
- full table population
- full CSV export

Keep the risers fetch lightweight:
- keep separate 7d / 14d riser queries capped to a smaller page window unless needed later

#### 2) Add the missing date windows
**File:** `src/pages/admin/SceneUsage.tsx`

Expand:
```ts
type Window = 1 | 7 | 30 | 60 | 90 | 360;
```

Replace:
```ts
[30, 60, 90]
```
with:
```ts
[1, 7, 30, 60, 90, 360]
```

No other logic needs to change because the page already passes `windowDays` into:
- `get_scene_popularity`
- `get_scene_unique_user_count`
- CSV filename
- KPI rendering

#### 3) Remove the crop-prone thumbnail path for this page
**Files:**
- `src/pages/admin/SceneUsage.tsx`
- `src/lib/imageOptimization.ts`

Update `getOptimizedUrl` to support optional height + resize mode, backward-compatible:
```ts
interface OptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
}
```

Append params when provided:
- `width`
- `height`
- `quality`
- `resize`

Then change Scene Performance thumbnails to use a **non-cropping** transform, for example:
```ts
getOptimizedUrl(url, { width: 80, height: 100, quality: 60, resize: 'contain' })
getOptimizedUrl(url, { width: 56, height: 72, quality: 60, resize: 'contain' })
```

And switch the page’s image classes from `object-cover` to `object-contain` inside the existing portrait containers.

Result:
- full scene stays visible
- no center-crop / zoomed-in look
- payload still stays small
- this fix is isolated to the admin page and does not regress other optimized thumbnails

#### 4) Keep the current performance improvements
**File:** `src/pages/admin/SceneUsage.tsx`

Preserve:
- progressive main-load-first rendering
- capped riser queries
- lazy visible-row metadata hydration
- optimized thumbnail delivery

### Why this is the right fix

- Solves the **actual** 1,000-row bug instead of relying on `.range(0, 9999)` which is still being capped
- Adds the requested **1d, 7d, 360d** filters with minimal risk
- Fixes thumbnail zooming by eliminating the crop path rather than trying more box-size tweaks
- Keeps the page fast and admin-only
- No billing, queue, generation, or user-facing flows are touched

### Files to change

- `src/pages/admin/SceneUsage.tsx`
  - add paged popularity fetch helper
  - use it for main dataset
  - add 1 / 7 / 360 buttons
  - switch thumbnail rendering to contain-safe optimized transforms
- `src/lib/imageOptimization.ts`
  - add optional `height` and `resize` support without breaking existing callers

### Validation

1. Open `/app/admin/scene-performance`
2. Confirm `Scenes used` is now **above 1,000** when data exceeds that threshold
3. Confirm table row count and CSV include more than 1,000 scenes
4. Confirm filter buttons now show:
   - 1d
   - 7d
   - 30d
   - 60d
   - 90d
   - 360d
5. Confirm table thumbnails and riser thumbnails show the **full preview** without zoom/crop
6. Confirm page still loads quickly and “Load more” behavior remains unchanged
