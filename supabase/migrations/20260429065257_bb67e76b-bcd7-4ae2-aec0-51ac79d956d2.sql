-- ── Email Campaigns ──────────────────────────────────────────────────────
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  cta_label TEXT,
  cta_url TEXT,
  audience_filter JSONB NOT NULL DEFAULT '{"plans":["all"]}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sending','sent','failed','cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  clicked_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read campaigns"
  ON public.email_campaigns FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert campaigns"
  ON public.email_campaigns FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update campaigns"
  ON public.email_campaigns FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete campaigns"
  ON public.email_campaigns FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Campaign Recipients ──────────────────────────────────────────────────
CREATE TABLE public.email_campaign_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','suppressed','bounced','opened','clicked','complained')),
  resend_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read campaign recipients"
  ON public.email_campaign_recipients FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_campaign_recipients_campaign ON public.email_campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_email ON public.email_campaign_recipients(email);

-- ── Email Automations ────────────────────────────────────────────────────
CREATE TABLE public.email_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN (
    'user.signup',
    'checkout.started',
    'checkout.abandoned',
    'credits.low',
    'subscription.cancelled',
    'subscription.renewed',
    'inactive.user'
  )),
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  audience_filter JSONB NOT NULL DEFAULT '{"plans":["all"]}'::jsonb,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  cta_label TEXT,
  cta_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  frequency_cap INTEGER NOT NULL DEFAULT 1,
  sent_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read automations"
  ON public.email_automations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert automations"
  ON public.email_automations FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update automations"
  ON public.email_automations FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete automations"
  ON public.email_automations FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_email_automations_updated_at
  BEFORE UPDATE ON public.email_automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Automation Log ───────────────────────────────────────────────────────
CREATE TABLE public.email_automation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID NOT NULL REFERENCES public.email_automations(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','suppressed','skipped','cancelled')),
  resend_message_id TEXT,
  error_message TEXT,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

ALTER TABLE public.email_automation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read automation log"
  ON public.email_automation_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_automation_log_automation ON public.email_automation_log(automation_id);
CREATE INDEX idx_automation_log_user ON public.email_automation_log(user_id);
CREATE INDEX idx_automation_log_email ON public.email_automation_log(email);

-- ── Automation Queue ─────────────────────────────────────────────────────
CREATE TABLE public.email_automation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID NOT NULL REFERENCES public.email_automations(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT NOT NULL,
  send_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','sent','failed','cancelled','skipped')),
  attempts INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.email_automation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read automation queue"
  ON public.email_automation_queue FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_automation_queue_send_at ON public.email_automation_queue(send_at) WHERE status = 'queued';
CREATE INDEX idx_automation_queue_user_automation ON public.email_automation_queue(user_id, automation_id);

-- ── Checkout Sessions (for abandoned-checkout detection) ─────────────────
CREATE TABLE public.checkout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  plan TEXT,
  amount_cents INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  abandoned_processed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read checkout sessions"
  ON public.checkout_sessions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can read own checkout sessions"
  ON public.checkout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_checkout_sessions_user ON public.checkout_sessions(user_id);
CREATE INDEX idx_checkout_sessions_pending ON public.checkout_sessions(started_at)
  WHERE completed_at IS NULL AND abandoned_processed_at IS NULL;

-- ── Marketing Unsubscribes ───────────────────────────────────────────────
CREATE TABLE public.marketing_unsubscribes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_id UUID,
  reason TEXT,
  unsubscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketing_unsubscribes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read marketing unsubscribes"
  ON public.marketing_unsubscribes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can read own marketing unsubscribe"
  ON public.marketing_unsubscribes FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_marketing_unsubscribes_email ON public.marketing_unsubscribes(email);

-- ── Helper RPC: resolve audience filter to a list of recipients ──────────
CREATE OR REPLACE FUNCTION public.resolve_email_audience(p_filter JSONB)
RETURNS TABLE(user_id UUID, email TEXT, plan TEXT, display_name TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plans TEXT[];
  v_active_days INTEGER;
  v_signup_after TIMESTAMPTZ;
  v_signup_before TIMESTAMPTZ;
  v_only_never_generated BOOLEAN;
  v_only_used_credits BOOLEAN;
  v_custom_emails TEXT[];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  v_plans := ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_filter->'plans', '["all"]'::jsonb)));
  v_active_days := NULLIF((p_filter->>'active_days')::TEXT, '')::INTEGER;
  v_signup_after := NULLIF((p_filter->>'signup_after')::TEXT, '')::TIMESTAMPTZ;
  v_signup_before := NULLIF((p_filter->>'signup_before')::TEXT, '')::TIMESTAMPTZ;
  v_only_never_generated := COALESCE((p_filter->>'only_never_generated')::BOOLEAN, false);
  v_only_used_credits := COALESCE((p_filter->>'only_used_credits')::BOOLEAN, false);
  v_custom_emails := ARRAY(SELECT lower(jsonb_array_elements_text(COALESCE(p_filter->'custom_emails', '[]'::jsonb))));

  RETURN QUERY
  SELECT DISTINCT p.user_id, p.email, p.plan, p.display_name
  FROM public.profiles p
  WHERE p.email IS NOT NULL
    AND (
      'all' = ANY(v_plans)
      OR p.plan = ANY(v_plans)
      OR (array_length(v_custom_emails, 1) > 0 AND lower(p.email) = ANY(v_custom_emails))
    )
    AND (v_signup_after IS NULL OR p.created_at >= v_signup_after)
    AND (v_signup_before IS NULL OR p.created_at <= v_signup_before)
    AND (
      v_active_days IS NULL
      OR EXISTS (
        SELECT 1 FROM public.generation_jobs gj
        WHERE gj.user_id = p.user_id
          AND gj.created_at >= now() - (v_active_days || ' days')::interval
      )
    )
    AND (
      NOT v_only_never_generated
      OR NOT EXISTS (SELECT 1 FROM public.generation_jobs gj WHERE gj.user_id = p.user_id)
    )
    AND (
      NOT v_only_used_credits
      OR EXISTS (SELECT 1 FROM public.generation_jobs gj WHERE gj.user_id = p.user_id)
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.marketing_unsubscribes mu WHERE lower(mu.email) = lower(p.email)
    );
END;
$$;