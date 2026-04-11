

# Fix: Add `backView` Trigger to Back-View Scenes Across Categories

## Problem
The "On-Model Back" scene in the hoodies category (and likely other garment categories) does **not** include `backView` in its `trigger_blocks`. Only the fragrance "Back View" scene currently has it. This means selecting a back-view shot never prompts the user to upload their product's back reference image — even though that reference would significantly improve generation accuracy.

## Root Cause
Database records for back-view scenes are missing the `backView` trigger block:
- `on-model-back-garments-hoodies` → `[background, personDetails]` ← missing `backView`
- `back-flat-lay-garments-hoodies` → `[background]` ← missing `backView`

## Solution
Run a database migration to add `backView` to the `trigger_blocks` array for all back-view scenes across all categories that are missing it.

### Database Migration
```sql
UPDATE product_image_scenes
SET trigger_blocks = array_append(trigger_blocks, 'backView')
WHERE is_active = true
  AND (scene_id ILIKE '%back%' OR title ILIKE '%back%')
  AND NOT ('backView' = ANY(trigger_blocks));
```

This is a single migration — no code changes needed. The existing client-side logic in `ProductImagesStep3Refine.tsx` already checks for `backView` in `triggerBlocks` and shows the upload card when found.

## Verification
After the migration, selecting "On-Model Back" or "Back View Flat Lay" in hoodies (or any category) will show the back-view reference upload card in the Setup step.

