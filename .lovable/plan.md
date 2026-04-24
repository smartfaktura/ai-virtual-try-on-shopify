
## Fix missing recommended hoodies / jeans / activewear / lingerie in `/app/discover`

### Real root cause

The previous merge fix was necessary, but it is not the main reason you still see only 4 hoodies.

`useRecommendedDiscoverItems` has two code paths:

- `/discover` uses the public RPC `get_public_recommended_scenes()` — this returns the joined recommended rows correctly
- `/app/discover` uses the authenticated path:
  ```ts
  supabase
    .from('product_image_scenes')
    .select('scene_id, title, description, preview_image_url, category_collection')
    .eq('is_active', true)
  ```
  That query is silently capped by the backend’s default row limit of 1000

Your active `product_image_scenes` table has **1613 active rows**, so the auth path only sees the first 1000 scenes. Many recommended scene IDs are outside that first batch, so they never get mapped into `recommendedPoses`.

That exactly matches the symptom:
- hoodies recommended total in DB: **19**
- jeans: **12**
- activewear: **18**
- lingerie: **12**
- but if you only look at the first 1000 active scenes, only a small subset is reachable

So `/app/discover` is incomplete because the hook is truncating the source scene table before it joins to `recommended_scenes`.

### What to change

#### 1. Fix `useRecommendedDiscoverItems` authenticated mode
Update `src/hooks/useRecommendedDiscoverItems.ts` so the auth path no longer does a single uncapped `product_image_scenes` read.

Best fix:
- use the same server-side RPC pattern for both auth and public
- or page through `product_image_scenes` until all active rows are collected before building `sceneById`

Preferred implementation:
- add one shared helper/RPC-backed fetch for recommended scenes
- keep the existing `disambiguateTitles()` and `buildPose()` logic unchanged

Result:
- `/app/discover` and `/discover` will resolve the same full recommended scene set
- no missing hoodies/jeans/lingerie/activewear due to row truncation

#### 2. Preserve the earlier Discover merge fix
Keep the already approved logic in:
- `src/pages/Discover.tsx`
- `src/pages/PublicDiscover.tsx`

That logic is still needed because:
- hidden-scene filtering should not remove recommended scenes
- same-title presets should not shadow better-tagged recommended scenes

The row-limit fix and the merge fix solve different layers of the problem.

#### 3. Optional hardening: make the hook deterministic
While touching the hook, also make the authenticated and public branches return the same shape from the same source of truth so this cannot drift again.

Good pattern:
- one backend query returns only:
  - `scene_id`
  - `title`
  - `description`
  - `preview_image_url`
  - `category_collection`
  - `created_at`
- frontend only maps rows into `RecommendedDiscoverPose`

### Files to edit

```text
src/hooks/useRecommendedDiscoverItems.ts   — remove 1000-row auth truncation
src/pages/Discover.tsx                     — keep current recommended-scene merge behavior
src/pages/PublicDiscover.tsx               — keep current recommended-scene merge behavior
```

### Expected result

After this fix:

- `/app/discover` Fashion → Hoodies will show the full recommended hoodie set, not just 4
- same for Jeans, Activewear, and Lingerie
- `/app/discover` and `/discover` will stay in sync
- recommended scenes added in admin will reliably appear in the correct sub-pill even when total active scene count grows past 1000

### Out of scope

- no taxonomy changes
- no RLS changes
- no preset backfill
- no loading/performance optimization yet
- no UI redesign

### Technical note

The bug is not that the subcategory tags are missing. The tags are already correct in the recommended scene source. The loss happens because the authenticated hook builds its lookup map from an incomplete `product_image_scenes` result set.
