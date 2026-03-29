
-- Drop the 3 security definer views
DROP VIEW IF EXISTS public.hidden_scene_ids;
DROP VIEW IF EXISTS public.public_featured_items;
DROP VIEW IF EXISTS public.public_custom_scenes;

-- 1. Function to get hidden scene IDs (replaces hidden_scene_ids view)
CREATE OR REPLACE FUNCTION public.get_hidden_scene_ids()
RETURNS TABLE(scene_id text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT scene_id FROM hidden_scenes; $$;

-- 2. Function to get public featured items (replaces public_featured_items view)
CREATE OR REPLACE FUNCTION public.get_public_featured_items()
RETURNS TABLE(id uuid, item_type text, item_id text, sort_order int, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT id, item_type, item_id, sort_order, created_at FROM featured_items ORDER BY created_at DESC; $$;

-- 3. Function to get public custom scenes (replaces public_custom_scenes view)
CREATE OR REPLACE FUNCTION public.get_public_custom_scenes()
RETURNS TABLE(id uuid, name text, description text, category text, image_url text,
  optimized_image_url text, prompt_hint text, prompt_only boolean,
  discover_categories text[], is_active boolean, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT id, name, description, category, image_url, optimized_image_url,
  prompt_hint, prompt_only, discover_categories, is_active, created_at
  FROM custom_scenes WHERE is_active = true ORDER BY created_at DESC; $$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_hidden_scene_ids() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_featured_items() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_custom_scenes() TO anon, authenticated;
