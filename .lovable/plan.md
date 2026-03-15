

## Fix Perspectives Generating Error

### Problem
When enqueuing perspective jobs, hitting the 429 rate limit (max 4 concurrent) causes `break` to only exit the innermost ratio loop. The outer variation/product loops continue, triggering more failed enqueue attempts and error toasts. Additionally, `/app/perspectives` is not in `GlobalGenerationBar`'s `HIDDEN_PATHS`, so the global bar overlaps with the dedicated progress view.

### Changes

#### 1. `src/hooks/useGeneratePerspectives.ts` -- Fix `break` to exit all loops on 402/429

Replace the triple-nested loop with a `shouldStop` flag. When a 402 or 429 is received, set `shouldStop = true` and break. Check the flag at the start of each outer loop iteration to bail out entirely.

#### 2. `src/components/app/GlobalGenerationBar.tsx` -- Hide on perspectives page

Add `'/app/perspectives'` to `HIDDEN_PATHS` so the global generation bar doesn't show a duplicate progress indicator while the dedicated generating view is active.

### Files changed
| File | Change |
|------|--------|
| `src/hooks/useGeneratePerspectives.ts` | Add `shouldStop` flag to break out of all loops on 402/429 |
| `src/components/app/GlobalGenerationBar.tsx` | Add `/app/perspectives` to `HIDDEN_PATHS` |

