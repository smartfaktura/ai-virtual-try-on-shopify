

## Priority Queue System -- Final Implementation Plan

### Design Decisions (Resolved)

| Question | Decision | Why |
|----------|----------|-----|
| One queue entry per job or per image? | **Per job** (1 entry = 1-8 images) | Simpler to manage. Worker generates images in a loop within a single job. If timeout risk arises, we cap at 4 images max per job and split larger requests into 2 jobs at enqueue time. |
| Realtime vs polling? | **Polling every 3 seconds** | Simpler, no need to enable realtime publication, works reliably. Switch to Realtime later if needed. |
| Rate limit storage? | **In the edge function code** (not SQL) | Easy to change without migrations. A simple config object mapping plan to limits. |
| Stale job refund? | **Auto-refund** | No manual review needed. Failed/timed-out jobs always refund credits. |

---

### Phase 1: Server-Side Credit Deduction (Security Fix)

**Why first**: Credits are currently deducted client-side in `Generate.tsx`. Users can bypass this by refreshing. This must be fixed before anything else.

**Database migration:**

```sql
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT credits_balance INTO current_balance
  FROM profiles WHERE user_id = p_user_id FOR UPDATE;

  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', current_balance, p_amount;
  END IF;

  UPDATE profiles SET credits_balance = credits_balance - p_amount
  WHERE user_id = p_user_id;

  RETURN current_balance - p_amount;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE profiles SET credits_balance = credits_balance + p_amount
  WHERE user_id = p_user_id
  RETURNING credits_balance INTO new_balance;
  RETURN new_balance;
END;
$$;
```

**Edge function changes** (`generate-tryon`, `generate-product`, `generate-freestyle`, `generate-workflow`):
- Add credit check and deduction at the start using `deduct_credits()` via service role client
- On failure, call `refund_credits()` for unused images
- Return `credits_used` and `new_balance` in the response

**Frontend changes** (`Generate.tsx`, `Freestyle.tsx`, `CreditContext.tsx`):
- Remove all `deductCredits()` calls after generation
- Instead, update local balance from the `new_balance` returned by the edge function
- `CreditContext` keeps `deductCredits` only for optimistic UI updates, but the source of truth is server-side

---

### Phase 2: Queue Table and Enqueue Endpoint

**Database migration:**

```sql
CREATE TABLE public.generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL,
  priority_score INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'queued',
  payload JSONB NOT NULL,
  result JSONB,
  credits_reserved INTEGER NOT NULL DEFAULT 0,
  user_plan TEXT NOT NULL DEFAULT 'free',
  is_first_generation BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  timeout_at TIMESTAMPTZ
);

-- Performance indexes
CREATE INDEX idx_queue_status_priority ON generation_queue(status, priority_score, created_at)
  WHERE status = 'queued';
CREATE INDEX idx_queue_user_processing ON generation_queue(user_id)
  WHERE status = 'processing';
CREATE INDEX idx_queue_user_recent ON generation_queue(user_id, created_at DESC);

-- RLS
ALTER TABLE generation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own queue jobs"
  ON generation_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON generation_queue FOR ALL
  USING (true) WITH CHECK (true);
```

**Database function: `enqueue_generation`**

```sql
CREATE OR REPLACE FUNCTION public.enqueue_generation(
  p_user_id UUID,
  p_job_type TEXT,
  p_payload JSONB,
  p_credits_cost INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_plan TEXT;
  v_balance INTEGER;
  v_is_first BOOLEAN;
  v_priority INTEGER;
  v_concurrent INTEGER;
  v_max_concurrent INTEGER;
  v_job_id UUID;
  v_position BIGINT;
BEGIN
  -- Get user plan and balance (locked row)
  SELECT plan, credits_balance INTO v_plan, v_balance
  FROM profiles WHERE user_id = p_user_id FOR UPDATE;

  IF v_balance < p_credits_cost THEN
    RETURN jsonb_build_object('error', 'Insufficient credits', 'balance', v_balance);
  END IF;

  -- Check concurrent jobs
  SELECT count(*) INTO v_concurrent
  FROM generation_queue
  WHERE user_id = p_user_id AND status = 'processing';

  v_max_concurrent := CASE v_plan
    WHEN 'pro' THEN 4 WHEN 'growth' THEN 3
    WHEN 'starter' THEN 2 ELSE 1
  END;

  IF v_concurrent >= v_max_concurrent THEN
    -- Still enqueue, just won't be picked up until a slot opens
  END IF;

  -- Check if first-ever generation
  SELECT NOT EXISTS(
    SELECT 1 FROM generation_jobs WHERE user_id = p_user_id LIMIT 1
  ) INTO v_is_first;

  -- Calculate priority
  v_priority := CASE v_plan
    WHEN 'pro' THEN 10 WHEN 'growth' THEN 20
    WHEN 'starter' THEN 30 ELSE 50
  END;
  IF v_is_first THEN v_priority := v_priority - 20; END IF;
  IF p_job_type = 'video' THEN v_priority := v_priority + 10; END IF;

  -- Deduct credits
  UPDATE profiles SET credits_balance = credits_balance - p_credits_cost
  WHERE user_id = p_user_id;

  -- Insert job
  INSERT INTO generation_queue (user_id, job_type, priority_score, payload,
    credits_reserved, user_plan, is_first_generation)
  VALUES (p_user_id, p_job_type, v_priority, p_payload,
    p_credits_cost, v_plan, v_is_first)
  RETURNING id INTO v_job_id;

  -- Calculate position
  SELECT count(*) INTO v_position
  FROM generation_queue
  WHERE status = 'queued' AND (priority_score < v_priority
    OR (priority_score = v_priority AND created_at < now()));

  RETURN jsonb_build_object(
    'job_id', v_job_id, 'position', v_position,
    'priority', v_priority, 'new_balance', v_balance - p_credits_cost
  );
END;
$$;
```

