

# Fix Catalog Studio: "0 of 1" UX Bug + Face Quality via Face-First Anchor

## Problems Identified

1. **"0 of 1 images" then jumping to 19**: During Phase 1, `batchState.jobs` only contains anchor jobs (1 job). The per-product progress card counts from `batchState.jobs`, so it shows "0/1". After Phase 2 completes, derivatives are added and it jumps to "0/19". The header `totalJobs` is correct but the per-product breakdown is misleading.

2. **Bad face quality**: The anchor shot (`front_model`) is a full-body shot. Seedream receives the model identity image + product image as two separate references. For full-body shots, the face is small in the output, so Seedream doesn't lock onto facial details well. The result: blurry/merged faces. Close-ups work better because the face is dominant.

3. **Two-phase polling conflict**: `pollJobs()` is called on line 627 (immediate UI feedback) AND again inside the async IIFE on line 618 (after derivatives enqueue). Both call `stopPolling()` + `setInterval`, which can cause race conditions.

## Solution

### 1. Face-First Anchor Strategy
Instead of using `front_model` (full body) as the anchor, generate a **waist-up portrait** as an invisible "identity anchor" first. This shot has a large, dominant face that Seedream can lock onto accurately. Then use that result as the consistency reference for ALL other shots including the full-body `front_model`.

- Add a new internal-only shot `identity_anchor` to the engine — a tight waist-up portrait focused on face + outfit. This shot is NOT shown in the shot picker; it's automatically prepended as the first job.
- The anchor prompt will heavily emphasize face detail and outfit accuracy.
- All user-selected shots (including `front_model`) become derivatives that receive the identity anchor result as `anchor_image_url`.

### 2. Fix "0 of 1" UX
- During Phase 1, set `totalJobs` to the full expected count (already done) but also add placeholder derivative jobs to `batchState.jobs` with status `'waiting'` so the per-product progress cards show the correct total from the start.

### 3. Fix polling race condition
- Remove the `pollJobs()` call on line 627. Only start polling inside the async IIFE — first for anchor status feedback, then for all jobs after derivatives are enqueued.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/catalogEngine.ts` | Add `identity_anchor` shot definition (internal, waist-up face-priority portrait). Update `getAnchorShotId` to always return `identity_anchor` for on-model categories. |
| `src/hooks/useCatalogGenerate.ts` | (a) ALL user-selected shots become derivatives — the auto-generated identity anchor is the only Phase 1 job. (b) Add placeholder derivative jobs to `batchState.jobs` during Phase 1 so product cards show full counts. (c) Remove duplicate `pollJobs()` call on line 627. (d) Start a lightweight anchor-only poll inside the async IIFE for UI feedback during Phase 1. |
| `src/pages/CatalogGenerate.tsx` | Filter out `identity_anchor` jobs from the results gallery (user shouldn't see the intermediate portrait). Add a `'waiting'` status styling for placeholder jobs in the per-product progress cards. |
| `supabase/functions/generate-catalog/index.ts` | No changes needed — it already handles `anchor_image_url` and reference ordering correctly. |

## How It Works After the Fix

```text
Phase 1: Generate 1 identity anchor (waist-up portrait, face-dominant)
         → Seedream nails the face because it's large in frame
         → UI shows "0 of 19 images" with correct per-product totals

Phase 2: All user-selected shots enqueued as derivatives
         → Each receives identity anchor URL as anchor_image_url
         → Seedream uses the clean face from anchor for consistency
         → Full-body shots get accurate face because anchor locks it
```

