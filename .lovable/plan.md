# Fix: StudioChat hook-order crash on /app/generate/product-images

## Cause
My last edit added a new `useEffect` (toast surface for credit / rate-limit errors) **below** the early `return null` guards in `src/components/app/StudioChat.tsx` (lines 62–77, including `/app/generate/product-images`). On that route the component returns before reaching the new hook, so React sees fewer hooks than the previous render and throws:

> Rendered fewer hooks than expected. This may be caused by an accidental early return statement.

The ErrorBoundary then replaces the whole page with "Something went wrong".

## Fix (one file, one change)

`src/components/app/StudioChat.tsx`

- Move the new `useEffect` that watches `messages` for credit / rate-limit toasts to sit **alongside the other `useEffect` hooks at the top of the component** (next to the scroll, focus, and `hiddenByPage` effects, before any `return null`).
- Leave everything else untouched: early-return guards, Stop button, quick-starter chips, `cancelStream`, prompt, backend — all unchanged.

## Why it's safe
- No behavior change — same effect, just moved up so it runs on every render (which is exactly what React's rules of hooks require).
- No backend, route, prompt, or DB change.
- Doesn't touch any other component or file.

## Verify
- `/app/generate/product-images` loads the Product Visuals flow normally (no error boundary)
- Chat on `/app` still shows the 3 quick-starter chips, Stop button works mid-stream, and out-of-credit / rate-limit replies still surface as a toast with a "See Plans" action
