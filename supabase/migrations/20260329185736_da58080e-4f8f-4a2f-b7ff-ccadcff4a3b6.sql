-- 1a. hidden_scenes: replace anon/public SELECT with a view
DROP POLICY "Anon can read hidden scenes" ON hidden_scenes;
DROP POLICY "Anyone can read hidden scenes" ON hidden_scenes;

CREATE VIEW public.hidden_scene_ids AS
  SELECT scene_id FROM hidden_scenes;
GRANT SELECT ON public.hidden_scene_ids TO anon, authenticated;

-- 1b. featured_items: replace anon/public SELECT with a view
DROP POLICY "Anyone can view featured items publicly" ON featured_items;
DROP POLICY "Authenticated can view featured items" ON featured_items;

CREATE VIEW public.public_featured_items AS
  SELECT id, item_type, item_id, sort_order, created_at FROM featured_items;
GRANT SELECT ON public.public_featured_items TO anon, authenticated;

-- 1c. custom_scenes: replace anon/public SELECT with a view
DROP POLICY "Anyone can view active scenes publicly" ON custom_scenes;

CREATE VIEW public.public_custom_scenes AS
  SELECT id, name, description, category, image_url, optimized_image_url,
         prompt_hint, prompt_only, discover_categories, is_active, created_at
  FROM custom_scenes WHERE is_active = true;
GRANT SELECT ON public.public_custom_scenes TO anon, authenticated;

-- Keep existing "Authenticated can view active scenes" policy for now but replace with admin-only
DROP POLICY IF EXISTS "Authenticated can view active scenes" ON custom_scenes;

-- Add admin SELECT on base tables so admin mutations/reads still work
CREATE POLICY "Admins can read hidden scenes"
  ON hidden_scenes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read featured items"
  ON featured_items FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read custom scenes"
  ON custom_scenes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));