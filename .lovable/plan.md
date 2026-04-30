## Goal

1. Completely remove `tsimkus@icloud.com` so they can register fresh.
2. Ship a reusable **Hard Reset User** admin action so this never requires a manual SQL fix again.
3. Stop labeling Supabase rate-limit errors as "suppressed" in the signup UI.

## Confirmed state of tsimkus@icloud.com

| Field | Value |
|---|---|
| auth.users row | exists (id `53bc615f…`) |
| email_confirmed_at | null (never confirmed) |
| deleted_at | null |
| profiles row | 1 (orphaned) |
| suppressed_emails | 0 |
| marketing_unsubscribes | 0 |

So the "suppressed" message is **wrong**. The real cause: the `auth.users` row still exists in unconfirmed state, and repeated signup attempts trip Supabase Auth's rate limiter, which the UI maps to "suppressed".

## Step 1 — New edge function: `admin-hard-delete-user`

`supabase/functions/admin-hard-delete-user/index.ts`

- Verify caller JWT via `auth.getClaims()` and check `has_role(uid, 'admin')`.
- Input: `{ email: string }` (validated with Zod).
- Actions, in order, using the service role client:
  1. Look up `auth.users` row by email.
  2. Delete from `public.suppressed_emails` where email matches.
  3. Delete from `public.marketing_unsubscribes` where email matches.
  4. Delete from `public.profiles` where `user_id` matches (cascades to user-owned rows that already FK to profiles).
  5. `supabase.auth.admin.deleteUser(userId)` — removes the `auth.users` row entirely.
  6. Return `{ ok: true, removed: { auth: true, profile: n, suppressed: n, unsub: n } }`.
- Full CORS, structured error responses.

## Step 2 — Run it once for tsimkus@icloud.com

After deploy, immediately invoke the function with `{ email: "tsimkus@icloud.com" }` so the user can re-register right away.

## Step 3 — Admin UI button

In the existing admin Users panel (the same place that today only deletes the profile):
- Add a **"Hard Reset (delete everywhere)"** destructive action with a confirm dialog.
- On confirm, calls `admin-hard-delete-user` with that user's email and refreshes the list.
- Keep the existing "Delete profile only" action separate so the destructive one is explicit.

## Step 4 — Fix the misleading "suppressed" message in signup

In the signup form / auth context where Supabase errors are mapped to user-facing strings:

```ts
if (msg.includes('over_email_send_rate_limit') || msg.includes('email rate limit')) {
  return "Too many confirmation emails requested. Please wait about a minute and try again.";
}
if (msg.includes('User already registered') || msg.includes('already_exists')) {
  return "This email is already registered. Try signing in, or use 'Forgot password'.";
}
// Only show the suppression message when we *actually* matched a row in suppressed_emails.
```

Remove the blanket "email is suppressed" fallback so it can no longer mask a rate-limit or "already registered" condition.

## Out of scope

- No schema changes.
- No changes to the Resend sync functions (those are healthy per the last fix).
- No change to the welcome-email trigger.

## Acceptance

- After approval + deploy, `tsimkus@icloud.com` is gone from `auth.users`, `profiles`, `suppressed_emails`, `marketing_unsubscribes`.
- You can register that email again and receive the confirmation email.
- Any future stuck account can be cleared from the admin panel in one click.
- Rate-limit errors show a clear "wait a minute" message, never "suppressed".
