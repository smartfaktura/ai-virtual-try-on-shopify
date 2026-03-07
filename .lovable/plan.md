

## Test Emails and Trigger Explanation

### Testing Issue

The `send-email` function is secured with **service role key authentication** — it checks `Authorization: Bearer <SERVICE_ROLE_KEY>`. The testing tool sends the anon key, so it gets rejected with 401. This is correct security behavior (only internal/database calls should send emails).

### Plan to Test

To send all 3 test emails to `hello@vovv.ai`, I need to temporarily relax the auth check to also accept the anon key, send the test emails, then revert. Alternatively, I can add a short-lived test bypass.

**Approach**: Temporarily update the auth check in `send-email/index.ts` to also accept the anon key for testing, fire off the 3 test calls, then immediately revert the auth back to service-role-only.

### When Each Email Gets Triggered

| Email | Trigger | How |
|-------|---------|-----|
| **Welcome** | New user signs up and profile is created | Database trigger `notify_new_user()` fires on `profiles` INSERT → calls `send-email` via `extensions.http_post` with type `welcome` |
| **Generation Complete** | Any image generation finishes successfully | Edge functions `generate-freestyle`, `generate-tryon`, `generate-workflow` each make a fire-and-forget `fetch()` call to `send-email` with type `generation_complete` after images are saved |
| **Low Credits** | User's credit balance drops below 10 | Database function `deduct_credits()` checks if balance < 10 and last email was >24h ago (or never sent) → calls `send-email` via `extensions.http_post` with type `low_credits` |

### Rate Limiting

- **Welcome**: Once per user (triggered on profile creation, which happens once)
- **Generation Complete**: Every successful generation (fire-and-forget, non-blocking)
- **Low Credits**: Maximum once every 24 hours per user (tracked via `last_low_credits_email_at` column on `profiles`)

### Flow Diagram

```text
User signs up
  → auth.users INSERT
    → handle_new_user() creates profile
      → notify_new_user() trigger
        → HTTP POST to send-email (welcome)

User generates images
  → generate-freestyle/tryon/workflow completes
    → fetch() to send-email (generation_complete)

User spends credits
  → deduct_credits() called
    → balance < 10 + not emailed in 24h?
      → HTTP POST to send-email (low_credits)
```

### Files Changed
- `supabase/functions/send-email/index.ts` — temporarily allow anon key, test, revert

