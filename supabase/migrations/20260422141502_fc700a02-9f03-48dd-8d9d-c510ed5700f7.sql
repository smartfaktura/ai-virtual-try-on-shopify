-- Additive columns on product_image_scenes
ALTER TABLE public.product_image_scenes
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS shot_style text,
  ADD COLUMN IF NOT EXISTS setting text,
  ADD COLUMN IF NOT EXISTS mood text,
  ADD COLUMN IF NOT EXISTS filter_tags text[] DEFAULT '{}';

-- Additive columns on custom_scenes
ALTER TABLE public.custom_scenes
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS shot_style text,
  ADD COLUMN IF NOT EXISTS setting text,
  ADD COLUMN IF NOT EXISTS mood text,
  ADD COLUMN IF NOT EXISTS filter_tags text[] DEFAULT '{}';

-- Indexes
CREATE INDEX IF NOT EXISTS product_image_scenes_subject_idx     ON public.product_image_scenes(subject);
CREATE INDEX IF NOT EXISTS product_image_scenes_shot_style_idx  ON public.product_image_scenes(shot_style);
CREATE INDEX IF NOT EXISTS product_image_scenes_setting_idx     ON public.product_image_scenes(setting);
CREATE INDEX IF NOT EXISTS product_image_scenes_category_idx    ON public.product_image_scenes(category_collection);
CREATE INDEX IF NOT EXISTS product_image_scenes_active_sort_idx ON public.product_image_scenes(is_active, sort_order);
CREATE INDEX IF NOT EXISTS product_image_scenes_filter_tags_gin ON public.product_image_scenes USING gin(filter_tags);

-- New table: admin-curated recommended scenes
CREATE TABLE IF NOT EXISTS public.recommended_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recommended_scenes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage recommended" ON public.recommended_scenes;
CREATE POLICY "Admins manage recommended"
  ON public.recommended_scenes
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Authenticated read recommended" ON public.recommended_scenes;
CREATE POLICY "Authenticated read recommended"
  ON public.recommended_scenes
  FOR SELECT
  TO authenticated
  USING (true);

-- Backfill subject (idempotent — only fills NULLs)
UPDATE public.product_image_scenes SET subject = CASE
  WHEN 'personDetails' = ANY(trigger_blocks) THEN 'with-model'
  WHEN outfit_hint IS NOT NULL THEN 'with-model'
  WHEN prompt_template ~* '\{\{(personDirective|modelDirective)\}\}' THEN 'with-model'
  WHEN prompt_template ~* '\m(model|wearing|holding|posed|body|face|walking|sitting|standing)\M' THEN 'with-model'
  WHEN COALESCE(sub_category,'') ~* '(on-body|on-skin|poses|lifestyle|ugc|selfie|carry|worn)' THEN 'with-model'
  WHEN scene_type IN ('macro','stilllife') AND prompt_template ~* '\mhands?\M'
       AND prompt_template !~* '\m(body|face|model|wearing)\M' THEN 'hands-only'
  ELSE 'product-only'
END
WHERE subject IS NULL;

-- Backfill shot_style
UPDATE public.product_image_scenes SET shot_style = CASE
  WHEN COALESCE(sub_category,'') ~* '(editorial|campaign)' THEN 'editorial'
  WHEN COALESCE(sub_category,'') ~* '(flat ?lay)' THEN 'flatlay'
  WHEN COALESCE(sub_category,'') ~* '(macro|detail|texture|close ?up)' THEN 'macro'
  WHEN COALESCE(sub_category,'') ~* '(lifestyle|ugc|selfie|social)' THEN 'lifestyle'
  WHEN COALESCE(sub_category,'') ~* '(still ?life|tabletop)' THEN 'still-life'
  WHEN COALESCE(sub_category,'') ~* '(portrait|headshot)' THEN 'portrait'
  WHEN COALESCE(sub_category,'') ~* '(essential|packshot|hero|studio pack)' THEN 'packshot'
  WHEN scene_type = 'stilllife' THEN 'still-life'
  ELSE COALESCE(scene_type, 'packshot')
END
WHERE shot_style IS NULL;

-- Backfill setting
UPDATE public.product_image_scenes SET setting = CASE
  WHEN shot_style IN ('packshot','portrait','macro') THEN 'studio'
  WHEN shot_style IN ('flatlay','still-life') THEN 'surface'
  WHEN shot_style = 'lifestyle' AND COALESCE(sub_category,'') ~* '(outdoor|street|park|beach|garden)' THEN 'outdoor'
  WHEN shot_style = 'lifestyle' THEN 'indoor'
  WHEN shot_style IN ('editorial','campaign') THEN 'editorial-set'
  ELSE 'studio'
END
WHERE setting IS NULL;

-- Backfill custom_scenes (lighter heuristics on category + name)
UPDATE public.custom_scenes SET subject = CASE
  WHEN COALESCE(category,'') ~* '(model|on-body|portrait|lifestyle|ugc|selfie)' THEN 'with-model'
  WHEN COALESCE(name,'') ~* '(model|wearing|portrait|lifestyle|ugc|selfie)' THEN 'with-model'
  ELSE 'product-only'
END
WHERE subject IS NULL;

UPDATE public.custom_scenes SET shot_style = CASE
  WHEN COALESCE(category,'') ~* 'editorial' OR COALESCE(name,'') ~* 'editorial' THEN 'editorial'
  WHEN COALESCE(category,'') ~* '(flat ?lay)' THEN 'flatlay'
  WHEN COALESCE(category,'') ~* '(macro|close ?up|detail)' THEN 'macro'
  WHEN COALESCE(category,'') ~* 'lifestyle' THEN 'lifestyle'
  WHEN COALESCE(category,'') ~* '(still ?life|tabletop)' THEN 'still-life'
  ELSE 'packshot'
END
WHERE shot_style IS NULL;

UPDATE public.custom_scenes SET setting = CASE
  WHEN shot_style IN ('packshot','portrait','macro') THEN 'studio'
  WHEN shot_style IN ('flatlay','still-life') THEN 'surface'
  WHEN shot_style = 'lifestyle' THEN 'indoor'
  WHEN shot_style IN ('editorial','campaign') THEN 'editorial-set'
  ELSE 'studio'
END
WHERE setting IS NULL;