

## Fix scroll reset when navigating to /app/discover

### Root cause
`AppShell.tsx` line 102-107 resets `#app-main-scroll` to top on route change but **explicitly skips** any path starting with `/app/discover`. That guard was added to preserve feed position when opening a Discover item modal (`/app/discover/:itemId`), but it also blocks reset when the user arrives at Discover from any other page (Library, Products, Dashboard, etc.) — leaving them deep in the feed.

### Fix (single file, ~5 lines)

**`src/components/app/AppShell.tsx`** — replace the scroll-reset effect (lines 102-107) with a `previousPathname` ref that compares the *previous* pathname to the new one. Skip reset only when both are inside `/app/discover` (intra-Discover navigation, e.g. opening/closing item modals). Reset on every other transition, including Library → Discover.

```tsx
const prevPathRef = useRef<string>(location.pathname);
useEffect(() => {
  const prev = prevPathRef.current;
  const next = location.pathname;
  prevPathRef.current = next;

  // Preserve scroll only when navigating within Discover (item modal open/close)
  const bothInDiscover = prev.startsWith('/app/discover') && next.startsWith('/app/discover');
  if (bothInDiscover) return;

  const main = document.getElementById('app-main-scroll');
  if (main) main.scrollTop = 0;
}, [location.pathname]);
```

Add `useRef` to the existing react import.

### Why this is safe
- Infinite scroll in Discover relies on IntersectionObserver inside the page — resetting `scrollTop` to 0 simply makes the sentinel re-trigger normally as the user scrolls down. No data refetch is forced (react-query cache is intact, `staleTime: 10min`).
- Item modal flow (`/app/discover` → `/app/discover/:itemId` → back) still preserves scroll because both paths start with `/app/discover`.
- `window.scrollTo` is intentionally not used — inside `/app/*` the scroll container is `<main id="app-main-scroll">`, not `window`. The existing `ScrollToTop` in `App.tsx` handles `window` for non-app routes.
- Only one effect, one file, no new dependencies.

### Out of scope
- No changes to Discover data hooks, masonry layout, or modal logic.
- No changes to `App.tsx`'s `ScrollToTop` (that handles public routes correctly via `window.scrollTo`).
- No changes to other app pages.

### QA
1. `/app/library` → scroll to bottom → click Explore → lands at top, first batch visible, infinite scroll still works on scroll down.
2. Same from `/app/products`, `/app/freestyle`, `/app/dashboard`, `/app/workflows`.
3. Inside Discover: scroll halfway down → click an item → modal opens → close → scroll position preserved.
4. Browser back/forward between Library and Discover: Discover lands at top (acceptable; matches expected behavior for fresh feed).

