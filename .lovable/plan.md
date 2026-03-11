

## Fix: Loading indicator in Freestyle prompt bar

### Problem
When a generation is active, a thin 2px loading bar appears at the very top of the prompt panel (lines 195-199 of `FreestylePromptPanel.tsx`). It looks out of place — it's a raw div with `h-[2px]` that doesn't match the rounded panel design and clips awkwardly at the top edge.

### Fix
Replace the hacky top-edge loading line with a subtle `Progress` component integrated into the panel's bottom action bar area, or better yet, remove it entirely since the `QueuePositionIndicator` already shows processing state above the prompt panel. The `isLoading` state in the prompt panel is a brief local state before the queue takes over, so a small spinner on the Generate button (already implemented at line 319) is sufficient.

**Plan**: Remove the floating loading bar entirely (lines 195-199). The Generate button already shows a `Loader2` spinner when `isLoading` is true, and once the job is enqueued, the `QueuePositionIndicator` card handles progress display. The thin line is redundant and visually jarring.

### File change
**`src/components/app/freestyle/FreestylePromptPanel.tsx`** — Delete lines 195-199 (the `isLoading && ...` block with the `h-[2px]` bar).

