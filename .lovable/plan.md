

# Persist Freestyle Guide Dismissal Per User (Database)

## Problem
The freestyle wizard guide dismissal is stored in `localStorage` (`freestyle_guide_dismissed`). This means:
- Same user on a different browser/device sees the guide again
- Different user on the same browser never sees the guide
- Clearing browser data resets it

It should be tied to the authenticated user, shown once per account.

## Solution

Store the dismissal flag in the user's `profiles.settings` JSONB column (which already exists and is used for other per-user settings like `emailOnFailed`, `inAppFailed`).

### `src/pages/Freestyle.tsx`

1. **On mount**: Read `profiles.settings.freestyleGuideDismissed` from the database instead of `localStorage`. Show the guide only if `settings.freestyleGuideDismissed !== true`.

2. **On dismiss/complete**: Update `profiles.settings` in the database, merging `{ freestyleGuideDismissed: true }` into the existing JSONB. Also set `localStorage` as a fast cache to avoid flicker on subsequent visits.

3. **Initialization logic**:
   - Check `localStorage` first for instant render (no flicker)
   - Then verify against the database profile
   - If database says dismissed but localStorage doesn't have it, sync localStorage
   - If database says not dismissed, show the guide

### No database migration needed
The `profiles.settings` JSONB column already exists and accepts arbitrary keys. We just add `freestyleGuideDismissed: true` to it.

### Changes

**`src/pages/Freestyle.tsx`** (~15 lines changed):
- Import `useAuth` and `supabase`
- Replace `localStorage`-only init with a `useEffect` that checks `profiles.settings`
- On dismiss, write to both `profiles.settings` (via Supabase update) and `localStorage`

