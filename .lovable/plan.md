
## Goal
Recover from the partial run: fix the broken edge function, respect Resend's 5 req/sec limit, finish registering properties, and backfill all 1,187 contacts.

## Steps

### 1. Repair `register-resend-properties/index.ts`
- Re-read current file to locate the dropped `fetch` line.
- Restore the per-property POST loop with a **250ms delay between calls** (`await new Promise(r => setTimeout(r, 250))`) to stay under 5 req/sec.
- Keep idempotency: treat `422 already exists` as success.
- Return `{ registered, already_exists, failed }`.

### 2. Throttle `resync-resend-audience`
- Reduce parallel batch size from **10 → 4** (safely under 5 req/sec).
- Add a **300ms gap between batches** as a second safety margin.
- Keep chunking (`offset`/`limit=300`), bulk aggregate query, and `Promise.allSettled` unchanged.

### 3. Deploy both functions
- Deploy `register-resend-properties` and `resync-resend-audience`.

### 4. Register remaining properties
- Curl `register-resend-properties` once. Expected: 10 `already_exists`, 2 `registered` (`subscription_status`, `referral_source`), 0 `failed`.
- If anything fails, retry just that call.

### 5. Run the 1,187-contact backfill
Sequential curl calls (each ~45–90s with the new throttle):
- `?offset=0&limit=300`
- `?offset=300&limit=300`
- `?offset=600&limit=300`
- `?offset=900&limit=300`

After each call, log `{ added, updated, failed, has_more, next_offset }`. If `failed > 0`, capture failing user_ids from logs for a targeted retry — don't re-run the whole chunk.

### 6. Verify
- Spot-check `info@tsimkus.lt` via Resend dashboard: confirm all 12 properties populated and `lifecycle_stage` correct.
- Sample 2–3 other contacts across plan tiers (free, active sub, churned).
- Confirm Resend total contact count ≈ 1,187.

## Safety boundary (unchanged)
- ❌ No DB schema, RLS, billing, signup, or email-send changes
- ✅ Only outbound PATCH/POST to Resend; idempotent throughout
- ✅ Chunked + throttled to fit edge function timeout and Resend rate limits

## Out of scope
Admin UI button, Stripe webhook auto-sync, nightly cron, `country` field.
