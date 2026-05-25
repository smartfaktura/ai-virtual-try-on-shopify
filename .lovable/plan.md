## Fix: JWT Signature Not Verified in `process-email-queue`

### Goal
Replace the unverified JWT payload decode with a strict bearer-token comparison against the real `SUPABASE_SERVICE_ROLE_KEY`. Matches the pattern already used in 6 other queue workers.

### File changed
`supabase/functions/process-email-queue/index.ts` — only this file.

### Changes
1. **Remove** the `parseJwtClaims` helper (≈lines 37–53).
2. **Replace** the auth block (≈lines 94–112) with:
   ```ts
   const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
   const expected = `Bearer ${supabaseServiceKey}`
   if (!authHeader || authHeader !== expected) {
     return new Response(JSON.stringify({ error: 'Forbidden' }), {
       status: 403,
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
     })
   }
   ```
3. Keep everything else (queue draining, send logic, cron polling, CORS, logging) untouched.

### Why this is safe
- The pg_cron dispatcher (created by `setup_email_infra`) already calls the function with the real `SUPABASE_SERVICE_ROLE_KEY` pulled from Vault secret `email_queue_service_role_key`. Legitimate calls match the new comparison exactly.
- The fix only tightens auth — it does not touch queue logic, templates, schedule, Vault, or DB.
- The identical pattern is already deployed and working in 6 other internal worker functions.
- If auth ever did fail mid-cycle, messages stay in pgmq and are retried on the next cron tick — no email loss.

### Deploy + verify
1. Redeploy `process-email-queue` only.
2. Wait one cron cycle (~5s).
3. Confirm `email_send_log` continues to record new `sent` rows (auth signups still flowing — currently ~420 sent, 0 failed).
4. Re-run security scan → `jwt_bypass_queue_internal` should clear.
5. If anything looks off, revert is a one-file rollback.

### Out of scope
- No DB migration.
- No config.toml change.
- No frontend change.
- No other edge functions touched.
- No Vault / cron / template changes.
