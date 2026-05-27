
-- 1. Update add_purchased_credits to fire credits.purchased event
CREATE OR REPLACE FUNCTION public.add_purchased_credits(p_user_id uuid, p_amount integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_balance INTEGER;
  v_email TEXT;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  UPDATE profiles SET credits_balance = credits_balance + p_amount
  WHERE user_id = p_user_id
  RETURNING credits_balance, email INTO new_balance, v_email;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Fire credits.purchased event to Resend (best-effort, async via pg_net)
  IF v_email IS NOT NULL THEN
    PERFORM public._invoke_edge_function(
      'track-resend-event',
      jsonb_build_object(
        'email', v_email,
        'user_id', p_user_id,
        'event', 'credits.purchased',
        'attributes', jsonb_build_object(
          'amount', p_amount,
          'new_balance', new_balance
        )
      )
    );
  END IF;

  RETURN new_balance;
END;
$function$;

-- 2. Generation milestone trigger
CREATE OR REPLACE FUNCTION public.fire_generation_milestone()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count INTEGER;
  v_email TEXT;
BEGIN
  -- Only fire on transition into completed state
  IF NEW.status <> 'completed' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO v_count
  FROM generation_jobs
  WHERE user_id = NEW.user_id AND status = 'completed';

  IF v_count NOT IN (1, 10, 50, 100) THEN
    RETURN NEW;
  END IF;

  SELECT email INTO v_email FROM profiles WHERE user_id = NEW.user_id;
  IF v_email IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM public._invoke_edge_function(
    'track-resend-event',
    jsonb_build_object(
      'email', v_email,
      'user_id', NEW.user_id,
      'event', 'generation.milestone',
      'attributes', jsonb_build_object(
        'milestone', v_count,
        'total', v_count
      )
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'fire_generation_milestone failed: %', SQLERRM;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_generation_milestone ON public.generation_jobs;
CREATE TRIGGER trg_generation_milestone
AFTER INSERT OR UPDATE OF status ON public.generation_jobs
FOR EACH ROW
EXECUTE FUNCTION public.fire_generation_milestone();
