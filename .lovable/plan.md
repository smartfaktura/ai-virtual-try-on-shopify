

## Fix: Prevent Scroll-to-Top When Opening Discover Item Modal

**Problem**: Clicking a discover card calls `navigate(getItemUrl(item))`, which changes the pathname and triggers `ScrollToTop` to fire `window.scrollTo(0, 0)`. The close handler was already fixed, but the open action still causes the scroll jump.

**Fix**: Use `window.history.pushState` instead of `navigate()` when opening an item, same approach as the close fix. This updates the URL without triggering React Router's navigation cycle.

| File | Change |
|------|--------|
| `src/pages/PublicDiscover.tsx` | In `handleCardClick`, replace `navigate(getItemUrl(item), { replace: false })` with `window.history.pushState(null, '', getItemUrl(item))`. Remove `navigate` from the dependency array. |
| `src/pages/Discover.tsx` | Same change in `handleCardClick` — use `pushState` instead of `navigate`. |

Using `pushState` (not `replaceState`) preserves browser back-button behavior — pressing back will return the URL to `/discover`.

