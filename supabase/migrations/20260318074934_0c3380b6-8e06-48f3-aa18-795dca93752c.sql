
-- Add credits_renewed_at column to profiles
ALTER TABLE public.profiles
ADD COLUMN credits_renewed_at timestamp with time zone NOT NULL DEFAULT now();

-- Create reset_plan_credits function
CREATE OR REPLACE FUNCTION public.reset_plan_credits(p_user_id uuid, p_plan_credits integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row RECORD;
BEGIN
  UPDATE profiles
  SET credits_balance = p_plan_credits,
      credits_renewed_at = now(),
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING plan, credits_balance, credits_renewed_at INTO v_row;

  IF v_row IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN jsonb_build_object(
    'plan', v_row.plan,
    'credits_balance', v_row.credits_balance,
    'credits_renewed_at', v_row.credits_renewed_at
  );
END;
$$;
