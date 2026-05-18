# Talking Video — Safe Rollout Plan

Kling-only pipeline (TTS + lip-sync, no ElevenLabs, no ffmpeg). Two stages chained via the existing `poll-stuck-videos` cron, fully isolated from current video flows.

## Why this is safe

- **Additive only** — no edits to logic of `generate-video`, `generate-freestyle`, `mux-video-audio`, ElevenLabs functions, billing RLS, or `enqueue_generation` RPC.
- **New job_type `talking_video`** routes to a brand-new worker. The route map is a pure lookup — adding one key cannot affect any other key.
- **Kill switch** — `generate-talking-video` checks `TALKING_VIDEO_ENABLED` env var; flip to `false` to disable instantly without redeploys.
- **Existing safety net** — `process-queue` already fails + refunds on unknown job types, so even a typo cannot wedge the dispatcher.
- **No schema changes beyond what shipped** (`generated_videos.metadata` JSONB + `workflow_type` index).
- **Reuses proven billing** — `enqueue_generation` reserves, `refund_credits` / `cancel_queue_job` handle failures and cancels.

## Pipeline

```text
TalkingVideoModal
  -> enqueue-generation (job_type='talking_video', credits=22 or 36)
  -> process-queue dispatches -> generate-talking-video (Stage 1)
       - submit Kling image2video, camera_fixed, talking-head prompt
       - insert generated_videos { workflow_type:'talking_video',
                                   status:'processing',
                                   metadata:{ stage:'base_video',
                                              script, voice_id,
                                              voice_language, voice_speed } }
       - write kling_task_id into queue.result
  -> poll-stuck-videos (every 1 min, EXISTING cron)
       - stage 'base_video' done -> call kling-lip-sync
                                    (audio_type='text', text, voice_id, speed)
                                    set metadata.stage='lipsync',
                                        metadata.lipsync_task_id=...
       - stage 'lipsync'   done -> swap video_url, status='complete'
       - stage 'lipsync' failed -> keep base video, status='complete',
                                   metadata.silent_fallback=true,
                                   refund 8 credits
```

## Files

### New
- `supabase/functions/generate-talking-video/index.ts` — already scaffolded; finish Stage 1 + add `TALKING_VIDEO_ENABLED` kill switch.
- `src/components/app/video/TalkingVideoModal.tsx` — script field (≤120 chars), voice picker, reference image picker (model or scene), Generate.
- `src/components/app/video/KlingVoicePicker.tsx` — curated Kling voice IDs grouped by language (e.g. `oversea_male1`, `oversea_female1`, `ai_kaiya`).
- `src/hooks/useTalkingVideoProject.ts` — calls `enqueue-generation`, optimistic toast, subscribes to `generated_videos` via existing realtime channel.
- `src/lib/talkingVideoPromptBuilder.ts` — locked-camera prompt + negative prompt + 120-char clamp.

### Edited (additive only)
- `supabase/functions/process-queue/index.ts` — add one key:
  ```ts
  talking_video: "generate-talking-video",
  ```
  Existing keys untouched. Dispatcher behavior identical for every other job_type.
- `supabase/functions/poll-stuck-videos/index.ts` — branch on `workflow_type='talking_video'`: when Stage 1 completes, call `kling-lip-sync` (action `create`, `audio_type:"text"`); when Stage 2 completes, swap URL. Silent-fallback path on Stage 2 failure + 8-credit refund via `refund_credits`. Existing `generate-video`/`video_multishot` paths unchanged.
- `src/lib/videoCreditPricing.ts` — add `talkingVideo: { base5s: 22, base10s: 36 }`.
- `src/pages/VideoHub.tsx` — add a `VideoWorkflowCard` "Talking Video" that opens `TalkingVideoModal`. No existing cards modified.

### Not touched
`generate-video`, `generate-freestyle`, `mux-video-audio`, `elevenlabs-*`, billing triggers/RPCs, RLS policies, `generation_queue` schema, `enqueue_generation` RPC.

## Validation (Stage 1, server-side)

- `script`: 1–120 chars, ASCII + common punctuation → 400 if invalid.
- `voice_id`: must match curated allowlist.
- `reference_image_url`: required; must be on our storage origin.
- `duration`: `5` or `10`.

## Credits

- 5s: **22 credits** · 10s: **36 credits**
- Reserved upfront by `enqueue_generation`.
- Stage 1 fails → full refund (existing path).
- Stage 2 fails → refund 8 credits, keep silent base video.
- User cancels → existing `cancel_queue_job` handles full refund.

## Acceptance tests

1. Built-in model + "Hello, welcome to our store." (5s) → mp4 in ~5 min, mouth in sync.
2. Script 200 chars → 400 "Script must be ≤120 characters".
3. Force Stage 2 failure → silent base video delivered + 8-credit refund.
4. Cancel mid-Stage-1 → full refund, no row stuck in `processing`.
5. Regression: existing `generate-video` workflow still works unchanged.
6. Set `TALKING_VIDEO_ENABLED=false` → new requests fail fast with full refund; all other queue traffic unaffected.

## Rollout order (each step independently revertible)

1. Finish `generate-talking-video` Stage 1 + kill switch.
2. Add `talking_video` line to `process-queue` route map.
3. Extend `poll-stuck-videos` with Stage 2 chain + silent fallback.
4. Add pricing constant.
5. Build UI (modal + voice picker + hook + VideoHub card).
6. Run acceptance tests, then announce.

If any step misbehaves, the previous deploy keeps every other workflow fully working.
