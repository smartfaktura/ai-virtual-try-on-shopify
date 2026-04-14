

# Short Film — Premium Multi-Shot Brand Film Workflow

## Overview
Build the most advanced video workflow in VOVV: a guided, multi-step campaign director that turns product references, character/model references, scene references, and optional script input into a structured shot plan, then generates a multi-shot brand film.

This is a very large feature. The plan is split into **two phases** so you get a working, testable workflow sooner.

---

## Phase 1 — Core Workflow (UI + Shot Planner + Generation)

### What gets built

**1. New page: `src/pages/video/ShortFilm.tsx`**
A multi-step guided workflow page at `/app/video/short-film`.

Steps rendered as a vertical stepper or horizontal progress bar:

| Step | Name | What it does |
|------|------|-------------|
| 1 | Film Type | Choose from 8 presets (Product Launch, Brand Story, Fashion Campaign, Beauty Film, Luxury Mood, Sports Campaign, Lifestyle Teaser, Custom). Selection sets defaults for story structure, motion style, prompt tone. |
| 2 | References | Upload/select product refs, scene refs (from Scene Library), style/mood refs, optional model refs (from Model Library), optional logo/end frame. Uses existing `useFileUpload`, `useCustomModels`, `useProductImageScenes` hooks. |
| 3 | Story Structure | Choose from 4 preset structures (Hook→Reveal→Detail→Closing, etc.) or Custom. Each preset defines default shot roles. |
| 4 | Shot Plan | AI-generated shot plan displayed as draggable cards. Each card shows: shot number, role, purpose, scene source, camera motion, duration, optional script line. User can reorder, edit, add/remove shots. |
| 5 | Settings | Aspect ratio, audio mode (silent/ambient/voiceover), preservation level, visual polish. Clean final settings panel. |
| 6 | Review & Generate | Shot plan preview with Generate Short Film CTA. Per-shot progress during generation. |

**2. Shot Plan Engine: `src/lib/shortFilmPlanner.ts`**
- Takes film type + references + story structure → produces a `ShotPlan` object
- Each shot has: `shot_index`, `role`, `purpose`, `scene_type`, `camera_motion`, `subject_motion`, `duration_sec`, `script_line`, `product_visible`, `character_visible`
- Film type presets define defaults for shot count (3-6), pacing, motion style, prompt tone
- Story structure defines shot roles

**3. Shot Plan Types: `src/types/shortFilm.ts`**
```typescript
export type FilmType = 'product_launch' | 'brand_story' | 'fashion_campaign' | 'beauty_film' | 'luxury_mood' | 'sports_campaign' | 'lifestyle_teaser' | 'custom';
export type StoryStructure = 'hook_reveal_detail_closing' | 'intro_product_lifestyle_end' | 'atmosphere_focus_human_finish' | 'tease_build_highlight_resolve' | 'custom';

export interface ShotPlanItem {
  shot_index: number;
  role: string;
  purpose: string;
  scene_type: string;
  camera_motion: string;
  subject_motion: string;
  duration_sec: number;
  script_line?: string;
  product_visible: boolean;
  character_visible: boolean;
  scene_reference_id?: string;
  model_reference_id?: string;
  preservation_strength: 'low' | 'medium' | 'high';
}

export interface ShortFilmProject {
  film_type: FilmType;
  story_structure: StoryStructure;
  shots: ShotPlanItem[];
  script_mode: 'none' | 'manual' | 'generated';
  script_lines?: string[];
  tone: string;
}
```

**4. Hook: `src/hooks/useShortFilmProject.ts`**
- Manages multi-step state
- Creates `video_projects` with `workflow_type: 'short_film'`
- Creates multiple `video_inputs` (product refs, scene refs, model refs, logo) with appropriate `input_role` values
- Creates multiple `video_shots` — one per shot in the plan
- Generates each shot sequentially via the existing `generate-video` edge function
- Tracks per-shot status and progress

**5. UI Components (new files in `src/components/app/video/short-film/`)**
- `FilmTypeSelector.tsx` — grid of 8 film type cards
- `ReferenceUploadPanel.tsx` — sections for product, scene, style, model, logo references
- `StoryStructureSelector.tsx` — 4 preset cards + custom option
- `ShotPlanEditor.tsx` — draggable shot cards with edit capability
- `ShotCard.tsx` — individual shot card showing role, scene, motion, duration
- `ShortFilmSettingsPanel.tsx` — final settings (aspect ratio, audio, preservation)
- `ShortFilmReviewPanel.tsx` — final review before generation
- `ShortFilmProgressPanel.tsx` — per-shot generation progress with VOVV team avatars

**6. Route + Nav updates**
- `src/App.tsx`: add route `/video/short-film` → `ShortFilm`
- `src/pages/VideoHub.tsx`: enable the existing Short Film card (remove `disabled` and `comingSoon`)

**7. Credit pricing: `src/config/videoCreditPricing.ts`**
Add `shortFilm` pricing:
```typescript
shortFilm: {
  basePerShot5s: 10,
  basePerShot10s: 18,
  ambient: 4,
  voice: 12,
  planningFee: 5, // AI shot planning
}
```

### No database schema changes needed
The existing `video_projects` + `video_shots` + `video_inputs` tables already support this workflow:
- `video_projects.workflow_type` = `'short_film'`
- `video_projects.settings_json` stores film_type, story_structure, tone, script
- `video_shots` stores each shot with `shot_role`, `shot_index`, `strategy_json`, `prompt_text`, `duration_sec`, `transition_type`
- `video_inputs` stores all references with `input_role` (product_ref, scene_ref, model_ref, logo, style_ref)

---

## Phase 2 — Script/Voiceover + Polish (future)

These are deferred to keep Phase 1 shippable:
- Script generation via AI (generate brand-safe voiceover lines)
- Script-to-shot mapping
- Voiceover audio generation
- Shot replacement / regeneration of individual shots
- Timeline editor / reordering post-generation
- Stitched final output (combine shots into single video)
- A/B shot variations
- Intro/outro branding overlays

---

## Files changed (Phase 1)

| File | Action |
|------|--------|
| `src/pages/video/ShortFilm.tsx` | New — main workflow page |
| `src/types/shortFilm.ts` | New — types |
| `src/lib/shortFilmPlanner.ts` | New — shot plan engine |
| `src/hooks/useShortFilmProject.ts` | New — state + generation hook |
| `src/components/app/video/short-film/FilmTypeSelector.tsx` | New |
| `src/components/app/video/short-film/ReferenceUploadPanel.tsx` | New |
| `src/components/app/video/short-film/StoryStructureSelector.tsx` | New |
| `src/components/app/video/short-film/ShotPlanEditor.tsx` | New |
| `src/components/app/video/short-film/ShotCard.tsx` | New |
| `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx` | New |
| `src/components/app/video/short-film/ShortFilmProgressPanel.tsx` | New |
| `src/App.tsx` | Add route + lazy import |
| `src/pages/VideoHub.tsx` | Enable Short Film card |
| `src/config/videoCreditPricing.ts` | Add shortFilm pricing |

This is ~15 files. Implementation will be done incrementally — types and planner first, then UI components, then the hook and wiring.

