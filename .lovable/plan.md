**Finding**
- The latest Talking Video did generate the base video, but the lip-sync step failed with Kling error: `Something went wrong when we tried to get the contents of the file.`
- Cause: the backend saved the base MP4 into the private `generated-videos` bucket, then sent Kling a `/object/public/...` URL. That URL is not publicly readable, so Kling cannot fetch it to add the voice.

**Plan**
1. **Fix future Talking Video generations**
   - Update `supabase/functions/poll-stuck-videos/index.ts` so the lip-sync submit step sends Kling a short-lived signed video URL instead of the private/public storage URL.
   - Keep storing the final base and lip-synced videos in the private video bucket for user privacy.

2. **Improve error handling**
   - Preserve the existing silent fallback behavior only if lip-sync truly fails after Kling can access the video.
   - Store clearer metadata when lip-sync submission fails, including whether the failure was an access/signing issue.

3. **Recover the latest silent video**
   - Re-submit lip-sync for the latest `silent_fallback: true` Talking Video using its saved base video, script, voice, and signed URL.
   - If Kling succeeds, update that same video record so the Video Hub points to the voiced MP4.
   - If it fails again, keep the silent base video and leave the error visible in metadata.

4. **Validate**
   - Deploy the updated backend function.
   - Run the poll/recovery path once.
   - Check backend logs confirm lip-sync submission returns a Kling task ID instead of the file-access error.
   - Confirm the latest video row is no longer `silent_fallback: true` after successful lip-sync.