**Database function: `claim_next_job`**

```sql
CREATE OR REPLACE FUNCTION public.claim_next_job()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_job RECORD;
BEGIN
  SELECT * INTO v_job
  FROM generation_queue
  WHERE status = 'queued'
  ORDER BY priority_score ASC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('job', null);
  END IF;

  UPDATE generation_queue
  SET status = 'processing',
      started_at = now(),
      timeout_at = now() + interval '5 minutes'
  WHERE id = v_job.id;

  RETURN jsonb_build_object('job', row_to_json(v_job));
END;
$$;
```

**New edge function: `supabase/functions/enqueue-generation/index.ts`**
- Accepts job type + payload from frontend
- Calculates credit cost based on job type, image count, quality
- Calls `enqueue_generation()` DB function
- Fire-and-forget triggers `process-queue` via internal fetch
- Returns job ID + position immediately

---

### Phase 3: Queue Worker

**New edge function: `supabase/functions/process-queue/index.ts`**

Loop pattern (stays under 60s timeout):

```text
Start
  |
  v
claim_next_job() -> got a job?
  |                    |
  No -> exit           Yes
                       |
                       v
              Route to generate-tryon / generate-product /
              generate-freestyle / generate-workflow via fetch()
                       |
                       v
              Write results to generation_queue
              Also insert into generation_jobs (for library)
                       |
                       v
              Check elapsed time < 45s?
                       |
                  Yes -> loop back to claim_next_job()
                  No  -> exit
```

Key behaviors:
- Calls existing edge functions via internal HTTP (no refactoring needed)
- Passes `x-queue-internal: true` header so generation functions skip their own credit deduction (credits already deducted at enqueue)
- On failure: marks job as `failed`, calls `refund_credits()`
- On partial success (e.g., 3 of 4 images): marks complete, refunds unused image credits

**Stale job cleanup** (also in `process-queue`, checked on each invocation):

```sql
-- Find timed-out jobs
UPDATE generation_queue
SET status = 'failed', error_message = 'Timed out'
WHERE status = 'processing' AND timeout_at < now()
RETURNING user_id, credits_reserved;
-- Then refund each
```

---

### Phase 4: Frontend Changes

**New file: `src/hooks/useGenerationQueue.ts`**
- `enqueue(jobType, payload)` -- calls `enqueue-generation` endpoint
- Starts polling `generation_queue` table every 3 seconds for status
- Returns `{ status, position, results, error, cancel }`
- On `completed`: stops polling, delivers results
- On `failed`: stops polling, shows error, balance auto-refunded server-side

**New file: `src/components/app/QueuePositionIndicator.tsx`**
- Shows "Your job is #3 in queue..." with animated dots
- Shows "Generating your images..." when processing
- Shows progress as images complete (partial results from `result` JSONB)

**Modified: `src/pages/Generate.tsx`**
- Replace direct calls to `generateTryOn()`, `generateProduct()`, etc. with `enqueue()`
- Remove all `deductCredits()` calls
- Show `QueuePositionIndicator` during generation
- When results arrive, transition to results step as before

**Modified: `src/pages/Freestyle.tsx`**
- Same pattern: replace `generateFreestyle()` with `enqueue()`

**Modified: `src/contexts/CreditContext.tsx`**
- `deductCredits` becomes a local-only optimistic update
- Add `refreshBalance()` that re-fetches from `profiles` table
- Call `refreshBalance()` after any queue job completes

---

### Rate Limits (in edge function code, easy to change)

```typescript
const RATE_LIMITS: Record<string, { perHour: number; maxConcurrent: number }> = {
  pro:       { perHour: 999, maxConcurrent: 4 },
  growth:    { perHour: 100, maxConcurrent: 3 },
  starter:   { perHour: 50,  maxConcurrent: 2 },
  free:      { perHour: 10,  maxConcurrent: 1 },
};
```

---

### Files Summary

| File | Action |
|------|--------|
| SQL migration (deduct/refund functions) | Create |
| SQL migration (generation_queue table + enqueue/claim functions) | Create |
| `supabase/functions/enqueue-generation/index.ts` | Create |
| `supabase/functions/process-queue/index.ts` | Create |
| `supabase/functions/generate-tryon/index.ts` | Modify (skip credit deduction when called internally) |
| `supabase/functions/generate-product/index.ts` | Modify (same) |
| `supabase/functions/generate-freestyle/index.ts` | Modify (same) |
| `supabase/functions/generate-workflow/index.ts` | Modify (same) |
| `src/hooks/useGenerationQueue.ts` | Create |
| `src/components/app/QueuePositionIndicator.tsx` | Create |
| `src/pages/Generate.tsx` | Modify |
| `src/pages/Freestyle.tsx` | Modify |
| `src/contexts/CreditContext.tsx` | Modify |
| `supabase/config.toml` | Modify (add new function entries) |

### Implementation Order

Phase 1 first (security fix, works independently). Then Phase 2 + 3 together (queue + worker). Phase 4 last (frontend wiring). Each phase is deployable and testable on its own.

