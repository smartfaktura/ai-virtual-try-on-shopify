

## Fix: Allow Large Batches (20+) in Product Perspectives

### Problem
Two hard limits block batches larger than 5-12 images:
1. **Client pre-flight check** (line 325): hardcoded `> 5` rejects any batch over 5 immediately — even with 0 active jobs
2. **DB burst limit** (Pro = 12 per 60s): with 20 images and 500ms stagger, all 20 enqueue within ~10s, hitting the 12-job burst cap

### Solution

#### 1. Remove hardcoded pre-flight limit (`src/hooks/useGeneratePerspectives.ts`)
- Delete the `> 5` pre-flight block entirely (lines 318-329). The DB function already enforces real limits — the client doesn't need to guess.

#### 2. Increase DB burst limits (`supabase migration`)
- Raise burst limits to accommodate perspective batches:
  - Pro: 12 → 25
  - Enterprise: 20 → 30
  - Growth: 6 → 15
  - Starter: 4 → 8
  - Free: 3 → 5

#### 3. Add retry-on-burst-limit logic (`src/hooks/useGeneratePerspectives.ts`)
- When a 429 is returned with `burst_limit` in the error, instead of `shouldStop = true`, **wait 10 seconds and retry** that same job (up to 2 retries). This lets large batches naturally pace themselves across burst windows without failing.
- Keep `shouldStop` for 402 (no credits) and non-burst 429s (hourly rate limit).

### Files changed
| File | Change |
|------|--------|
| `src/hooks/useGeneratePerspectives.ts` | Remove pre-flight check; add retry-with-backoff on burst 429s |
| New migration SQL | Increase burst limits for all plans |

