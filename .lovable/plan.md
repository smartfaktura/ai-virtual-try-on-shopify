

# Fix Contact Form Email Notification

## Problem
The contact form **does work** — submissions are saved to the database (confirmed 4 rows including 2 from today). The issue is that **no email notification is sent** because the `notify_contact_submission` database function exists but is **not attached as a trigger** to the `contact_submissions` table.

## Fix

### 1. Create a database trigger
Attach the existing `notify_contact_submission()` function to the `contact_submissions` table so it fires on every new insert:

```sql
CREATE TRIGGER on_contact_submission
  AFTER INSERT ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_contact_submission();
```

This will call the `send-email` edge function with type `contact_form` to `hello@vovv.ai` whenever a new contact form is submitted.

### 2. Add a visible success toast
The form already shows a success toast — no UI changes needed.

## Summary
Single migration to create the missing trigger. One SQL statement, no code changes.

