## Talking Video Workflow — Kling-only (revised)

A new video workflow alongside Animate / Start-End / Ad Sequence / Consistent Model: pick a model reference (+ optional scene), write a script, pick a Kling voice — Kling generates the base video AND the speech + lip-sync in one pipeline. No ElevenLabs.

### User flow

1. **New "Talking Video" card** in `VideoHub` workflows grid.
2. Modal with 4 compact steps:
   - **Reference**: pick a model from library (required, reuses `LibraryPickerModal`). Optional scene reference for background.
   - **Script**: textarea, max 280 chars (~15s @ 2 words/sec, well within one 5s or 10s shot). Live duration estimate + char counter.
   - **Voice**: Kling preset voices grid (8 curated: 4 EN male/female, 2 ES, 2 multilingual). Speed slider 0.8–1.5 (Kling supported range).
   - **Settings**: aspect ratio 9:16 / 1:1 / 16:9, duration auto (5s if ≤10 words, otherwise 10s).
3. **Credit estimate** live.
4. Submit → queued → progress card in Recent Videos.

### Pipeline (single edge function: `generate-talking-video`)

```text
Stage 1: Kling text-to-video (or image-to-video from model reference)
         model: kling-v2-master, camera_fixed=true, prompt enforces
         "stable medium close-up, mouth visible, subtle natural motion,
          no camera movement, no head turns"
         ──► silent base video URL

Stage 2: Kling Lip-Sync API
         POST /v1/videos/lip-sync with:
           input.video_url = base video URL
           input.audio_type = "text"        ← key change: text-to-speech native
           input.text = script
           input.voice_id = selected_voice
           input.voice_language = "en" | "es" | etc
           input.voice_speed = speed
         ──► final talking video URL

Stage 3: Download → upload to generated-videos bucket → mark complete
```

This uses **Kling's built-in TTS via lip-sync** (`audio_type: "text"`) — same API call, no separate audio file, no ffmpeg muxing, no ElevenLabs. One vendor, one bill, one less failure mode.

### Camera stability (your requirement)

Hard-coded for every talking-video job:
- `camera_fixed: true` in Kling call
- Prompt prefix: `"locked-off camera, no pan, no zoom, no dolly, subject centered and steady, talking-head framing, mouth fully visible, natural blinking and breathing only"`
- Negative prompt: `"camera movement, panning, zooming, head turning away, fast motion, mouth occluded"`

### Credits (revised, lower since no ElevenLabs)

Add to `VIDEO_CREDIT_RULES`:
```ts
talkingVideo: {
  base5s: 22,    // kling v2-master 5s (~16) + lip-sync (~6)
  base10s: 36,   // kling v2-master 10s (~26) + lip-sync (~10)
}
```

### Resilience (your "make sure it will work" requirement)

1. **Pre-flight validation**: reject script > 280 chars, reject if Kling credentials missing, reject if model reference image fails to load.
2. **Stage 1 retry**: if Kling base video fails, retry once with simpler prompt (just model + "talking to camera"). After 2 fails → refund, mark failed.
3. **Stage 2 polling**: 5s interval, max 8 min timeout. If lip-sync fails → keep the silent base video as a deliverable, mark `status='complete_silent'`, partial refund of lip-sync portion (~6 credits), surface clear UI message: "Lip-sync unavailable — base video delivered."
4. **Idempotency**: store stage state in `generated_videos.metadata.stage` (`tts → base → lipsync → done`). Re-entrant poller picks up where it left off.
5. **Pre-launch smoke test**: deploy function, run one end-to-end test with my model + "Hello, this is a test" before exposing the UI card. UI card hidden behind `feature_flag: 'talking_video'` until verified.
6. **Logging**: every Kling API call logs `[talking-video] stage=X taskId=Y` so failures are diagnosable in 30 seconds.

### Data

No schema changes. Reuses:
- `generation_queue` with `job_type='talking_video'`
- `generated_videos` with `metadata = { script, voice_id, stage, base_video_url, lipsync_task_id, silent_fallback: boolean }`
- Existing RLS policies (owner-only)

### Files

**New**
- `supabase/functions/generate-talking-video/index.ts` — orchestrator + Kling calls + Kling lip-sync (text mode)
- `src/components/app/video/talking/TalkingVideoModal.tsx` — 4-step wizard
- `src/components/app/video/talking/KlingVoicePicker.tsx` — 8 curated voices, preview disabled (Kling has no preview endpoint — show voice description + sample subtitle)
- `src/hooks/useTalkingVideoProject.ts` — local state + enqueue
- `src/lib/talkingVideoPromptBuilder.ts` — stable-camera prompt builder

**Edited**
- `src/pages/VideoHub.tsx` — add Talking Video workflow card (feature-flagged off initially)
- `src/config/videoCreditPricing.ts` — add `talkingVideo` rules
- `supabase/functions/poll-stuck-videos/index.ts` — handle `talking_video` state machine
- `src/hooks/useGenerateVideo.ts` — extend types

### What this does NOT touch

- ElevenLabs functions (untouched)
- Existing video workflows (Animate, Start-End, Short Film) — zero shared code paths edited
- `mux-video-audio` — not used (Kling delivers final muxed video)
- DB schema — no migrations
- Billing/credits trigger — no changes
- RLS policies — no changes

### Risks & mitigations

| Risk | Mitigation |
|---|---|
| Kling text mode voice quality varies | Curate only the 8 voices we test and approve |
| Lip-sync misalignment on stylized models | Forced camera_fixed + framing prompt; silent fallback if it fails |
| Long script overflows 10s video | Hard cap at 280 chars enforced client + server |
| Kling API outage | Feature flag lets us hide the card instantly |
| Cost overrun | Credit price set above measured cost; 1-click refund on failure |

### Acceptance test before turning the flag on

1. Generate talking video with built-in model + "Hello, welcome to our store" → expect a 5s talking video in <5 min.
2. Generate with intentionally long script → expect 422 client validation error.
3. Force Kling lip-sync 500 → expect silent fallback + partial refund.
4. Cancel mid-generation → expect full refund, no orphan rows.
