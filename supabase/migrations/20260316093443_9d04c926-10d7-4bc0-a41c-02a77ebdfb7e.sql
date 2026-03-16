CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  page_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own sessions" ON public.chat_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.chat_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON public.chat_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.chat_sessions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sessions" ON public.chat_sessions
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));