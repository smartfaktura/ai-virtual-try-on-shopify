
DROP POLICY "Users can cancel their own jobs" ON public.generation_queue;

CREATE OR REPLACE FUNCTION public.cancel_queue_job(p_job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_found boolean;
BEGIN
  UPDATE generation_queue
  SET status = 'cancelled'
  WHERE id = p_job_id
    AND user_id = auth.uid()
    AND status IN ('queued', 'processing')
  RETURNING true INTO v_found;

  RETURN COALESCE(v_found, false);
END;
$$;
