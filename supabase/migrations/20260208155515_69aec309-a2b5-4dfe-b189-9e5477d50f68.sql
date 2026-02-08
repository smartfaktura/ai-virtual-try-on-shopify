-- Update default free credits from 5 to 20 for new signups
ALTER TABLE public.profiles ALTER COLUMN credits_balance SET DEFAULT 20;

-- Update the trigger function that grants free credits on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, credits_balance)
  VALUES (NEW.id, NEW.email, 20);
  RETURN NEW;
END;
$$;