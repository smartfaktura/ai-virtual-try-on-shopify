
ALTER TABLE public.try_shot_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read try_shot_sessions"
ON public.try_shot_sessions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
