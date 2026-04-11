

# Fix IntersectionObserver — Safe Plan

## What's wrong (simple version)
The "load more products" watcher runs its setup code on **every single screen update** because the `useEffect` has no dependency list. It works but wastes effort — like re-hiring a guard every second instead of once.

## The fix

**File:** `src/pages/ProductImages.tsx`

**Step 1 — Use `useState` instead of `useRef` for the sentinel element** (line 93)

Replace `const sentinelRef = useRef<HTMLDivElement>(null)` with:
```ts
const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);
```
This lets React notify us when the element actually appears or disappears from the page.

**Step 2 — Update the `useEffect` dependency** (lines 370-378)

Replace the current effect with:
```ts
useEffect(() => {
  if (!sentinelEl) return;
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) setVisibleCount(v => v + 25);
  }, { rootMargin: '200px' });
  obs.observe(sentinelEl);
  return () => obs.disconnect();
}, [sentinelEl]);
```
Now it only re-runs when the element mounts/unmounts — not on every render.

**Step 3 — Update the ref in JSX** (line 1054)

Change `ref={sentinelRef}` → `ref={setSentinelEl}`

**Step 4 — Clean up imports**

Remove `useRef` from imports if no longer used elsewhere; confirm first.

## Why this is safe
- The sentinel div is conditionally rendered (`hasMore && ...`), so a `useRef` with `[]` deps would miss it. `useState` as a ref callback is the React-recommended pattern for conditional elements.
- Exactly one observer exists at any time; cleanup disconnects it properly.
- No change to user-facing behavior — products still auto-load on scroll.

**~6 lines changed, single file.**

