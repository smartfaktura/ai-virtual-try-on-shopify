

## Fix workflow card thumbnails + animations (root cause: name mismatch)

### Root cause found
DB workflow names were renamed (dropped " Set" suffix): now `Virtual Try-On`, `Selfie / UGC`, `Flat Lay`, `Mirror Selfie`. But `workflowScenes` in `workflowAnimationData.tsx` is keyed by the OLD names: `Virtual Try-On Set`, `Selfie / UGC Set`, `Flat Lay Set`, `Mirror Selfie Set`.

`WorkflowCardCompact` looks up `workflowScenes[workflow.name]` → `undefined` for these 4 cards → falls through to the static `<img>` fallback. That's why:
- Wrong/old images appear (the DB `preview_image_url`, not the curated scene background).
- No animations (animated component never mounts).

Other cards still work because their names already match (`Product Visuals`, `Picture Perspectives`, `Catalog Studio`, `Interior / Exterior Staging`, `Image Upscaling`).

### Fix

**File: `src/components/app/workflowAnimationData.tsx`** — add aliases for the renamed workflows so lookup works for both old and new names:

```ts
// After workflowScenes object, add aliases for renamed DB workflows
workflowScenes['Virtual Try-On'] = workflowScenes['Virtual Try-On Set'];
workflowScenes['Selfie / UGC'] = workflowScenes['Selfie / UGC Set'];
workflowScenes['Flat Lay'] = workflowScenes['Flat Lay Set'];
workflowScenes['Mirror Selfie'] = workflowScenes['Mirror Selfie Set'];
workflowScenes['Product Listing'] = workflowScenes['Product Listing Set'];
```

This is a 5-line additive change — zero risk to other cards or scene definitions. All thumbnails and animations come back instantly.

### Acceptance
- Virtual Try-On card shows model carousel + animations.
- Selfie / UGC card shows UGC carousel + animations.
- Flat Lay + Mirror Selfie show their scene compositions.
- Product Visuals, Perspectives, Catalog Studio, Staging, Upscaling unchanged (already worked).

