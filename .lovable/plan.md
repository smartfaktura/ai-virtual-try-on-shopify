

## Consolidate the Generation Loading UI

### Problem

The loading screen shows **two separate team avatar messages** because:
1. The `QueuePositionIndicator` component has its own rotating team avatar + message (e.g., "Max is calibrating the lights...")
2. The Generate page adds a **second** static team message below it (e.g., "Sophia is crafting your product listing set...")
3. There's also a redundant time estimate below that, even though the indicator already shows one

This creates a cluttered, repetitive experience.

### Solution

Remove the duplicate static team message and time estimate from `Generate.tsx`, keeping only the `QueuePositionIndicator` which already handles everything elegantly (rotating avatars, time estimates, progress bar, overtime messages).

### Changes

**File: `src/pages/Generate.tsx` (lines 1827-1847)**

Remove the static team avatar message block and the static time estimate text, keeping only the `QueuePositionIndicator` and the Cancel button. The result will be a cleaner loading state:

- Workflow title + product name (already there)
- Batch progress (if multi-batch, already there)
- `QueuePositionIndicator` with rotating team messages, time estimate, and progress bar
- Cancel button

The 6 lines showing the static Sophia/Zara avatar and the static time estimate will be deleted entirely.

