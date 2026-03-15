

## Add Generating Progress Screen to Product Perspectives

### Problem
After clicking "Generate", the Perspectives page immediately navigates to `/app/library` once jobs are enqueued. There is no loading/progress screen showing elapsed time, team avatars, per-variation status chips, or batch progress — unlike the main Generate page which has all of this.

### Solution
Integrate `useGenerationBatch` into the Perspectives page and add a `'generating'` view state that mirrors what Generate.tsx does: a full-screen progress card with per-variation chips, batch progress bar, team avatars, elapsed time, and queue position indicator.

### Changes

#### 1. `src/hooks/useGeneratePerspectives.ts` — Return job IDs instead of fire-and-forget

Currently the hook enqueues jobs and calls `onComplete` immediately after enqueuing. Change it to:
- Collect and return all enqueued job IDs from the responses
- Remove the immediate `onComplete` call and navigation
- Let the page control when to show results (after polling confirms completion)

#### 2. `src/pages/Perspectives.tsx` — Add generating state with batch tracking

- Import `useGenerationBatch` hook
- Add a `generatingView` boolean state that switches the page to show a progress card instead of the configuration UI
- After `generate()` returns job IDs, pass them to `useGenerationBatch` for polling
- Show the generating progress card with:
  - Product thumbnail (source image)
  - Title: "Creating Product Perspectives..."
  - Subtitle: "Generating X angles of [product title]"
  - Per-variation status chips (Close-up, Back Angle, etc.) with queued/processing/completed/failed icons
  - Batch progress bar (X of Y done)
  - `QueuePositionIndicator` for the active job
  - Team avatar rotation (from TEAM_MEMBERS)
  - Elapsed time counter
  - Est. time range (pro model: ~60-120s per image)
  - Cancel button
- When batch completes → navigate to `/app/library` with success toast
- When all fail → show error state with retry button

The generating view replaces the entire config UI (similar to how Generate.tsx hides config during `currentStep === 'generating'`).

#### 3. `useGenerationBatch` — No changes needed
The existing hook already supports polling multiple job IDs and tracking per-job status. The Perspectives page will call `startBatch` or directly use the polling mechanism.

Actually, `useGenerationBatch` expects to enqueue jobs itself via `startBatch`. Since Perspectives uses its own enqueue logic (via `useGeneratePerspectives`), I'll need to either:
- **Option A**: Refactor `useGeneratePerspectives` to return job IDs, then manually set them into a polling-only mechanism
- **Option B**: Add a `trackJobs(jobIds)` method to `useGenerationBatch` that starts polling without enqueuing

I'll go with Option A: modify `useGeneratePerspectives` to return job IDs, then create a lightweight polling loop directly in the Perspectives page (reusing the same pattern from `useGenerationBatch`).

### Files changed
| File | Change |
|------|--------|
| `src/hooks/useGeneratePerspectives.ts` | Return `{ jobIds, batchId }` from `generate()` instead of calling `onComplete` immediately |
| `src/pages/Perspectives.tsx` | Add generating progress view with batch polling, per-variation chips, team avatars, elapsed timer, cancel support |

