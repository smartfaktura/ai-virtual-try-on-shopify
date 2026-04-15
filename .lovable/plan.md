

# Generate Short Film System Documentation (DOCX)

## Summary
Create a comprehensive technical document explaining the entire Short Film workflow — the 6-step wizard, AI Director prompt engineering, shot planning, prompt building, audio pipeline, multi-shot Kling v3 generation, and recovery mechanisms. Output as a downloadable DOCX file.

## Document Structure

### 1. System Overview
- 6-step wizard: Film Type → References → Story Structure → Shot Plan → Settings → Review/Generate
- Kling v3 multi-shot pipeline (1-6 shots, 3-15s total, 1080p pro mode)
- Persistence via `video_projects` + `video_shots` tables with `draft_state_json`

### 2. Film Types & Story Structures
- 8 film type presets (product_launch, brand_story, fashion_campaign, beauty_film, luxury_mood, sports_campaign, lifestyle_teaser, custom)
- 4+1 story structures with role sequences (e.g., hook → product_reveal → detail_closeup → brand_finish)
- Default tone mappings per film type

### 3. AI Director (ai-shot-planner Edge Function)
- Full system prompt documentation — the exact prompt sent to Gemini 3 Flash Preview
- Role sequence enforcement, valid enums (16 roles, 15 scene types, 10 camera motions)
- Script_line word budget (~2 words/sec), voiceover constraints
- Music direction generation for ElevenLabs
- SFX trigger timing defaults
- Role alias mapping and validation/sanitization

### 4. Shot Prompt Engine (shortFilmPromptBuilder.ts)
- Priority-based prompt construction (P1 → P2 → P3) with 510 char cap
- Per-role cinematographic directives (directive, lighting, lens, negatives) for all 16 roles
- Scene type framing map (15 entries: macro_closeup, product_hero, etc.)
- Tone presets per film type (anamorphic, editorial, beauty, luxury, etc.)
- Smart truncation at sentence boundaries
- Negative prompt system (base + human-specific negatives)
- `<<<image_N>>>` token injection for multi-shot references

### 5. Reference & Image Mapping
- Smart angle lookup: detail shots → texture/side, reveals → main/back
- Per-shot override via scene_reference_id / model_reference_id
- Character-visible shots → model reference fallback
- Image deduplication for Kling image_list

### 6. Audio Production Pipeline
- Background Music: ElevenLabs `/v1/music` with contextual prompt + timing cues
- SFX & Dialog: Native Kling (sound: "on", with_audio: true) — no separate API calls
- Film-type music presets (8 entries with BPM, instrumentation, energy arc)
- Music prompt resolution chain: AI Director → custom → named preset → contextual builder
- Energy arc detection from shot roles
- Mux pipeline: `mux-video-audio` edge function for final MP4

### 7. Generation Pipeline
- Multi-shot payload: per-shot prompts, durations, image_urls, cfg_scale, preservation_strength
- Duration distribution with proportional scaling to 15s cap
- Polling: generation_queue → kling_task_id → generate-video status action
- Credit estimation formula

### 8. Recovery & Resilience
- sessionStorage auto-resume (`sf_active_project`)
- Stuck project detection (status === 'processing') → server-side recovery
- Auto-trigger audio for completed videos missing music
- ElevenLabs retry logic (2x on 5xx, graceful JSON fallback)

## Technical Execution
- Generate DOCX using `docx-js` with professional formatting
- Include code snippets for key prompt templates
- Include the full AI Director system prompt verbatim
- Include all role cinematics tables
- Output to `/mnt/documents/short-film-system-documentation.docx`

