-- 1. Add column + index
ALTER TABLE public.discover_presets
  ADD COLUMN IF NOT EXISTS scene_ref text;

CREATE INDEX IF NOT EXISTS idx_discover_presets_scene_ref
  ON public.discover_presets(scene_ref);

-- 2. Backfill PASS A: title + category match (highest confidence)
-- Maps discover_presets.category → product_image_scenes.category_collection
-- using the same merge map used in the client (food/wallets aliases).
WITH cat_map AS (
  SELECT
    dp.id AS preset_id,
    dp.scene_name,
    CASE dp.category
      WHEN 'snacks-food' THEN 'food'
      WHEN 'food-beverage' THEN 'food'
      WHEN 'wallets' THEN 'wallets-cardholders'
      ELSE dp.category
    END AS mapped_cat
  FROM public.discover_presets dp
  WHERE dp.scene_ref IS NULL
    AND dp.scene_name IS NOT NULL
    AND dp.scene_name <> ''
),
matches AS (
  SELECT
    cm.preset_id,
    pis.scene_id,
    ROW_NUMBER() OVER (PARTITION BY cm.preset_id ORDER BY pis.sort_order) AS rn,
    COUNT(*) OVER (PARTITION BY cm.preset_id) AS match_count
  FROM cat_map cm
  JOIN public.product_image_scenes pis
    ON lower(pis.title) = lower(cm.scene_name)
   AND pis.is_active = true
   AND (
     pis.category_collection = cm.mapped_cat
     OR pis.category_collection = cm.mapped_cat || 's'
     OR pis.category_collection || 's' = cm.mapped_cat
   )
)
UPDATE public.discover_presets dp
SET scene_ref = m.scene_id
FROM matches m
WHERE m.preset_id = dp.id
  AND m.rn = 1
  AND m.match_count = 1;

-- 3. Backfill PASS B: title-only match, only when globally unique
WITH title_matches AS (
  SELECT
    dp.id AS preset_id,
    pis.scene_id,
    COUNT(*) OVER (PARTITION BY dp.id) AS match_count,
    ROW_NUMBER() OVER (PARTITION BY dp.id ORDER BY pis.sort_order) AS rn
  FROM public.discover_presets dp
  JOIN public.product_image_scenes pis
    ON lower(pis.title) = lower(dp.scene_name)
   AND pis.is_active = true
  WHERE dp.scene_ref IS NULL
    AND dp.scene_name IS NOT NULL
    AND dp.scene_name <> ''
)
UPDATE public.discover_presets dp
SET scene_ref = tm.scene_id
FROM title_matches tm
WHERE tm.preset_id = dp.id
  AND tm.rn = 1
  AND tm.match_count = 1;