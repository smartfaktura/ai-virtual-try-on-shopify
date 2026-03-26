

# Refactor Freestyle Fallback: Normalized ProviderResult + Clean 3-Attempt Chain

## Summary

Replace the mixed return types and scattered fallback branches in `generate-freestyle/index.ts` with a normalized `ProviderResult` type and a single `runFreestyleWithFallback()` executor. Remove Pro→Flash auto-downgrade. Limit to 3 total attempts per image: primary → other provider → final rescue on primary.

## Current Problems (lines referenced)

1. **Mixed types**: `GenerateResult = string | { blocked: true; reason: string } | null` (line 299), plus thrown `{ status: 429 }` objects and `Error` instances
2. **Pro→Flash silent downgrade** at lines 1216-1220
3. **Duplicated fallback logic**: lines 1206-1227 (normal path) AND lines 1303-1377 (429 catch path) — nearly identical code repeated
4. **No blocked-content detection** for Seedream

## Changes

### 1. Define `ProviderResult` and `FailureType` (replace line 299)

```typescript
type FailureType =
  | "rate_limit" | "credits_exhausted" | "server_error"
  | "timeout" | "network_error" | "no_image_returned"
  | "unsafe_block" | "invalid_request" | "auth_error" | "unknown";

type ProviderResult = {
  ok: boolean;
  imageUrl?: string;
  blocked?: boolean;
  blockReason?: string;
  failureType?: FailureType;
  retryable?: boolean;
  statusCode?: number;
  provider: "nanobanana" | "seedream";
  model: string;
  durationMs: number;
  rawError?: string;
};
```

Remove old `GenerateResult` type.

### 2. Rewrite `generateImage()` (lines 643-751) → returns `ProviderResult`

Every exit path returns a `ProviderResult` instead of throwing or returning mixed types:

| Current behavior | New `ProviderResult` |
|---|---|
| HTTP 429 → **throws** `{ status: 429 }` | `{ ok: false, failureType: "rate_limit", retryable: true }` |
| HTTP 402 → **throws** `{ status: 402 }` | `{ ok: false, failureType: "credits_exhausted", retryable: false }` |
| Other HTTP errors → **throws** Error | `{ ok: false, failureType: "server_error", retryable: true }` |
| Content blocked → returns `{ blocked, reason }` | `{ ok: false, failureType: "unsafe_block", blocked: true, retryable: false }` |
| No image in 200 → returns `null` | `{ ok: false, failureType: "no_image_returned", retryable: true }` |
| Timeout → **throws** Error | `{ ok: false, failureType: "timeout", retryable: true }` |
| Success → returns string | `{ ok: true, imageUrl: "..." }` |

**Key change**: No more internal retry loop inside `generateImage`. Each call = 1 attempt. The fallback executor handles all retries externally. This eliminates double-retry waste (currently retries 2x inside the function, THEN the outer loop retries again).

### 3. Rewrite `generateImageSeedream()` (lines 332-419) → returns `ProviderResult`

Same normalization. Additionally:
- Add basic content-moderation detection for Seedream responses (check for `code` field with moderation error codes in the ARK response body)
- No more internal retry loop — single attempt per call

### 4. Create `runFreestyleWithFallback()` — the centralized executor

```typescript
async function runFreestyleWithFallback(
  primaryProvider: "nanobanana" | "seedream",
  primaryModel: string,
  contentArray: ContentItem[],
  seedreamInput: { prompt: string; imageUrls: string[] } | null,
  opts: { aspectRatio: string; quality: string; apiKeys: { lovable: string; ark?: string } },
): Promise<ProviderResult>
```

**Fallback chain (3 attempts max)**:

```text
Attempt 1: primary provider
  → if ok: return
  → if terminal (unsafe_block, credits_exhausted, invalid_request, auth_error): return immediately
  → if retryable: continue

Attempt 2: switch to other provider
  → NB Pro failed → try Seedream 4.5
  → Seedream failed → try NB Pro (same model, not Flash)
  → if ok: return
  → if terminal: return
  → if retryable: continue

Attempt 3: final rescue on original provider
  → if ok: return
  → else: return final failure
```

**Rules enforced**:
- Never route Pro → Flash automatically
- Never exceed 3 attempts
- If Seedream ARK key is missing, skip Seedream attempts (chain shortens to 2)
- If `providerOverride === "nanobanana"`, skip Seedream fallback entirely
- If `imageRole === "edit"`, skip Seedream (it can't edit)

**Logging per attempt**:
```
[FREESTYLE] img=1 attempt=1/3 provider=nanobanana model=gemini-3-pro duration=127.3s result=timeout retryable=true
[FREESTYLE] img=1 attempt=2/3 provider=seedream model=seedream-4-5 duration=14.2s result=ok
```

### 5. Simplify the main generation loop (lines 1171-1394)

Replace the entire `if (useSeedream) { ... } else { ... }` block + the 429 catch block with:

```typescript
const seedreamInput = ARK_API_KEY ? convertContentToSeedreamInput(contentArray) : null;
const result = await runFreestyleWithFallback(
  useSeedream ? "seedream" : "nanobanana",
  useSeedream ? PROVIDERS["seedream-4.5"].model : aiModel,
  contentArray,
  seedreamInput,
  { aspectRatio: body.aspectRatio, quality: body.quality || "standard",
    apiKeys: { lovable: LOVABLE_API_KEY, ark: ARK_API_KEY } },
);

if (result.ok) {
  const publicUrl = result.imageUrl!.startsWith("http")
    ? await downloadAndUploadToStorage(...)
    : await uploadBase64ToStorage(...);
  images.push(publicUrl);
  actualProvider = `${result.provider}/${result.model}`;
  // ... existing heartbeat + save + early-finalize logic (unchanged)
} else if (result.blocked) {
  contentBlocked = true;
  blockReason = result.blockReason!;
  break;
} else if (result.failureType === "credits_exhausted") {
  // Terminal — return 402
  // ... existing queue completion logic
} else {
  errors.push(`Image ${i + 1}: ${result.failureType} (${result.rawError || "no details"})`);
}
```

This **removes**:
- The duplicated 429 catch block (lines 1303-1377)
- The Pro→Flash inner fallback (lines 1216-1220)
- The scattered cross-provider fallback blocks (lines 1206-1227)
- All `typeof result === "object" && "blocked" in result` type guards

### 6. Summary log per image

After the fallback executor returns, log one summary:
```
[FREESTYLE] img=1 summary: started=nanobanana/gemini-3-pro → timeout → seedream/seedream-4-5 → ok (total=141.5s)
```

## What This Does NOT Do

- No changes to workflows — Freestyle only
- No new tables or migrations
- No UI changes
- No changes to `completeQueueJob`, `saveFreestyleGeneration`, or prompt building
- Does not change which model is selected (Pro vs Flash selection logic stays)

## Files Modified

- `supabase/functions/generate-freestyle/index.ts` — new types, rewritten provider wrappers, new `runFreestyleWithFallback()`, simplified main loop

