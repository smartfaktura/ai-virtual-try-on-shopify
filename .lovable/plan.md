

## Audit: Email Subscriber Sync Coverage

### What's working
- **Email signup** (`Auth.tsx`): Syncs to Resend immediately after signup.
- **Onboarding** (`Onboarding.tsx`): Syncs when user completes Step 1 (profile).
- **Settings** (`Settings.tsx`): Syncs when user toggles marketing preference and saves.

### Gap found: OAuth signups bypass Resend sync

When a user signs up via **Google or Apple OAuth**, they skip the email signup form. The `handle_new_user` database trigger creates their profile with `marketing_emails_opted_in = true` (the default), but no `sync-resend-contact` call fires. They only get synced if they complete Onboarding.

**Risk**: If a user signs up via OAuth but abandons onboarding, they're marked as opted-in in the database but **never added to the Resend audience**.

### Proposed fix

**Add a Resend sync call after OAuth users land in the app for the first time.** The simplest place is in the Onboarding page's `useEffect` or in the `ProtectedRoute` component — when a new user's profile exists with `marketing_emails_opted_in = true` and `onboarding_completed = false`, fire a one-time sync. Alternatively, just ensure the Onboarding flow is mandatory (which it appears to be via `ProtectedRoute`), making the current Onboarding sync sufficient.

### Recommendation

If Onboarding is **always required** before accessing the app (i.e., OAuth users must complete it), then the current setup is complete — no changes needed. The Onboarding step already syncs.

If Onboarding can be skipped, then we should add a sync call in `ProtectedRoute` or `AppShell` for first-time users.

### Optional: Backfill existing users

There's no mechanism to sync users who signed up before the Resend integration was wired. This would require a one-time script or edge function that queries all profiles with `marketing_emails_opted_in = true` and batch-adds them to the Resend audience.

