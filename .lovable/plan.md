

# Creative Drop Try-On Generation: Silent Failure

## Root Cause

The creative drop job has been stuck in `processing` for 5+ minutes because `generate-tryon` receives the payload but it's **missing required fields**, causing a 400 response that nobody reads (fire-and-forget dispatch). No logs appear because the function returns before reaching any `console.log` statement.

**Two missing data structures in `trigger-creative-drop`:**

### 1. Missing `pose` object (CRITICAL — causes instant 400)
`generate-tryon` checks `if (!body.product || !body.model || !body.pose)` at line 565 and returns 400. The creative drop payload has no `pose` field at all. The wizard saves `pose_ids` (e.g., `["custom-1200035f-..."]`) in `scene_config`, but `trigger-creative-drop` never resolves these IDs into pose objects.

### 2. Incomplete `model` object (causes bad prompts)
`generate-tryon` expects `model: { name, gender, ethnicity, bodyType, ageRange, imageUrl }`. The creative drop only sends `{ name, imageUrl }` — missing 4 fields. The wizard saves models as `{ id, name, image_url }` without demographic data.

## Fix

### File 1: `supabase/functions/trigger-creative-drop/index.ts`

**A. Resolve pose data for try-on workflows (~25 lines)**

After reading `sceneConfig`, for try-on workflows:
1. Read `pose_ids` from `wfSceneConfig`
2. For IDs starting with `custom-`, query `custom_scenes` table (strip prefix)
3. For standard IDs (e.g., `pose_001`), use a hardcoded lookup of the mock poses (same data as `mockTryOnPoses` — name, description, category)
4. Build a `pose` object: `{ name, description, category, imageUrl? }` for each pose
5. If multiple poses, loop per-pose (each generates separately). If none, use a default studio pose.

**B. Resolve full model demographics (~15 lines)**

For try-on workflows, enrich the `model` object with `gender`, `ethnicity`, `bodyType`, `ageRange`:
1. For standard model IDs (e.g., `model_035`), use a hardcoded lookup matching `mockModels` data
2. For custom models (from DB), query `custom_models` table for metadata — or fall back to reasonable defaults (`gender: 'female'`, `bodyType: 'slim'`, etc.)

**C. Restructure job loop for try-on (~10 lines)**

Currently iterates `products × models`. For try-on, must iterate `products × models × poses`, creating one job per combination. Each job gets a fully resolved `pose` and `model` object.

### File 2: `supabase/functions/trigger-creative-drop/index.ts` (add logging)

Add a `console.warn` when a try-on job is built without pose data as a safety net.

### File 3: `src/components/app/CreativeDropWizard.tsx`

Save full model demographics alongside the basic model data in `scene_config.models`:
```ts
return m ? { 
  id: m.id, name: m.name, image_url: m.image_url,
  gender: mockModel?.gender, ethnicity: mockModel?.ethnicity,
  bodyType: mockModel?.bodyType, ageRange: mockModel?.ageRange
} : null;
```

Save full pose objects alongside `pose_ids` in `scene_config.poses`:
```ts
poses: poseSelections.map(pid => {
  const p = allScenePoses.find(sp => sp.poseId === pid);
  return p ? { poseId: p.poseId, name: p.name, description: p.description, category: p.category, imageUrl: p.previewUrl } : null;
}).filter(Boolean),
```

This way `trigger-creative-drop` has all the data it needs without hardcoding mock data on the backend.

## Also Fix: Stuck Job Cleanup

The current stuck job (`0a644a6f`) should be cleaned up by `cleanup_stale_jobs` (runs at the start of every `process-queue` call, cleans jobs processing > 5 min). But we should also add a `console.log` before the 400 return in `generate-tryon` so future issues are visible in logs.

### File 4: `supabase/functions/generate-tryon/index.ts`
Add `console.error("[generate-tryon] Missing required fields", { hasProduct: !!body.product, hasModel: !!body.model, hasPose: !!body.pose })` before the 400 return on line 565.

## Summary
- **Root cause**: `trigger-creative-drop` doesn't build `pose` objects for try-on jobs — `generate-tryon` immediately rejects with 400 (silently)
- **Fix approach**: Store full pose & model data from the wizard, forward it in `trigger-creative-drop`
- 3 files changed, ~60 lines added
- Fixes both the missing pose (crash) and missing model demographics (bad prompts)

