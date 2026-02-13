

## Show "New images incoming" banner in Library after recent generations

### Problem
After completing a Virtual Try-On or other generation, users navigate to the Library and don't immediately see their new images (due to the 15-second polling interval). This looks like a bug.

### Solution
Add a subtle info banner at the top of the Library page that appears when a generation was recently completed. It will say something like "New images are on the way -- they'll appear here shortly" with a refresh button, and auto-dismiss after the next successful data fetch includes the new items.

### How it works
- Use the existing `useGenerationQueue` hook to detect if a job just completed (status = `completed` and `completed_at` within the last 30 seconds)
- Alternatively, use a simpler approach: store a timestamp in sessionStorage when any generation completes, and check it in the Library page
- Show a small animated banner with a Loader icon and message, plus a manual "Refresh" button that triggers an immediate refetch
- The banner disappears once the library data refreshes and includes items newer than the stored timestamp

### Technical Details

**File: `src/pages/Jobs.tsx`** (the Library page)
- Import `useGenerationQueue` and `Sparkles` icon
- After the header, add a conditional banner:
  - Check `useGenerationQueue` for a recently completed job (completed within last 30s)
  - Render a small info bar: `"Your latest images are being processed and will appear here shortly."` with a spinning loader icon and a "Refresh now" button that calls `queryClient.invalidateQueries(['library'])`
- Style it as a soft muted banner matching the existing UI aesthetic (rounded-2xl, bg-muted/30, subtle border)

**File: `src/hooks/useGenerationQueue.ts`**
- Expose `lastCompletedAt` (the `completed_at` timestamp of the most recent completed job) so the Library can check recency

### Changes summary
| File | Change |
|------|--------|
| `src/hooks/useGenerationQueue.ts` | Expose `lastCompletedAt` field from the hook return |
| `src/pages/Jobs.tsx` | Add conditional "images incoming" banner when a generation completed in the last 30 seconds |

