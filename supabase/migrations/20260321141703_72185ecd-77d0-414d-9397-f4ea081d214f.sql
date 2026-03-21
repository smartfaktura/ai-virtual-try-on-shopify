CREATE TABLE public.try_shot_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  domain text NOT NULL,
  created_at timestamptz DEFAULT now(),
  results jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX idx_try_shot_ip_time ON public.try_shot_sessions(ip_address, created_at DESC);

ALTER TABLE public.try_shot_sessions ENABLE ROW LEVEL SECURITY;