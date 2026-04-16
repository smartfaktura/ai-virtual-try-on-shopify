
# Fix loading avatar message hopping + freestyle survey trigger

## What I found
- Avatar message hopping is caused by render-time randomness. In generation banners like `QueuePositionIndicator`, the code calls `getRandomStatusMessage(currentMember)` during render, but the component rerenders every second because elapsed time updates. So the same avatar can show different lines before the avatar itself rotates.
- The same anti-pattern exists in several other progress/loading UIs, so this is a shared issue rather than a one-off.
- Freestyle survey counting is still inaccurate because `src/pages/Freestyle.tsx` increments the survey counter from `savedImages.length`. When old freestyle history loads, it can count that as a “new generation”.
- The Freestyle survey also loses its job-specific identity because it passes `resultId={activeJob?.id}`. After completion, `activeJob` is reset, so the card can fall back to a global freestyle dismiss key and suppress later surveys.

## Plan
1. Make avatar + message rotation stable
- Replace render-time random message selection with a stable message tied to the same rotation tick as the avatar.
- Update the shared helper in `src/data/teamData.ts` (or add a tiny shared helper) so messages only change when rotation changes, not on every rerender.
- Apply that fix to all current generation/progress UIs using `getRandomStatusMessage(...)` in render:
  - `src/components/app/QueuePositionIndicator.tsx`
  - `src/components/app/MultiProductProgressBanner.tsx`
  - `src/pages/Perspectives.tsx`
  - `src/pages/CatalogGenerate.tsx`
  - `src/components/app/WorkflowActivityCard.tsx`
  - `src/components/app/GlobalGenerationBar.tsx`

2. Fix Freestyle “3rd generation” counting
- Remove the `savedImages.length`-based survey counter effect from `src/pages/Freestyle.tsx`.
- Increment `vovv_fb_gen_count_freestyle` only when a freestyle job actually transitions to `completed`, once per job id.
- Preserve the current intended rule: show feedback on the true 3rd completed freestyle generation.

3. Keep the survey attached to the completed result
- In `src/pages/Freestyle.tsx`, store the completed freestyle job id in local state before the queue resets.
- Render `ContextualFeedbackCard` with that stored id instead of `activeJob?.id`.
- Gate the card on both `showFreestyleFeedback` and the stored completed result id so initial history loads cannot trigger or suppress the survey incorrectly.

## QA to verify
- On loading/progress screens, the same avatar keeps the same message while the timer updates; avatar and text rotate together on the intended interval.
- Opening Freestyle with existing old images does not increment the survey count.
- After 1 and 2 new Freestyle completions, no survey appears.
- After the 3rd new Freestyle completion, the survey appears reliably.
- After queue reset, rerender, and scene-hint transitions, the survey still remains tied to the correct completed result.

## Files
- `src/data/teamData.ts`
- `src/components/app/QueuePositionIndicator.tsx`
- `src/components/app/MultiProductProgressBanner.tsx`
- `src/pages/Perspectives.tsx`
- `src/pages/CatalogGenerate.tsx`
- `src/components/app/WorkflowActivityCard.tsx`
- `src/components/app/GlobalGenerationBar.tsx`
- `src/pages/Freestyle.tsx`
