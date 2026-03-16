

## Recommendation: Add 429 retry with backoff to all generation functions

### What's happening
Line 560–561 in `generate-freestyle/index.ts` immediately throws on HTTP 429. Line 595–596 catches that thrown object and **re-throws it again**, bypassing the retry loop entirely. The job fails and refunds credits within 1–2 seconds. The same pattern exists in `generate-tryon` and `generate-workflow`.

### The fix (3 edge function files, same change)

**In `generateImage()` — replace the immediate 429 throw with backoff + retry:**

```typescript
// BEFORE (line 560-561):
if (response.status === 429) {
  throw { status: 429, message: "Rate limit exceeded..." };
}

// AFTER:
if (response.status === 429) {
  console.warn(`AI Gateway 429 (attempt ${attempt + 1}/${maxRetries + 1}) — backing off`);
  if (attempt < maxRetries) {
    await new Promise(r => setTimeout(r, 3000 * (attempt + 1))); // 3s, then 6s
    continue;
  }
  throw { status: 429, message: "Rate limit exceeded. Please wait and try again." };
}
```

**In the catch block (line 595–596) — add model fallback for 429 before re-throwing:**

If the primary model (e.g. Flash) exhausted retries on 429, try once with the alternate model (Pro or vice versa) before giving up. This works because rate limits are often per-model.

### Files changed

| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | 429 backoff in retry loop + model fallback |
| `supabase/functions/generate-tryon/index.ts` | 429 backoff in retry loop |
| `supabase/functions/generate-workflow/index.ts` | 429 backoff in retry loop |

No database changes. No UI changes. Credits still refund if all retries fail.

