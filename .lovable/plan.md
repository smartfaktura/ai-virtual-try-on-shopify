

# Short Film — Phase 4: AI Director + Resilience

## Current Status
Phases 1–3 are complete: 6-step UI, real uploads, Scene/Model Library pickers, inline shot editing with reorder, script lines per shot, tone override, credits badge, and real generation via `generate-video` with DB persistence and polling.

## What to build next

### 1. AI-Powered Shot Plan Generation
Replace the deterministic `generateShotPlan()` with an optional AI mode. Create an edge function `ai-shot-planner` that calls Lovable AI (gemini-3-flash-preview) to generate a creative, context-aware shot plan based on film type, story structure, references, and any script input. Add a toggle in the shot plan step: "Auto Plan" (current preset logic) vs "AI Director" (calls the edge function). Parse the AI response into `ShotPlanItem[]`.

### 2. Start Over / Reset Flow
Add a "Start Over" button in the bottom nav bar (visible after step 1). Resets all state: filmType, storyStructure, references, shots, settings, shotStatuses back to defaults.

### 3. Save Draft Projects
Persist partial project state to `video_projects` with `status: 'draft'` when the user leaves mid-flow or clicks "Save Draft". On return, allow loading the last draft. Add a `draft_state_json` column or reuse `settings_json` to store the full form state.

### 4. Retry Individual Failed Shots
When generation completes with some failed shots, show a "Retry" button on each failed shot card. Clicking it re-invokes `generate-video` for just that shot and resumes polling.

### 5. Stitch / Preview Final Film
After all shots complete, add a "Preview Film" button that plays all clips sequentially (simple JS-based playlist, no server-side stitching). Optional: call an edge function to concatenate clips into a single MP4 using ffmpeg if available.

## Implementation order
1. AI Shot Planner edge function + toggle UI (highest impact)
2. Start Over / Reset (quick win)
3. Retry failed shots (resilience)
4. Save draft projects (requires migration)
5. Preview/stitch final film (polish)

## Files to create/change

| File | Action |
|------|--------|
| `supabase/functions/ai-shot-planner/index.ts` | New — edge function calling Lovable AI to generate shot plans |
| `src/hooks/useShortFilmProject.ts` | Add `resetProject()`, `retryShotGeneration()`, AI plan mode toggle |
| `src/components/app/video/short-film/ShotPlanEditor.tsx` | Add "AI Director" vs "Auto Plan" toggle button |
| `src/pages/video/ShortFilm.tsx` | Add "Start Over" button, retry UI on failed shots, sequential preview player |
| `src/components/app/video/short-film/ShortFilmProgressPanel.tsx` | Add per-shot retry button for failed shots |
| `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx` | New — sequential playlist player for completed clips |
| DB migration | Add `draft_state_json` column to `video_projects` (for save draft feature) |

