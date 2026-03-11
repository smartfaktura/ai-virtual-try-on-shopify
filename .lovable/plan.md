

## Stuck Generation: Root Cause & Fix

### What happened
Job `f8ff9636` (freestyle, 14:35:35 UTC) crashed immediately with `ReferenceError: Cannot access 'resolution' before initialization` at line 796 of the **deployed** `generate-freestyle` function. The crash happens before the function can update the queue status to "failed," so it stays stuck in "processing" until the 5-minute watchdog cleans it up and refunds credits.

This is the **same stale deployment bug** identified last time. The code on disk is correct and does not contain this `resolution` variable issue, but the deployed edge function is still running the old buggy version.

### Fix
Add a trivial comment to `supabase/functions/generate-freestyle/index.ts` to force a redeployment. This will sync the deployed function with the current (correct) code on disk that has no `resolution` variable bug.

Single-line comment addition at the top of the file — no logic changes needed.

