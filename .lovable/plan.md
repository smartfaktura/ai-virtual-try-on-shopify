

# Download Options & SFX Timing Control

## Changes

### 1. Replace Volume Mixer with Download Options
**File: `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx`**

- Remove the Mixer button and entire Volume Mixer section
- Replace single Download button with two buttons when music exists:
  - "Download" — video only (current behavior)
  - "Download with Music" — triggers a new `onDownloadWithAudio` callback
- If no music/audio was generated, show only "Download"
- Keep internal volume levels at sensible defaults (music 0.5, sfx 0.7, voice 1.0) for preview playback — no user control needed

### 2. Add `onDownloadWithAudio` prop and muxing logic
**File: `src/pages/video/ShortFilm.tsx`**

- Pass a new `onDownloadWithAudio` callback to `ShortFilmVideoPlayer`
- This function fetches the video + music track, combines them using an `<audio>` + `MediaRecorder` approach or simply downloads both files (pragmatic: download video + separate audio track, since true client-side muxing is complex)
- Pragmatic approach: use a backend function to mux video + audio into one MP4

**File: `supabase/functions/mux-video-audio/index.ts`** (new edge function)
- Accepts video URL + audio URL, uses ffmpeg to combine into single MP4, returns the muxed file
- This gives a proper single-file download with embedded audio

### 3. Add SFX trigger offset to ShotPlanItem
**File: `src/types/shortFilm.ts`**

Add `sfx_trigger_at?: number` to `ShotPlanItem` — offset in seconds from shot start (default 0 = shot start). This lets users control exactly when the SFX plays within a shot.

### 4. Surface SFX timing control in ShotPlanEditor
**File: `src/components/app/video/short-film/ShotPlanEditor.tsx`**

Next to the existing SFX prompt input, add a small number input or dropdown for trigger offset:
- Label: "Trigger at" with options like "Start", "0.5s", "1s", "1.5s", "2s" or a free-form input
- Shows only when `sfx_prompt` is non-empty

### 5. Use `sfx_trigger_at` in playback
**File: `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx`**

Update the RAF loop: instead of triggering SFX at shot start, trigger at `shotOffset.start + sfx_trigger_at`. Pass shots with full `ShotPlanItem` data (or at least `sfx_trigger_at`) to the player.

### 6. Auto-populate sensible SFX timing defaults
**File: `src/lib/shortFilmPlanner.ts`**

Set default `sfx_trigger_at` based on shot role:
- `hook` → 0 (immediate impact)
- `product_reveal` → 0.5 (slight delay for reveal moment)
- `closing` → 0 (immediate)
- Others → 0

## Files to Change

| File | Change |
|------|--------|
| `src/types/shortFilm.ts` | Add `sfx_trigger_at?: number` to `ShotPlanItem`; add `offset_sec` to `AudioAssets.perShotAudio` |
| `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx` | Remove mixer, add dual download buttons, use `sfx_trigger_at` in RAF loop |
| `src/components/app/video/short-film/ShotPlanEditor.tsx` | Add SFX trigger offset input next to SFX prompt |
| `src/pages/video/ShortFilm.tsx` | Add `downloadWithAudio` callback using mux edge function |
| `src/lib/shortFilmPlanner.ts` | Default `sfx_trigger_at` per role |
| `supabase/functions/mux-video-audio/index.ts` | New: combine video + audio tracks into single MP4 |

