## Fix `Rendered fewer hooks than expected` crash on Generate

### Root cause
`src/pages/ProductSwap.tsx` has an early `return` at line 326 when `isGeneratingView` is true, but a `useEffect` for auto-detecting scene aspect ratio sits **below** that return at line 518. Clicking Generate flips `isGeneratingView` to `true`, the component returns before reaching the effect, React sees fewer hooks than the previous render, and the error boundary swaps the page out.

Backend is fine — edge function logs show all generation jobs enqueued and dispatched successfully. This is purely a client hooks-order bug.

### Fix
Move the ratio-detection `useEffect` (lines 517-533) so it runs **before** the `if (isGeneratingView) return (...)` block at line 326. Keep its dependencies and behavior exactly the same — it only watches `sceneUrl` and calls `setDetectedRatio`, so its position has no functional impact.

That's the only change needed. No backend, RLS, or edge-function changes.

### Verification
- Reload `/app/product-swap`, complete steps 1–3, click Generate.
- Confirm the page transitions into the "Swapping Products…" view without the red error boundary.
- Confirm the console no longer logs the "Rendered fewer hooks than expected" error.
