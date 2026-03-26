

# Add Provider-Level Generation Observability

## What & Why
Currently you can't see how long the AI provider took, whether retries happened, or what the response looked like. This plan adds detailed per-attempt timing and outcome logging to `generate-freestyle` so you can debug slow or failed generations from the edge function logs.

## Changes

### File: `supabase/functions/generate-freestyle/index.ts`

**1. Add timing to `generateImage()` (Nano Banana)**
Wrap the `fetch` call with `performance.now()` timestamps. Log:
- Attempt number, model name
- Request duration in seconds
- HTTP status code
- Whether image was returned or null
- Content blocked reason if applicable

```
[NB] attempt=1/2 model=gemini-3-pro duration=127.3s status=200 hasImage=true
```

**2. Add timing to `generateImageSeedream()`**
Same pattern:
```
[SDR] attempt=1/3 model=seedream-4-5 duration=14.2s status=200 hasImage=true
```

**3. Add fallback event logging in the main generation loop (lines 1184-1210)**
When a cross-provider or inner fallback triggers, log it explicitly:
```
[FALLBACK] primary=gemini-3-pro result=null → trying gemini-3.1-flash
[FALLBACK] primary=nanobanana result=null → trying seedream-4.5
```

**4. Log total generation time**
Add a `performance.now()` at the start of the request handler and log total elapsed at completion:
```
[generate-freestyle] Job abc123 total elapsed: 146.2s (AI: 127.3s, upload: 3.1s, DB: 0.8s)
```

**5. Save provider metadata to queue result**
Add `providerUsed` and `durationMs` to the queue job's `result` JSONB so admin can query it later:
```typescript
result: { images, generatedCount, requestedCount, providerUsed: actualProvider, durationMs: elapsed }
```

## What This Does NOT Do
- No new tables or migrations
- No UI changes
- No changes to fallback logic or retry counts
- Does not affect generation behavior — logging only

## Files Modified
- `supabase/functions/generate-freestyle/index.ts` — add timing logs + provider metadata to result

