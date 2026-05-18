
UPDATE public.generated_videos
SET status = 'failed',
    error_message = 'Generation could not start. Credits have been refunded.',
    completed_at = now()
WHERE id = 'bbbb8992-d4d8-4221-af04-3c55d5b80c24';

UPDATE public.generated_videos
SET status = 'complete',
    completed_at = COALESCE(completed_at, now()),
    metadata = metadata || jsonb_build_object(
      'stage', 'complete',
      'silent_fallback', true,
      'lipsync_error', 'Lip-sync timed out — silent fallback applied manually',
      'base_video_url', video_url
    )
WHERE id = '5f279313-051f-4eaa-938e-3b06d24d8063';

SET LOCAL ROLE service_role;
SELECT public.refund_credits('fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc'::uuid, 8);
RESET ROLE;
