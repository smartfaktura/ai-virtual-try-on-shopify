

## Replace "Load More" Button with Infinite Scroll

### What changes
Replace the manual "Load more" button in the Freestyle gallery with an automatic infinite scroll using `IntersectionObserver`. When the user scrolls near the bottom of the loaded images, the next page loads automatically.

### Technical Detail

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

1. Add `useRef` and `useEffect` imports
2. Create a sentinel `<div>` at the bottom of the masonry grid
3. Use `IntersectionObserver` with `rootMargin: '400px'` to trigger `onLoadMore` when the sentinel is ~400px from the viewport (fires early so content loads before the user reaches the end)
4. Remove the "Load more" button entirely
5. Show a small loading spinner when `isFetchingMore` is true

Replace lines 437-446 (the button block) with:
```tsx
{hasMore && <div ref={sentinelRef} className="h-1" />}
{isFetchingMore && (
  <div className="flex justify-center pb-6">
    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
)}
```

Add an `useEffect` + `useRef` for the observer:
```tsx
const sentinelRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!hasMore || !onLoadMore || isFetchingMore) return;
  const el = sentinelRef.current;
  if (!el) return;
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) onLoadMore(); },
    { rootMargin: '400px' }
  );
  observer.observe(el);
  return () => observer.disconnect();
}, [hasMore, onLoadMore, isFetchingMore]);
```

No changes needed in any other files -- the props are already wired up.

