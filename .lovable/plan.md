## Fix `/discover` modal "appears twice on close" + spacing

### Bug: closing modal needs two clicks / second modal flashes

**Root cause** in `src/pages/PublicDiscover.tsx`:

1. `handleCardClick` (line 215) currently does **both** `navigate(...)` + `setSelectedItem(item)` — opens modal once via state.
2. The auto-open `useEffect` (line 207) then fires when `urlItem` resolves and `cameFromGrid=true` → calls `setSelectedItem(urlItem)` **again** with the same item.
3. On X click, `handleClose` runs `setSelectedItem(null)` + `navigate(-1)`. The back-navigation triggers React-Router to update `location` and re-render. During that transient render, `urlItem` may briefly still resolve to the previous item before the URL fully settles, and the auto-open effect re-fires → modal re-appears → user has to click X again.
4. The `cameFromGrid` flag is captured once from `location.state` at render time. After `navigate(-1)`, on the next forward nav into a card it stays referencing the new state, but the transient "ghost" reopen during back-nav is what users see.

### Fix (one file: `src/pages/PublicDiscover.tsx`)

1. **Remove redundant `setSelectedItem(item)` from `handleCardClick`** — let the auto-open `useEffect` be the single source of truth (URL → modal).
2. **Add a `justClosedSlugRef` ref** — set to current URL slug inside `handleClose`. The auto-open `useEffect` checks this ref and skips re-opening the same slug once. Cleared whenever `urlItemId` changes to a different value.
3. **Auto-open `useEffect` improvement** — guard with both `cameFromGrid` AND `urlItemId !== justClosedSlugRef.current`, and skip if the resolved item already equals `selectedItem`.
4. **`handleClose`** — record the slug being closed in the ref before calling `navigate(-1)`.

This is purely behavioral (no UI change), routing/SEO untouched.

### Spacing fix

In `src/components/discover/DiscoverItemSEOView.tsx`:

- Change article wrapper padding from `py-6` to `pt-10 sm:pt-14 pb-8` so the breadcrumbs get clear breathing room below the top navigation.

### Out of scope

- The two console warnings (`forwardRef` on `DiscoverCard`, `fetchPriority` casing on `ShimmerImage`) are pre-existing and unrelated to this bug — happy to fix in a follow-up if you want, but they don't cause the double-modal issue.
- No SEO, JSON-LD, sitemap, prerender, or `/app/discover` changes.

### Risk
Very low — bug fix is one component file, behavioral only. Spacing is one className change.