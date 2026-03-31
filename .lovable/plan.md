

## Increase All Timeout Limits Across the Generation Pipeline

### Current Timeout Map

```text
Layer                              Current Value     Issue
─────────────────────────────────  ────────────────  ─────────────────────────────
DB: claim_next_job timeout_at      3 minutes         Too tight — cleanup_stale_jobs
                                                     may kill jobs still running

FREESTYLE:
  PRIMARY_ATTEMPT_TIMEOUT_MS       75s               Too short for Nano Banana Pro
  WALL_CLOCK_BUDGET_MS             140s              OK but tight with longer primary
  SAFETY_DEADLINE_MS               135s              OK
  MIN_ATTEMPT_BUDGET_MS            15s               OK
  Seedream per-call timeout        90s               OK
  Nano Banana Pro default          120s              Overridden by PRIMARY to 75s

WORKFLOW:
  PER_IMAGE_TIMEOUT (Gemini)       75s               Same issue
  MAX_WALL_CLOCK_MS                140s              OK
  Seedream per-call timeout        90s               OK

TRY-ON:
  Gemini per-attempt timeout       75s               Same issue
  MAX_WALL_CLOCK_MS                140s              OK
  Seedream per-call timeout        90s               OK

CLIENT:
  useGenerationQueue HARD_TIMEOUT  10 min            OK — no change needed
```

### Proposed Changes

| Location | Current | New | Rationale |
|----------|---------|-----|-----------|
| **DB function `claim_next_job`** | `timeout_at = 3 min` | `timeout_at = 5 min` | Give the full fallback chain time to complete before `cleanup_stale_jobs` kills the job |
| **freestyle `PRIMARY_ATTEMPT_TIMEOUT_MS`** | 75s | 100s | Nano Banana Pro needs 80-100s for complex prompts |
| **freestyle `WALL_CLOCK_BUDGET_MS`** | 140s | 270s | With 100s primary + 90s Seedream fallback, 140s is too tight. 270s gives both providers full time |
| **freestyle `SAFETY_DEADLINE_MS`** | 135s | 265s | 5s before wall clock budget |
| **workflow `PER_IMAGE_TIMEOUT`** | 75s | 100s | Same Nano Banana Pro issue |
| **workflow `MAX_WALL_CLOCK_MS`** | 140s | 270s | Match freestyle budget |
| **tryon Gemini timeout** | 75s | 100s | Same fix |
| **tryon `MAX_WALL_CLOCK_MS`** | 140s | 270s | Match freestyle budget |

### Why 270s for WALL_CLOCK?

```text
100s (Nano Banana Pro primary)
+ 5s  (overhead / logging)
+ 90s (Seedream fallback)  
+ 10s (upload + DB writes)
= 205s needed minimum

270s gives comfortable buffer.
Platform hard-kill is at 300s for edge functions.
```

### Files to Change

1. **DB migration** — Update `claim_next_job` function: change `timeout_at` from `interval '3 minutes'` to `interval '5 minutes'`

2. **`supabase/functions/generate-freestyle/index.ts`** (~line 798-800)
   - `PRIMARY_ATTEMPT_TIMEOUT_MS`: 75000 → 100000
   - `WALL_CLOCK_BUDGET_MS`: 140000 → 270000
   - `SAFETY_DEADLINE_MS`: 135000 → 265000

3. **`supabase/functions/generate-workflow/index.ts`** (~line 631, 882)
   - `PER_IMAGE_TIMEOUT`: 75000 → 100000
   - `MAX_WALL_CLOCK_MS`: 140000 → 270000

4. **`supabase/functions/generate-tryon/index.ts`** (~line 448, 707)
   - Gemini `AbortSignal.timeout`: 75000 → 100000
   - `MAX_WALL_CLOCK_MS`: 140000 → 270000

5. **`src/hooks/useLibraryItems.ts`** — Fix the existing TypeScript build errors (`.name` / `.image_url` on `unknown` type) with proper type casting

