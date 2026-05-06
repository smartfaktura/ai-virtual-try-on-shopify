
# Bundle Visuals — Generation UX Improvements

## Issues Found

1. **Step 5 (Generating) is bare** — Only a spinner + "X/Y complete" text. No progress bar, no time estimate, no branded experience. The project already has `MultiProductProgressBanner` with all these features.

2. **Auto-redirect on completion** — Navigates to `/app/library` immediately, giving no sense of accomplishment or context about what was generated.

3. **No visual feedback during enqueue phase** — Between pressing "Generate" and jobs starting, there's no indication of progress.

## Fixes

### 1. Use `MultiProductProgressBanner` in Step 5

Replace the bare spinner with the existing branded progress component that provides:
- Animated progress bar with time-based floor
- Elapsed timer + smart time estimate
- Rotating team member messages ("Tomas is composing your bundle...")
- Overtime warnings when jobs take longer than expected
- Product chips showing which items are in the bundle

Wire: `totalExpectedImages`, `generatingProgress = (completedJobs/expectedJobCount)*100`, `workflowName = "Bundle Visuals"`, product queue from selected products.

### 2. Completion state with results summary

Instead of auto-navigating to library:
- Show a success state with checkmark animation
- Display count: "3 bundle images ready"
- Two buttons: **"View in Library"** (primary) and **"Create Another Bundle"** (ghost, resets to Step 1)
- Keep the success state until user clicks

### 3. Better enqueue phase feedback

Add a "Preparing..." state before polling starts (while base64 conversion + enqueue happens). Show "Uploading product images..." then "Queuing generations..." so user sees activity from the moment they click Generate.

### 4. Progress percentage calculation fix

Current: raw `completedJobs / expectedJobCount`. 
Improved: Account for enqueue phase (0-15%) + generation phase (15-100%), so progress never jumps from 0 to 30%.

## Files to modify

- `src/pages/BundleVisuals.tsx` — All changes contained here (import + use MultiProductProgressBanner, add completion state, improve progress tracking)

## Safety

- Zero edge function changes
- Zero database changes
- Zero changes to shared components
- Only the Bundle Visuals page is touched
