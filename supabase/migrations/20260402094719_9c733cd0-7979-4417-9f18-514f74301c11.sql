
DROP FUNCTION IF EXISTS public.get_public_custom_scenes();

CREATE FUNCTION public.get_public_custom_scenes()
 RETURNS TABLE(id uuid, name text, description text, category text, image_url text, optimized_image_url text, prompt_hint text, prompt_only boolean, discover_categories text[], is_active boolean, created_at timestamp with time zone, preview_image_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $$ SELECT id, name, description, category, image_url, optimized_image_url,
  prompt_hint, prompt_only, discover_categories, is_active, created_at, preview_image_url
  FROM custom_scenes WHERE is_active = true ORDER BY created_at DESC; $$;
