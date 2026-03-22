

# Fix: Scroll Right Panel to Top When Selecting "More Like This" Item

## Problem
When clicking an image in "More like this", the right panel stays at whatever scroll position the user was at (e.g. scrolled down to the grid). It should reset to the top.

## Changes

### `src/components/app/DiscoverDetailModal.tsx`

1. **Add a ref** to the right panel's scrollable div:
   ```tsx
   const panelRef = useRef<HTMLDivElement>(null);
   ```

2. **Scroll to top when item changes** — add to the existing `useEffect` that runs on `[itemId, open]` (line ~86):
   ```tsx
   panelRef.current?.scrollTo({ top: 0 });
   ```

3. **Attach ref** to the right panel div (line 163):
   ```tsx
   <div ref={panelRef} className="relative w-full md:w-[40%] ...overflow-y-auto...">
   ```

One file, 3 lines added.

