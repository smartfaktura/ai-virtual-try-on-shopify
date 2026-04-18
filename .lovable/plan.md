
The user sees the voiceover checkbox checked on each shot but the voiceover input field shows placeholder "Voiceover narration for this shot..." instead of actual narration text.

Looking at `ShotPlanEditor.tsx`: the VO row renders `shot.script_line` in the Input. If `script_line` is empty/undefined, the input shows the placeholder.

This means the AI Director planner did not populate `script_line` for these shots — even though the Voiceover audio layer is enabled and per-shot `vo_enabled` defaults to true.

Likely causes to verify:
1. `ai-shot-planner` edge function is not generating `script_line` per shot (or returns empty strings).
2. Auto planner (`durationPlanner.ts` / shot generator) doesn't include script lines — only AI Director does.
3. The current plan was generated under "Auto" mode (no AI script), but VO checkbox still appears checked because `vo_enabled !== false` defaults to true.

So the answer to the user: **it's not a bug-in-progress, it's expected** when shots have no script line yet. But the UX is misleading — the checkbox suggests VO is ready when nothing will actually be spoken.

**Plan — fix the misleading state:**

1. **`ShotPlanEditor.tsx`** — make the VO checkbox reflect reality:
   - Default the checkbox to *unchecked* when `script_line` is empty (treat empty script as VO disabled rather than enabled-but-empty).
   - Change check logic: `shotVoEnabled = shot.vo_enabled === true && !!shot.script_line?.trim()` for the visual checked state, OR auto-set `vo_enabled=false` when script is empty.
   - Add a subtle hint below empty VO inputs: "Add narration text to enable voiceover for this shot" instead of leaving it ambiguous.

2. **AI Director path** — when user clicks "AI Director" + Regenerate, ensure `ai-shot-planner` returns `script_line` for every shot that can hold VO (≥3s). Inspect `supabase/functions/ai-shot-planner/index.ts` to confirm the prompt asks for narration. If gaps exist, fix the prompt to always populate `script_line` when voiceover layer is on.

3. **Auto path** — when in Auto mode (no AI), suggest user either:
   - switch to AI Director to get scripts, OR
   - manually fill VO lines.
   Add a one-line empty-state hint at the top of the shot list when VO layer is on but zero shots have `script_line`.

**Files to edit:**
- `src/components/app/video/short-film/ShotPlanEditor.tsx` (checkbox truth + empty-state hint)
- `supabase/functions/ai-shot-planner/index.ts` (verify + enforce `script_line` output when VO enabled), then redeploy

**Result:** Voiceover checkbox only appears checked when there's actual narration text, and AI Director reliably fills script lines so users aren't surprised by silent shots.
