CREATE POLICY "Admins can delete discover presets"
ON public.discover_presets
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));