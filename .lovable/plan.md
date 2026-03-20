

# Fix Creative Drops: Remove Toast, Label Generation Bar, Add Schedule Feedback

## Issues

1. **Unnecessary toast**: "Drop created — generating now!" toast in `CreativeDropWizard.tsx` (line 556) is redundant — the GlobalGenerationBar already shows processing status.

2. **GlobalGenerationBar shows generic "Generation"**: Creative drop jobs have `creative_drop_id` in their payload but the bar just shows the workflow name (e.g., "Generation"). It should say "Creative Drop" or the drop/schedule name to distinguish from regular generations.

3. **Schedule card has no feedback after "Generate Now"**: After the wizard triggers a drop, the Schedules tab shows the same static card. No indicator that generation is in progress. The user should see a "Generating…" state on the schedule card, or be auto-switched to the Drops tab.

## Changes

### File 1: `src/components/app/CreativeDropWizard.tsx`
- **Line 556**: Remove `toast.success('Drop created — generating now!')` — the GlobalGenerationBar and the Drops tab provide feedback already.

### File 2: `src/components/app/GlobalGenerationBar.tsx`
- **Lines 192-196**: Check if `payload.creative_drop_id` exists on the job. If so, label the group as `"Creative Drop"` instead of the workflow name. Update the `ActiveJob` type and `groupJobsIntoBatches` input to pass through `creative_drop_id`.
- Also update the "View in Workflows" button to say "View in Creative Drops" and navigate to `/app/creative-drops` when the job is a creative drop job.

### File 3: `src/pages/CreativeDrops.tsx`
- After wizard `onSuccess` with `isNow`, auto-switch to the **Drops** tab (`setActiveTab('drops')`) so the user immediately sees the generating drop card with progress bar.

### File 4: `src/lib/batchGrouping.ts`
- Add `creative_drop_id` field to `ActiveJob` interface so the GlobalGenerationBar can detect creative drop jobs.

## Summary
- 4 files, ~15 lines changed
- Removes redundant toast
- Labels creative drop jobs distinctly in the global bar
- Auto-switches to Drops tab after launching so user sees progress immediately

