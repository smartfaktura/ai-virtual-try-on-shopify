DROP POLICY "Anyone can insert views" ON public.discover_item_views;
CREATE POLICY "Anyone can insert views" ON public.discover_item_views
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());