

# Caching & Asset Loading Optimization Plan

## Current State
- 60+ lazy-loaded routes, React Query with 2-min staleTime, preconnect/preload hints already in place
- No chunk splitting, no route prefetching, no dns-prefetch for 3rd-party scripts, no extended gcTime

## Changes (4 items, zero-risk, no new dependencies)

### 1. Vendor Chunk Splitting (`vite.config.ts`)
Add `build.rollupOptions.output.manualChunks` to create stable, long-cached vendor bundles:
- `vendor-react`: `react`, `react-dom`, `react-router-dom`
- `vendor-query`: `@tanstack/react-query`
- `vendor-radix`: all `@radix-ui/*` packages
- `vendor-icons`: `lucide-react`

This prevents vendor code from being re-downloaded when only app code changes.

### 2. Route Prefetch on Hover (`src/components/app/AppShell.tsx`)
Add an `onMouseEnter` handler to sidebar nav items that calls `import()` for the matching lazy route chunk. Uses a simple path-to-import map for the top 8 routes (Dashboard, Products, Generate, Library, Freestyle, Workflows, Discover, Settings). One hover = one prefetch = zero delay on click.

### 3. Extended gcTime (`src/App.tsx`)
Add `gcTime: 10 * 60 * 1000` (10 minutes) to QueryClient defaults. Prevents garbage collection of cached data during tab switches and back-navigation, especially for image-heavy pages like Library and Freestyle.

### 4. DNS Prefetch Hints (`index.html`)
Add `<link rel="dns-prefetch">` for:
- `connect.facebook.net`
- `www.googletagmanager.com`

These domains are already loaded by deferred scripts but DNS resolution can start earlier.

---

**No PWA / service worker** — per project guidelines, this is skipped unless explicitly requested.

| # | File | Change |
|---|---|---|
| 1 | `vite.config.ts` | Add `manualChunks` config |
| 2 | `src/components/app/AppShell.tsx` | Add hover prefetch for nav items |
| 3 | `src/App.tsx` | Add `gcTime: 10 * 60 * 1000` |
| 4 | `index.html` | Add 2 `dns-prefetch` links |

