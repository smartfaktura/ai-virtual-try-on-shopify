UPDATE public.generation_jobs gj
SET scene_id = pis.scene_id
FROM public.product_image_scenes pis
WHERE gj.scene_id IS NULL
  AND gj.scene_name IS NOT NULL
  AND lower(gj.scene_name) = lower(pis.title);