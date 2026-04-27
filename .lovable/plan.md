# Fix: `/app/video/start-end` — generation, recovery, credits, and pill buttons

## Findings (what's actually happening)

### 1. The "stuck Generating" + last video
The job the user kicked off **completed successfully**:
- `generation_queue` row `9ecd07f8…` → `status=completed` at 06:17:13 UTC.
- `generated_videos` row `7a8ea433…` → `status=complete`, `video_url` is a real `.mp4` in storage.
- `kling_task_id`: `877623997259714608`.

So the backend pipeline works. What broke is the **client UI**: the page caught a runtime React error (the "The app encountered an error" overlay in the screenshot) mid-generation, the local `useGenerateVideo` `status` stayed at `'queued'`/`'processing'`, and after reload the page resets to the empty form — there's no path back to the finished video unless the user goes to the Library / Video hub.

### 2. The "nothing happens after Generate"
Two things contribute:
- The runtime overlay was triggered by the same render; once the user dismissed it, the spinner kept going because the activeJob ref had been cleared by the reset/reload sequence.
- We never tell the user that the result is in their Library. There's no "you have a recent transition video — open it" affordance on this page.

### 3. Credits logic is inconsistent
- **Frontend** (`videoCreditPricing.ts`) charges Start & End at **12 credits base** + 2 for premium style + 4 for ambient audio.
- **Backend** (`enqueue-generation/index.ts → calculateCreditCost`) for `jobType === "video"` charges **10 credits base** (the animate price) regardless of `workflow_type`. The Start & End premium-style add-on isn't honored either.
- Result: the UI says 12 (or 14), the user is actually charged 10. Misleading; also blocks future pricing for premium transition styles.

### 4. The Upload / Library buttons don't match the app pill aesthetic
Currently `rounded-lg` rectangles. The rest of the app uses `rounded-full` pill buttons with the Folder/Image icons.

## Fixes

### A. Backend credit calculation — honor workflow type
`supabase/functions/enqueue-generation/index.ts`:

In `calculateCreditCost`, when `jobType === "video"`, branch on `payload.workflow_type`:

```ts
const wf = String(payload?.workflow_type || "");
if (wf === "start_end") {
  let cost = 12;                                  // base 5s
  const style = String(payload?.transition_style || payload?.style || "");
  if (["cinematic", "editorial"].includes(style)) cost += 2;
  if (audio === "ambient") cost += 4;
  return cost;
}
```

Forward `style` from the Start & End hook to the edge function so the backend can read it: in `useStartEndVideoProject.runPipeline`, pass `style` into `generateVideo.startGeneration` (we'll extend `startGeneration` to forward `transitionStyle` into `payload.transition_style`). Animate / other workflows keep current pricing.

### B. Recover the user's last finished Start & End video
In `useStartEndVideoProject`, fetch the most recent `generated_videos` row for this user where the linked project's `workflow_type='start_end'` and `status='complete'`. If found within the last 24 hours and the local UI is on the empty form (no in-flight pipeline), expose:

```ts
recentResult: { id, videoUrl, sourceImageUrl, createdAt } | null
```

Render a slim banner at the top of `StartEndVideo.tsx`:

> ✓ Your last transition is ready — `View video` (opens the result panel) · `Start a new one` (dismiss).

Clicking "View video" hydrates the Results panel (`videoUrl`, `sourceImageUrl`) without re-spinning anything.

### C. Don't get stuck on "Generating…" again
- In `useGenerateVideo`, when `queue.activeJob` becomes `null` while local `status` is still `creating`/`queued`/`processing`, run a one-shot reconciliation: query `generated_videos` for the latest row with this `project_id` (passed in `meta`). If it's `complete`, set `status='complete'` and surface `videoUrl`. If it's `failed`, surface the error. Otherwise reset to `idle`.
- Add a hard client safety net inside `useStartEndVideoProject`: if `pipelineStage === 'queued' || 'processing'` for > 10 minutes with no `activeJob`, automatically run the recovery query above and either flip to `complete` or to `error`.

### D. Pill-style Upload / Library buttons
`StartEndUploadPair.tsx`:
- Both buttons → `rounded-full h-9 px-4 text-xs gap-1.5`.
- Same pill recipe used by other CTAs: `border-border bg-background hover:border-primary/40 hover:bg-primary/[0.04] hover:text-foreground transition-colors`.
- Slightly more space between them (`gap-2.5`) and align to a single row on `sm+` (already set).
- Loading state inside the buttons stays `Loader2` icon.

No changes to other section card recipes (Goal, Refinement, Preservation, Audio, Summary) — they stay as they are now.

### E. Surface the right error message
Right now any pipeline failure shows a toast "Failed to start transition" and bubbles to a `ValidationWarnings` block at the bottom. Move that warning **above** the Generate bar and prefix with the queue's own error if available (`generateVideo.error`), so the user sees it inline next to the button instead of below the fold.

## Files touched

- `supabase/functions/enqueue-generation/index.ts` — workflow-aware video pricing.
- `src/hooks/useGenerateVideo.ts` — extend `startGeneration` params with `transitionStyle`; add reconciliation when activeJob disappears mid-flight.
- `src/hooks/useStartEndVideoProject.ts` — pass `transitionStyle`, fetch recent result, expose `recentResult` + `loadRecentResult()`, add 10-min safety reconciliation.
- `src/pages/video/StartEndVideo.tsx` — recent-result banner at the top, error block above the generate bar.
- `src/components/app/video/start-end/StartEndUploadPair.tsx` — pill-style Upload / Library buttons only.

## What stays the same

- Goal / Refinement / Preservation / Summary card layouts — no further restyling.
- LibraryPickerModal (already polished in the previous pass).
- The cinematic prompt builder, preflight, compatibility resolver, and the rest of the generation pipeline.
