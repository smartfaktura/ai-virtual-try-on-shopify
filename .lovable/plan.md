## Root cause

Latest talking video failed lip-sync with Kling error:
`input.audio_type value 'text' is invalid`

In `supabase/functions/poll-stuck-videos/index.ts` we submit lip-sync with:
```ts
input: {
  video_url: permanentUrl,
  audio_type: "text",         // ← wrong field name
  text: script.slice(0, 120),
  voice_id, voice_language, voice_speed,
}
```

Kling's lip-sync API uses `mode: "text2video" | "audio2video"`, not `audio_type`. Because submission fails, the code immediately runs the silent-fallback path (saves base video, refunds 8 credits, sets `silent_fallback: true`). So every talking video has been delivered without audio.

## Fix

### 1. `supabase/functions/poll-stuck-videos/index.ts`
Replace the lip-sync request body with the correct Kling schema:
```ts
input: {
  video_url: permanentUrl,
  mode: "text2video",
  text: script.slice(0, 120),
  voice_id: voiceId,
  voice_language: voiceLanguage,
  voice_speed: voiceSpeed,
}
```

No other logic changes — the stage-2 polling, timeout, silent-fallback, and queue-sync code stays as-is and will now actually receive a real `lipsync_task_id`.

### 2. Repair the latest row (`51f85fbc…`)
The base video is intact in storage. Re-arm stage 2 so the next `poll-stuck-videos` tick resubmits lip-sync with the fixed payload:
- Set `status='processing'`, clear `completed_at`
- `metadata.stage='base_video'`, `metadata.silent_fallback=false`, clear `lipsync_error`
- Reset `kling_task_id` to the base-video task id so polling detects "succeed" again and runs the (now-fixed) stage-2 submit branch
- Re-open the queue row (status `processing`) and reverse the 8-credit silent-fallback refund

### 3. Deploy
Deploy `poll-stuck-videos` immediately after the edit.

## Out of scope
- No UI changes
- No changes to `generate-talking-video` (stage 1 is fine)
- No changes to credit pricing or voice picker
