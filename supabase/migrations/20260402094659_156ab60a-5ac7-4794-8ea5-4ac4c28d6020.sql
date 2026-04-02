
ALTER TABLE public.custom_scenes ADD COLUMN IF NOT EXISTS preview_image_url text DEFAULT NULL;
