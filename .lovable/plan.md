
# Fix plan: 120s failover from Nano Banana + guaranteed cross-model fallback

## What I found (from code + logs)
- The failed job (`1f447...`) ran **attempt=1/1** and timed out at **150s** on Nano Banana Pro.
- That happened because `canUseSeedream` is currently forced to `false` when `providerOverride === "nanobanana"`, so the fallback chain collapses to one attempt.
- Nano Banana Pro timeout is set to `150_000ms`, which is too close to runtime limits and leaves poor room for recovery.

## Implementation approach

### 1) Make provider override “primary preference”, not “no-fallback lock”
**File:** `supabase/functions/generate-freestyle/index.ts`
- Change fallback eligibility logic:
  - Keep Seedream disabled for edit mode.
  - Keep Seedream disabled if ARK key missing.
  - **Remove** the `providerOverride !== "nanobanana"` restriction from `canUseSeedream`.
- Result:
  - If user picks Nano Banana and it times out, attempt 2 can still try Seedream.
  - If user picks Seedream and it fails, attempt 2 can still try Nano Banana.

### 2) Enforce 120s failover on first attempt
**File:** `supabase/functions/generate-freestyle/index.ts`
- Add explicit timeout policy constants (centralized near provider code), e.g.:
  - `PRIMARY_ATTEMPT_TIMEOUT_MS = 120_000`
  - provider defaults for later attempts (NB Flash 90s, NB Pro 120s, Seedream ~90–120s configurable)
- Update `generateImage(...)` and `generateImageSeedream(...)` to accept optional timeout override.
- In `runFreestyleWithFallback(...)`, set attempt-specific timeout:
  - Attempt 1 uses max 120s.
  - Later attempts use shorter capped timeout so fallback can complete quickly.

### 3) Add wall-clock budget guard inside fallback executor
**File:** `supabase/functions/generate-freestyle/index.ts`
- Track executor start time.
- Before each fallback attempt, compute remaining budget and skip starting an attempt if too little time remains.
- Derive per-attempt timeout from remaining budget (`min(modelTimeout, remainingBudget - safetyBuffer)`).
- This prevents “doomed” late attempts and improves deterministic behavior under runtime constraints.

### 4) Improve observability for debugging
**File:** `supabase/functions/generate-freestyle/index.ts`
- Extend attempt logs to include:
  - timeout used for that attempt
  - elapsed total time
  - fallback reason (timeout/network/server)
- Keep final summary log chain so we can confirm real-world failover behavior.

## Validation checklist
1. Force Nano Banana primary, induce slow generation:
   - verify timeout near 120s
   - verify second attempt starts on Seedream.
2. Force Seedream primary:
   - verify timeout/failure triggers Nano Banana fallback.
3. Edit mode:
   - verify Seedream is still not used.
4. Confirm queue job ends cleanly (completed/failed) with no stuck processing rows and correct credit refund behavior.

## Scope
- No UI flow rewrite.
- No database migration.
- No queue architecture overhaul (queue already exists and is correct); this is fallback/timeout orchestration hardening in `generate-freestyle`.
