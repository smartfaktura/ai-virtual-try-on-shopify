ALTER TABLE public.discover_submissions
  ADD COLUMN IF NOT EXISTS product_name text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS product_image_url text DEFAULT NULL;