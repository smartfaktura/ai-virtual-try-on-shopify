

## Plan: Wire up sync-resend-contact calls

The edge function exists and works, but nothing in the frontend calls it. Three places need wiring:

### Changes

**1. `src/pages/Auth.tsx` — after successful email signup**
- After `supabase.auth.signUp()` succeeds and the profile's `marketing_emails_opted_in` is updated, call `supabase.functions.invoke('sync-resend-contact', { body: { email, first_name: displayName, opted_in: marketingOptIn } })` (fire-and-forget, no need to block signup).

**2. `src/pages/Onboarding.tsx` — when OAuth user completes Step 1**
- After saving the marketing preference to the profile, call the same edge function with the user's email and opt-in status.

**3. `src/pages/Settings.tsx` — when marketing toggle changes**
- When the user toggles the "News, tips & special offers" checkbox and the profile update succeeds, call `sync-resend-contact` with the new `opted_in` value.

### Result
Every opt-in/opt-out action will sync to Resend audience `bb3f4e0a-9c15-4d19-8b35-997ac10f6f91` in real time. Existing users (like `info@tsimkus.lt`) can be synced by toggling the preference in Settings.

