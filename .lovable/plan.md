Two improvements to `/app/video/talking`:

## 1. Voice preview buttons (▶ play sample)

**Reality check on Kling voices:** Kling does not expose a public TTS preview endpoint — voice IDs like `oversea_male1` only render through the lip-sync pipeline. So we can't fetch live samples on every click. Best path: **generate each sample once, cache it as an MP3 in Supabase Storage, then play from a static URL.**

**Approach:**

- New public storage bucket `voice-samples` (read-only public).
- One-off edge function `seed-voice-samples` (admin-only) that:
  - For each of the 5 `KLING_VOICES`, calls Kling lip-sync with a tiny neutral placeholder face + a fixed 5-word sentence ("Hi, welcome to our studio")
  - Extracts the audio track from the returned MP4 using `ffmpeg-wasm` (or just stores the MP4 — `<audio>` can play MP4 audio)
  - Uploads to `voice-samples/{voice_id}.mp4`
- Manual one-time invocation by us via `curl_edge_functions`. Result: 5 cached files, ~50KB each.
- `KlingVoicePicker.tsx` gains a small ▶ / ◼ button per voice (separate click target from selection). Uses a single shared `<audio>` element + `useRef` so only one sample plays at a time. Plays from `https://{project}.supabase.co/storage/v1/object/public/voice-samples/{id}.mp4`.
- Sample sentence shown as caption under the picker so users know what they're hearing.

If Kling lip-sync seeding turns out unreliable for short clips, fallback is to generate samples with **ElevenLabs** voices chosen to match the Kling personas (close enough for a preview, clearly labeled "approximate preview"). I'll try Kling first.

## 2. Waiting screen + immediate Video Hub visibility

**Two problems today:**

- `TalkingVideo.tsx` calls `setTimeout(() => navigate('/app/video'), 800)` right after enqueue — reloads instantly.
- The `generated_videos` row is only inserted **inside** `generate-talking-video` after the queue worker picks it up. Between enqueue and first poll, the Video Hub shows nothing.

**Fix A — stay on the page with a generating screen (matches Product Images):**

- Replace the navigate-on-success with a local `phase` state: `idle` → `submitting` → `processing` → `complete | failed`.
- When `phase === 'processing'`, render a new `TalkingVideoGenerating` card (mirroring `ProductImagesStep5Generating`): elapsed timer, animated progress bar capped at time-based estimate (~4–6 min for Kling Master + lip-sync), rotating branded messages from `TEAM_MEMBERS`, and a "Safe to leave — your video appears in Video Hub" footer.
- Add a secondary "Go to Video Hub" button so users can leave voluntarily; no auto-redirect.
- Poll `generation_queue` + `generated_videos` by `jobId` every 5s (already supported via `supabase` client). When status flips to `complete`, swap to a result card with the playable video; if `failed`, show the error + a Try Again button.

**Fix B — make the queued video appear in Video Hub immediately:**

- In `enqueue-generation/index.ts`, when `jobType === 'talking_video'`, insert a placeholder row into `generated_videos` right after the queue insert, with:
  - `status = 'queued'`, `workflow_type = 'talking_video'`
  - `source_image_url`, `prompt = script`, `model_name = 'kling-v2-master'`, `duration`, `aspect_ratio` (already in payload)
  - `metadata.queue_job_id = jobId` so we can update/dedupe later
- Update `generate-talking-video/index.ts` to **update** the existing row (matching `metadata->>queue_job_id = jobId`) instead of `insert`, so we don't get duplicates. If no row is found (legacy jobs), fall back to insert.
- Result: the Video Hub's existing realtime subscription on `generated_videos` shows the new card with the processing thumbnail the instant the user enqueues — even before they leave the talking page.

## Files touched

- New: `supabase/functions/seed-voice-samples/index.ts` (admin one-off)
- New: `src/components/app/video/TalkingVideoGenerating.tsx`
- Edit: `src/components/app/video/KlingVoicePicker.tsx` — add play/pause button + caption
- Edit: `src/pages/video/TalkingVideo.tsx` — phase machine, no auto-redirect, render generating screen
- Edit: `supabase/functions/enqueue-generation/index.ts` — insert placeholder `generated_videos` row for `talking_video`
- Edit: `supabase/functions/generate-talking-video/index.ts` — update-by-job-id instead of insert
- New storage bucket: `voice-samples` (public, via migration)

## Out of scope

- No changes to Kling pricing, queue throughput, or other video workflows.
- Voice list stays at the existing 5 Kling voices — no new voices added.