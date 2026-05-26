## Two small fixes to `src/pages/ProductSwap.tsx`

### 1. Search input edges get clipped when focused
The page root uses `overflow-x-clip` (line 555). The Step 2 sticky search bar sits flush against that edge, so the 2px focus ring on `<Input>` is clipped on the left/right.

**Fix:** Give the sticky container a tiny horizontal breathing room so the focus ring renders fully.
- Line 706: change `className="sticky top-0 z-10 pt-2 pb-3 space-y-2 bg-background"` to add `-mx-1 px-1` (sticky container expands by 4px on each side, content unchanged).

This matches behavior of the Step 1 library search (which is not sticky and not at the page edge).

### 2. Products step should load 10 at a time (match scene pattern)
Current: initial 24, "Load more" adds 24.
Target: initial 10, "Load more" adds 10 — same as `libraryVisibleCount` for scenes.

**Fix:**
- Line 72: `useState(24)` → `useState(10)`
- Line 711: `setProductVisibleCount(24)` → `setProductVisibleCount(10)`
- Line 779: `c => c + 24` → `c => c + 10`

No other behavior, business logic, or backend changes.
