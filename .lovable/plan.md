# Start & End Video — Finish Plan (UI + Wiring)

Backend, prompt engine, validation, compatibility, credit pricing and the Kling edge function are already done. This plan completes the **UI layer + orchestration hook + route registration** so the workflow becomes fully usable end-to-end.

---

## What's missing (and what we'll add)

### 1. Route registration
**File:** `src/App.tsx`
- Add lazy import: `const StartEndVideo = lazy(() => import('@/pages/video/StartEndVideo'))`
- Add route under the existing video group:
  `<Route path="/video/start-end" element={<StartEndVideo />} />`

### 2. Orchestration hook
**File:** `src/hooks/useStartEndVideoProject.ts` (new)

Pipeline executed when user clicks **Generate Transition Video**:
1. Run `runTransitionPreflight(startFile, endFile)` → block on errors, surface warnings
2. Upload both images via `useFileUpload` → public URLs
3. Call existing `analyze-video-input` edge function once per image (parallel)
4. `resolveTransitionCompatibility(analysisStart, analysisEnd)` → tier + sharedElements
5. `buildTransitionPrompt({ goal, refinement, preservation, tier, sharedElements, note, category })` → prompt + negativePrompt + cfgScale
6. Insert `video_projects` row (`workflow_type: 'start_end'`, `settings_json` includes `tailImageUrl`, tier, goal)
7. Insert two `video_inputs` rows: start (`input_role: 'main_reference'`), end (`input_role: 'end_reference'`)
8. Call `useGenerateVideo.startGeneration({ imageUrl, tailImageUrl, prompt, negativePrompt, cfgScale, duration:'5', audioMode, aspectRatio:auto, workflowType:'startEnd' })`
9. Expose: `pipelineStage`, `analysisStart`, `analysisEnd`, `compatibility`, `videoUrl`, `videoError`, `isAnalyzing`, `isGenerating`, `isComplete`, `reset()`

### 3. New page
**File:** `src/pages/video/StartEndVideo.tsx` (new)

Mirrors `AnimateVideo.tsx` structure but slimmer (no bulk mode v1):
- `PageHeader` (title: "Start & End Video", subtitle: "Cinematic transitions between two frames")
- `<StartEndUploadPair>` — two upload slots
- `<ValidationWarnings>` — preflight output
- `<CompatibilityCard>` — appears after both analyses complete
- `<TransitionGoalSelector>` — 8 presets
- `<TransitionRefinementPanel>` — style, camera feel, motion strength, smoothness, realism
- `<PreservationRulesPanel>` — reused, smart defaulted from tier + category
- `<AudioModeSelector>` — silent / ambient
- `Textarea` — optional Transition Note
- `<TransitionSummaryCard>` — recap rows
- Generate row: `<CreditEstimateBox>` + primary CTA (disabled until preflight pass + both analyses done)
- `<VideoResultsPanel>` — reused for result + retry
- `<NoCreditsModal>` — reused

### 4. New components — `src/components/app/video/start-end/`

- **`StartEndUploadPair.tsx`** — two `UploadSlot` cards side-by-side (desktop `grid-cols-2`) with absolute-centered chevron-right chip; stacked on mobile with arrow-down icon. Each slot supports drag/drop, paste, file picker, and "Pick from Library" (`LibraryPickerModal`). Shows per-slot upload progress + thumbnail preview + remove button.

- **`CompatibilityCard.tsx`** — colored badge (Strong/Good/Risky/Weak using brand-safe variants — never alarming red), one-line reason, optional recommendation link (e.g. weak tier suggests "Try Ad Sequence instead").

- **`TransitionGoalSelector.tsx`** — 2-col mobile / 4-col desktop card grid using `TRANSITION_GOALS` from `transitionMotionRecipes.ts`. Selected state matches `MotionGoalSelector` styling (ring + tinted bg).

- **`TransitionRefinementPanel.tsx`** — grouped segmented controls (2-col grid) for: Style, Camera Feel, Motion Strength (Low/Med/High → maps to `cfg_scale` 0.3/0.5/0.7), Smoothness, Realism. Each group uses `InfoTooltip`.

- **`TransitionSummaryCard.tsx`** — muted-bg card with label · value rows for: Goal, Style, Motion, Camera, Audio, Tier, Note (if set), Estimated credits.

### 5. Wiring details

- `useGenerateVideo` already accepts `tailImageUrl` (done). Page passes it through.
- `estimateStartEndCredits` already exported from `videoCreditPricing.ts` (done). Page calls it whenever refinement changes.
- VideoHub card already links to `/app/video/start-end` (done) — only the route + page need to exist for it to work.

---

## Acceptance criteria

1. Navigating to `/app/video/start-end` renders the new page (no 404).
2. Uploading two same-AR images shows compatibility tier + enables Generate.
3. Different-AR images block generation with inline error from preflight.
4. Generate triggers the pipeline; result video appears in `VideoResultsPanel` and is saved to Library.
5. Edge function receives `image_tail` in payload (already supported); no `camera_control` is sent (already stripped).
6. Credits are deducted via existing queue logic; failures refund via existing triggers.
7. Mobile layout stacks slots with arrow-down divider; desktop shows side-by-side with chevron-right chip.

---

## Files touched (final tally)

**Create (7):**
- `src/pages/video/StartEndVideo.tsx`
- `src/hooks/useStartEndVideoProject.ts`
- `src/components/app/video/start-end/StartEndUploadPair.tsx`
- `src/components/app/video/start-end/CompatibilityCard.tsx`
- `src/components/app/video/start-end/TransitionGoalSelector.tsx`
- `src/components/app/video/start-end/TransitionRefinementPanel.tsx`
- `src/components/app/video/start-end/TransitionSummaryCard.tsx`

**Edit (1):**
- `src/App.tsx` — add lazy import + route

No DB migrations. No edge function changes. No new secrets.
