

## Fix: Freestyle Prompt Bar Not Fixed on Mobile

### Root Cause

The prompt bar and gradient use `fixed` positioning (lines 474, 477 in `Freestyle.tsx`). On iOS Safari, `fixed` positioning breaks inside scrollable containers — the bar scrolls with content instead of staying pinned.

### Solution

Change `fixed` to `absolute` on both the gradient and prompt bar divs. This works because:
- The parent container (line 428) already has `position: relative`, `height: 100dvh`, and `overflow-hidden`
- The gallery scrolls inside a child div (`overflow-y-auto`)
- `absolute` bottom-0 within the parent container achieves the same pinned effect without iOS bugs

### Changes

**File:** `src/pages/Freestyle.tsx`

| Line | Before | After |
|------|--------|-------|
| 474 | `fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t...` | `absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t...` |
| 477 | `fixed bottom-0 left-0 right-0 px-4 sm:px-6 pb-4...` | `absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4...` |

No other files need to change.

