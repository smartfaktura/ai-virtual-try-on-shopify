CREATE POLICY "Anon can read hidden scenes"
ON public.hidden_scenes FOR SELECT
TO anon
USING (true);