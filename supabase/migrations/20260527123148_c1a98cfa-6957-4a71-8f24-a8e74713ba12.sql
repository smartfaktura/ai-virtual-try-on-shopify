CREATE OR REPLACE FUNCTION public.fire_generation_milestone()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count INTEGER;
  v_email TEXT;
  v_event TEXT;
BEGIN
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

  -- Per-milestone event names so Resend "last_event equals X" automations
  -- can distinguish each milestone (1 / 10 / 50 / 100).
  v_event := CASE v_count
    WHEN 1 THEN 'generation.milestone.first'
    ELSE 'generation.milestone.' || v_count::text
  END;

  PERFORM public._invoke_edge_function(
    'track-resend-event',
    jsonb_build_object(
      'email', v_email,
      'user_id', NEW.user_id,
      'event', v_event,
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