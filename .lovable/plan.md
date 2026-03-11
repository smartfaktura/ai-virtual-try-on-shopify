

## Fix: Resolution Not Passed to Generation Function

### Root Cause

In `supabase/functions/enqueue-generation/index.ts` line 132, the enriched payload that gets forwarded to `generate-freestyle` only includes `imageCount` and `quality`:

```typescript
const enrichedPayload = { ...payload, imageCount, quality };
```

The `resolution` field is extracted from the request body (line 77) but never added to the payload. So when `generate-freestyle` reads it on line 811, it gets `undefined` and defaults to `'1K'`, producing 1024x1024 images regardless of user selection.

### Fix

**`supabase/functions/enqueue-generation/index.ts`** — Line 132: Add `resolution` to the enriched payload:

```typescript
const enrichedPayload = { ...payload, imageCount, quality, resolution };
```

One line change, one file. The `resolution` variable is already destructured on line 77. The `generate-freestyle` function already reads and uses it correctly (line 811). It just never arrives because enqueue strips it.

