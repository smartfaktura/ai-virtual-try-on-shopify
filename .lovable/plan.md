

## Regenerate All 24 Mirror Selfie Scene Previews

### Problem
The edge function tries to generate all 24 scene previews in a single call, but times out after ~3 images (each takes ~20s, edge function limit is ~60s). Currently 8/24 scenes have previews, 16 are missing.

### Solution: Add batch processing to the edge function

Modify `generate-scene-previews` to accept `batch_size` and `start_index` parameters, defaulting to processing 3 scenes per call. Then call it repeatedly to cover all scenes.

### Changes

#### 1. Update edge function (`supabase/functions/generate-scene-previews/index.ts`)

Add two new optional parameters:
- `batch_size` (default: 3) -- how many scenes to generate per call
- `start_index` (default: 0) -- which scene index to start from (for manual control)

The function will:
- Skip scenes that already have `preview_url` (existing behavior)
- Stop after generating `batch_size` images
- Return status indicating how many were generated and how many remain

This way each call completes within the timeout window.

#### 2. Call the function multiple times

After deploying, call the function 6 times (16 remaining scenes / 3 per batch) with `force_regenerate: true` on the first call to regenerate everything fresh, or without it to just fill in the missing 16.

Since the user wants ALL scenes regenerated, the first call will use `force_regenerate: true` which clears all preview URLs, then subsequent calls will process 3 scenes at a time until all 24 are done.

### Technical Details

**Edge function change**: Add `batch_size` parameter, add a counter that breaks the loop after N successful generations. Return `{ success: true, generated: N, remaining: M }`.

**Execution**: 8 sequential calls (24 scenes / 3 per batch), each taking ~60s. Total time: ~8 minutes. Progress is saved after each image, so any timeout is safe.
