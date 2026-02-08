ALTER TABLE public.freestyle_generations
  ADD COLUMN model_id text,
  ADD COLUMN scene_id text,
  ADD COLUMN product_id uuid REFERENCES public.user_products(id) ON DELETE SET NULL;