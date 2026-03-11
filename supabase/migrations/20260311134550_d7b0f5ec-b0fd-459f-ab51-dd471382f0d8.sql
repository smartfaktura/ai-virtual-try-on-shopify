
-- Update the cancellation trigger to also refund credits when processing jobs are cancelled
CREATE OR REPLACE FUNCTION public.handle_queue_cancellation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status IN ('queued', 'processing') THEN
    PERFORM refund_credits(NEW.user_id, NEW.credits_reserved);
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$function$;
