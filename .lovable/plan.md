

# Video Tab Redesign — Revised Plan with All 7 Feedback Points

This is the full revised plan incorporating all feedback. Implementation is split into 3 batches (V1-A, V1-B, V1-C) to protect quality.

---

## Architecture: Three-Layer Pipeline

```text
Upload → AI Analysis (descriptive only) → Strategy Resolver → Prompt Builder → Kling API
```

**Critical rule**: The AI analysis layer is a structured vision parser, not a creative director. It returns deterministic JSON describing uploaded images only — no freeform prompt ideas, no cinematic invention. Creative direction happens in the strategy resolver and prompt builder layers.

---

## Batch V1-A — Animate Image End-to-End

### 1. Database Migration

**New tables:**

`video_projects`
- id, user_id, workflow_type, status, title, settings_json, created_at, updated_at
- analysis_status (pending/complete/failed)
- generation_mode (single/multi_shot/stitched)
- estimated_credits, charged_credits
- cover_image_url

`video_inputs`
- id, project_id, type (image/video/audio/script), asset_url, sort_order
- input_role (main_reference/frame/model_reference/background_reference/motion_reference)
- analysis_json, validation_json

`video_shots`
- id, project_id, shot_index, prompt_text, duration_sec, status, result_url
- source_input_id, shot_role, transition_type, audio_mode, model_route

**Modify:** `generated_videos` — add nullable `project_id`, `workflow_type` columns

**RLS:** All tables user_id scoped (users CRUD own records), service_role full access.

### 2. AI Analysis Edge Function (`analyze-video-input`)

- Uses Lovable AI (Gemini) with tool-calling for structured output
- Returns deterministic JSON only:
  - subject_category, scene_type, shot_type, camera_angle, lighting_style, mood
  - motion_recommendation, identity_sensitive, scene_complexity
  - risk_flags: busy_background, text_present, multiple_people, low_resolution, transparent_png
- For multiple images: continuity_score, best_order, shot_roles, mismatch_warnings
- Stores result in `video_inputs.analysis_json`
- Never generates prompts or creative concepts

### 3. Workflow Strategy Resolver (`src/lib/videoStrategyResolver.ts`)

New utility between analysis and prompt building. Takes analysis JSON + user workflow selections, returns:

```typescript
interface VideoStrategy {
  workflow_strategy: string;        // e.g. "product_subtle_motion"
  preserve_scene: boolean;
  allow_scene_expansion: boolean;
  recommended_model_route: "kling_v3" | "kling_v3_omni" | "motion_control";
  recommended_audio_mode: "silent" | "ambient" | "voice";
  motion_intensity_default: "low" | "medium" | "high";
  validation_level: "standard" | "strict";
  prompt_template_family: string;   // e.g. "product_hero"
}
```

Business logic decisions live here, not in AI analysis or prompt builder.

### 4. Prompt Builder (`src/lib/videoPromptTemplates.ts`)

Template-driven prompt composition from analysis + strategy + user selections. Template families: Product Hero, Lifestyle Motion, Editorial Motion, Beauty Motion, Cinematic Motion.

Stores for debugging: `analysis_json`, `strategy_json`, `prompt_template_name`, `final_prompt_text` in video_shots.

### 5. Shared Credit Pricing Engine (`src/config/videoCreditPricing.ts`)

Single source of truth used by both frontend estimates and backend charging:

```typescript
export const VIDEO_CREDIT_RULES = {
  animate: { base5s: 10, base10s: 18, premiumMotion: 2, ambient: 4 },
  adSequence: { base2Shots: 24, extraShot: 8, ambient: 6, voice: 12 },
  consistentModel: { base: 18, strong: 6, base10s: 28, ambient: 4, voice: 10 },
};
```

Backend imports or mirrors this config to guarantee frontend estimate matches actual charge.

### 6. Video Hub Page (`src/pages/VideoHub.tsx`)

Clean landing at `/app/video`:
- Header: "Create videos from your images" + subtitle
- 3 workflow cards (Animate Image, Create Ad Sequence, Consistent Model Video)
- Each card: icon, title, one-line description, "best for" tags
- Recent videos gallery below
- No aspect ratio or brand preset selectors on hub (those live inside workflows)

### 7. Animate Image Page (`src/pages/video/AnimateVideo.tsx`)

Steps:
1. Upload 1 image with validation (min resolution, corruption, crowded scene detection)
2. Output style preset chips: Product Motion, Lifestyle, Editorial, Beauty, Cinematic
3. Motion recipe chips: Slow push-in, Camera drift, Product orbit, Gentle pan, Premium handheld, Minimal
4. Settings: aspect ratio, duration (5s/10s), audio (Silent/Ambient only for V1), motion intensity (Low/Medium/High), preserve scene toggle
5. Credit estimate display (from shared pricing engine)
6. Generate button

