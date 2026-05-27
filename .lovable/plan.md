## Register Resend custom properties (one-off) + fix `credits_balance` type

### Why no admin gate
Correct — this is a **one-shot setup**. Resend's `/contact-properties` endpoint registers each key on the **account** (not per-contact). Once `plan`, `product_categories`, `signup_date`, `credits_balance` exist, every future PATCH to `/audiences/{id}/contacts/{email}` will persist them. We never need to call it again unless we add a new property key. So a public-but-unlisted edge function we hit once is fine — no admin role check, no UI button.

### 1. New edge function: `register-resend-properties`

`supabase/functions/register-resend-properties/index.ts`
- No JWT, no role check. Just reads `RESEND_API_KEY` from env.
- Loops the 4 properties and POSTs each to `https://api.resend.com/contact-properties`:

| key | type | fallback_value |
|---|---|---|
| `plan` | string | `"free"` |
| `product_categories` | string | `""` |
| `signup_date` | string | `""` |
| `credits_balance` | number | `0` |

- 2xx → success, capture returned `id`.
- Non-2xx (already exists / validation) → log status + body, continue. Fully idempotent.
- Returns `{ ok: true, results: [{ key, status, id?, error? }, …] }`.

### 2. Send `credits_balance` as a real number

In `supabase/functions/sync-resend-contact/index.ts` and `supabase/functions/resync-resend-audience/index.ts`:
- Stop running `credits_balance` through `toPropString` (which stringifies it).
- Build `properties` so string fields stay strings, and `credits_balance` is included as a `number` only when finite.
- Widen typing from `Record<string, string>` to `Record<string, string | number>`.

### 3. Trigger + verify

- Call `register-resend-properties` once via `curl_edge_functions` — confirm all 4 return 2xx with an `id`.
- Re-run `sync-resend-contact` for `info@tsimkus.lt`.
- Open Resend dashboard → contact → confirm all 4 properties show with correct values and `credits_balance` is numeric.

### Out of scope
- Multi-audience segmentation (Option A) — separate plan.
- Bulk backfill of all opted-in contacts — only after single-contact verification.
- No DB migrations, no UI changes, no admin role plumbing.