

# Image Caching Optimization Plan

## Problem
Every signed URL call is a network request to the backend. The same image URLs get re-signed on every React Query refetch, navigation, and component remount. With the Discover library (100+ presets), Dashboard gallery (16 items refreshing every 15s), Library (paginated), Freestyle (paginated), and Video hub — this creates thousands of redundant signing requests.

## Current State

| Area | Images | Signing | Refetch Pattern |
|---|---|---|---|
| Dashboard Recent Creations | 16 | `toSignedUrls` every 15s | `refetchInterval: 15_000`, `staleTime: 10_000` |
| Library (infinite scroll) | 20/page | `toSignedUrls` per page | `staleTime: 60_000` |
| Freestyle gallery | 20/page | `toSignedUrls` per page | `staleTime: 5min` |
| Discover feed | 100+ presets | No signing (public bucket) | `staleTime: 10min` |
| Video hub | Per-video | `toSignedUrl` per URL | Per-query |
| Workflow preview modals | Batch | `toSignedUrls` on open | On-demand |
| ShimmerImage | All images | N/A | No `decoding="async"` |

## Changes (4 items)

### 1. In-Memory Signed URL Cache (`src/lib/signedUrl.ts`)
Add a `Map<string, { url: string; expiresAt: number }>` cache with 50-minute TTL (safety margin under 1-hour expiry). Both `toSignedUrl` and `toSignedUrls` check cache before calling the backend. Cache hits return instantly, cache misses sign and store. This eliminates redundant signing across:
- Dashboard ↔ Library navigation (same images appear in both)
- React Query refetches that return the same URLs
- Modal opens for already-displayed images
- Component remounts during tab switches

### 2. Dashboard Gallery Polling Reduction (`src/components/app/RecentCreationsGallery.tsx`)
Change `staleTime` from `10_000` to `2 * 60 * 1000` (2 min) and `refetchInterval` from `15_000` to `60_000` (1 min). New generations take 30-60s to complete — polling every 15s with a 10s staleTime means the gallery re-signs all 16 URLs every 15 seconds for no benefit. A 1-minute poll still catches new results quickly.

### 3. Add `decoding="async"` to ShimmerImage (`src/components/ui/shimmer-image.tsx`)
Add `decoding="async"` to the `<img>` element. This moves image decoding off the main thread, preventing frame drops when scrolling through large galleries (Library with 60+ images, Discover with 100+ cards, Freestyle infinite scroll). Already used in landing components and FreestyleGallery but missing from the core ShimmerImage used everywhere else.

### 4. Preload Above-Fold Dashboard Images (`src/pages/Dashboard.tsx`)
After the RecentCreationsGallery query resolves, call `new Image().src` for the first 4 images. This primes the browser disk cache before the cards enter the viewport, eliminating shimmer for the top row on every Dashboard visit.

---

| # | File | Change |
|---|---|---|
| 1 | `src/lib/signedUrl.ts` | Add `Map` cache with 50-min TTL to both functions |
| 2 | `src/components/app/RecentCreationsGallery.tsx` | `staleTime: 120_000`, `refetchInterval: 60_000` |
| 3 | `src/components/ui/shimmer-image.tsx` | Add `decoding="async"` to `<img>` |
| 4 | `src/pages/Dashboard.tsx` | Preload first 4 gallery images on query success |

