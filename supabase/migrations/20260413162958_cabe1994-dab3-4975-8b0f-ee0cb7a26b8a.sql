CREATE POLICY "Anon can read model sort order"
ON public.model_sort_order
FOR SELECT
TO anon
USING (true);