# Plan — Better Voice & Performance Controls for `/app/video/talking`

Goal: give creators ElevenLabs-grade voice control, more voices, and a Motion/Gaze section that actually makes sense.

---

## 1. Expanded ElevenLabs voice catalog

Replace `KlingVoicePicker` (currently 6 Kling-flavored aliases mapped to ElevenLabs IDs) with a proper **ElevenLabsVoicePicker** built directly on ElevenLabs voice IDs from the bundled top-voices list.

New catalog (16 voices, EN, balanced gender + accent + tone):

| Label | EL ID | Gender | Accent | Vibe |
|---|---|---|---|---|
| Sarah | EXAVITQu4vr4xnSDxMaL | F | US | Warm, conversational |
| Laura | FGY2WhTYpPnrIDTdsKH5 | F | US | Bright, friendly |
| Alice | Xb7hH8MSUJpSbSDYk0k2 | F | UK | Calm, refined |
| Matilda | XrExE9yKIg1WjnnlVkGX | F | US | Soft, story |
| Jessica | cgSgspJ2msm6clMCkdW9 | F | US | Youthful, upbeat |
| Lily | pFZP5JQG7iQjIQuC4Bku | F | UK | Gentle, narration |
| River | SAz9YHcvj6GT2YYXdXww | NB | US | Neutral, modern |
| Roger | CwhRBWXzGAHq8TQ4Fs17 | M | US | Confident |
| George | JBFqnCBsd6RMkjVDRZzb | M | UK | Mature, authoritative |
| Charlie | IKne3meq5aSn9XLyUdCD | M | AU | Casual, friendly |
| Callum | N2lVS1w4EtoT3dr4eOWO | M | UK | Intense, character |
| Liam | TX3LPaxmHKxFdv7VOQHJ | M | US | Articulate |
| Will | bIHbv24MWmeRgasZH58o | M | US | Chill, podcast |
| Eric | cjVigY5qzO86Huf0OWal | M | US | Smooth, narration |
| Chris | iP95p4xoKVk53GoZ742B | M | US | Natural, casual |
| Brian | nPczCjzI2devNBz1zQrb | M | US | Deep, narration |

Picker UX upgrades:
- Filter chips at the top: **All / Female / Male / UK / US**.
- Each tile keeps the current play/preview button.
- Preview audio sourced from ElevenLabs sample endpoint (cached in `voice-samples` bucket; backfill via existing `seed-voice-samples` function pattern). If a sample is missing we fall back to a one-shot TTS via the existing preview-talking-voice flow.

---

## 2. Full ElevenLabs voice controls (advanced panel)

Add a collapsible **"Voice tuning"** section under the picker (closed by default — keeps the page calm for casual users). All controls map 1:1 to ElevenLabs `voice_settings`:

| Control | Range | Default | UI |
|---|---|---|---|
| Stability | 0 – 1 | 0.5 | Slider with labels **Expressive ↔ Consistent** |
| Similarity boost | 0 – 1 | 0.75 | Slider **Creative ↔ True to voice** |
| Style exaggeration | 0 – 1 | 0.0 | Slider **Neutral ↔ Stylized** |
| Speaker boost | on / off | on | Switch — "Sharpen clarity" |
| Speed | 0.7 – 1.2 | 1.0 | Existing slider, moved into this panel |
| Model | dropdown | `eleven_multilingual_v2` | Choices: Multilingual v2 (best), Turbo v2.5 (fast) |

Each control gets a one-line plain-language helper underneath (e.g. "Higher = more predictable, lower = more emotion"). A small **Reset to defaults** link in the panel header.

Persist these on the project state alongside `voiceId` / `voiceSpeed`. Send them through to the edge function in the existing payload.

---

## 3. Replace confusing Motion + Gaze with a single clear section

Today's Gaze (`To camera` / `Soft glance`) is ambiguous — most users won't know what it does. Consolidate into one **"Delivery"** section with two clear axes:

**Energy** (replaces Motion):
- **Still** — only mouth, eyes, breathing. Best for product/locked beauty shots.
- **Natural** — subtle facial life, micro nods, gentle blinks. Default.
- **Presenter** — confident delivery, small assertive nods. Best for spokesperson.

**Eye contact** (replaces Gaze, renamed and explained):
- **Direct** — eyes locked on the camera the whole time.
- **Relaxed** — mostly on camera with occasional natural glance away.

Each option keeps a one-line description visible under the chip (not on hover) so the meaning is obvious without experimenting. Add a tiny "?" tooltip above the section explaining: *"These shape how the model performs while speaking — they don't change the voice."*

Backend prompt map updates to match new labels (`Energy → MOTION_LINES`, `Eye contact → GAZE_LINES`). Wording in prompt builder is tightened so Kling gets cleaner instructions.

---

## 4. Backend changes (`generate-talking-video`)

- Accept new fields: `voice_settings: { stability, similarity_boost, style, use_speaker_boost }` and `tts_model`.
- Validate ranges server-side (clamp, default fallbacks).
- Pass through to ElevenLabs TTS request body. Keep current upload + Kling flow untouched.
- Update voice map: replace alias→EL map with direct EL voice IDs (the picker now sends EL IDs). Keep a small back-compat shim that maps the 6 old Kling aliases to their EL equivalents so in-flight jobs / old projects don't break.
- `preview-talking-voice` accepts the same new fields so previews match final render.

No schema changes. No pricing changes. Voice settings ride along in existing JSON payload.

---

## 5. Files touched

- New: `src/components/app/video/ElevenLabsVoicePicker.tsx` (replaces `KlingVoicePicker` import; old file kept until references removed)
- New: `src/components/app/video/VoiceTuningPanel.tsx` (collapsible advanced sliders)
- Edit: `src/components/app/video/TalkingPerformancePicker.tsx` (rename labels, add descriptions, single tooltip)
- Edit: `src/pages/video/TalkingVideo.tsx` (wire new state: `voiceSettings`, `ttsModel`; pass to `start()`)
- Edit: `src/hooks/useTalkingVideoProject.ts` (extend payload type)
- Edit: `supabase/functions/generate-talking-video/index.ts` (accept + apply new fields, back-compat voice map, refined prompt wording)
- Edit: `supabase/functions/preview-talking-voice/index.ts` (accept same fields)

## 6. Out of scope

- No new pricing, no new credits, no voice cloning, no multilingual UI surface (model picker is enough).
- No changes to lip-sync stage, queue, or Video Hub.

## 7. Verification

- Generate a 5s talking video with default settings → matches current quality.
- Move stability to 0.2 + style to 0.6 → preview audibly more expressive.
- Switch voice (e.g. Sarah → George) → preview + final video both reflect new voice.
- Pick **Still + Direct** vs **Presenter + Relaxed** → resulting Kling motion visibly differs.
