

# Fix Zoomed-In Dashboard Recent Creations Images

## Problem
`getOptimizedUrl` is called with `width: 400` on line 280 of `RecentCreationsGallery.tsx`, triggering server-side cropping. Combined with `object-cover`, images appear zoomed in — same root cause as the workflow cards fix.

## Change — `src/components/app/RecentCreationsGallery.tsx`

**Line 280** — Remove `width: 400`, keep quality-only:

```
// Before:
src={getOptimizedUrl(item.imageUrl, { width: 400, quality: 60 })}

// After:
src={getOptimizedUrl(item.imageUrl, { quality: 60 })}
```

Single line change, single file.

