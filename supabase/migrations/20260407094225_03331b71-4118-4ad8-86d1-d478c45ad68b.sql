ALTER TABLE public.reference_analyses
  ADD COLUMN IF NOT EXISTS depth_of_field text DEFAULT '',
  ADD COLUMN IF NOT EXISTS color_grading text DEFAULT '',
  ADD COLUMN IF NOT EXISTS texture_detail text DEFAULT '',
  ADD COLUMN IF NOT EXISTS reflections text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contrast_level text DEFAULT '',
  ADD COLUMN IF NOT EXISTS saturation_level text DEFAULT '',
  ADD COLUMN IF NOT EXISTS key_visual_elements text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS negative_space text DEFAULT '',
  ADD COLUMN IF NOT EXISTS product_placement text DEFAULT '',
  ADD COLUMN IF NOT EXISTS background_detail text DEFAULT '';