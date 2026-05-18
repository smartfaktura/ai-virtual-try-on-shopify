## New architecture: ElevenLabs voiceover + Kling lip-sync

Instead of letting Kling generate the speech (which has no preview, fewer voices, and inconsistent pacing), we generate the audio ourselves with ElevenLabs and feed it to Kling's lip-sync. This is exactly what `kling-lip-sync` already supports (`audio_type: "file"` + `audio_url`).

### Why this is better
- **Voice quality**: ElevenLabs (the same voice users previewed) instead of Kling TTS
- **Preview parity**: what you hear in Preview voice IS what ends up in the video
- **Voice choice**: 6 mapped voices today, easily expandable
- **Pacing control**: ElevenLabs `speed` + punctuation honored precisely
- **Determinism**: audio duration known upfront → we can tell Kling to render a base video that matches it

### New pipeline

```text
Stage 0  Generate voiceover (ElevenLabs)
         - serialize script (pauses → punctuation)
         - call ElevenLabs TTS with chosen voice + speed
         - upload MP3 to generated-audio bucket (user-prefixed)
         - measure duration (parse from MP3 header)

Stage 1  Generate silent base video (Kling image2video)
         - choose 5s or 10s based on measured audio duration
         - new structured talking-head prompt (locked camera, mouth visible, etc.)
         - poll until ready (existing poll-stuck-videos handles this)

Stage 2  Lip-sync (kling-lip-sync action=create)
         - input: base video_url + ElevenLabs audio_url
         - audio_type: "file"
         - poll until ready

Stage 3  Persist final video_url to generated_videos
```

Stages 0 and 1 can run in parallel (audio generation is fast, ~3-8s; base video takes minutes). We wait for both before stage 2.

### Code changes

**Frontend**
- Keep the existing `TalkingScriptComposer` minus the **Emphasis** chip and `[em]` logic (it doesn't help when we control the audio)
- Keep the Preview voice button — now it's truly representative of the final voice
- Replace the Motion presets with clearer **Locked / Natural / Presenter** + simple gaze
- No changes to credit pricing, duration picker, library picker, or reference upload

**Backend: `generate-talking-video` (rewritten flow)**
1. Validate payload (script, voice, image, performance, duration)
2. Call ElevenLabs TTS server-side:
   - voice = mapped ElevenLabs id (same VOICE_MAP)
   - model = `eleven_multilingual_v2` (final quality)
   - speed, stability, similarity_boost from request
3. Upload MP3 to `generated-audio/<user_id>/talking/<job_id>.mp3`
4. Create a signed URL for Kling (long expiry)
5. Submit Kling image2video with new structured prompt + duration matched to audio
6. Save row with `metadata.stage = "base_video"`, `metadata.audio_url`, `metadata.audio_duration`

**`poll-stuck-videos`** (existing handler for talking videos)
- When stage 1 completes → call `kling-lip-sync` action=create with `video_url` + saved `audio_url`
- Update `metadata.stage = "lipsync"`, save `lipsync_task_id`
- When stage 2 completes → finalize `video_url`, set status `complete`

**`kling-lip-sync`** — no changes needed, already supports `audio_url + audio_type: "file"`

**New structured Kling prompt** (replaces loose prompt + appended performance lines):
```text
CAMERA: Locked vertical frame, no pan/zoom/dolly/orbit/shake/reframe
SUBJECT: Single person, head and shoulders, face unobstructed, mouth fully visible
PERFORMANCE: <Locked | Natural | Presenter lines>
GAZE: <camera | soft glance>
SPEECH READINESS: natural jaw + lip articulation, gentle blinks, soft breathing
SAFETY: hands stay out of frame, nothing crosses mouth, no profile turn
STYLE: preserve reference identity, wardrobe, lighting, background unless scene_hint given
```
Plus expanded negative prompt for talking-head failure modes (mouth covered, teeth warping, face melting, duplicate face, profile turn, hands near face, jitter, camera dolly).

### Edge cases handled
- **Audio longer than picked duration** → auto-bump duration from 5s to 10s, or fail with a clear "trim your script" message
- **ElevenLabs failure** → fail the job before consuming Kling credits, refund
- **Storage upload failure** → fail before Kling, refund
- **Lip-sync failure** → keep silent base video as fallback (existing `silent_fallback` flag), notify user

### Cleanup
- Remove the old preview-only edge function `preview-talking-voice` (or repurpose it as the shared TTS helper used in stage 0 — preferred, less duplication)
- Remove the **Emphasis** chip from the composer
- Remove `[em]`/`[/em]` from serializeForKling and the token regex
- Update `mem://features/video-generation-full-system` to reflect the new two-stage pipeline once shipped

### Out of scope
- No pricing change (cost stays the same: 5s and 10s tiers)
- No new voices (we can expand later)
- No schema changes — everything stored in existing `metadata` JSONB