

## Final Cleanup: Remove All Dead Code Leftovers

Two changes to clean up the last remnants of the old direct-call pattern.

---

### Change 1: Remove dead `video` priority boost from SQL function

**What**: The `enqueue_generation` database function still has `IF p_job_type = 'video' THEN v_priority := v_priority + 10; END IF;` -- video jobs are rejected before reaching this point.

**Fix**: Run a migration to recreate the function without that line.

---

### Change 2: Clean up `useGenerateFreestyle` dead hook in Freestyle.tsx

**What**: `Freestyle.tsx` line 53 still imports `useGenerateFreestyle` and destructures `generate`, `isLoading`, and `progress`. The `generate` function is never called (all generation goes through `enqueue()`), but `isLoading` and `progress` are still referenced in several places:

| Location | Variable | Current behavior | Fix |
|----------|----------|-----------------|-----|
| Line 120: `canGenerate` check | `isLoading` | Always `false` (harmless but misleading) | Replace with `isProcessing \|\| isEnqueuing` |
| Line 332-333: `panelProps` | `isLoading`, `progress` | Always `false`/`0` -- progress bar in FreestylePromptPanel never shows | Replace with queue-derived state |
| Line 382: gallery visibility | `isLoading` | Always `false` | Replace with `isEnqueuing` |
| Line 395: `generatingCount` | `isLoading` | Always `false` | Replace with `isEnqueuing` |
| Line 396: `generatingProgress` | `progress` | Always `0` | Remove or use indeterminate |

**Fix**: 
- Remove the `useGenerateFreestyle` import and hook call entirely
- Add `isEnqueuing` to the `useGenerationQueue` destructuring
- Replace all `isLoading` references with `isEnqueuing || isProcessing`
- Replace `progress` in panelProps with a queue-aware value (indeterminate pulse when processing)
- Update `FreestylePromptPanel` progress bar: show an indeterminate/pulse `Progress` when `isLoading` is true (since progress will always be 0 from queue perspective)

### Technical details

**Files to change**:

| File | Change |
|------|--------|
| Database migration | Remove `IF p_job_type = 'video'` line from `enqueue_generation` |
| `src/pages/Freestyle.tsx` | Remove `useGenerateFreestyle` import and hook; add `isEnqueuing` to queue destructuring; replace all `isLoading`/`progress` references with queue state |
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Update progress bar to use indeterminate/pulse animation (since exact progress is unavailable from queue) |

