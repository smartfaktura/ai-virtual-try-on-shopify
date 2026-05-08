-- 1. Drop the duplicate blanket trigger (keeps the WHEN-guarded trg_queue_cancel)
DROP TRIGGER IF EXISTS trg_queue_cancellation ON public.generation_queue;

-- 2. Rewrite cancel_queue_job so it elevates to service_role before the UPDATE.
--    This lets the handle_queue_cancellation trigger → refund_credits → profiles
--    chain pass through protect_billing_fields without being blocked.
CREATE OR REPLACE FUNCTION public.cancel_queue_job(p_job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_found boolean;
  v_caller_uid uuid;
BEGIN
  -- Capture the authenticated caller before changing the local role
  v_caller_uid := auth.uid();

  IF v_caller_uid IS NULL THEN
    RETURN false;
  END IF;

  -- Elevate to service_role for this transaction so that
  -- protect_billing_fields allows the credit refund triggered
  -- by handle_queue_cancellation → refund_credits.
  PERFORM set_config('role', 'service_role', true);

  UPDATE generation_queue
  SET status = 'cancelled'
  WHERE id = p_job_id
    AND user_id = v_caller_uid
    AND status IN ('queued', 'processing')
  RETURNING true INTO v_found;

  RETURN COALESCE(v_found, false);
END;
$$;