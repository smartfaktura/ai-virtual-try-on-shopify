
# Talking Video — Lip-Sync Quality + Audio/Video Duration Fix

## Why it looks off today

Two separate issues, both rooted in `generate-talking-video` + `poll-stuck-videos`:

### 1. Lip-sync isn't tight
The **base** Kling clip is generated with a prompt that tells the model to act *as if already speaking*:
> "Natural jaw and lip articulation as if speaking… engaged expression."

So the base mp4 already has the mouth moving on its own timing. Then `kling-lip-sync` is layered on top — it warps the mouth toward the ElevenLabs audio, but it's fighting motion that's already there. Result: soft, slightly mushy sync, occasional double-articulation.

### 2. Video keeps "talking" after voice ends
Kling base clips are fixed-length: **5s or 10s**. If the ElevenLabs voiceover is e.g. 6.2s, we still submit a 10s base clip. Lip-sync only drives the mouth where audio exists — the remaining ~3.8s falls back to the base clip's own mouth motion (which, per the prompt above, is "articulating as if speaking"). Visually: the head keeps mouthing silently after sound stops.

We also auto-bump 5s→10s using a `roughDurationSeconds()` estimate based on words/wpm, which over-shoots for short scripts.

---

## Fix plan (no UI changes)

### A. Make base video neutral, not "pre-talking"
Rewrite `buildStructuredPrompt` in `supabase/functions/generate-talking-video/index.ts`:

- Remove the "natural jaw and lip articulation as if speaking" line.
- Replace with: "Mouth relaxed and lightly closed at start. No speaking motion in the base clip — lips only move when driven externally. Soft natural blinks, quiet breathing."
- Strengthen `NEGATIVE_PROMPT`: add `mouthing words, silent talking, lip flapping, jaw chewing, talking without audio`.

This gives Kling lip-sync a clean canvas to drive, which both **tightens sync** and **stops the silent-mouthing tail**.

### B. Pad the ElevenLabs audio to match base video length
Right now the base clip is 5s or 10s but the audio is whatever ElevenLabs returns. We'll:

1. After ElevenLabs returns the MP3, **measure its real duration** by parsing the MP3 frame headers in Deno (small inline function — no ffmpeg needed).
2. Choose `duration` ("5" vs "10") from the *measured* audio length + 0.4s tail, instead of the rough word-count estimate.
3. **Append silence** (a tiny pre-generated silent MP3 frame, repeated) so the final audio length equals exactly `duration` seconds.
4. Upload the padded MP3 to `generated-audio` and use it for lip-sync.

Effect: lip-sync now drives the mouth for the *entire* base clip — the padded silent tail produces a naturally closed mouth instead of inheriting base-clip mumbling.

Store `audio_duration_sec` (real) and `audio_padded_to_sec` in metadata for debugging.

### C. Use Kling's higher-fidelity lip-sync settings
In `poll-stuck-videos` stage-2 submit, current body is:
```
{ input: { video_url, mode: "audio2video", audio_type: "url", audio_url } }
```
Add the explicit accuracy controls Kling supports:
- `voice_language`: pass through from metadata ("en" / "zh") so phoneme matching uses the right model.
- Confirm `mode: "audio2video"` (already correct — that's the high-quality path; "text2video" is the legacy TTS one we abandoned).

If Kling rejects extra fields we'll log and drop them — fallback chain already handles failures.

### D. Tighter duration estimator (defense in depth)
`src/lib/talkingDuration.ts` currently feeds the UI estimate. After (B), the server picks duration from real audio length, so client estimate is just for the live counter — leave it alone unless it's wildly off. No code change required here unless QA shows drift.

---

## Files touched

- `supabase/functions/generate-talking-video/index.ts`
  - Rewrite `buildStructuredPrompt` (neutral mouth).
  - Strengthen `NEGATIVE_PROMPT`.
  - Add `measureMp3DurationSec()` helper.
  - Add `padMp3ToSeconds()` helper (append silent MP3 frames).
  - Replace `roughDurationSeconds`-based duration pick with measured length.
  - Upload the **padded** audio; record real + padded duration in metadata.

- `supabase/functions/poll-stuck-videos/index.ts`
  - Pass `voice_language` (and any other supported accuracy hints) into the `/videos/lip-sync` body when present in metadata.
  - No behavior change for non-talking flows.

- `.lovable/plan.md` — log the change.

## Out of scope

- No UI changes (voice picker, performance picker, composer all stay).
- No credit/pricing changes.
- No new dependencies (MP3 measurement is a small pure-Deno function).
- No changes to the realtime/queue plumbing or the silent-fallback refund path.

## Expected outcome

- Sharper lip-sync (mouth is a blank canvas, not pre-animated).
- No more silent mouthing after the voice ends — the mouth stays closed for the padded tail.
- Same total clip length (5s or 10s) but it now actually matches the audio envelope.
