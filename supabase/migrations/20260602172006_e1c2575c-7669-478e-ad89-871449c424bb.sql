SET LOCAL session_replication_role = replica;
SELECT public.add_purchased_credits('4049132b-1ab0-4d9d-8afa-a250b3d611b5'::uuid, 500);