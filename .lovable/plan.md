

# Fix Contact Form: Two Root Causes Found

## Problem
The contact form saves to the database successfully, but no email notification reaches `hello@vovv.ai`. Two issues:

1. **No triggers exist in the database** — despite two migrations attempting to create them, zero triggers are present. The migrations likely failed silently (possibly due to the function referencing vault secrets that didn't exist at migration time, or duplicate trigger name conflicts).

2. **Vault secrets missing** — the `notify_contact_submission()` function reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `vault.decrypted_secrets`. Neither exists in the vault, so even if the trigger fired, both values would be NULL and the `net.http_post` call would be skipped (the function has `IF v_url IS NOT NULL AND v_key IS NOT NULL` guard).

## Fix

### 1. Add vault secrets via migration
Insert `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` into the Supabase vault so the trigger function can call the `send-email` edge function:

```sql
SELECT vault.create_secret(
  current_setting('app.settings.supabase_url', true),
  'SUPABASE_URL'
);
SELECT vault.create_secret(
  current_setting('app.settings.service_role_key', true),
  'SUPABASE_SERVICE_ROLE_KEY'
);
```

### 2. Recreate the trigger (with conflict safety)
Drop any leftover trigger names and create a single clean trigger:

```sql
DROP TRIGGER IF EXISTS on_contact_submission ON public.contact_submissions;
DROP TRIGGER IF EXISTS on_contact_submission_insert ON public.contact_submissions;

CREATE TRIGGER on_contact_submission
  AFTER INSERT ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_contact_submission();
```

### 3. Also fix the `notify_new_user` trigger (same pattern)
The `handle_new_user` and `notify_new_user` functions use the same vault secret pattern. While we're fixing this, ensure the new-user welcome email trigger also works. Check and recreate if missing.

## Files changed
- One database migration (SQL only, no code changes)

## Why previous fixes didn't work
The earlier migration created the trigger SQL but the trigger never actually persisted — confirmed by querying `information_schema.triggers` which returns zero rows for the entire `public` schema. The vault secrets were never seeded either, so the function body was a no-op from day one.

