
-- Allow anonymous users to view discover presets (public feed)
CREATE POLICY "Anyone can view discover presets publicly"
ON public.discover_presets
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to view active custom scenes
CREATE POLICY "Anyone can view active scenes publicly"
ON public.custom_scenes
FOR SELECT
TO anon
USING (is_active = true);

-- Allow anonymous users to view featured items
CREATE POLICY "Anyone can view featured items publicly"
ON public.featured_items
FOR SELECT
TO anon
USING (true);
