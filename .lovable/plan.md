## Root cause

Hub/category pages (e.g. `/ai-product-photography/fashion`) load slightly scrolled down instead of at the very top.

Two things combine:

1. All routes are loaded with `React.lazy(...)`. The page chunk is fetched async, so when `<ScrollToTop />` fires `window.scrollTo(0, 0)` on `pathname` change, the route is still showing the empty Suspense fallback. Scrolling a 0-height page does nothing.
2. The browser's default `history.scrollRestoration` is `'auto'`. After the lazy chunk resolves and the tall page paints, the browser restores a small scroll offset from the previous route (or from its own heuristics for back/forward-cache), so the hero ends up clipped under the fixed `LandingNav`.

## Fix

Update `src/components/ScrollToTop.tsx` to:

1. Set `history.scrollRestoration = 'manual'` once on mount, so the browser stops restoring scroll automatically.
2. On every `pathname` change (non-POP navigation), scroll to top **immediately** AND again on the next animation frame, so the second call lands after the lazy page has actually mounted and the layout has expanded.

Approximate new body:

```tsx
useEffect(() => {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
}, []);

useEffect(() => {
  if (navType !== 'POP') {
    window.scrollTo(0, 0);
    // Re-assert after lazy chunk mounts and layout settles.
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(raf);
  }
  trackPageView();
  gtagPageView();
}, [pathname, navType]);
```

(Keep the existing analytics calls — just move scroll logic into its own block so the rAF cleanup doesn't strand them.)

## Files

- `src/components/ScrollToTop.tsx` — only file touched.

This is a single, surgical change that fixes every lazy-loaded route, including all `/ai-product-photography/:slug` hub pages.
