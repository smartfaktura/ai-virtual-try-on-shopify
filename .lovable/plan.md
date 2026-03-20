

# Creative Drops: Final Debug Audit

## Bugs Found

### Bug 1 (CRITICAL — Runtime Crash): `run-scheduled-drops` double variable declaration

`supabase/functions/run-scheduled-drops/index.ts` declares `const serviceRoleKey` twice: line 16 and line 30. This causes a Deno runtime error — the scheduled cron job will always fail silently.

**Fix**: Remove the duplicate declaration on line 30. `serviceRoleKey` from line 16 is already in scope.

### Bug 2 (Major — Broken UI): Image metadata stores IDs instead of names

`complete-creative-drop` stores images as `{ url, workflow_id, product_id }` (UUIDs). But the frontend `DropImage` type expects `{ url, workflow_name, product_title }` (human-readable strings). Result: when a "ready" drop has images populated, the detail modal can't group by workflow or show product titles — all metadata appears blank.

The fallback query in `DropDetailModal` (which resolves names from `generation_jobs`) only runs when `drop.images` is empty. Once `complete-creative-drop` populates `drop.images`, the fallback is skipped and no names are available.

**Fix**: Update `complete-creative-drop` to resolve workflow names and product titles before storing:
1. Collect unique `workflow_id`s and `product_id`s from completed jobs
2. Batch-query `workflows` and `user_products` tables for names
3. Store images as `{ url, workflow_name, product_title }` matching the frontend type

### Bug 3 (Low — Cosmetic): Drop card "generating" status shows `0 of 0 images`

When `total_images` is 0 (set at creation before jobs complete), the generating text shows "0 of 0 images". The `total_images` in the `creative_drops` insert is calculated from `jobPayloads.reduce(...)` which uses `payload.imageCount`. This should be correct. However, if `getVariationCount` returns 0 for some workflows, `total_images` could be 0.

**Fix**: In `DropCard.tsx`, when `total_images === 0` during generating, show job count instead: `"Processing ${drop.generation_job_ids.length} jobs"`.

## Changes

### File 1: `supabase/functions/run-scheduled-drops/index.ts`
- Remove line 30 (`const serviceRoleKey = ...`) — it's a duplicate of line 16

### File 2: `supabase/functions/complete-creative-drop/index.ts`
- After collecting completed jobs, batch-query `workflows` table for names and `user_products` table for titles
- Store images as `{ url, workflow_name, product_title }` instead of `{ url, workflow_id, product_id }`
- ~15 lines added

### File 3: `src/components/app/DropCard.tsx`
- Line 313: When `generating` and `targetImages === 0`, show job count fallback text

## Summary
- 1 runtime crash fix (cron will actually work now)
- 1 metadata resolution fix (drop detail modal shows names correctly)
- 1 cosmetic fix
- 3 files, ~20 lines changed

