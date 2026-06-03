SET LOCAL session_replication_role = 'replica';
SELECT public.add_purchased_credits('15c1a8fe-41ed-4aec-836c-e682ff9224b7'::uuid, 100);
SET LOCAL session_replication_role = 'origin';