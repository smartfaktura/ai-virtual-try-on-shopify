## Root cause (rechecked against the DB)

- RLS on `product_image_scenes` is correct. For non-admin `123presets@gmail.com`, the policy `Auth read scenes` only returns:
  - global scenes (`owner_user_id IS NULL`) that are active, or
  - their own rows (`owner_user_id = auth.uid()`).
- The DB confirms `123presets` is **not** an admin, so `TEST`, `GHA Lobby Image`, and `Subway` are not actually returned by the server for that user.
- The leak is in the client. `useProductImageScenes` defines its React Query keys without the current user id:
  - `['product-image-scenes', cacheVariant]`
  - `['product-image-scenes-priority', cacheVariant, priorityCats]`
  - `['product-image-scenes-rest', cacheVariant, priorityCats]`
  - `staleTime: 5 * 60 * 1000`
- That means once any session (admin viewing the page, prewarm, or a shared tab) populates the cache, the next user in the same browser reuses it. That is what is showing other users' Brand Scenes inside the Activewear category for `123presets`.

So this is a frontend cache isolation bug, not an RLS bug.

## Safe fix (frontend only, no DB changes)

1. Scope React Query keys by user
   - In `src/hooks/useProductImageScenes.ts`, add the current `user?.id ?? 'anon'` into all three query keys (`QUERY_KEY_ALL`, `QUERY_KEY_PRIORITY`, `QUERY_KEY_REST`).
   - Result: admin and non-admin sessions never share cached scene lists; logout/login swaps cache cleanly.

2. Defense-in-depth filter on the client
   - After fetching, drop any row where `owner_user_id` is set and not equal to the current user id, unless the caller explicitly opts into the admin catalog (`includeInactive: true` paths used by admin pages).
   - This guarantees that even if a stale query result is hydrated from anywhere, other users' brand scenes are never rendered to a normal user.

3. Cache-bust on auth change
   - In the auth state listener, invalidate the three scene query keys on sign-in / sign-out so a logout in the same tab does not leave admin data behind.

4. Keep admin tools intact
   - `AdminProductImageScenes`, `AdminBulkPreviewUpload`, and `BundleVisuals` already pass `includeInactive: true` / `includeBundle: true`. Those paths skip the owner filter so admins keep full catalog management.

5. No RLS changes
   - RLS is already correct and already protects the data server-side. Adding a RESTRICTIVE policy here would risk breaking admin catalog editing and is unnecessary for this bug.

## Files touched

- `src/hooks/useProductImageScenes.ts` — user-scoped query keys + owner-filter for user-facing callers.
- `src/contexts/AuthContext.tsx` (or wherever the auth subscription lives) — invalidate scene query keys on auth events.

## Why this is the smallest safe fix

- The visible bug is cache reuse; user-scoped query keys fix it directly.
- The owner filter is a belt-and-suspenders guard against future regressions or unrelated shared-cache paths.
- No migrations, no RLS rewrites, no admin breakage, no edge function changes.
