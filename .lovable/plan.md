

## Turn Off Failed Generation Notifications for New Users by Default

### Problem
New users get `settings: '{}'` in their profile, causing all notification checks to default to ON. Failed generation emails are noisy for new users who don't need them.

### Changes

**1. Database migration — set initial settings in `handle_new_user()`**

Update the function to insert explicit settings JSON with `emailOnFailed` and `inAppFailed` set to `false`:

```sql
INSERT INTO public.profiles (user_id, email, credits_balance, display_name, settings)
VALUES (
  NEW.id, NEW.email, 60,
  COALESCE(...),
  '{"emailOnFailed": false, "inAppFailed": false}'::jsonb
);
```

This ensures new signups have failed notifications OFF. Existing users are unaffected — their saved settings remain as-is.

**2. No frontend changes needed**

The Settings page already reads from the DB and merges with defaults. New users will see `emailOnFailed` and `inAppFailed` unchecked. They can check them anytime to opt in.

The edge functions (`generate-tryon`, `generate-freestyle`, `generate-workflow`) already check `settings.emailOnFailed !== false` — since new users will now have it explicitly set to `false`, they won't receive failed generation emails.

### Summary
- Single DB migration updating `handle_new_user()`
- New users: failed notifications OFF by default (both email and in-app)
- Existing users: no change
- Users can enable anytime in Settings

