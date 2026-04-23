

## Fix: "Recreate this" routes Freestyle presets to wrong workflow

### Root cause

In `src/pages/Discover.tsx` line 481, the routing condition is too greedy:

```ts
if (d.scene_ref && (d.workflow_slug === 'product-images' || !d.workflow_slug)) {
  navigate(`/app/generate/product-images?...`);
}
```

The preset "AURELUNE Sable Veil: Botanical Essence" was created with **Freestyle** (`workflow_slug` is null), but its scene "Botanical Oasis" also exists in the `product_image_scenes` library — so it has a `scene_ref`. The `|| !d.workflow_slug` branch then incorrectly hijacks it into the Product Visuals wizard instead of Freestyle.

This is regression-prone because many scenes live in both libraries now.

### Fix

In `src/pages/Discover.tsx` `handleUseItem` (lines 478–509):

1. **Remove the `|| !d.workflow_slug` clause.** Only route to `/app/generate/product-images` when `d.workflow_slug === 'product-images'` explicitly.
2. Freestyle presets (`workflow_slug` null/empty) fall through to the existing freestyle branch at line 496, which already handles `scene_name`, `scene_image_url`, prompt, and ratio correctly — preserving the original Freestyle creation context.
3. If a `product-images` preset has a `scene_ref`, keep passing it (as today) so the wizard pre-selects the scene.

```ts
// Before
if (d.scene_ref && (d.workflow_slug === 'product-images' || !d.workflow_slug)) { ... }

// After
if (d.workflow_slug === 'product-images') {
  const params = new URLSearchParams();
  if (d.scene_ref) params.set('sceneRef', d.scene_ref);
  params.set('fromDiscover', '1');
  navigate(`/app/generate/product-images?${params.toString()}`);
  return;
}
```

### Verify identical bug in `PublicDiscoverDetailModal`

The public modal (lines 165–195) routes Freestyle presets to `/auth?redirect=/app/freestyle?...` correctly already (no `scene_ref` shortcut), so no change needed there.

### Out of scope
- No styling, layout, or memory changes.
- Scene-type Discover items still route to product-images (correct — they have no other origin workflow).

