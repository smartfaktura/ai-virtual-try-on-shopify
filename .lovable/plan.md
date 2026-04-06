

# Fix: Stuck generation loses all results

## Problem
When generation gets stuck at 19/20, the user has no way to see the 19 completed images. If they refresh the page, ALL progress is lost because state lives only in React `useState`. The "Skip waiting" button exists but only appears after 60 seconds. There is no auto-finish for near-complete batches, and no session recovery.

## Plan

### 1. Near-complete auto-finish (ProductImages.tsx, polling logic)
Inside the `poll` function, after checking done count (line 519), add a near-complete check:
- If elapsed > 90 seconds AND done >= 90% of jobs, auto-finish with available results
- Show toast: "1 image still processing — showing 19 completed results"
- This prevents the stuck-at-19/20 scenario entirely

### 2. Session persistence via sessionStorage (ProductImages.tsx)
**Save on entering Step 5:**
- Store `{ jobIds: [...], jobMapEntries: [...[key, value]], startTime, expectedJobCount }` to `sessionStorage` key `pi_generation_session`

**Restore on component mount:**
- Check sessionStorage for active session
- If found and step is 1 (default): restore step to 5, rebuild jobMap, resume polling
- User sees progress screen again instead of being dumped to Step 1

**Clear on Step 6 or reset:**
- Remove sessionStorage entry when results display or user starts over

### 3. Earlier and smarter "Skip" button (ProductImagesStep5Generating.tsx)
- Show after **30 seconds** (down from 60s) when >50% jobs are done
- Change to `default` variant (more visible) when 90%+ jobs complete
- Label changes to "View 19 completed results" showing actual count

## Files

| File | Changes |
|---|---|
| `src/pages/ProductImages.tsx` | Near-complete auto-finish in poll loop, sessionStorage save/restore/clear, resume polling on mount |
| `src/components/app/product-images/ProductImagesStep5Generating.tsx` | Earlier skip button (30s), prominent styling at 90%+, dynamic label with completed count |

