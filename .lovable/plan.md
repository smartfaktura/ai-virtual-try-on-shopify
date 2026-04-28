## Problem

On `/discover/<slug>`, clicking the X to close the detail modal sometimes does nothing — the modal disappears for a frame and immediately reopens. This happens specifically when the modal was opened via a deep link (direct URL or shared link).

## Root Cause

`PublicDiscover.tsx` has **two auto-open effects** that watch `urlItemId` and reopen the modal whenever `selectedItem` is null:

1. **Fast-path effect** (lines 121–139): fires when `deepLinkedItem` resolves and `selectedItem` is null.
2. **Fallback effect** (lines 219–231): fires when `urlItemId` is set, `allItems` is loaded, and `selectedItem` is null.

`handleClose` does:
```ts
setSelectedItem(null);
window.history.replaceState(null, '', '/discover');
```

`window.history.replaceState` updates the URL bar but **does not notify React Router**, so `useParams()` still returns the old `urlItemId`. On the next render:
- `selectedItem` is now null
- `urlItemId` is still `'scene-rec-volcanic-sunset-7'`
- `deepLinkedItem` is still cached by React Query

→ Both effects re-trigger and call `setSelectedItem(deepLinkedItem)` → modal pops back open.

## Fix

Two coordinated changes in `src/pages/PublicDiscover.tsx`:

1. **Track explicit dismissal with a ref.**
   Add `dismissedItemIdRef = useRef<string | null>(null)`.
   In `handleClose`, set `dismissedItemIdRef.current = urlItemId` before clearing state.
   Both auto-open effects guard with `if (dismissedItemIdRef.current === urlItemId) return;`.

2. **Use React Router `navigate` for the URL change.**
   Replace `window.history.replaceState(null, '', '/discover')` with `navigate('/discover', { replace: true })` so `useParams` actually clears `urlItemId`. This also resets the dismissal ref naturally on the next deep-link visit.

After the fix:
- Click X → `selectedItem` cleared, URL updated through React Router, `urlItemId` becomes undefined, `deepLinkedItem` query disables itself, neither effect fires → modal stays closed.
- Belt-and-suspenders: even if `urlItemId` lingered briefly, the dismissal ref blocks re-open for that exact id.
- Opening a different item still works because the ref only matches the previously dismissed slug.

## Out of scope

- Modal animation timing
- The 3-source feed loading skeleton (already fixed)
- Any other Discover behavior
