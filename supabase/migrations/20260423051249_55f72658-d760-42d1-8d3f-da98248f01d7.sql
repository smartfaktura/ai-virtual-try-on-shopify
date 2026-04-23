ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS product_subcategories text[] NOT NULL DEFAULT '{}'::text[];