### 8. Shared Components (`src/components/app/video/`)

- `VideoWorkflowCard` — hub card
- `MotionPresetSelector` — chip selector
- `StylePresetSelector` — chip selector
- `AudioModeSelector` — Silent/Ambient for V1 (Voice added in V1-C)
- `CreditEstimateBox` — reads from shared pricing engine
- `ValidationWarnings` — friendly notices
- `VideoResultsPanel` — player + download + "Reuse settings" + "Generate variation" + "Open as new project"

### 9. Hook (`src/hooks/useVideoProject.ts`)

Manages project lifecycle: create project → upload inputs → run analysis → resolve strategy → build prompt → submit to Kling → poll → save results.

### 10. Updated Edge Function (`generate-video`)

Extended with `workflow_type` and `project_id` params. Stores workflow metadata. Existing direct-generation path preserved for backward compatibility.

### 11. Routing (`src/App.tsx`)

- `/app/video` → VideoHub
- `/app/video/animate` → AnimateVideo
- `/app/video/ad-sequence` → AdSequenceVideo (V1-B)
- `/app/video/consistent-model` → ConsistentModelVideo (V1-C)

---

## Batch V1-B — Ad Sequence

### Ad Sequence Page (`src/pages/video/AdSequenceVideo.tsx`)

- Upload 2-6 images with drag-to-reorder `FrameTimeline` component
- Sequence type presets: Product Teaser, Luxury Campaign, Beauty Story, Fashion Sequence, Brand Trailer
- Pacing: Calm, Balanced, Dynamic, Cinematic
- Audio: Silent, Ambient
- Credit estimate

### Shot Planner (backend logic in analyze-video-input or new function)

- Multi-image analysis: continuity_score, best_order, per-frame shot roles
- Validation: palette consistency, subject consistency, lighting direction, frame order sanity

### Internal Architecture — Shot-Based from Day One

Ad Sequence is architected as shot-based generation internally, with each shot stored as a first-class `video_shots` record, even if V1-B presents it as one combined output. Each uploaded frame becomes a shot candidate with assigned role, motion, and duration. This makes per-shot regeneration in V1.1 straightforward.

### New Component: `FrameTimeline`

Drag-to-reorder image strip with shot role labels. Shows validation warnings per frame.

---

## Batch V1-C — Consistent Model Video

### Consistent Model Page (`src/pages/video/ConsistentModelVideo.tsx`)

- Upload 1-4 model reference images
- Scene type: Talking model, Luxury lifestyle, Walking/pose, Social creator, Campaign
- Optional support assets: background, scene image
- Consistency level: Standard, Strong, Maximum

### Reference Quality Scoring

Calculate `reference_quality_score` (Weak/Good/Strong) based on:
- Face size and clarity
- Number of people detected
- Occlusion (sunglasses, masks)
- Angle coverage diversity
- Lighting consistency

Display as a visual indicator. Block or strongly discourage generation on "Weak" score with preflight gate: "Your references may produce unstable consistency. Replace 1-2 images for better results."

### Identity vs Outfit Separation

Clear UI copy:
- "Preserve identity" — face/appearance consistency (supported)
- "Preserve outfit/styling" — clothing, hair, accessories (limited, shown as disclaimer)

### Audio: Silent, Ambient, Voice available in this mode

### Model Routing

Strategy resolver decides between kling_v3, kling_v3_omni, or motion_control based on consistency level and input quality.

---

## Files Summary

**New files (V1-A):**
- `src/pages/VideoHub.tsx`
- `src/pages/video/AnimateVideo.tsx`
- `src/components/app/video/VideoWorkflowCard.tsx`
- `src/components/app/video/MotionPresetSelector.tsx`
- `src/components/app/video/StylePresetSelector.tsx`
- `src/components/app/video/AudioModeSelector.tsx`
- `src/components/app/video/CreditEstimateBox.tsx`
- `src/components/app/video/ValidationWarnings.tsx`
- `src/components/app/video/VideoResultsPanel.tsx`
- `src/hooks/useVideoProject.ts`
- `src/lib/videoStrategyResolver.ts`
- `src/lib/videoPromptTemplates.ts`
- `src/config/videoCreditPricing.ts`
- `supabase/functions/analyze-video-input/index.ts`
- DB migration for new tables

**New files (V1-B):**
- `src/pages/video/AdSequenceVideo.tsx`
- `src/components/app/video/FrameTimeline.tsx`

**New files (V1-C):**
- `src/pages/video/ConsistentModelVideo.tsx`

**Modified files:**
- `src/App.tsx` — new video routes
- `supabase/functions/generate-video/index.ts` — workflow_type + project_id support
- `src/hooks/useGenerateVideo.ts` — backward-compatible extensions

**Preserved:** Existing `VideoGenerate.tsx` kept as legacy fallback until hub is stable.

