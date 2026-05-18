SELECT set_config('app.trusted_rpc', 'true', true);

UPDATE public.generation_queue
SET status = 'failed',
    completed_at = now(),
    error_message = 'Lip-sync stage timed out — credits refunded'
WHERE id IN (
  '847844c0-48a7-4669-9bfe-6c14ed17fff2',
  'a1a8aee2-b762-4d2a-b0d5-62ccf3170d2b'
)
AND status = 'processing';

SELECT public.refund_credits('fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc'::uuid, 72);

UPDATE public.generated_videos
SET status = 'failed',
    error_message = 'Lip-sync stage timed out — credits refunded'
WHERE id IN (
  '639de233-33f4-4887-a964-fe1c5b92c91f',
  'cfe2264f-ae2e-4288-a2d9-05e785188d91'
)
AND status = 'processing';

SELECT set_config('app.trusted_rpc', '', true);