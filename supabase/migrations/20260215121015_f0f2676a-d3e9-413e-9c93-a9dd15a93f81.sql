
-- Add new columns to creative_schedules
ALTER TABLE public.creative_schedules
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS theme_notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS images_per_drop integer NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS model_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS scene_config jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS start_date timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS estimated_credits integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS include_freestyle boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS freestyle_prompts text[] NOT NULL DEFAULT '{}';

-- Add new columns to creative_drops
ALTER TABLE public.creative_drops
  ADD COLUMN IF NOT EXISTS credits_charged integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_images integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS download_url text,
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]';
