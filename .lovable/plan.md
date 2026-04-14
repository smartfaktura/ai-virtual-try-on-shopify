

# Fix AI Director Script Quality + Add Kling Lip-Sync

## Problems

### 1. AI Director writes mood poetry instead of product copy
The `script_line` instruction in `ai-shot-planner/index.ts` says nothing about writing **product-focused, brand-selling copy**. It only says "voiceover narration" with a word budget. When the user selects a style preset like "Y2K Chrome", its keywords (`"Reflective metallic surfaces, iridescent holographic sheen..."`) are passed as `tonePresetText` and the AI Director writes script lines that describe the aesthetic instead of selling the product.

**Current instruction (line 90):**
> `script_line (string: voiceover narration — CRITICAL: word count MUST match duration...)`

**Should be:**
> `script_line (string: product/brand-focused voiceover copy — sell the product, highlight features/benefits, create desire. NOT aesthetic descriptions. Word budget: ~2 words/sec...)`

### 2. No timing alignment between voiceover and video
The video prompt (`shortFilmPromptBuilder.ts` line 294) includes `Visual matches: "${shot.script_line}"` but Kling doesn't know WHEN in the shot the words are spoken. For lip-sync or visual alignment, the prompt should describe the action at the moment the words are delivered.

### 3. Kling HAS a native Lip-Sync API
Kling's official API has `POST /v1/videos/lip-sync` which takes:
- `video_url`: the generated video
- `audio_url`: the ElevenLabs voiceover audio

This is a **post-processing step**: generate video → generate voiceover → lip-sync them together. This means for `character_visible` shots with voiceover, we can get real lip-sync without hacks.

## Changes

### File: `supabase/functions/ai-shot-planner/index.ts`
**Fix script_line instruction to be product/brand focused:**
- Change the `scriptLineInstruction` to explicitly say: "Write persuasive product copy — highlight features, benefits, brand promise. Do NOT describe aesthetics or visual mood. Examples: 'Precision-engineered for perfection.' NOT 'Moody shadows dance across surfaces.'"
- Add to system prompt: "This is an e-commerce product short film. Every script_line must sell the product or reinforce the brand. Style/mood presets affect VISUALS ONLY, never the voiceover script."
- Separate the `tonePresetText` in the user prompt so it's clearly labeled as "VISUAL STYLE ONLY — do not reference in script_line"

### File: `src/lib/shortFilmPromptBuilder.ts`
**Better visual-script alignment:**
- For `character_visible` shots with `script_line`, inject a directive like: `"Character delivering line: '${shot.script_line}' — match mouth movement and expression to speech cadence."`
- This gives Kling visual cues about what the character is saying, improving natural lip movement even before lip-sync post-processing

### File: `supabase/functions/generate-video/index.ts`
**No changes yet** — lip-sync is a post-processing step that needs a new edge function

### New file: `supabase/functions/kling-lip-sync/index.ts`
**Create Kling lip-sync edge function:**
- Accepts `video_url` (generated video) + `audio_url` (ElevenLabs VO audio)
- Calls Kling `POST /v1/videos/lip-sync` with these URLs
- Returns the lip-synced video task_id for polling
- Uses same JWT auth as `generate-video`

### File: `src/hooks/useShortFilmProject.ts`
**Add lip-sync post-processing step:**
- After both video generation AND voiceover generation complete for shots where `character_visible === true` and `script_line` exists:
  1. Upload the ElevenLabs VO audio to storage (already done)
  2. Get the generated video URL
  3. Call `kling-lip-sync` edge function
  4. Poll for lip-synced result
  5. Replace the original video URL with the lip-synced version
- For shots without characters or without VO, skip lip-sync (no change)

## Summary

| File | Change |
|------|--------|
| `ai-shot-planner/index.ts` | Rewrite script_line instructions for product-focused copy; isolate style presets from script guidance |
| `shortFilmPromptBuilder.ts` | Add speech-aligned character directives for character_visible shots |
| `kling-lip-sync/index.ts` (NEW) | Kling lip-sync API integration — video + audio → synced video |
| `useShortFilmProject.ts` | Add lip-sync post-processing for character shots with voiceover |

