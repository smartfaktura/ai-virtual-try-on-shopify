

## Store RESEND_API_KEY and Build All 3 Email Notifications

I need to switch to Build mode to execute this plan. Here is exactly what will happen:

### Step 1 — Store RESEND_API_KEY
Use the `add_secret` tool to prompt you to paste your Resend API key (`re_eYg3VhbR_...`). This will show a working input field.

### Step 2 — Create `supabase/functions/send-email/index.ts`
Single edge function with branded VOVV.AI HTML templates for all 3 email types. Accepts `{ type, to, data }`, calls Resend API. Auth: service role key only.

### Step 3 — Database migration
- Enable `pg_net` extension
- Add `last_low_credits_email_at` column to `profiles`
- Create `notify_new_user()` trigger on `profiles` INSERT → calls send-email via `pg_net`
- Update `deduct_credits` to trigger low-credits email via `pg_net` when balance drops below threshold

### Step 4 — Generation complete emails
Update `generate-freestyle`, `generate-tryon`, `generate-workflow` to fire-and-forget call to `send-email` on success.

### Step 5 — Config
Add `[functions.send-email]` to `supabase/config.toml`.

### Files changed
- `supabase/functions/send-email/index.ts` — new
- `supabase/functions/generate-freestyle/index.ts` — add email call
- `supabase/functions/generate-tryon/index.ts` — add email call
- `supabase/functions/generate-workflow/index.ts` — add email call
- Database migration (pg_net, column, trigger, deduct_credits update)

