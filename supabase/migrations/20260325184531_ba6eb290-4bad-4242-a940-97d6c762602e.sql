ALTER TABLE public.generated_videos
  ADD COLUMN IF NOT EXISTS negative_prompt text,
  ADD COLUMN IF NOT EXISTS cfg_scale numeric,
  ADD COLUMN IF NOT EXISTS camera_type text;