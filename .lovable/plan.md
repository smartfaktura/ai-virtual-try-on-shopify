

## Fix duplicate-slug collision in admin scene duplication

### Problem
When duplicating a scene to a category that already has a row with the target `scene_id` (often from earlier inactive copies not visible in the admin grid), the insert fails with `duplicate key value violates unique constraint "product_image_scenes_scene_id_key"`.

### Fix
Make `handleDuplicate` in `src/pages/AdminProductImageScenes.tsx` resilient to slug collisions by:

1. **Querying the database directly** for an exact `scene_id` match before inserting (instead of relying on the in-memory `existingIds` set, which only contains active scenes loaded by the wizard hook).
2. **Auto-incrementing the suffix** until a free slug is found: try `{base}-{categorySuffix}`, then `{base}-{categorySuffix}-2`, `-3`, … up to `-20`.
3. **Wrapping the final insert in a try/catch** that detects Postgres error code `23505` (unique violation) and retries once more with a short random suffix as a last resort.

### What changes
- File: `src/pages/AdminProductImageScenes.tsx` only
- Function: `handleDuplicate` (~lines 319–351)
- No DB migration, no schema change, no other files touched

### Validation
1. Try duplicating the same shot you got the error on → succeeds with slug `…-2` (or whatever number is free)
2. Duplicate it again → succeeds with `…-3`
3. Existing duplicate-to-empty-category flows still produce clean `…-{categorySuffix}` slugs (no unnecessary numbering)
4. Toast shows the final scene_id used so you can confirm the suffix

