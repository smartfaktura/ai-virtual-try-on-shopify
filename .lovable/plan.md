

## Fix: Preserve Scroll Position When Closing Discover Modal

**Problem**: Closing the detail modal navigates from `/discover/:itemId` → `/discover`, which triggers `ScrollToTop` and jumps to the top of the page.

**Fix**: Instead of using `navigate()` on modal close, use `window.history.replaceState()` to update the URL without triggering a React Router navigation — so `ScrollToTop` never fires.

| File | Change |
|------|--------|
| `src/pages/PublicDiscover.tsx` | In `handleClose`, replace `navigate('/discover', { replace: true })` with `window.history.replaceState(null, '', '/discover')` |
| `src/pages/Discover.tsx` | Same change in the close handler |

