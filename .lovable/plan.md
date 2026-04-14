

# Precise Audio Timing & User Audio Control System

## Core Problems

1. **Audio timing is disconnected from video**: We know exact shot boundaries (cumulative `duration_sec`) but audio generation ignores this. Music, SFX, and VO are generated as isolated blobs with no timing metadata — the player just triggers them at shot boundaries using RAF, but there's no guarantee the audio content *matches* those boundaries.

2. **No user choice for audio layers**: `audioMode` is set in Settings (step 5), but the shot plan (step 4) always shows VO/SFX fields regardless. Users generate everything even if they only want music. No per-shot toggle for "this shot needs VO" vs "this shot is silent."

3. **Lip-sync gap**: When `character_visible=true` and the shot has a `script_line`, the video prompt doesn't mention the character is speaking. Kling generates a silent-looking character, then VO is layered on top — lips don't move.

4. **Music has no timing structure**: The music prompt says "15 seconds long" but doesn't describe what should happen at each shot boundary (drop at 3s, build at 7s, resolve at 12s).

## Solution

### 1. Move audio preferences into Shot Plan step (before shots are generated)

**File: `src/types/shortFilm.ts`**
- Add `audioLayers` to `ShortFilmSettings`: `{ music: boolean; sfx: boolean; voiceover: boolean }` — replaces the 5-option `audioMode` enum
- Add per-shot `vo_enabled?: boolean` and `sfx_enabled?: boolean` to `ShotPlanItem`

**File: `src/components/app/video/short-film/ShotPlanEditor.tsx`**
- Add an "Audio Layers" toolbar at the top of shot plan: three toggle chips — Music, SFX, Voiceover — so user picks what they want before editing shots
- Only show the VO input row when voiceover is enabled globally AND the shot is >= 3s
- Only show SFX input row when sfx is enabled globally
- Add per-shot VO toggle (small checkbox) so user can disable VO on specific shots (e.g., atmospheric shots)
- Show word budget indicator: `{wordCount}/{maxWords}w` with color warning when over budget

**File: `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx`**
- Remove the 5-option `audioMode` grid — audio is now configured in Shot Plan
- Keep voice picker and music prompt in settings but only show if respective layer is enabled

### 2. Build a timing manifest for audio generation

**File: `src/hooks/useShortFilmProject.ts`**
- Before calling ElevenLabs, compute a `TimingManifest`:
```
Shot 1: 0.0s–2.0s (hook) — SFX: "whoosh impact" @ 0.0s, VO: none
Shot 2: 2.0s–6.0s (reveal) — SFX: "shimmer" @ 2.5s, VO: "Introducing the future." @ 2.0s
Shot 3: 6.0s–9.0s (detail) — SFX: "click" @ 6.0s, VO: none
Shot 4: 9.0s–12.0s (brand_finish) — SFX: "bass resolve" @ 9.0s, VO: "Your story begins." @ 9.0s
```
- Use this manifest to:
  - Skip audio generation for shots where the layer is disabled
  - Pass exact timing cues into the music prompt (e.g., "drop at 2.0s, build at 6.0s, resolve at 9.0s")
  - Set correct `offset_sec` on `perShotAudio` entries for playback

### 3. Inject timing cues into music prompt

**File: `src/hooks/useShortFilmProject.ts` → `buildContextualMusicPrompt`**
- Add shot boundary timestamps: "energy shift at 2.0s (reveal), peak at 6.0s (detail), soft resolve at 9.0s"
- ElevenLabs music gen doesn't have a "cue" API, but descriptive timing in the prompt ("bass drop at 2 seconds, strings enter at 6 seconds") significantly improves alignment

### 4. Add lip-sync awareness to video prompts

**File: `src/lib/shortFilmPromptBuilder.ts`**
- When `character_visible=true` AND `shot.script_line` AND `shot.vo_enabled !== false`:
  - Append to prompt: `"character speaking dialogue, natural lip movement, conversational expression"`
  - This tells Kling to animate the mouth, improving VO overlay quality

### 5. Respect user's audio choices in generation

**File: `src/hooks/useShortFilmProject.ts` → `generateAudio`**
- Derive what to generate from `settings.audioLayers` instead of `audioMode`:
  - `audioLayers.music` → generate music track
  - `audioLayers.sfx` → generate SFX (only for shots with `sfx_enabled !== false`)
  - `audioLayers.voiceover` → generate VO (only for shots with `vo_enabled !== false` and `script_line` exists and `duration_sec >= 3`)

### 6. Pass audio layer choices to AI Director

**File: `supabase/functions/ai-shot-planner/index.ts`**
- Accept `audioLayers: { music, sfx, voiceover }` in request body
- When `voiceover=false`: don't generate `script_line` at all (set to empty)
- When `sfx=false`: don't generate `sfx_prompt`
- This prevents the AI from wasting effort on unwanted audio content

### 7. Backward compatibility

- Map old `audioMode` values to new `audioLayers` on load:
  - `silent` → `{ music: false, sfx: false, voiceover: false }`
  - `ambient` → `{ music: false, sfx: false, voiceover: false }` (Kling native)
  - `music` → `{ music: true, sfx: true, voiceover: false }`
  - `voiceover` → `{ music: false, sfx: false, voiceover: true }`
  - `full_mix` → `{ music: true, sfx: true, voiceover: true }`

## Files to Change

| File | Change |
|------|--------|
| `src/types/shortFilm.ts` | Add `audioLayers` to settings, `vo_enabled`/`sfx_enabled` to `ShotPlanItem` |
| `src/components/app/video/short-film/ShotPlanEditor.tsx` | Audio layer toggles toolbar, conditional VO/SFX rows, word budget indicator, per-shot VO toggle |
| `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx` | Remove audioMode grid, keep voice/music prompt conditional on layers |
| `src/hooks/useShortFilmProject.ts` | Timing manifest, layer-aware generation, music timing cues, backward compat migration |
| `src/lib/shortFilmPromptBuilder.ts` | Lip-sync prompt injection for speaking characters |
| `supabase/functions/ai-shot-planner/index.ts` | Accept `audioLayers`, skip script/sfx generation when disabled |

