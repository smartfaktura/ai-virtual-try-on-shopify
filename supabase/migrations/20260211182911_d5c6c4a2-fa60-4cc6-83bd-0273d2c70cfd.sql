
CREATE OR REPLACE FUNCTION public.change_user_plan(p_user_id uuid, p_new_plan text, p_new_credits integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_row RECORD;
BEGIN
  IF p_new_plan NOT IN ('free', 'starter', 'growth', 'pro', 'enterprise') THEN
    RAISE EXCEPTION 'Invalid plan: %', p_new_plan;
  END IF;

  UPDATE profiles
  SET plan = p_new_plan,
      credits_balance = GREATEST(credits_balance, p_new_credits),
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING plan, credits_balance INTO v_row;

  IF v_row IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN jsonb_build_object('plan', v_row.plan, 'credits_balance', v_row.credits_balance);
END;
$function$;
