-- Pass C: title + subcategory match (subcategory mirrors category_collection)
WITH sub_matches AS (
  SELECT
    dp.id AS preset_id,
    pis.scene_id,
    COUNT(*) OVER (PARTITION BY dp.id) AS match_count,
    ROW_NUMBER() OVER (PARTITION BY dp.id ORDER BY pis.sort_order) AS rn
  FROM public.discover_presets dp
  JOIN public.product_image_scenes pis
    ON lower(pis.title) = lower(dp.scene_name)
   AND pis.is_active = true
   AND lower(pis.category_collection) = lower(dp.subcategory)
  WHERE dp.scene_ref IS NULL
    AND dp.scene_name IS NOT NULL
    AND dp.scene_name <> ''
    AND dp.subcategory IS NOT NULL
    AND dp.subcategory <> ''
)
UPDATE public.discover_presets dp
SET scene_ref = sm.scene_id
FROM sub_matches sm
WHERE sm.preset_id = dp.id
  AND sm.rn = 1;