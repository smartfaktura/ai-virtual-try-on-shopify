

## Refactor: Align Freestyle with Try-On Architecture

Restructure `generate-freestyle` to match the proven `generate-tryon` pattern exactly, fixing the timeout issues.

### Key Differences Causing Problems

| Aspect | Try-On (works) | Freestyle (broken) |
|--------|----------------|-------------------|
| AI Model | Always `gemini-2.5-flash-image` | Auto-upgrades to `gemini-3-pro-image-preview` (slow) |
| Storage | Uploads inside function, returns URLs | Returns raw base64, process-queue uploads |
| Timeout | None needed (fast model) | None present (slow model hangs) |
| Supabase client | Creates client for storage upload | No client at all |

### Changes

#### 1. `supabase/functions/generate-freestyle/index.ts` -- Full Restructure

**Add Supabase client + storage upload (copy from try-on):**
- Import `createClient` from supabase-js (line 1 area)
- Add `uploadBase64ToStorage()` function identical to try-on's, but targeting the `freestyle-images` bucket
- Add `getUserIdFromJwt()` helper (copy from try-on)

**Add timeout to AI fetch (line 315):**
- Add `signal: AbortSignal.timeout(50_000)` to the AI gateway fetch call

**Queue-mode optimizations:**
- Detect `x-queue-internal` header (like try-on does at line 228)
- When queue-internal: cap `imageCount` to 1, reduce `maxRetries` to 1
- Extract `user_id` from payload when queue-internal (same as try-on)

**Upload images inside the function (lines 527-571):**
- After each successful generation, call `uploadBase64ToStorage()` to upload to `freestyle-images` bucket
- Push the public URL (not base64) into the `images` array
- This matches try-on's pattern at lines 268-272

**Reduce retry delays (lines 342, 360, 373):**
- Change from `1000 * (attempt + 1)` to flat `500`ms

**Save to `freestyle_generations` DB inside the function:**
- When queue-internal, save each image record to `freestyle_generations` table directly (moving this logic out of process-queue)

#### 2. `supabase/functions/process-queue/index.ts` -- Simplify

**Add timeout to downstream fetch (line ~90):**
- Add `signal: AbortSignal.timeout(55_000)` to the fetch calling generation functions

**Multi-image freestyle loop:**
- For freestyle jobs with `imageCount > 1`: loop N sequential calls (1 image each), each with its own 55s timeout
- Collect URLs from each call; if some fail, continue (partial success)

**Remove duplicate freestyle logic (lines ~107-145):**
- Remove the entire `if (jobType === 'freestyle')` block that handles base64 upload and DB saves
- Since freestyle now uploads internally and saves DB records itself, process-queue just needs to collect the URLs from the response (same as it does for try-on)

### Result

After these changes, freestyle will follow the exact same flow as try-on:
1. Edge function receives request
2. Generates image with AI (with 50s timeout)
3. Uploads to storage internally
4. Returns public URL (not base64)
5. Process-queue just collects URLs and marks job complete

### Files Changed

| File | What Changes |
|------|-------------|
| `supabase/functions/generate-freestyle/index.ts` | Add supabase client, `uploadBase64ToStorage()`, `getUserIdFromJwt()`; add AbortSignal.timeout(50s); detect queue-internal header to cap imageCount=1, maxRetries=1, extract user_id; upload each image to storage and return URLs; save freestyle_generations record when queue-internal; reduce retry delays to 500ms |
| `supabase/functions/process-queue/index.ts` | Add AbortSignal.timeout(55s) to downstream fetch; loop multi-image freestyle as sequential 1-image calls; remove duplicate freestyle upload/DB-save block |

