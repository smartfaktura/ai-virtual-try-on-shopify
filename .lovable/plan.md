

# Fix Generation Loading UX + Error Handling

## Problems Found

### 1. "0 of 1 product" stuck state
In `ProductImages.tsx` line 326, `setJobMap(newJobMap)` is called only AFTER all enqueue calls complete. But Step 5 renders immediately (line 203: `setStep(5)`) with `totalJobs={jobMap.size}` which is still 0. So the user sees "Processing 0 images across 1 product" and "0/0 completed 0%" during the entire enqueue phase (which can take several seconds for multi-scene batches).

### 2. No generation timeout / error recovery
The polling loop (lines 332-386) has no timeout. If jobs get permanently stuck in `processing` or `queued` status, the spinner runs forever with no way out.

### 3. No branded experience during generation
The generating screen is a plain spinner — no VOVV.AI team personality.

## Plan

### File 1: `src/pages/ProductImages.tsx`

**A. Fix the "0 jobs" problem** — track expected job count separately from jobMap:
- Add `const [expectedJobCount, setExpectedJobCount] = useState(0)` 
- Before starting enqueue loop, compute expected count: `selectedProducts.length * selectedScenes.length * imgCount` and call `setExpectedJobCount()`
- Pass `expectedJobCount` instead of `jobMap.size` as `totalJobs` to Step 5
- Update `jobMap` progressively during the enqueue loop (after each successful enqueue) so the UI shows "Queuing X of Y..." phase

**B. Add enqueue phase tracking** — pass an `enqueuingCount` to Step 5:
- Add `const [enqueuedCount, setEnqueuedCount] = useState(0)`
- Increment after each successful enqueue inside the loop
- Pass to Step 5 as `enqueuedJobs`

**C. Add generation timeout** — in `startPolling`, track elapsed time:
- After 5 minutes of polling with no progress, show a "taking longer than expected" message
- After 10 minutes total, auto-transition to results with whatever completed, show error toast for stuck jobs
- Add a "Cancel & View Results" button to Step 5

**D. Track failed jobs** — currently polling counts `completed` OR `failed` as `done`, but doesn't pass failure info to Step 5:
- Track `completedJobIds` and `failedJobIds` Sets during polling
- Pass them to Step 5

### File 2: `src/components/app/product-images/ProductImagesStep5Generating.tsx`

Complete rewrite of the generating screen:

**A. Multi-phase display:**
- Phase 1 "Queuing": While `enqueuedJobs < totalJobs` — show "Setting up your scenes..." with branded avatar messages
- Phase 2 "Generating": Once all queued — show progress bar with per-product breakdown
- Phase 3 "Almost done": When > 80% complete — show "Finishing touches..." message

**B. Branded avatar messages** — rotating VOVV.AI team messages during generation:
- Import `TEAM_MEMBERS` from teamData and `getOptimizedUrl` from imageOptimization
- Show a sequence of messages with team member avatars:
  - Sophia: "Setting up your scene lighting..."
  - Kenji: "Composing the perfect angle..."
  - Luna: "Adding final touches..."
- Cycle through messages every 6 seconds using `useEffect` + `useState`

**C. Error recovery UI:**
- If `failedJobs > 0` after completion, show count of failed images
- Add "Cancel & View Results" button visible after 60 seconds
- Add "Taking longer than expected" warning after 3 minutes

**D. Fix the counter display:**
- During queuing phase: "Queuing scene 3 of 8..."
- During generation: "2 of 8 images completed"
- Show per-product rows (already partially implemented but not wired)

### Files to Update

| File | Change |
|------|--------|
| `src/pages/ProductImages.tsx` | Add `expectedJobCount`, `enqueuedCount`, `failedJobIds`, `completedJobIds` state; update enqueue loop to set counts progressively; add polling timeout; pass new props to Step 5 |
| `src/components/app/product-images/ProductImagesStep5Generating.tsx` | Multi-phase UI with branded avatars, error recovery button, timeout warning, fix counter display |

