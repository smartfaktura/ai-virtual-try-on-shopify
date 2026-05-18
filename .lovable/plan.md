# Fix: "Generate talking video" button does nothing

## Root cause

From the session replay: you typed a script and clicked the button, but the button is **`disabled`** (rrweb confirms the `disabled` attribute is set). No network request fires, no logs are produced — that's why the button "doesn't work".

It's disabled because `canGenerate` in `src/pages/video/TalkingVideo.tsx` requires:

```ts
const canGenerate = !!imageUrl && charCount > 0 && charCount <= MAX_SCRIPT && !isSubmitting;
```

You haven't uploaded a reference photo yet, so `imageUrl` is null and the button silently locks. There's no message explaining what's missing — that's the real bug.

The backend (`enqueue-generation`, `generate-talking-video`, `process-queue` routing) is wired correctly and ready; we just never reach it.

## Fix (frontend only — no backend changes)

In `src/pages/video/TalkingVideo.tsx`:

1. **Stop disabling the button silently.** Keep it enabled, run a validation function on click, and show a clear toast for each missing piece:
   - "Add a reference photo first" → scrolls to Step 1
   - "Write a short script first"
   - "Script is too long — keep it under 120 characters"
   - Only disable while `isSubmitting` (with the existing spinner)
2. **Inline hint under the CTA** when something is missing, e.g. *"Add a reference photo to continue"* in muted text — so the user sees the blocker without having to click.
3. **Step badges** ("1 Reference · 2 Script · 3 Voice · 4 Duration") get a subtle ✓ when complete and a faint dot when pending, so missing steps are visible at a glance.
4. Keep all current validation logic in `useTalkingVideoProject.start` as a safety net (already there).

## Out of scope

- No edge function changes, no `enqueue-generation` changes, no DB changes, no Kling pipeline changes. Existing queue/video workflows are untouched.

## Acceptance

- Clicking the button with no image shows a toast and the inline hint — no silent failure.
- Once a photo is uploaded and a script is entered, the button enqueues the job and navigates to `/app/video` as before.
