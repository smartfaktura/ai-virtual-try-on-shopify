# Talking Video — Smarter script, honest duration, light performance controls (v2)

What was weak in v1 and what changes:

- **Pause chips inserted raw punctuation** → fragile (double periods, ambiguous with user's own commas, no way to count them reliably). Replaced with **explicit bracket tokens** that render as visual pills and are converted to punctuation only at submit time.
- **WPM table was guessed** → replaced with **calibrated WPM per voice** measured from the probe MP4s already in storage, plus a ±10% confidence band shown to the user instead of fake precision.
- **No recovery when script is too long** → added an inline **"Switch to 10s" / "Auto-trim"** suggestion right where the error appears.
- **"Start another" during generation** was vague about what carries over → now explicit: keeps image + voice + performance, clears only the script, and shows a small "1 video in background" pill linking to Video Hub.
- **No way to preview voice cadence** before spending 16+ credits → added a **"Preview voice" 5-second TTS sample** of the actual script using the ElevenLabs preview voice already mapped in `seed-voice-samples` (free, no Kling call).
- **Performance presets risked fighting the locked-camera prefix** → reduced to two orthogonal axes (motion + gaze) instead of one fuzzy slider, and each writes one short, additive line — never overrides the prefix.

## 1. Script composer with token pauses

New `src/components/app/video/TalkingScriptComposer.tsx`:

- Textarea + a **mirrored display layer** on top that highlights tokens as pills:
  - `[.]` short pause (~0.25s) — small dot pill
  - `[..]` medium pause (~0.6s) — two-dot pill
  - `[...]` long pause (~1.0s) — three-dot pill
  - `[em]…[/em]` emphasis — underlined pill wrapping selection
- Chip row above the textarea inserts the token at caret.
- A **single source of truth** is the raw string with tokens; `serializeForKling(script)` converts to Kling-friendly punctuation at submit time:
  - `[.]` → `, `, `[..]` → `… `, `[...]` → `. … `, `[em]X[/em]` → `*X*`
- Empty-state placeholder uses one real example with a pill: `Hi [.] welcome to our new collection.`
- Character count stays as a muted footer; primary feedback is the duration meter (#2).

## 2. Calibrated duration meter

New `src/lib/talkingDuration.ts`:

- Tokens-aware tokenizer: strips pause/emphasis tokens before counting words, then adds pause durations separately.
- **Per-voice WPM table** seeded from probe MP4 measurements (kept in the file as a const, with the script + measured seconds in a comment so future calibration is one-line). Initial values from current probes:
  - `ai_kaiya` 158, `girlfriend_4_speech02` 162, `calm_story1` 138, `oversea_male1` 150, `uk_man2` 146, `uk_boy1` 168.
- Formula:
  ```text
  speech  = words / (WPM[voice] * speed) * 60
  pauses  = 0.25*short + 0.6*medium + 1.0*long
  total   = speech + pauses + 0.4   // Kling intro/outro
  band    = ±10%                     // shown as range
  ```
- Returned shape: `{ low, mid, high, fits: 'ok' | 'tight' | 'over', overBy }`.

UI (under textarea):

- Compact bar: `≈ 3.4–4.1s of 5s` with a thin fill bar. Colors via existing tokens (`primary`, `[hsl(38,92%,50%)]` amber, `destructive`).
- States:
  - **ok** (≥0.4s headroom) — neutral
  - **tight** (within 0.4s) — amber, copy: "Close to the limit"
  - **over** — destructive, inline actions: **`Switch to 10s`** (one-click sets duration) and **`Auto-trim`** (truncates at last sentence/pause that fits; never mid-word)
- Generate is blocked only on **over** + 10s already selected.

## 3. Preview voice (5s, no credits)

Tiny button next to the chip row: **`Preview voice`** (disabled until script + voice set).

- Calls a new edge function `preview-talking-voice` that:
  - Takes `{ script, voiceId, speed }`, runs the same `serializeForKling` server-side, then hits ElevenLabs TTS with the voice already mapped in `seed-voice-samples` `VOICE_MAP` and the matching `speed`.
  - Returns base64 MP3 (no storage write). ElevenLabs cost is negligible and not user-billed.
- Frontend plays via `<audio>` element; show a one-line muted note: "Audio preview only — Kling will match the pacing for the final video".
- Hard cap: 8s of generated audio (truncate script if longer so previews stay cheap).
- Rate-limit in the edge function: 30/hour/user via `generation_queue` count or a small `voice_preview_log` table — pick the simpler `generation_queue`-free path with an in-memory Deno map keyed by user ID with a 1-minute window (10 previews/min/user is plenty).

## 4. Performance controls (two small axes)

Replace v1's single trio with two short chip rows under Voice:

- **Motion**: `Still` · `Natural` (default) · `Expressive`
- **Gaze**: `To camera` (default) · `Soft / off-camera`

Stored in component state, forwarded as `meta.performance = { motion, gaze }`. `generate-talking-video/index.ts` appends one additive line each to `STABLE_PROMPT_PREFIX`:

- motion.still → "Body remains static, only mouth, jaw and eyes animate, shoulders fixed."
- motion.expressive → "Allow subtle natural head tilts and light shoulder shifts; hands remain out of frame."
- gaze.soft → "Eyes drift gently between camera and a soft off-camera point, never fully turning away."

The locked-camera prefix and NEGATIVE_PROMPT are untouched, so no risk of breaking lip-sync framing.

## 5. "Start another" during generation

In `TalkingVideoGenerating.tsx` queued/processing card, add a secondary outline button next to "Go to Video Hub":

- **`Start another`** → calls a new `onStartAnother` prop. In `TalkingVideo.tsx` this:
  - Sets `phase = 'idle'`
  - Clears only `script`, `resultVideoUrl`, `resultError`
  - **Keeps** `imageUrl`, `voiceId`, `voiceSpeed`, `performance`, `duration`
  - Leaves the in-flight `activeJobId` in a `backgroundJobIds: string[]` array so polling continues silently
- A persistent muted pill at the top of the form: `1 video generating in background — Open Video Hub` (link). Pill goes away once the background job's poller resolves to complete/failed (toast on complete).
- No queue/credit changes — the background job already debited credits.

## 6. Files

```text
NEW  src/lib/talkingDuration.ts
NEW  src/components/app/video/TalkingScriptComposer.tsx
NEW  src/components/app/video/TalkingPerformancePicker.tsx
NEW  src/components/app/video/BackgroundJobPill.tsx
NEW  supabase/functions/preview-talking-voice/index.ts
EDIT src/pages/video/TalkingVideo.tsx          (composer, meter, performance, background jobs)
EDIT src/components/app/video/TalkingVideoGenerating.tsx  (Start another CTA + onStartAnother prop)
EDIT src/hooks/useTalkingVideoProject.ts        (forward meta.performance)
EDIT supabase/functions/generate-talking-video/index.ts   (read meta.performance, append lines; use serializeForKling output already passed in script)
```

## 7. Out of scope

- No new voices, no voice-language UI change, no pricing change, no queue/worker change.
- No SSML — Kling lip-sync has no SSML; punctuation is the only lever and that's what tokens compile to.
- No real-time mouth preview (would require running Kling — defeats the point of the cheap preview).
- No saving "performance" per-user as a default — kept ephemeral for now.

## 8. Acceptance checks

- Typing `Hi [.] welcome [..] to VOVV.AI` shows three pills in the composer, meter reads ~2.0–2.5s of 5s, Preview voice plays the pacing.
- Overflowing past 5s shows red bar with `Switch to 10s` button; clicking it flips to 10s and bar turns neutral.
- Selecting `Motion: Still` + generating produces a noticeably stiller base render (verified by spot-checking one generation per option).
- Pressing `Start another` mid-generation keeps the photo + voice, clears the script, shows the background pill, and the original video still lands in Video Hub.
