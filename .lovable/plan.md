
Fix `/app/catalog` so Generate never shows false completion or misleading counts.

Problem
- Catalog Studio currently runs in 2 client phases:
  1. hidden anchor jobs
  2. user-visible derivative shots
- `useCatalogGenerate.ts` starts the UI with `[anchors + placeholders]`, but polling only tracks real anchor jobs.
- On every poll, `batchState.jobs` is replaced with the anchor-only list, so placeholders disappear from the UI.
- `allDone` is then computed against anchors only. When anchors finish, the page can flip to `allDone=true` before derivative jobs even exist.
- `CatalogGenerate.tsx` filters out internal anchors and placeholders, so that premature completion state becomes: “Your Catalog is Ready” and `0 images generated`.
- The page already has `batchState.phase`, but the UI does not use it.

Implementation plan
1. Fix the completion logic in `src/hooks/useCatalogGenerate.ts`.
   - Add an explicit phase guard/ref so `allDone` can never become `true` during the anchor phase.
   - Only allow completion after derivative jobs have been enqueued and all real user-visible jobs are terminal.
   - Keep phase transitions strict: `anchors -> derivatives -> complete`.

2. Separate display state from polled state.
   - Keep placeholders visible during phase 1 instead of replacing the whole batch with anchor-only jobs.
   - Merge polled anchor updates into the displayed batch list.
   - When phase 2 starts, replace placeholders with the real derivative job records.
   - Add explicit metadata like `isPlaceholder` / `isUserVisible` in `src/types/catalog.ts` so the UI no longer depends on `jobId.startsWith('placeholder-')` or `shotId !== 'identity_anchor'`.

3. Remove phantom hidden work for pure product-only runs.
   - Finish the product-only pipeline cleanup by making the anchor optional/null when no model is selected.
   - Skip the hidden `front_flat` anchor entirely for product-only-only sessions.
   - This keeps packshot runs single-phase and avoids fake “preparing invisible anchor” behavior.

4. Make the `/app/catalog` UI honest in `src/pages/CatalogGenerate.tsx`.
   - Use `batchState.phase` to render phase-specific messaging:
     - `anchors`: “Locking consistency reference…”
     - `derivatives`: “Generating your selected shots…”
     - `complete`: success / partial success / failed
   - Never show “Your Catalog is Ready” when `visibleCompleted === 0`.
   - If all visible jobs fail, show a failure state instead of a success card.
   - Base progress and ETA on the correct phase so hidden anchors do not distort user-facing numbers.

5. Tighten start-state handling.
   - In `handleGenerate()`, only keep timer/start UI state if `startGeneration()` actually succeeds.
   - Keep session recovery compatible with the new metadata so restored batches do not instantly look complete or empty.

Files to update
- `src/hooks/useCatalogGenerate.ts`
- `src/pages/CatalogGenerate.tsx`
- `src/types/catalog.ts`
- `src/lib/catalogEngine.ts` (only for optional/no-anchor product-only flow)

Expected result
- Clicking Generate always shows a truthful in-progress state.
- No more premature “ready” screen with `0 images generated`.
- Product-only sessions begin directly with real shots.
- The final completion card appears only after actual user-visible outputs are done.

Technical details
```text
Current:
UI starts with [anchors + placeholders]
polling only knows about [anchors]
poll update overwrites UI with [anchors]
anchors finish -> allDone=true
UI hides anchors/placeholders -> 0 visible images
=> false success state

After fix:
UI keeps [anchors + placeholders] during phase 1
polling updates anchors without dropping placeholders
anchors finishing switches to derivatives, not complete
placeholders are replaced by real jobs
complete=true only after real visible jobs are terminal
```
