

# Fix Catalog Session Recovery — Persist All Jobs from Start

## Root Cause

`persistBatch(markedAnchors)` at line 565 only saves anchor jobs to `sessionStorage`. Placeholders (representing future derivatives) are not persisted. If the browser refreshes during phase 1, recovery loads only anchors → poll marks them complete → `allDone = true` with 0 visible images → "No Images Generated" error screen, even though the backend completed everything.

## Fix (single file: `src/hooks/useCatalogGenerate.ts`)

### Change 1: Persist anchors AND placeholders from the start (line 565)

Replace:
```typescript
persistBatch(markedAnchors);
```
With:
```typescript
persistBatch(initialJobs);
```

This ensures `sessionStorage` contains both anchor jobs and placeholder derivatives, so recovery knows the full scope.

### Change 2: Persist `isUserVisible` and `isPlaceholder` fields (lines 46-54)

Update `persistBatch` to include `isUserVisible` and `isPlaceholder` in the serialized metadata, so recovery can correctly filter visible vs. hidden jobs.

### Change 3: Restore `isUserVisible` and `isPlaceholder` on load (lines 72-76)

Update `loadPersistedBatch` to read and restore these fields from the persisted data.

### Change 4: Handle placeholder-only recovery (lines 146-164)

When recovery detects placeholder jobs exist (derivatives not yet enqueued), set `phase` to `'anchors'` (not `'derivatives'`) so the phase-aware `allDone` guard on line 282 prevents premature completion. The poll will wait for real derivatives to appear.

Additionally: if ALL recovered jobs are anchors (no derivatives at all), and they're all terminal, show a graceful "Session expired — check your Library" message instead of "No Images Generated".

### Change 5: Fallback UI in CatalogGenerate.tsx (line 369-377)

When `allDone && visibleCompleted === 0 && visibleFailed === 0` (no visible jobs at all — likely a recovery edge case), show a softer message: "Session Interrupted — Your images may still be in your Library" with a direct link, instead of the harsh "No Images Generated / Something went wrong."

## Summary

| Change | File | Why |
|--------|------|-----|
| Persist all initial jobs | `useCatalogGenerate.ts` line 565 | Placeholders survive refresh |
| Include visibility fields in persist/load | `useCatalogGenerate.ts` lines 46-76 | Correct filtering after recovery |
| Phase-aware recovery | `useCatalogGenerate.ts` lines 146-164 | Prevent premature allDone |
| Graceful fallback UI | `CatalogGenerate.tsx` lines 369-377 | Better UX for edge cases |

