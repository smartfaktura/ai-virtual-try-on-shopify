DROP TRIGGER IF EXISTS on_contact_submission ON public.contact_submissions;
DROP FUNCTION IF EXISTS public.notify_contact_submission() CASCADE;