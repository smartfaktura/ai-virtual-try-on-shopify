

# Add Freestyle Recreate Support with Model/Scene Pre-fill + Hint Banner

## What's Happening Now

When a Freestyle Discover item has model/scene data but no `workflow_slug`, clicking "Recreate this" navigates to `/app/freestyle` with only `prompt`, `ratio`, and `quality` params. The model and scene selections are lost. There's also no hint banner in Freestyle like the "Recreating look from Discover" banner on the Generate page.

## Changes

### 1. `src/pages/Discover.tsx` — Pass model/scene params for freestyle recreate

In `handleUseItem` (line 408-414), when routing to freestyle (no `workflow_slug`), also pass `model`, `scene`, `modelImage`, `sceneImage` params:

```ts
const params = new URLSearchParams({
  prompt: d.prompt,
  ratio: d.aspect_ratio,
  quality: d.quality,
});
if (d.model_name) params.set('model', d.model_name);
if (d.scene_name) params.set('scene', d.scene_name);
if (d.model_image_url) params.set('modelImage', d.model_image_url);
if (d.scene_image_url) params.set('sceneImage', d.scene_image_url);
params.set('fromDiscover', '1');
navigate(`/app/freestyle?${params.toString()}`);
```

### 2. `src/components/app/DiscoverDetailModal.tsx` — Also pass model/scene for freestyle presets

In the CTA click handler (line 220-223), when it's a preset without `workflow_slug`, also pass model/scene URL params instead of delegating to `onUseItem`:

```ts
onClose();
const params = new URLSearchParams();
if (item.data.prompt) params.set('prompt', item.data.prompt);
if (item.data.aspect_ratio) params.set('ratio', item.data.aspect_ratio);
if (item.data.model_name) params.set('model', item.data.model_name);
if (item.data.scene_name) params.set('scene', item.data.scene_name);
if (item.data.model_image_url) params.set('modelImage', item.data.model_image_url);
if (item.data.scene_image_url) params.set('sceneImage', item.data.scene_image_url);
params.set('fromDiscover', '1');
navigate(`/app/freestyle?${params.toString()}`);
```

### 3. `src/pages/Freestyle.tsx` — Read model/scene params + show recreate banner

**Pre-fill model from URL**: Read `model` param, match against available models (mockModels + custom), set `selectedModel`.

**Pre-fill scene from URL**: Already partially handled — extend to also match by name (not just poseId).

**Add "Recreating look from Discover" banner**: Same style as Generate.tsx — an Alert with Sparkles icon, model/scene Badge chips with thumbnails, a dismiss X button, and a hint line: "Add your product to recreate this look".

```tsx
{recreateSource && (
  <Alert className="border-primary/20 bg-primary/5">
    <AlertDescription>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span className="text-muted-foreground">Recreating look from Discover</span>
          {recreateSource.modelName && (
            <Badge variant="secondary" className="text-xs gap-1.5 pl-1 pr-2">
              {recreateSource.modelImageUrl && <img ... />}
              {recreateSource.modelName}
            </Badge>
          )}
          {recreateSource.sceneName && (
            <Badge variant="secondary" className="text-xs gap-1.5 pl-1 pr-2">
              {recreateSource.sceneImageUrl && <img ... />}
              {recreateSource.sceneName}
            </Badge>
          )}
        </div>
        <button onClick={() => setRecreateSource(null)}>
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground/70 mt-1.5">
        Add your product to generate this type of result
      </p>
    </AlertDescription>
  </Alert>
)}
```

### 4. `src/components/app/PublicDiscoverDetailModal.tsx` — Mirror changes

Same CTA update: pass model/scene params to freestyle URL for non-workflow presets.

## Files

| File | Change |
|------|--------|
| `src/pages/Discover.tsx` | Pass model/scene/image params for freestyle recreate |
| `src/components/app/DiscoverDetailModal.tsx` | Route freestyle presets with full params |
| `src/components/app/PublicDiscoverDetailModal.tsx` | Mirror freestyle routing |
| `src/pages/Freestyle.tsx` | Read model/scene params, add recreate banner with product hint |

