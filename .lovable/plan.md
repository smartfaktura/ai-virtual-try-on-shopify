

## Fix Scene Preview Images — Use Existing Workflow URLs

The 6 new scenes reference non-existent files in the `landing-assets` bucket. The actual preview images already exist in the `workflow-previews` bucket from the Product Listing Set workflow.

### Change

**`src/data/mockData.ts`** — Replace the 6 `getLandingAssetUrl(...)` constants with direct workflow-preview URLs:

```typescript
// Replace these:
const sceneRawConcrete = getLandingAssetUrl('scenes/scene-raw-concrete.jpg');
const sceneWarmWoodGrain = getLandingAssetUrl('scenes/scene-warm-wood-grain.jpg');
const sceneLinenFabric = getLandingAssetUrl('scenes/scene-linen-fabric.jpg');
const sceneBathroomShelf = getLandingAssetUrl('scenes/scene-bathroom-shelf.jpg');
const sceneWaterSplash = getLandingAssetUrl('scenes/scene-water-splash.jpg');
const sceneFloatingLevitation = getLandingAssetUrl('scenes/scene-floating-levitation.jpg');

// With the actual workflow-preview URLs:
const WORKFLOW_PREVIEW_BASE = 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/bf124e8b-aabc-484a-bc81-d29a9ccec885';

const sceneRawConcrete = `${WORKFLOW_PREVIEW_BASE}/scene-6.png`;
const sceneWarmWoodGrain = `${WORKFLOW_PREVIEW_BASE}/scene-7.png`;
const sceneLinenFabric = `${WORKFLOW_PREVIEW_BASE}/scene-8.png`;
const sceneBathroomShelf = `${WORKFLOW_PREVIEW_BASE}/scene-10.png`;
const sceneWaterSplash = `${WORKFLOW_PREVIEW_BASE}/scene-16.png`;
const sceneFloatingLevitation = `${WORKFLOW_PREVIEW_BASE}/scene-20.png`;
```

Single file, 6 URL swaps. Images will load immediately.

