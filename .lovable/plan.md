## Goal

Fire `begin_checkout` exactly once per checkout attempt — only **after** Stripe Checkout Session is created, always carrying `checkout_id = session.id`. This makes Meta InitiateCheckout (fired from GTM) emit a single event with a real `eventID`, eliminating the "Deduplicated with eventID = undefined" entry.

## Root cause

`src/contexts/CreditContext.tsx` → `startCheckout()` currently pushes `begin_checkout` twice:

1. Line 234 — **intent push without `checkout_id`** (fires on click, before backend).
2. Line 275 — **enrichment push with `checkout_id`** (fires after `create-checkout` returns).

GTM forwards both to Meta. Without a shared `eventID`, Meta treats them as two separate InitiateCheckout events.

## Changes

### 1. `src/contexts/CreditContext.tsx` (the only fix)

In `startCheckout()`:

- **Delete the intent push** (lines ~232–251), including its debug log block.
- Keep the enrichment push (line 275) as the **single** `begin_checkout` call. It already contains `userId`, `checkoutId: data.sessionId`, `planName`, `checkoutMode`, `value`, `currency`, `pageLocation` — matching the expected payload exactly.
- Keep `gtmCheckoutSessionCreated` (debug-only) and the 250 ms pre-redirect hold.
- Update the leading comment to: `// Meta InitiateCheckout fires from GTM via the single begin_checkout dataLayer event pushed AFTER Stripe session creation.`

No other files need edits.

### 2. Optional cleanup (low priority, not required to fix the bug)

- In `src/lib/gtm.ts`, the time-window dedup branch in `gtmBeginCheckout` (the `else` block when `checkoutId` is absent) becomes dead code for the checkout flow once the intent push is removed. Leaving it in place is harmless — keep it so external/future callers without an ID still get protection.

## Verification after implementation

- Repo grep for `gtmBeginCheckout(` → exactly **one** call site (the enrichment push).
- Repo grep for `fbq(`, `InitiateCheckout` (excluding comments/binaries), `fbPixel`, `connect.facebook.net` → **zero** matches in `src/`, `index.html`, `public/*.html`.
- Manual: click any pricing CTA → exactly one `begin_checkout` in dataLayer / GTM Preview, with `checkout_id = cs_live_…` and full `ecommerce` block.
- Meta Test Events → one InitiateCheckout with `eventID = cs_live_…`, no second "Deduplicated, eventID = undefined" row.

## Report deliverable (after fix)

- Files where `begin_checkout` fires: `src/contexts/CreditContext.tsx` (one call), via `src/lib/gtm.ts:gtmBeginCheckout`.
- `fbq('track', 'InitiateCheckout')` remaining: **none**.
- One `begin_checkout` push per checkout attempt: **confirmed**.
