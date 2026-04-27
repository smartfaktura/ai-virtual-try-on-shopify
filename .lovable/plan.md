# Fix GTM `sign_up` for Google OAuth (with safety adjustments)

Detect first-time Google OAuth sign-up inside `onAuthStateChange` in `src/contexts/AuthContext.tsx` and fire `gtmSignUp(user.id, "google")` exactly once.

**Heuristic** (per user adjustments):
- `provider = app_metadata.provider`; `providers = app_metadata.providers || []`
- `isGoogle = provider === "google" || providers.includes("google")`
- `isFirstSignIn = |last_sign_in_at − created_at| < 60_000` (60s window)
- `isFresh = (now − created_at) < 2 * 60_000` (2 min)
- Only fire on `event === 'SIGNED_IN'` + `isGoogle` + `isFirstSignIn` + `isFresh`
- Persistent dedup `gtm:signup:{user_id}` (already in `gtm.ts`) guarantees one fire ever
- Dev-only `console.debug` of {provider, providers, created_at, last_sign_in_at, ageMs, isFirstSignIn, isFresh} gated by `import.meta.env.DEV`

**Untouched**: email signup path, Auth.tsx OAuth flow, DB trigger, no migrations, no edge functions.