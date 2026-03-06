CREATE OR REPLACE FUNCTION public.get_user_emails_for_admin(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, email text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.email
  FROM public.profiles p
  WHERE p.user_id = ANY(p_user_ids)
    AND public.has_role(auth.uid(), 'admin'::app_role);
$$;