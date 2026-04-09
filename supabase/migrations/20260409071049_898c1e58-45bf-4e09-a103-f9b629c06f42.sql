
ALTER TABLE public.user_products
  ADD COLUMN IF NOT EXISTS back_image_url text,
  ADD COLUMN IF NOT EXISTS side_image_url text,
  ADD COLUMN IF NOT EXISTS packaging_image_url text,
  ADD COLUMN IF NOT EXISTS extra_image_urls text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weight text,
  ADD COLUMN IF NOT EXISTS materials text,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS sku text;
