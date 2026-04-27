# Replace old "V" pulse loader on /auth and protected routes

The `/auth` page (and the protected `/app/*` route guard) still show an old hand-rolled "V" pulsing square loader, while the rest of the app uses the canonical `BrandLoaderProgressGlyph` (set as the global Suspense fallback in `App.tsx`). This causes a visible style mismatch when signing in.

## Why it happens

Two files have inline copies of the legacy loader:

- `src/pages/Auth.tsx` (lines 120–131) — shown briefly while `useAuth().isLoading` is true.
- `src/components/app/ProtectedRoute.tsx` (lines 55–65) — shown after login while auth + onboarding check resolve.

Both render a small primary square with a pulsing "V" + "Loading…" caption. Neither matches the brand glyph used everywhere else.

## Fix

Replace both inline loaders with the canonical fullscreen brand loader:

```tsx
import { BrandLoaderProgressGlyph } from '@/components/ui/brand-loader-progress-glyph';

// ...
return <BrandLoaderProgressGlyph fullScreen />;
```

This is the same component already used as the Suspense fallback for lazy routes in `App.tsx`, so users get a single consistent loading experience from page navigation through login through entering the app.

## Files changed

1. `src/pages/Auth.tsx` — swap the `isLoading` block + add import
2. `src/components/app/ProtectedRoute.tsx` — swap the `isLoading || !onboardingChecked` block + add import

## Out of scope

- No changes to inline button spinners (Sign in / Sign up / Send OTP) — those are correctly contextual, not full-screen loaders.
- No changes to `AppShellLoading` (used inside `/app` shell, different purpose).