## Real problem found

`/app/generate/product-images` works because it runs through `generate-workflow`, which accepts internal queue calls even when the service-role token format differs after key rotation.

`/app/freestyle` runs through `generate-freestyle`, and its internal auth guard is stricter:

```text
x-queue-internal must be true AND Authorization must exactly equal the current service key
```

If the internal key format differs, `generate-freestyle` returns `403` before generation starts. Because `process-queue` currently dispatches fire-and-forget, it logs “dispatched” but does not see that `generate-freestyle` rejected the call. The queue row then stays stuck in `processing`.

That matches the live evidence:

- `hello@123presets.store` has freestyle job `61a69321-1822-41be-94cb-871b089f5436` stuck in `processing`
- `process-queue` says it dispatched that job
- `generate-freestyle` only shows boot/shutdown logs, no generation logs
- Product image workflow jobs for the same user completed successfully

## Fix plan

1. **Make freestyle internal auth match product-images**
   - Update `generate-freestyle` to use the same service-role JWT fallback logic already used by `generate-workflow`
   - Add a clear warning log when an internal queue request is rejected, so this cannot fail silently again

2. **Unstick the affected account**
   - Cleanly fail/cancel the stuck freestyle job for `hello@123presets.store`
   - Refund the reserved 6 credits if they were not already refunded

3. **Add a small safety check in the dispatcher**
   - Change `process-queue` dispatch from fully fire-and-forget to “confirm accepted” for immediate `403/500` responses
   - If the target function rejects immediately, mark the job failed/refunded instead of leaving it in `processing`

4. **Validate**
   - Confirm the stuck freestyle row is no longer active
   - Trigger/observe a fresh freestyle queue call reaches the actual generation logic
   - Confirm product-images remains unchanged

No new cron jobs, no model/prompt changes, no generation rewrite.