## Add 8 new Resend properties + safe backfill of all 1,187 contacts

### Source data
- ✅ in `profiles`: `subscription_status`, `current_period_end`, `referral_source`, `product_categories[]`, `updated_at`
- ⚙️ derived: `lifecycle_stage` from `plan` + `subscription_status`; `primary_category` from `product_categories[0]`
- 📊 aggregated once: `last_generated_at`, `total_generations` from `generation_jobs` + `freestyle_generations`
- ❌ `country` — no source column, skipped

### 1. Register the 8 new properties

Extend the array in `register-resend-properties/index.ts`. Idempotent — existing 4 just log "already exists" and continue.

| key | type | fallback |
|---|---|---|
| `lifecycle_stage` | string | `"lead"` |
| `subscription_status` | string | `""` |
| `subscription_renews_at` | string | `""` |
| `last_active_at` | string | `""` |
| `last_generated_at` | string | `""` |
| `total_generations` | number | `0` |
| `primary_category` | string | `""` |
| `referral_source` | string | `""` |

`lifecycle_stage` resolver: `subscription_status='active'` → `paid`; `'canceled'/'past_due'` → `churned`; `plan='free'` → `lead`; paid plan w/o active sub → `trial`.

### 2. Extend `sync-resend-contact` (per-event)

- Widen profile SELECT to include `subscription_status, current_period_end, referral_source, updated_at`.
- Add 8 new keys to `buildProperties()` using only profile columns (no aggregates — keeps signup fast).
- Add `total_generations` to `NUMERIC_PROP_KEYS`.
- Per-signup `last_generated_at` / `total_generations` stay empty; backfill fills them.

### 3. Extend `resync-resend-audience` — make it chunk-safe

Current function loops all profiles sequentially in one invocation. **Risk:** 1,187 sequential HTTP calls × ~200ms ≈ 4 min → Supabase edge function 150s timeout will kill it mid-run.

Changes:
- Accept query params `?offset=N&limit=M` (defaults: `offset=0`, `limit=300`).
- One bulk aggregate query before the loop builds a `Map<user_id, {last_generated_at, total_generations}>` — no N+1.
- Within the chunk, run PATCH/POST in **batches of 10 in parallel** (`Promise.allSettled`), then loop to the next batch. ~10× faster, fits comfortably under 150s for 300 contacts. No artificial sleep — Resend's published limit is high enough for this volume.
- Return `{ added, updated, failed, processed_from, processed_to, total_opted_in, has_more, next_offset }`.

### 4. Run backfill in 4 curl calls

```
POST /resync-resend-audience?offset=0&limit=300
POST /resync-resend-audience?offset=300&limit=300
POST /resync-resend-audience?offset=600&limit=300
POST /resync-resend-audience?offset=900&limit=300
```

Each completes in ~30–45s. Total wall time ~3 min. If any chunk fails, just re-run that one — PATCH is idempotent.

### 5. Verify

- Spot-check `info@tsimkus.lt` → all 12 properties populated.
- Check 1 free-tier contact and 1 churned contact → `lifecycle_stage` correct.
- Check Resend dashboard total contact count is unchanged (no duplicates).

### Safety summary
- ✅ No DB schema, RLS, billing, or email-send changes
- ✅ Re-runnable / idempotent at every layer
- ✅ Admin-gated; touches only Resend outbound
- ✅ Chunked + parallel-batched to fit edge function timeout
- ❌ No new rate limiting added (per project policy — Resend's volume is fine for 1,187 calls in batches of 10)

### Out of scope
- Admin UI button, Stripe webhook auto-sync, nightly cron, `country` — separate passes later if you want.