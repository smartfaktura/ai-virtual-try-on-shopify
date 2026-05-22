
-- Phase 1: Brand Scenes ownership columns
ALTER TABLE public.product_image_scenes
  ADD COLUMN IF NOT EXISTS owner_user_id uuid,
  ADD COLUMN IF NOT EXISTS is_brand_scene boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS brand_scene_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS brand_scene_schema_version int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS brand_scene_module text,
  ADD COLUMN IF NOT EXISTS source_generation_id uuid;

CREATE INDEX IF NOT EXISTS idx_pis_owner_active
  ON public.product_image_scenes (owner_user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_pis_brand_scene
  ON public.product_image_scenes (owner_user_id)
  WHERE is_brand_scene = true;

-- RLS rewrite — replace loose SELECT policies with explicit anon/auth/admin
DROP POLICY IF EXISTS "Public can read active scenes" ON public.product_image_scenes;
DROP POLICY IF EXISTS "Authenticated can read active scenes" ON public.product_image_scenes;

CREATE POLICY "Anon read active global scenes"
  ON public.product_image_scenes
  FOR SELECT TO anon
  USING (is_active = true AND owner_user_id IS NULL);

CREATE POLICY "Auth read scenes"
  ON public.product_image_scenes
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR (is_active = true AND (owner_user_id IS NULL OR owner_user_id = auth.uid()))
  );

CREATE POLICY "Users insert own brand scenes"
  ON public.product_image_scenes
  FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() AND is_brand_scene = true);

CREATE POLICY "Users update own brand scenes"
  ON public.product_image_scenes
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid() AND is_brand_scene = true)
  WITH CHECK (owner_user_id = auth.uid() AND is_brand_scene = true);

CREATE POLICY "Users delete own brand scenes"
  ON public.product_image_scenes
  FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid() AND is_brand_scene = true);

-- Safety trigger
CREATE OR REPLACE FUNCTION public.protect_brand_scene_writes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_brand_scene = true THEN
    IF NEW.scene_id IS NULL OR NEW.scene_id NOT LIKE 'brand-%' THEN
      RAISE EXCEPTION 'Brand scene scene_id must start with "brand-"';
    END IF;
    IF NEW.category_collection = 'bundle' THEN
      RAISE EXCEPTION 'Brand scenes cannot use bundle collection';
    END IF;
    IF NEW.sort_order < 0 AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Only admins can feature scenes (sort_order < 0)';
    END IF;
    IF NEW.owner_user_id IS NULL THEN
      RAISE EXCEPTION 'Brand scenes must have owner_user_id set';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE'
     AND OLD.owner_user_id IS NOT NULL
     AND NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Cannot change owner_user_id';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_brand_scene_writes_trg ON public.product_image_scenes;
CREATE TRIGGER protect_brand_scene_writes_trg
  BEFORE INSERT OR UPDATE ON public.product_image_scenes
  FOR EACH ROW EXECUTE FUNCTION public.protect_brand_scene_writes();
