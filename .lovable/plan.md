

# Performance Analysis & Quick Fix Recommendations

## Landing Page (/)

### Finding 1: `BuyCreditsModal` rendered on every page (HIGH impact)
`BuyCreditsModal` is rendered at line 199 of `App.tsx`, **outside** any `ProtectedRoute`. It imports `useCredits` → `CreditContext`, which on mount calls `supabase.functions.invoke('check-subscription')` and queries the `profiles` table — even for anonymous visitors on the landing page. This is a wasted network request and blocks the credit context from settling.

**Fix**: Move `<BuyCreditsModal />` inside the `/app/*` protected route block, since only authenticated users ever see it.

### Finding 2: `CreditProvider` wraps the entire app (MEDIUM impact)
`CreditProvider` sits at the top level (line 96), so it runs `fetchCredits` + `checkSubscription` for every visitor. For unauthenticated users these calls return immediately, but they still create promises, run effects, and set up a 60-second interval timer.

**Fix**: Move `CreditProvider` inside the `/app/*` `ProtectedRoute` so it only initializes for logged-in users. The landing page and public pages don't need credit state.

### Finding 3: `Landing` is eagerly imported (MINOR — intentional)
This is actually correct for the home page. No change needed.

### Finding 4: Hero images from `/images/hero/` (ring, headphones showcases)
Showcases 2 and 3 in `HeroSection.tsx` reference local paths like `/images/hero/hero-ring-fabric.png` which are served from the public folder — these don't go through the Supabase CDN image optimization pipeline (`getOptimizedUrl`). They may be uncompressed PNGs, which are much heavier than optimized JPGs.

**Fix**: Move these assets to the `landing-assets` bucket and use `getLandingAssetUrl` + `getOptimizedUrl` like showcase 1 does. (Larger effort — flag for later.)

---

## App (/app/*)

### Finding 5: `ProtectedRoute` makes a blocking profile query (MEDIUM impact)
Every navigation to `/app/*` triggers a `supabase.from('profiles').select('onboarding_completed')` query. This runs sequentially after auth resolves, adding ~200-500ms before any app content appears.

**Fix**: Cache the onboarding check result in `sessionStorage` after first successful check. Only re-query if the cached value is missing. This eliminates the query on subsequent navigations within the same session.

### Finding 6: `check-subscription` edge function called on every app load (MEDIUM impact)
`CreditProvider` calls `checkSubscription` (which invokes the `check-subscription` edge function) on every mount AND sets a 60-second interval. The edge function is a cold-start-prone serverless call.

**Fix**: Increase the interval from 60s to 5 minutes (`300000`). Subscription status rarely changes — once per 5 min is sufficient.

### Finding 7: `AdminViewProvider` wraps the entire app (LOW impact)
Non-admin users still load this context. It's lightweight but unnecessary for 99% of users.

**No change** — impact too small to justify restructuring.

---

## Recommended Quick Fixes (ordered by impact)

### 1. Move `BuyCreditsModal` inside protected routes
**File**: `src/App.tsx`
Move `<BuyCreditsModal />` from line 199 (global) to inside the `/app/*` route element, after `<AppShell>`.

### 2. Move `CreditProvider` inside protected routes
**File**: `src/App.tsx`
Wrap `CreditProvider` around the `/app/*` route content only, not the entire app. This eliminates subscription checks and profile queries for all public pages.

### 3. Cache onboarding check in ProtectedRoute
**File**: `src/components/app/ProtectedRoute.tsx`
After confirming `onboarding_completed !== false`, store `sessionStorage.setItem('onboarding_ok', '1')`. On subsequent loads, skip the DB query if the flag exists.

### 4. Reduce subscription check interval from 60s to 5min
**File**: `src/contexts/CreditContext.tsx`, line 194
Change `60000` to `300000`.

### Technical details

```text
Current load chain (landing page):
  index.html → main.tsx → App.tsx
    → AuthProvider (getSession + onAuthStateChange)
    → CreditProvider (fetchCredits + checkSubscription) ← UNNECESSARY
    → BuyCreditsModal (renders Dialog) ← UNNECESSARY
    → Landing page renders

Proposed load chain (landing page):
  index.html → main.tsx → App.tsx
    → AuthProvider (getSession + onAuthStateChange)
    → Landing page renders
    (CreditProvider + BuyCreditsModal only load inside /app/*)
```

All four fixes are isolated, low-risk changes touching only `App.tsx`, `ProtectedRoute.tsx`, and `CreditContext.tsx`.

