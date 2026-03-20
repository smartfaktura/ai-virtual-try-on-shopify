

# Fix: Creative Drops — Real-Time Updates & Better Preview Modal

## Problems

1. **No real-time updates**: After generation completes, the Drops tab stays stale. The polling (`refetchInterval: 10_000`) only runs when a drop has `status: 'generating'` — but when the drop transitions to `ready`, the page has already stopped polling by the next cycle, so the UI doesn't update. Only a hard refresh shows the result.

2. **Bad preview modal**: `DropDetailModal` uses a basic `Dialog` with a grid of checkboxes — completely different from the polished split-panel `WorkflowPreviewModal` used everywhere else. No signed URLs, no shimmer loading, no upscale/perspectives actions.

## Changes

### File 1: `src/pages/CreativeDrops.tsx` — Fix polling & auto-refresh

**Problem**: `refetchInterval` checks current data for `generating` status. Once the drop transitions to `ready` on the server, the client still has old data showing `generating`, so it polls once more — but by that time the data is already `ready` and polling stops. The issue is the query also needs a short continued poll after all drops become non-generating (to catch the final transition).

**Fix**: Keep polling for 30 seconds after the last generating drop disappears. Add a `useRef` tracking `lastGeneratingTime` and extend the `refetchInterval` logic:
```ts
refetchInterval: () => {
  const hasGenerating = data?.some(d => d.status === 'generating');
  if (hasGenerating) { lastGeneratingRef.current = Date.now(); return 5_000; }
  // Keep polling briefly after generation finishes to catch completion
  if (Date.now() - lastGeneratingRef.current < 30_000) return 5_000;
  return false;
}
```

Also reduce polling interval from 10s to 5s for snappier updates.

### File 2: `src/components/app/DropDetailModal.tsx` — Replace with WorkflowPreviewModal pattern

**Replace the entire modal** with a split-panel fullscreen overlay matching `WorkflowPreviewModal`:
- Left panel: large image with arrow navigation
- Right panel: title, thumbnail grid, download current, download all, upscale & perspectives buttons
- Use `toSignedUrls` for proper signed URL resolution
- Use `ShimmerImage` for loading states
- Fetch images from `generation_jobs` when `drop.images` is empty (keep existing logic)
- Include the schedule name as the title
- Keep keyboard navigation (Escape, arrows)

This reuses the exact same visual pattern as `WorkflowPreviewModal` but adapted for creative drop data (multiple images from jobs, schedule name as title).

### File 3: `src/components/app/DropCard.tsx` — Make generating cards clickable

Currently generating cards aren't clickable (`onClick={drop.status === 'ready' ? onViewDrop : undefined}`). Allow clicking generating cards too — the modal will show a "Generating..." state with the spinner.

## Summary
- 3 files changed
- Fixes: real-time status updates without hard refresh, polished split-panel preview modal matching workflow UX, generating cards become interactive
- Polling extended briefly after completion to catch the `generating→ready` transition

