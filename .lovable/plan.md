## Goal
Determine which of the 8 non-Kaiya voice IDs actually work with Kling's `/videos/lip-sync` endpoint, and trim the picker to only the working ones.

## Voice IDs to test
- `oversea_male1`, `oversea_male2`
- `oversea_female1`, `oversea_female2`
- `commercial_lady_en_f-v1`
- `reader_en_m-v1`
- `uk_man2`, `uk_boy1`

(`ai_kaiya` is already confirmed working and stays.)

## Test procedure
1. Pick the most recent successfully-generated base MP4 in the `generated-videos` bucket and create a 1-hour signed URL for it.
2. For each of the 8 voice IDs, submit a `/videos/lip-sync` request to Kling with:
   - the signed video URL
   - a short fixed script (e.g. "Hello, this is a voice test.")
   - `voice_id` = the candidate ID
   - `voice_language` set per ID (English for the 6 English IDs; Chinese for `oversea_*` if Kling docs require it — try both if first fails)
3. Capture the immediate response. Two outcomes matter:
   - HTTP 200 with a task_id → mark as **accepted**, then poll the task once after ~60s to confirm it completes (not just accepted).
   - Any error (`Voice id not found`, invalid param, etc.) → mark as **rejected** with the exact error string.
4. Record results in a table.

No videos are kept; this is a probe-only round. No credits are charged to users.

## Apply results
- Update `src/components/app/video/KlingVoicePicker.tsx`: remove any voice whose ID failed both the submit and the poll step.
- Update `supabase/functions/seed-voice-samples/index.ts`: remove the matching `VOICE_MAP` entries for any removed voices (and delete their orphaned sample MP3s from the `voice-samples` bucket).
- Leave `ai_kaiya` and any confirmed-working IDs in place with their existing ElevenLabs preview samples.

## Deliverable to you
A short report listing each of the 8 IDs as **kept** or **removed**, with the Kling error message for removed ones, plus a confirmation that the picker now shows only working voices.

## Out of scope
- No changes to `generate-talking-video`, credit pricing, UI layout, or the silent-fallback behavior.
- No new voices added.
- No retry of previously-failed user videos.
