

# Short Film — Phase 5: Save Drafts, Project History, and Polish

## Current Status (Phases 1–4 complete)
The Short Film workflow has: 6-step UI with stepper, film type + story structure selectors, real reference uploads with Scene/Model Library pickers, interactive shot plan editor (reorder, inline edit, add/delete), AI Director mode via edge function, tone override, credits badge, real generation via `generate-video` with DB persistence and polling, retry for failed shots, "Start Over" reset, and a sequential preview player.

## What to build next

### 1. Save & Load Draft Projects
The `draft_state_json` column already exists on `video_projects`. Wire it up:
- Add a "Save Draft" button (visible from step 2 onward) that persists the current form state (filmType, storyStructure, references, shots, settings, planMode, current step) to a `video_projects` row with `status: 'draft'`
- On page load, check for the user's latest draft and offer a "Resume Draft" prompt
- Loading a draft restores all state and jumps to the saved step

### 2. Project History List
Add a small "My Films" section at the top of the Short Film page (or a collapsible panel) that lists the user's previous `video_projects` with `workflow_type: 'short_film'`. Show title, status (draft / processing / complete), date, and shot count. Clicking a completed project shows its clips; clicking a draft resumes it.

### 3. Per-Shot Source Image Selection
Currently all shots use the same source image (first product or scene reference). Allow each shot to optionally pick a different reference image from the uploaded set — useful for multi-product films or varied scenes. Add a small image selector dropdown on each `ShotCard` in edit mode.

### 4. Custom Story Structure Builder
When the user picks "Custom" structure, show an inline builder where they can add/remove/reorder roles (from a preset palette of ~15 roles) to compose their own narrative arc before generating the shot plan.

### 5. Export & Share
After generation completes, add:
- "Download All" button that downloads each clip individually (zip not needed — sequential download)
- "Copy Link" that creates a shareable public link to the project (requires a new `is_public` column on `video_projects` and a public viewer page)

## Implementation order
1. Save & Load Drafts (highest user value, column already exists)
2. Project History List (leverages draft + completed data)
3. Per-shot source image selection (improves generation quality)
4. Custom structure builder (advanced users)
5. Export & share (polish)

## Files to create/change

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Add `saveDraft()`, `loadDraft()`, per-shot source image logic |
| `src/pages/video/ShortFilm.tsx` | Add "Save Draft" button, "Resume Draft" prompt, project history panel |
| `src/components/app/video/short-film/ShortFilmProjectList.tsx` | New — lists user's short film projects |
| `src/components/app/video/short-film/ShotCard.tsx` | Add source image selector in edit mode |
| `src/components/app/video/short-film/CustomStructureBuilder.tsx` | New — drag-to-compose custom story roles |
| `src/components/app/video/short-film/StoryStructureSelector.tsx` | Integrate custom builder when "Custom" is selected |

