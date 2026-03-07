

## Set Up Resend for Branded VOVV.AI Email Notifications

### Overview
Create a `send-email` edge function powered by Resend, then integrate it into three flows: welcome email on signup, generation complete notification, and low credits alert.

### Step 1 — Store the Resend API key
Use the `add_secret` tool to request `RESEND_API_KEY` from you.

### Step 2 — Create `supabase/functions/send-email/index.ts`
A single edge function that accepts a `type` parameter and renders the appropriate branded HTML email. Calls the Resend API (`https://api.resend.com/emails`).

- Accepts: `{ type: "welcome" | "generation_complete" | "low_credits", to: string, data: {...} }`
- Sends from: `notifications@vovv.ai` (or whatever sender you configure in Resend)
- Auth: service role key only (internal calls from other functions/triggers)
- Each email type has inline-styled HTML matching VOVV.AI branding (dark theme, primary purple, clean layout)

### Step 3 — Welcome email trigger
Modify `handle_new_user()` DB function — or better, call `send-email` from the existing signup flow. The cleanest approach: add a database webhook or call `send-email` from a new lightweight trigger edge function invoked after profile creation.

**Approach chosen**: Create a DB trigger function `notify_new_user()` that fires after INSERT on `profiles`, which calls the `send-email` edge function via `pg_net` (Supabase's async HTTP extension). This keeps it fully server-side with no client changes.

### Step 4 — Generation complete email
In `process-queue/index.ts` or the individual generation functions (`generate-freestyle`, `generate-workflow`, `generate-tryon`): after a job completes successfully, fire a call to `send-email` with `type: "generation_complete"`. Since these functions already have the user_id, we'll look up the user's email from profiles and send.

**Approach chosen**: Add a helper call at the end of each generation function's success path (where it updates `generation_queue` to `completed`). Fire-and-forget call to `send-email`.

### Step 5 — Low credits alert
Add logic in the `deduct_credits` DB function: after deduction, if the new balance crosses a threshold (e.g., < 20% of plan credits), call `send-email` via `pg_net`. To avoid spam, we'll add a `last_low_credits_email_at` column to profiles and only send once per 24h.

### Database changes
- Add `last_low_credits_email_at timestamptz` column to `profiles` (nullable, default null)
- Enable `pg_net` extension if not already enabled (for DB-level HTTP calls)

### Files changed
- `supabase/functions/send-email/index.ts` — **new** (branded email templates + Resend API)
- `supabase/functions/generate-freestyle/index.ts` — add generation complete email call
- `supabase/functions/generate-tryon/index.ts` — same
- `supabase/functions/generate-workflow/index.ts` — same
- `supabase/config.toml` — add `[functions.send-email]` entry
- DB migration — add `last_low_credits_email_at` column, create `notify_new_user` trigger, update `deduct_credits` function

### Email design
All three emails will share a consistent branded layout:
- White background body (email best practice)
- VOVV.AI logo/wordmark header
- Primary color (#8B5CF6 purple) for CTA buttons
- Clean typography, minimal layout
- Footer with unsubscribe note and company info

