
UPDATE public.generation_queue q
SET status = 'completed',
    completed_at = COALESCE(gv.completed_at, now()),
    result = COALESCE(q.result, '{}'::jsonb) || jsonb_build_object('video_url', gv.video_url, 'stage', 'complete', 'repaired', true)
FROM public.generated_videos gv
WHERE q.job_type = 'talking_video'
  AND q.status IN ('processing','queued')
  AND gv.workflow_type = 'talking_video'
  AND gv.status = 'complete'
  AND gv.video_url IS NOT NULL
  AND gv.metadata->>'queue_job_id' = q.id::text;
