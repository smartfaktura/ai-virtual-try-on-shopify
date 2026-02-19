CREATE POLICY "Users can update own freestyle generations"
ON public.freestyle_generations FOR UPDATE
USING (auth.uid() = user_id);