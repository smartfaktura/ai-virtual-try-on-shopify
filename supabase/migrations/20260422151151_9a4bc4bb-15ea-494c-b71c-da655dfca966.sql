ALTER TABLE public.recommended_scenes ADD COLUMN IF NOT EXISTS category text;

CREATE INDEX IF NOT EXISTS recommended_scenes_category_idx
  ON public.recommended_scenes(category, sort_order);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recommended_scenes_scene_id_key'
  ) THEN
    ALTER TABLE public.recommended_scenes DROP CONSTRAINT recommended_scenes_scene_id_key;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recommended_scenes_cat_scene_uniq'
  ) THEN
    ALTER TABLE public.recommended_scenes
      ADD CONSTRAINT recommended_scenes_cat_scene_uniq UNIQUE (category, scene_id);
  END IF;
END $$;