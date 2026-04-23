CREATE OR REPLACE FUNCTION public.get_public_recommended_scenes()
RETURNS TABLE(
  scene_id text,
  title text,
  description text,
  preview_image_url text,
  category_collection text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT ON (pis.scene_id)
    pis.scene_id,
    pis.title,
    pis.description,
    pis.preview_image_url,
    pis.category_collection,
    rs.created_at
  FROM public.recommended_scenes rs
  JOIN public.product_image_scenes pis ON pis.scene_id = rs.scene_id
  WHERE pis.is_active = true
    AND pis.preview_image_url IS NOT NULL
  ORDER BY pis.scene_id, rs.created_at DESC;
$$;