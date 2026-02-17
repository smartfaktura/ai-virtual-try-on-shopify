

## Fix: Eliminate Image Flash on Freestyle Page Load

### Problem

Every time the Freestyle page loads (or the query refetches in the background), all images briefly flash. This happens because:

1. Every refetch generates **new signed URLs** for the same images (signed URLs contain unique tokens/timestamps)
2. When React receives new URL strings, the browser treats them as new images and re-downloads them
3. The `ImageCard` component starts with `loaded = false` and uses `opacity-0` until `onLoad` fires, causing a visible flash during re-download

### Solution

Two changes to eliminate the flash:

**1. Make `ImageCard` resilient to URL changes (`FreestyleGallery.tsx`)**

Track the previous `src` in a ref. When `src` changes but the component was already loaded (same image, just a new signed URL), keep `loaded = true` so there's no opacity flash. Only reset `loaded` to `false` when the image is truly new (component mounts fresh).

**2. Prevent unnecessary refetches (`useFreestyleImages.ts`)**

Add `staleTime` and `refetchOnWindowFocus: false` to the infinite query options. Signed URLs are valid for 1 hour, so there's no need to refetch (and re-sign) on every window focus or mount. This prevents the entire flash scenario from occurring in the first place.

### Changes

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

In the `ImageCard` component (line 196), replace the simple `loaded` state with logic that preserves the loaded state across URL changes:

```typescript
// BEFORE (line 196):
const [loaded, setLoaded] = useState(false);

// AFTER:
const [loaded, setLoaded] = useState(false);
const prevSrcRef = useRef(img.url);

// When src changes (e.g. new signed URL for same image), keep loaded=true
useEffect(() => {
  if (prevSrcRef.current !== img.url) {
    prevSrcRef.current = img.url;
    // Don't reset loaded — same image, just a new signed URL
  }
}, [img.url]);
```

This means once an image has loaded, it stays visible even if the URL token changes on refetch.

**File: `src/hooks/useFreestyleImages.ts`**

Add query options to prevent unnecessary background refetches:

```typescript
// Add to the useInfiniteQuery options (after line 75):
staleTime: 5 * 60 * 1000,        // 5 minutes — signed URLs last 1 hour
refetchOnWindowFocus: false,       // Don't refetch when user tabs back
```

This prevents the query from re-running (and generating new signed URLs) just because the user switched tabs or the component re-rendered.

### Why This Works

- `staleTime` + `refetchOnWindowFocus: false` prevents the refetch from happening in the first place during normal browsing
- The `ImageCard` resilience ensures that even when a deliberate refetch occurs (like after generation), already-loaded images don't flash
- New images from a generation will still load normally with the shimmer-to-visible transition since they mount fresh

