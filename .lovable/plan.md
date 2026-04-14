

# Why Video Has No Preview + No Music/Audio

## Root Cause

The page **reloaded mid-generation** (the version-check bug we just fixed). This caused:

1. **No preview thumbnail** — The client-side polling (`pollQueueJobCompletion`) was interrupted. The video likely completed on Kling's side, but the status poll that saves `preview_url` and `video_url` to `generated_videos` never ran → broken thumbnail in Video Hub.

2. **No music/SFX/voiceover** — Audio generation (`generateAudio()`) is called AFTER the video poll completes (line 1054-1066). Since the page reloaded, `generationSucceeded` was never set → `generateAudio()` never executed → zero calls to `elevenlabs-music`, `elevenlabs-tts`, or `elevenlabs-sfx`.

3. **Broken thumbnail in screenshot** — The `source_image_url` is set when the `generated_videos` row is inserted, but it points to a private storage path. Without `preview_url` being set (requires successful poll), the card falls back to `source_image_url` which may be an unsigned/expired URL.

## Problems to Fix

### Problem 1: No recovery for interrupted polls
If the page reloads or the user navigates away during generation, there's no mechanism to resume polling or recover the video result. The video completes on Kling but the DB row stays stuck at `status: 'processing'`.

### Problem 2: Audio is entirely dependent on uninterrupted client session
Audio generation only runs if the video poll completes in the same session. There's no way to generate audio after the fact for a completed project.

### Problem 3: Broken thumbnails for stuck videos
Videos stuck in `processing` state show broken image thumbnails because `preview_url` is null and `source_image_url` may be unsigned.

## Changes

### File: `supabase/functions/generate-video/index.ts`
**Add a `recover` action** — a new action that takes a `project_id`, finds any `generated_videos` rows stuck in `processing`, re-polls their Kling task IDs, and updates `video_url` + `preview_url` if the video has completed. This is a server-side recovery mechanism.

### File: `src/hooks/useShortFilmProject.ts`
**Add project recovery on load** — When a project is loaded from `draft_state_json` with `status: 'processing'`, automatically call the `recover` action to check if the video actually completed. If it did, update the UI and offer to generate audio.

**Add "Generate Audio" button for completed projects missing audio** — If a project has `status: 'complete'` but no `music_track_url`, show the audio generation controls so the user can trigger it manually.

### File: `src/pages/VideoHub.tsx`
**Fix broken thumbnails** — For videos with no `preview_url` and no valid `source_image_url`, show a fallback gradient/placeholder instead of a broken image icon. Also sign `source_image_url` when used as fallback.

### File: `src/hooks/useGenerateVideo.ts`
**Sign source_image_url fallback** — When `preview_url` is null, ensure `source_image_url` is also signed via `toSignedUrl()` so it doesn't show as broken.

## Summary

| File | Change |
|------|--------|
| `generate-video/index.ts` | Add `recover` action to re-poll stuck Kling tasks |
| `useShortFilmProject.ts` | Auto-recover on project load + allow standalone audio generation for completed projects |
| `VideoHub.tsx` | Fallback placeholder for missing thumbnails |
| `useGenerateVideo.ts` | Sign `source_image_url` when used as thumbnail fallback |

