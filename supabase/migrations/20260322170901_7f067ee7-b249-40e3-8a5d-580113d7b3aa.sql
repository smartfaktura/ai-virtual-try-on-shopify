ALTER TABLE public.discover_presets ADD COLUMN product_name text, ADD COLUMN product_image_url text;
ALTER TABLE public.generation_jobs ADD COLUMN product_name text, ADD COLUMN product_image_url text;