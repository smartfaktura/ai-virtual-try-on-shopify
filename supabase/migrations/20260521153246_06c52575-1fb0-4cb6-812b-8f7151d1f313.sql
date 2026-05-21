DROP POLICY IF EXISTS "Anyone can view discover presets publicly" ON public.discover_presets;
CREATE POLICY "Anyone can view discover presets"
  ON public.discover_presets
  FOR SELECT
  TO anon, authenticated
  USING (true);