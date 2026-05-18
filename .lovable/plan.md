## Goal

Expand the Talking Video voice picker from **5 → 9** English Kling voices, keeping brand-safe, natural-sounding options only. Each new voice gets a previewable MP3 sample, identical to the current 5.

## New voices to add

All English, all officially supported by Kling's lip-sync API (`voice_language: "en"`):

| Kling `voice_id` | Display label | Gender | Notes |
|---|---|---|---|
| `commercial_lady_en_f-v1` | Isla | female | Polished commercial / VO tone |
| `reader_en_m-v1` | Henry | male | Calm narrator / explainer |
| `uk_man2` | James | male | British male, mature |
| `uk_boy1` | Theo | male | British male, younger |

Final lineup (9): Oliver, Marcus, Sophia, Ava, Kaiya, **Isla, Henry, James, Theo**.

## Changes

### 1. `src/components/app/video/KlingVoicePicker.tsx`
- Append the 4 new entries to `KLING_VOICES` (id + label + `language: 'en'` + gender).
- No layout change needed — existing grid is `grid-cols-2 sm:grid-cols-3` and already wraps to a third row cleanly with 9 items.

### 2. `supabase/functions/seed-voice-samples/index.ts`
- Add 4 new entries to `VOICE_MAP`, each mapped to a similar ElevenLabs voice for the MP3 preview (Kling has no public TTS preview endpoint, so we approximate — same pattern as the current 5):
  - `commercial_lady_en_f-v1` → ElevenLabs "Rachel" (clear American female VO)
  - `reader_en_m-v1` → ElevenLabs "Adam" (calm male narrator)
  - `uk_man2` → ElevenLabs "George" (British male, mature)
  - `uk_boy1` → ElevenLabs "Callum" (British male, younger)
- Re-running the function is idempotent (`upsert: true`) — only the 4 new MP3s get uploaded; existing 5 are overwritten with identical content.

### 3. Deploy + seed
- Deploy `seed-voice-samples`.
- Call it once as admin to generate and upload the 4 new MP3s to the public `voice-samples` bucket. Picker will then play them via the existing `${SAMPLE_BASE}/{id}.mp3` URL.

## Out of scope
- No backend payload changes — `generate-talking-video` and `poll-stuck-videos` already forward `voice_id` verbatim to Kling, so any supported ID works without code changes.
- No credit pricing changes.
- No Chinese / cartoon voices.
- No UI redesign of the picker.

## Validation
- Open `/app/video/talking`, confirm 9 tiles render in a clean 3×3 grid (≥sm) or 2-col layout (mobile).
- Click ▸ on each new voice → preview plays.
- Generate a test talking video with one new voice (e.g. `uk_man2`) → confirm final MP4 has audio.
