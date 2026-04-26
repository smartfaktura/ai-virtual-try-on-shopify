# Fix: Public pages sometimes appear not from top

## What's happening

Across the site you've seen public pages (e.g. an SEO category page like `/ai-product-photography/dresses`, or after navigating from one public page to another) load already partially scrolled — title hidden behind the nav, hero looking "cut off" (matches the screenshot you sent).

`ScrollToTop` already runs on every navigation and forces `window.scrollTo(0, 0)` immediately, again on the next animation frame, and again after 80 ms. So why does the page still end up mid-scroll? Two reasons, both happening **after** ScrollToTop's last attempt:

### Cause 1 — Chip rail auto-scroll on mount (the main culprit)

`src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` has:

```ts
const [activeIdx, setActiveIdx] = useState(0);

useEffect(() => {
  const chip = chipRefs.current[activeIdx];
  chip?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}, [activeIdx]);
```

This effect runs on **first mount**. The chip rail sits well below the fold on the category pages. Even with `block: 'nearest'`, when the chip is not in the viewport the browser scrolls the nearest scrollable ancestor (the window) to bring it into view — pulling the page down to the chips section. Because this fires after the lazy route chunk mounts (which can be later than ScrollToTop's 80 ms timer), `ScrollToTop` doesn't get a chance to undo it.

The intent of that effect is "keep the active chip visible **when the user changes it**", not on mount.

### Cause 2 — ScrollToTop is fragile against late-mounting lazy routes

For lazy-loaded pages (every public page except `/`), the new page mounts *after* `ScrollToTop`'s effect already fired. The current 80 ms safety timeout isn't always enough on slower mobile networks — by the time the new page paints, ScrollToTop has already given up.

## Fix

### 1. Stop `CategoryBuiltForEveryCategory` from scrolling on mount

Skip the `scrollIntoView` on the very first run; only react to subsequent `activeIdx` changes (real user interaction). Use a `didMountRef` ref so the rule is unambiguous.

```ts
const didMountRef = useRef(false);
useEffect(() => {
  if (!didMountRef.current) { didMountRef.current = true; return; }
  const chip = chipRefs.current[activeIdx];
  chip?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}, [activeIdx]);
```

This removes the unwanted page jump and still keeps the chip-follow behavior when users tap a different subcategory.

### 2. Make `ScrollToTop` robust against lazy routes

Update `src/components/ScrollToTop.tsx` so it re-asserts scroll position once the route's `<main>` actually appears:

- Keep the immediate + rAF + 80 ms attempts (fast path).
- Add a single `MutationObserver` watching `document.body` for a short window (~600 ms) after `pathname` changes. As soon as a new top-level page node appears (or the next paint after Suspense resolves), force `scrollTo(0, 0)` once more, then disconnect.
- Bail out entirely on `POP` (back/forward) so we never stomp on the browser's restored scroll position.
- Skip when the URL contains a `#hash` so anchor jumps still work.

This guarantees the new page lands at the top even when its lazy chunk resolves later than the existing timers.

### 3. Sanity sweep

While there, audit the other `scrollIntoView` / `scrollTo` calls on public surfaces to confirm none of them fire on mount unintentionally:

- `ProductVisualLibrary.tsx` lines 48–53, 76–82 — already guarded (only run on user action or when `?family=` deep-link is present). No change needed.
- `LandingNav.tsx` hash click — only runs on click. No change.

## Files to change

- `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` — guard the `scrollIntoView` effect with a first-mount ref.
- `src/components/ScrollToTop.tsx` — add a short-lived `MutationObserver` re-assert pass; preserve `POP` and `#hash` behavior.

## How to verify

1. From `/` click "Scene Library" then "How It Works" then a category page — each should land at the very top with the hero fully visible under the floating nav.
2. Reload `/ai-product-photography/dresses` directly on mobile — page should start at hero, not at the chip rail.
3. Use browser back/forward — previous scroll position should still be restored (POP path untouched).
4. Visit `/pricing#enterprise` (or any URL with a hash) — anchor jump should still work.
