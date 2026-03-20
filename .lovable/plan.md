

# Fix Contact Form Email + Remove Discord Card

## Problem
1. The `/contact` form inserts into `contact_submissions` table but never sends an email to hello@vovv.ai — the DB record is saved but no notification reaches the team.
2. The "Community / Join our Discord" sidebar card is false — there is no Discord community.

## Root Cause
The contact page only does `supabase.from('contact_submissions').insert(...)`. The `send-contact` edge function (which forwards to `send-email`) is only used by the in-app `ChatContactForm` and requires JWT auth. The public `/contact` page has no mechanism to trigger an email.

## Solution

### 1. Database trigger to send email on new contact submission
Create a migration with a trigger function on `contact_submissions` INSERT that calls the `send-email` edge function via `net.http_post` — the same pattern already used by `notify_new_user()` and `deduct_credits()`.

```sql
CREATE FUNCTION notify_contact_submission()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE v_url text; v_key text;
BEGIN
  -- Get credentials from vault (same pattern as notify_new_user)
  SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
  SELECT decrypted_secret INTO v_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;

  IF v_url IS NOT NULL AND v_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_url || '/functions/v1/send-email',
      body := jsonb_build_object(
        'type', 'contact_form',
        'to', 'hello@vovv.ai',
        'data', jsonb_build_object(
          'name', NEW.name,
          'email', NEW.email,
          'message', NEW.message,
          'inquiryType', NEW.inquiry_type
        )
      ),
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_key,
        'Content-Type', 'application/json'
      )
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_contact_submission failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_contact_submission_insert
  AFTER INSERT ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION notify_contact_submission();
```

This is the same battle-tested pattern used by `notify_new_user`. No client-side changes needed — the existing DB insert will now automatically trigger the email.

### 2. Update `contactFormEmail` template in `send-email`
Add the `inquiryType` field to the email template so the team can see the selected subject category.

### 3. Remove the Discord/Community card
In `src/pages/Contact.tsx`, delete lines 148-156 (the Community card with the Discord mention).

## Files
- **New migration** — trigger function + trigger on `contact_submissions`
- **`supabase/functions/send-email/index.ts`** — add `inquiryType` row to `contactFormEmail` template
- **`src/pages/Contact.tsx`** — remove the Community sidebar card

