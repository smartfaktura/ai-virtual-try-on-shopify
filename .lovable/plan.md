

# Fix: Crash after saving Discover metadata

## Root Cause
After saving metadata, lines 488-497 in `DiscoverDetailModal.tsx` **directly mutate** the `item.data` object (which is owned by React Query cache). Then `queryClient.invalidateQueries` triggers a refetch, causing a race between the mutated stale data and new data. This can crash the React tree (caught by ErrorBoundary → reload page).

## Fix

### 1. `DiscoverDetailModal.tsx` — Remove direct item.data mutations (lines 488-497)
Delete the block that mutates `item.data` after a successful save. The `queryClient.invalidateQueries` on line 498 already handles refreshing the data correctly — the mutations are redundant and dangerous.

```typescript
// REMOVE these lines (488-497):
(item.data as any).category = editCategory;
(item.data as any).model_name = update.model_name;
(item.data as any).model_image_url = update.model_image_url;
(item.data as any).scene_name = update.scene_name;
(item.data as any).scene_image_url = update.scene_image_url;
(item.data as any).workflow_slug = update.workflow_slug;
(item.data as any).workflow_name = update.workflow_name;
(item.data as any).prompt = editPrompt || null;
(item.data as any).product_name = update.product_name;
(item.data as any).product_image_url = update.product_image_url;
```

Keep only the `queryClient.invalidateQueries` call and `toast.success`.

### 2. `DiscoverDetailModal.tsx` — Fix duplicate model keys (line 323)
The model Select uses `m.name` as key, but `allModelOptions` can contain duplicates between `mockModels` and `customModelProfiles` (e.g. "Priya" appears in both). The dedup check on line 69 uses `items.find(i => i.name === cm.name)` which should prevent this, but the mock data itself may have duplicates.

Add index to key: `key={\`model-${idx}\`}` for models and `key={\`scene-${idx}\`}` for scenes.

## Summary
Two changes, both in `DiscoverDetailModal.tsx`:
1. Remove unsafe direct mutations of cached React Query data (the actual crash cause)
2. Fix duplicate Select keys (warning cleanup)

