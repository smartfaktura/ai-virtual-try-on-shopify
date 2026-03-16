

## Sort Discover feed by newest first (featured items still pinned on top)

### Problem
Non-featured items in Discover have no date-based sorting — they appear in whatever order presets (`sort_order`) and scenes were appended. User wants newest items first, with featured items still pinned at the top.

### Approach
Both `Discover.tsx` and `PublicDiscover.tsx` need the same fix. The challenge is that `DiscoverItem` wraps `DiscoverPreset` (has `created_at`) or `TryOnPose` (no `created_at`). Custom scenes have `created_at` on the DB row but it's stripped during `toTryOnPose()` conversion. Mock scenes have no date at all.

### Changes

#### 1. `src/types/index.ts` — Add optional `created_at` to `TryOnPose`
Add `created_at?: string` to the `TryOnPose` interface so scenes can carry their creation date through the pipeline.

#### 2. `src/hooks/useCustomScenes.ts` — Pass `created_at` through `toTryOnPose`
In the `toTryOnPose` function, include `created_at: scene.created_at` so custom scenes retain their date.

#### 3. `src/pages/PublicDiscover.tsx` — Same fix for the public `toTryOnPose` + update sort
- Add `created_at` to the local `toTryOnPose` mapping
- Update the `sorted` memo: after featured-first logic, sort non-featured by `created_at` descending. For items without `created_at` (mock scenes), treat them as oldest (sort to bottom).

#### 4. `src/pages/Discover.tsx` — Update sort
Same sorting change: non-featured items sorted by `created_at` descending, with a `getItemDate` helper:
```typescript
function getItemDate(item: DiscoverItem): number {
  const d = item.type === 'preset' ? item.data.created_at : item.data.created_at;
  return d ? new Date(d).getTime() : 0;
}
```
In the sort comparator, replace the `return 0` fallback with `return getItemDate(b) - getItemDate(a)`.

