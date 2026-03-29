

# Audit Results -- Image Caching Optimization

## Status of 4 Planned Changes

| # | Change | Status |
|---|---|---|
| 1 | In-memory signed URL cache in `signedUrl.ts` | Done |
| 2 | Gallery polling reduction (`staleTime: 2min`, `refetchInterval: 1min`) | Done |
| 3 | `decoding="async"` on ShimmerImage | Done |
| 4 | Preload above-fold Dashboard images | **Missing** |

## Bonus Issue Found: forwardRef Warning

Console shows `Function components cannot be given refs` for `ShimmerImage` inside `DiscoverCard`. The `ShimmerImage` component needs to be wrapped with `React.forwardRef` so parent components can pass refs without warnings. This affects the Discover feed on the Dashboard.

## Remaining Work (2 items)

### 1. Preload First 4 Dashboard Images (`src/pages/Dashboard.tsx`)
The `RecentCreationsGallery` component owns its own query, so the preload logic should go inside `RecentCreationsGallery.tsx` itself. After the query resolves, call `new Image().src` for the first 4 URLs to prime the browser cache before cards render.

### 2. Add forwardRef to ShimmerImage (`src/components/ui/shimmer-image.tsx`)
Wrap the component with `React.forwardRef` so refs from `DiscoverCard` and other parents work without console warnings. The existing `imgRef` callback can merge with the forwarded ref.

| # | File | Change |
|---|---|---|
| 1 | `src/components/app/RecentCreationsGallery.tsx` | Add `useEffect` to preload first 4 image URLs after query resolves |
| 2 | `src/components/ui/shimmer-image.tsx` | Wrap with `forwardRef`, merge forwarded ref with internal `imgRef` |

