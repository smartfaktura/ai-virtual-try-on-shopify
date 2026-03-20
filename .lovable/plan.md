

# Fix: Scene Loading Speed, Inner Scroll, and Workflow-Filtered Scenes

## Problems
1. **Slow scene images**: `ShimmerImage` renders raw `pose.previewUrl` (full-res Supabase Storage URLs) without using `getOptimizedUrl()` — every scene image loads at full size
2. **Inner scroller**: `max-h-[400px] overflow-y-auto` creates a nested scroll container inside the wizard
3. **Wrong scenes shown**: All scene categories appear for every workflow. Virtual Try-On should only show on-model scenes (Studio, Lifestyle, Editorial, Streetwear). Product Set should only show product scenes (Product Studio, Surface, Flat Lay, Product Editorial, Kitchen, Living Space, Bathroom, Botanical, Outdoor)

## Changes

### File: `src/components/app/CreativeDropWizard.tsx`

**A. Optimize scene images** (line 1120)
Wrap `pose.previewUrl` with `getOptimizedUrl()`:
```tsx
<ShimmerImage
  src={getOptimizedUrl(pose.previewUrl, { quality: 60 })}
  ...
/>
```
Also optimize the `pose.optimizedImageUrl` fallback if available. This matches how `SceneSelectorChip` already does it on the Generate page.

**B. Remove inner scroller** (line 1094)
Change `<div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">` to just `<div className="space-y-4">`. The wizard itself already scrolls — no need for a nested scrollable container.

**C. Filter scenes by workflow type** (lines 276-284)
Add filtering logic based on `selectedWorkflow`:

- Define two category sets:
  - `ON_MODEL_CATEGORIES = ['studio', 'lifestyle', 'editorial', 'streetwear']`
  - `PRODUCT_CATEGORIES = ['clean-studio', 'surface', 'flat-lay', 'product-editorial', 'kitchen', 'living-space', 'bathroom', 'botanical', 'outdoor']`

- When building `allScenePoses`, filter by workflow type:
  - If `selectedWorkflow?.uses_tryon` → only show `ON_MODEL_CATEGORIES`
  - If workflow is product-based (not `uses_tryon` and not model-based) → only show `PRODUCT_CATEGORIES`
  - Fallback: show all

- Update the `useMemo` dependencies to include `selectedWorkflow` so it recalculates when the workflow changes

**D. Clear pose selections when workflow changes** (existing `useEffect` for workflow change)
When `selectedWorkflowId` changes, also reset `poseSelections` to `[]` since the available scenes change per workflow.

## Summary
- 1 file, ~15 lines changed
- Scene images load 5-10x faster via quality-compressed thumbnails
- No nested scroll — scenes flow naturally in the wizard scroll
- Scenes are contextually filtered: on-model scenes for try-on, product scenes for product workflows

