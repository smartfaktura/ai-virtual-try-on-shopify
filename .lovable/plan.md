

## Fix: Recommended scenes display as "Product Visuals" workflow with scene thumbnail

The Recreate routing IS correct already — `handleUseItem` in `Discover.tsx` (line 463-480) sends every scene-type tile to `/app/generate/product-images?sceneRef=...&fromDiscover=1`. What's broken is purely **visual labeling** in the modals and card hover. Recommended scene tiles render as a bare `"Scene"` instead of mirroring the Ice Cold Energy Boost layout (workflow chip + scene thumbnail row).

### What changes

**1. `src/components/app/DiscoverDetailModal.tsx`**
- `workflowLabel` (line 179-181): for scene-type items, return `"Product Visuals"` instead of `"Scene"`.
- "Created with" Scene row (line 250-264): also render when `item.type === 'scene'`, using `item.data.name` as the scene name and `item.data.previewUrl` as the thumbnail.
- "Created with" workflow click handler (line 235-244): for scenes, navigate to `/app/generate/product-images?sceneRef={scene_ref}&fromDiscover=1`.

**2. `src/components/app/PublicDiscoverDetailModal.tsx`**
- Mirror the same three changes (workflowLabel, scene-thumbnail row, click handler).

**3. `src/components/app/DiscoverCard.tsx`**
- `getGenerationLabel` (line 28-34): scene-type returns `"Product Visuals"` instead of `"Scene"`.
- Hover overlay (line 92-113): for scenes, render a single Scene row using `item.data.name` + `item.data.previewUrl` as the thumbnail (same visual as preset's scene-thumb row).

**4. `src/hooks/useRecommendedDiscoverItems.ts`** (single line)
- Add `workflow_slug: 'product-images'` and `workflow_name: 'Product Visuals'` as additional fields on the `RecommendedDiscoverPose` so any future consumer that branches on these gets the right values. Existing UI code that explicitly checks `item.type === 'scene'` keeps working.

### Result

Hovering or opening any recommended scene tile now shows:
- **Top label**: "Created with **Product Visuals**" (clickable → opens Product Images wizard)
- **Scene row**: 40×40 thumbnail of the scene preview + scene name + "Scene" sub-label
- **Recreate this** button: routes to `/app/generate/product-images?sceneRef=...&fromDiscover=1` (already worked)

Identical visual treatment to the Ice Cold Energy Boost example in the screenshot, but powered entirely by data already on the recommended-scene rows. No DB or RPC changes.

### Files to edit

```text
src/components/app/DiscoverDetailModal.tsx
src/components/app/PublicDiscoverDetailModal.tsx
src/components/app/DiscoverCard.tsx
src/hooks/useRecommendedDiscoverItems.ts
```

### Out of scope
- No DB/RLS/RPC changes
- No Product Images wizard changes (Step 1/Step 2 logic untouched)
- No new components

