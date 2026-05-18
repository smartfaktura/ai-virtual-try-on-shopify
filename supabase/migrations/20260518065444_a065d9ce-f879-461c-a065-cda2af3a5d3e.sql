ALTER TABLE public.generated_videos
ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_generated_videos_workflow_type
  ON public.generated_videos (workflow_type)
  WHERE workflow_type IS NOT NULL;