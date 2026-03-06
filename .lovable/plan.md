

## Improve Caching Across the App

### What's happening now
- Discover presets, custom scenes, featured items, and saved items all use **`staleTime: 0`** (React Query default), meaning they refetch from the database on every component mount and every window focus — even if nothing changed.
- The Discover presets hook already has a **realtime subscription** that invalidates the cache when new presets are inserted, so frequent refetching is redundant.
- The global `QueryClient` in `App.tsx` has no custom defaults.

### Plan

**1. Set global defaults on `QueryClient` (`src/App.tsx`)**
- Set `staleTime: 2 * 60 * 1000` (2 min) and `refetchOnWindowFocus: false` as global defaults
- This gives all queries a reasonable baseline cache without needing per-query config
- Queries that need shorter windows (like active job polling) already override these locally

**2. Add `staleTime` to Discover-related hooks**

| Hook / Query | New `staleTime` | Rationale |
|---|---|---|
| `useDiscoverPresets` | 10 min | Realtime channel handles new inserts; no need to refetch |
| `public-custom-scenes` (in `PublicDiscover.tsx`) | 10 min | Scene library changes rarely |
| `useFeaturedItems` | 5 min | Curated list, changes infrequently |
| `useSavedItems` | 5 min | User's own saves, only changes on explicit action (already invalidated on mutate) |
| `discover-view-count` | 2 min | Cosmetic stat, doesn't need to be real-time |

**3. No changes needed for**
- Library items (already 60s + realtime-aware)
- Freestyle images (already 5 min)
- Workflows (already have appropriate stale times)
- Recent creations (intentionally short for polling)

### Files changed
- `src/App.tsx` — add global `staleTime` and `refetchOnWindowFocus` defaults to `QueryClient`
- `src/hooks/useDiscoverPresets.ts` — add `staleTime: 10 * 60 * 1000`
- `src/pages/PublicDiscover.tsx` — add `staleTime: 10 * 60 * 1000` to custom scenes query
- `src/hooks/useFeaturedItems.ts` — add `staleTime: 5 * 60 * 1000`
- `src/hooks/useSavedItems.ts` — add `staleTime: 5 * 60 * 1000`

### Result
- Discover page loads **instantly** on repeat visits within 10 min
- All pages feel snappier — no unnecessary loading spinners on navigation
- New content still appears via realtime subscriptions or after cache expires
- No risk of stale data for critical flows (credits, active jobs) since those already have short/custom cache windows

