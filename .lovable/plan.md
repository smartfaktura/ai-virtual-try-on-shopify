

# Fix: Schedule "Paused" Label & Theme Verification

## Two Issues

### Issue 1: One-time schedule shows "Paused" after completion

After a one-time drop finishes, `trigger-creative-drop` sets `active: false, next_run_at: null`. The schedule card then shows "Paused" because line 124 of `DropCard.tsx` checks `!schedule.active`. A completed one-time schedule is NOT paused — it's done.

**Fix in `DropCard.tsx`**: Change the badge logic to distinguish "Completed" from "Paused":

```ts
const isCompleted = isOneTime && !schedule.active;
const isPaused = !schedule.active && !isCompleted;
```

- Badge: show "Completed" (green check) for `isCompleted`, "Paused" (gray) for `isPaused`, "Active" for active
- Hide the "Resume" / "Pause" toggle button for completed one-time schedules (it makes no sense to resume them)
- Dim the card slightly for completed schedules (same as paused)

### Issue 2: Winter theme not applied to try-on generation

The edge function log from 20:03 shows the prompt had NO `SEASONAL DIRECTION` block. This was because that generation ran on the **old version** of `generate-tryon` (before the theme injection code was added in our recent fix). The theme injection code IS now deployed — the next creative drop try-on generation should include it.

However, to be safe, there's one more gap: the `buildDropDirectionBlocks` function (line 129) checks `ctx.theme !== "custom"` — this is correct since `winter` !== `custom`. And `body.creative_drop_id` will be a real UUID (set at enqueue time, line 386 of trigger). So the condition at line 579 (`body.creative_drop_id ? { theme: body.theme, ... }`) should pass.

**No code fix needed for theme** — the deployed code should work now. The failed generation was from the pre-fix version.

**Recommendation**: Re-run the drop to verify the winter theme appears in the prompt.

## Changes

### File: `src/components/app/DropCard.tsx`

1. Add `isCompleted` detection for one-time schedules that have `active: false`
2. Badge shows "Completed" with a check icon and green styling instead of "Paused"  
3. Hide Pause/Resume button for completed one-time schedules
4. Hide "Run Now" from dropdown for completed schedules

~10 lines changed in 1 file.

