-- 1. Drop the cancellation trigger — refund will be done inline in cancel_queue_job
DROP TRIGGER IF EXISTS trg_queue_cancel ON public.generation_queue;
DROP TRIGGER IF EXISTS trg_queue_cancellation ON public.generation_queue;

-- 2. Update protect_billing_fields to also trust our custom GUC
CREATE OR REPLACE FUNCTION public.protect_billing_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Allow service_role (edge functions) to update anything
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Allow trusted RPC functions (cancel_queue_job, etc.) to update billing fields
  IF current_setting('app.trusted_rpc', true) = 'true' THEN
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

-- 3. Rewrite cancel_queue_job — inline refund, use custom GUC
CREATE OR REPLACE FUNCTION public.cancel_queue_job(p_job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_uid uuid;
  v_row RECORD;
BEGIN
  v_caller_uid := auth.uid();
  IF v_caller_uid IS NULL THEN
    RETURN false;
  END IF;

  -- Lock the row and verify ownership + cancellable status
  SELECT id, user_id, credits_reserved, status
  INTO v_row
  FROM generation_queue
  WHERE id = p_job_id
    AND user_id = v_caller_uid
    AND status IN ('queued', 'processing')
  FOR UPDATE;

  IF v_row.id IS NULL THEN
    RETURN false;
  END IF;

  -- Mark cancelled
  UPDATE generation_queue
  SET status = 'cancelled',
      completed_at = now(),
      error_message = 'Cancelled by user'
  WHERE id = v_row.id;

  -- Refund credits using custom GUC to bypass protect_billing_fields
  PERFORM set_config('app.trusted_rpc', 'true', true);

  UPDATE profiles
  SET credits_balance = credits_balance + v_row.credits_reserved
  WHERE user_id = v_caller_uid;

  -- Reset the flag (transaction-local, but be explicit)
  PERFORM set_config('app.trusted_rpc', '', true);

  RETURN true;
END;
$$;