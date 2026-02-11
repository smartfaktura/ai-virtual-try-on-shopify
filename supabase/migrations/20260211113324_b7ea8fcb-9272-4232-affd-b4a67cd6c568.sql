
-- Phase 1: Server-side credit deduction functions

CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT credits_balance INTO current_balance
  FROM profiles WHERE user_id = p_user_id FOR UPDATE;

  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', current_balance, p_amount;
  END IF;

  UPDATE profiles SET credits_balance = credits_balance - p_amount
  WHERE user_id = p_user_id;

  RETURN current_balance - p_amount;
END;
$$;

CREATE OR REPLACE FUNCTION public.refund_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE profiles SET credits_balance = credits_balance + p_amount
  WHERE user_id = p_user_id
  RETURNING credits_balance INTO new_balance;
  RETURN new_balance;
END;
$$;
