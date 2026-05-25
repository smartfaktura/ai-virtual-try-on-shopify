## Goal
Ensure every brand scene saved by users automatically has the "use preview as generation reference" flag enabled, so re-generating from the saved scene reproduces the exact same look.

## Changes

1. **`supabase/functions/save-brand-scene/index.ts`**
   - Add `use_scene_reference: true` to the insert payload for `product_image_scenes`.
   - Applies to both the prompt-only wizard flow and the reference-image flow.

2. **Backfill existing brand scenes** (via insert tool)
   - `UPDATE product_image_scenes SET use_scene_reference = true WHERE is_brand_scene = true AND preview_image_url IS NOT NULL;`

## Out of scope
- No schema changes (column already exists).
- No RLS changes.
- No UI changes — admin form already exposes the toggle.
- Admin (non-brand) scenes untouched.