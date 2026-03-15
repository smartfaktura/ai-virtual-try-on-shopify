

## Bugs Found in Picture Perspectives

### 1. Console Error: "Function components cannot be given refs"
**File**: `WorkflowAnimatedThumbnail.tsx`, line 226
React warns because `FloatingEl` is a plain function component. While no explicit ref is passed, React's reconciliation can attempt to attach refs internally. This is a dev-mode warning but indicates a code smell.
**Fix**: Wrap `FloatingEl` with `React.forwardRef` (or `React.memo` which also resolves this in some React versions), or simply ensure no ref forwarding is attempted.

### 2. Carousel Interval Resets Every Slide (Stale Closure)
**File**: `WorkflowAnimatedThumbnail.tsx`, lines 169-185
The `useEffect` that creates the carousel interval has `current` in its dependency array. Every time the slide changes, React tears down and recreates the interval — resetting the 5-second timer. This causes unpredictable timing.
**Fix**: Remove `current` from deps. Use a ref to track the current index, or use functional updaters: `setPrev(() => currentRef.current)` with a `useRef` for `current`.

### 3. No Functional Issues Found on the Perspectives Page
The `/app/perspectives` page, `useGeneratePerspectives` hook, and edge functions all look correct. No data-flow or logic bugs detected.

---

### Changes

| File | Change |
|------|--------|
| `WorkflowAnimatedThumbnail.tsx` | Fix carousel interval: use a `useRef` for `current` index to avoid stale closures and interval resets. Remove `current` from `useEffect` deps. |
| `WorkflowAnimatedThumbnail.tsx` | Fix ref warning: convert `FloatingEl` to use `React.memo` wrapper |

