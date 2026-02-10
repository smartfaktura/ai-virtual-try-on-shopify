CREATE POLICY "Users can delete their own jobs"
ON public.generation_jobs
FOR DELETE
USING (auth.uid() = user_id);