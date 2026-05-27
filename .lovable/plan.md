## Problem

New users in the last 2 hours show low real balances (2, 4, 8) because they actually start with **20 free credits** (set by `handle_new_user` trigger + `Auth.tsx` fallback, both = 20). Resend, however, shows **60 credits** for every new contact.

Root cause: `src/pages/Onboarding.tsx` line 137 sends a hardcoded `credits_balance: 60` in the `sync-resend-contact` payload. The `sync-resend-contact` function prefers `incomingProps.credits_balance` over the actual DB value, so Resend gets 60 even though the profile holds 20.

Every recent `resend_event_log` row confirms this — `credits_balance: 60` on `contact.sync` and `contact.property_sync` for every new signup.

## Fix (1 line)

In `src/pages/Onboarding.tsx`, remove the hardcoded `credits_balance: 60` from the `sync-resend-contact` invoke payload. The edge function will fall back to `profile?.credits_balance` from the DB (the real 20), which keeps Resend in sync as users spend credits.

## Optional follow-up (separate, ask first)

Backfill the 4 recent contacts in Resend with their true balance via the existing `resync-resend-audience` admin button on the Email Marketing page — no code change required, just one click.

## Out of scope

- No DB migration
- No change to `handle_new_user`, `Auth.tsx`, or any credit-granting logic
- No change to `sync-resend-contact` (its fallback behavior is correct)
