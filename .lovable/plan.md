
Root cause confirmed from code:

1) `src/pages/video/AnimateVideo.tsx` only renders UI for:
- pre-upload: `!isPipelineActive && !isComplete && !imageUrl`
- settings form: `!isPipelineActive && !isComplete && imageUrl`

There is no render branch for `isPipelineActive === true` (generation in progress) or `isComplete === true` (finished result), so the page can appear blank after clicking Generate.

2) `videoError` / pipeline errors are not surfaced in this page, so failed runs also lack visible recovery UI.

3) `src/hooks/useVideoProject.ts` sets `pipelineStage` to `generating` and triggers `startGeneration()`, but stage synchronization with `useGenerateVideo` is weak, which can leave UI state inconsistent.

Implementation plan:

## 1) Add missing render states in AnimateVideo page
File: `src/pages/video/AnimateVideo.tsx`

- Add a dedicated “pipeline active” block (for `isPipelineActive`) using existing stage messaging (`getStageMessage`) and elapsed timer.
- Add a dedicated “complete” block (for `isComplete`) that renders `VideoResultsPanel` with:
  - `videoUrl`
  - `sourceImageUrl` from uploaded image
  - `generationContext` from `buildGenerationContext()`
  - actions: `onReuse`, `onQuickVariation`, `onNewProject`
- Add an explicit error block when generation fails (`videoStatus === 'error'` or pipeline error), with clear retry CTA.

## 2) Harden pipeline state syncing
File: `src/hooks/useVideoProject.ts` (and small contract update in `src/hooks/useGenerateVideo.ts`)

- Ensure `runAnimatePipeline()` reacts to generation start failure (e.g., duplicate in-flight video) instead of staying in generating state.
- Synchronize `pipelineStage` with `generateVideo.status` (`complete` / `error`) via effect or explicit callbacks.
- Keep `isPipelineActive` derived from both pipeline stage + generator status to prevent blank-state gaps.

## 3) Keep prompt behavior single-shot-safe (no editing language)
File: `src/lib/videoPromptTemplates.ts` (small guard)

- Add/confirm prompt guardrail language for one continuous shot behavior (no “cut”, “split-screen”, multi-edit sequencing), matching model constraints for image-to-video.

## 4) QA checklist (manual end-to-end)
- Upload image → wait analysis → Generate.
- Confirm progress UI is visible during create/processing.
- Confirm results panel appears on success with playable video + actions.
- Trigger a failure path and confirm error UI + retry works.
- Validate quick variation runs again without blanking.

Technical details:
- Expected files touched: `AnimateVideo.tsx`, `useVideoProject.ts`, `useGenerateVideo.ts` (optional signature return), and optionally `videoPromptTemplates.ts`.
- No database schema or migration changes required.
