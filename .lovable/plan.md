

## Fix Copy Prompt + Improve Generation Performance

### Problem 1: "Copy prompt to editor" copies nothing

When the user leaves the prompt field empty, the system auto-builds a prompt from selected assets (product, model, scene). However, the auto-built prompt is constructed inside `handleGenerate` as a local variable (`finalPrompt`) and never stored. When `saveImages` runs, it saves `prompt` (the raw state = empty string). 

Every image in the gallery then has `prompt: ""`, so clicking "Copy prompt to editor" copies an empty string. The toast fires ("Prompt copied to editor") but nothing visible changes.

**Fix**: Track the effective prompt (the one actually sent to the AI) and save that to the database.

- Store the final effective prompt in a ref (`lastEffectivePromptRef`) during `handleGenerate`
- Use that ref value in the `saveImages` call instead of the raw `prompt` state
- This way images saved to the DB will always have the real prompt that was used

**File**: `src/pages/Freestyle.tsx`

---

### Problem 2: Generation is very slow (138 seconds for 1 image)

Edge function logs show:
- A network retry error (`error reading a body from connection`) caused a failed attempt + 2-second backoff before retrying
- Total processing time: 138 seconds for a single standard-quality image
- For multi-image requests, images are generated **sequentially** with 500ms delays between each

**Fixes**:

#### A. Parallelize multi-image generation (edge function)

Currently the loop at line 488 of `generate-freestyle/index.ts` runs `generateImage` calls one at a time. Switch to `Promise.allSettled` for concurrent generation. This cuts 4-image generation time from ~4x to ~1x.

**File**: `supabase/functions/generate-freestyle/index.ts`

#### B. Reduce retry delays

The current retry logic waits `1000 * (attempt + 1)` ms (1s, then 2s). Reduce to 500ms flat for faster recovery from transient errors.

**File**: `supabase/functions/generate-freestyle/index.ts`

#### C. Add connection timeout

There is no fetch timeout configured. A hanging connection wastes the full edge function runtime. Add an `AbortController` with a 90-second timeout per image request.

**File**: `supabase/functions/generate-freestyle/index.ts`

---

### Technical Summary

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Add `lastEffectivePromptRef` to track the actual prompt sent to AI; use it in `saveImages` call instead of raw `prompt` state |
| `supabase/functions/generate-freestyle/index.ts` | Parallelize multi-image generation with `Promise.allSettled`; reduce retry backoff to 500ms; add 90s per-request timeout via `AbortController` |

### Expected Results

- **Copy prompt**: Will now copy the actual prompt used for generation (including auto-built parts from assets)
- **Performance**: Multi-image generation will run in parallel instead of sequentially, cutting wall-clock time by up to 75% for 4-image batches. Single-image generation benefits from faster retries and connection timeouts preventing indefinite hangs.
