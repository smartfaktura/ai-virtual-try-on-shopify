Root cause found: Kling rejects the current Talking Video request because `generate-talking-video` sends `camera_control` with `model_name: "kling-v2-master"`. Logs show: `Camera control is not supported by the current model`, which causes `process-queue` to fail the job with `Dispatch rejected (500)`.

Plan:
1. Update `supabase/functions/generate-talking-video/index.ts`
   - Remove the unsupported `camera_control` field from the Kling `image2video` request.
   - Keep the locked-camera behavior in the prompt/negative prompt instead, so the talking-head output stays stable without using an unsupported API parameter.
   - Improve the Kling error handling so rejected API responses are saved with the exact provider message.

2. Keep the waiting page behavior intact
   - No instant redirect changes are needed; the current page already shows the generation state.
   - This fix should let the job move past dispatch into normal queued/processing status instead of immediately failing.

3. Deploy and verify
   - Deploy `generate-talking-video`.
   - Test a Talking Video queue dispatch and confirm the previous Kling error no longer appears in function logs.