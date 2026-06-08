## What we're fixing — in plain English

Right now your admin chart says "83 people started checkout, only 5 finished" — that looks scary, but it's wrong. Customers ARE paying (you have 99 active subscribers). The problem is we only write down "completed ✅" for one-time credit pack purchases. For **subscriptions** we forget to mark them done.

Real conversion is about **55%** — totally healthy.

## What I'll change (only 2 small things)

### 1. Add subscription tracking to one edge function

File: `supabase/functions/check-subscription/index.ts`

After this function confirms a user has an active subscription (it already does this every minute), it will additionally:
- Look at that user's recent Stripe checkout sessions
- Find any **subscription** sessions Stripe says are `status = "complete"`
- Stamp `completed_at` on the matching row in our `checkout_sessions` table — but only if it's still empty

Wrapped in a try/catch safety net (same pattern used elsewhere). If anything fails, it's silently logged and the function keeps working exactly like today.

### 2. One-time cleanup of old records

A single SQL `UPDATE` that fixes historical rows so your chart shows the real story going forward.

**Conservative rules so we never mark the wrong row:**
- Only touches rows where `completed_at` is empty
- Only for users currently on a paid plan (`subscription_status = 'active'` AND `plan != 'free'`)
- Only if their `current_period_end` is later than that checkout's `started_at` (proves the subscription came from that attempt or later)

## Edge cases — already handled

| Scenario | What happens |
|---|---|
| User cancels later | Old row stays marked completed (correct — they DID pay at the time). Cancellation is a separate event. |
| Existing subscriber upgrades plan | New checkout row inserted, new Stripe session ID, gets marked completed normally. Old row untouched. |
| Subscriber opens checkout but bails | Stripe session never reaches `status = "complete"` → our filter ignores it → row stays open and eventually marked abandoned by existing logic. |
| Stripe API fails during the new code block | try/catch swallows the error, logs it, function returns user's plan normally. Zero customer impact. |

## Safety guarantees (why this can't break anything)

- **No payment code changes.** Stripe charges, credit grants, plan changes — completely untouched
- **No schema changes.** No new tables, no new columns
- **The column we touch (`completed_at`) is purely a reporting timestamp.** Nothing in the app reads it to decide who pays, who gets credits, or who has access
- **Can never overwrite an existing value** — every update has `.is('completed_at', null)` guard
- **Can never close a row Stripe didn't confirm** — we filter on Stripe's `status === "complete"`
- **Reversible in one SQL statement** if you ever want to undo

## What you'll see after it ships

- Funnel chart jumps from ~6% to ~50–60% completion (the real number)
- Future abandoned-cart emails will correctly skip people who actually paid
- Zero change for customers — they don't see any of this

## What this plan does NOT touch

- Stripe configuration, prices, products, plans
- Pricing page, checkout UI, payment buttons
- Credits, subscriptions, user profiles
- RLS, auth, security

## Files changed

1. `supabase/functions/check-subscription/index.ts` — add ~15 lines inside a try/catch after the active subscription is detected
2. One new SQL migration with the historical backfill (single `UPDATE` statement, scoped by the rules above)
