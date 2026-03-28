
-- Prevent users from self-modifying billing-critical fields
-- Only service_role (via edge functions) should update these columns
CREATE OR REPLACE FUNCTION public.protect_billing_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role to update anything
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block changes to billing-critical fields for regular users
  IF NEW.credits_balance IS DISTINCT FROM OLD.credits_balance THEN
    RAISE EXCEPTION 'Cannot modify credits_balance directly';
  END IF;
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    RAISE EXCEPTION 'Cannot modify plan directly';
  END IF;
  IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
    RAISE EXCEPTION 'Cannot modify subscription_status directly';
  END IF;
  IF NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id THEN
    RAISE EXCEPTION 'Cannot modify stripe_customer_id directly';
  END IF;
  IF NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id THEN
    RAISE EXCEPTION 'Cannot modify stripe_subscription_id directly';
  END IF;
  IF NEW.current_period_end IS DISTINCT FROM OLD.current_period_end THEN
    RAISE EXCEPTION 'Cannot modify current_period_end directly';
  END IF;
  IF NEW.billing_interval IS DISTINCT FROM OLD.billing_interval THEN
    RAISE EXCEPTION 'Cannot modify billing_interval directly';
  END IF;
  IF NEW.credits_renewed_at IS DISTINCT FROM OLD.credits_renewed_at THEN
    RAISE EXCEPTION 'Cannot modify credits_renewed_at directly';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_billing_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_billing_fields();
