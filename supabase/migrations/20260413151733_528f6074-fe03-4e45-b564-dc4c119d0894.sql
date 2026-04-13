ALTER TABLE public.model_sort_order
  ADD COLUMN IF NOT EXISTS name_override text,
  ADD COLUMN IF NOT EXISTS gender_override text,
  ADD COLUMN IF NOT EXISTS body_type_override text,
  ADD COLUMN IF NOT EXISTS ethnicity_override text,
  ADD COLUMN IF NOT EXISTS age_range_override text,
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;