
CREATE TABLE public.reference_responsibility_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  user_email text,
  ip_address inet DEFAULT inet_client_addr(),
  user_agent text,
  context text NOT NULL CHECK (context IN ('brand_scene_wizard', 'brand_model_reference')),
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rra_user_accepted ON public.reference_responsibility_acceptances (user_id, accepted_at DESC);

ALTER TABLE public.reference_responsibility_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own acceptances"
ON public.reference_responsibility_acceptances
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own acceptances"
ON public.reference_responsibility_acceptances
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins read all acceptances"
ON public.reference_responsibility_acceptances
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
