
-- Singleton lock table for process-queue dispatcher
CREATE TABLE IF NOT EXISTS public.queue_dispatch_lock (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  locked_at timestamptz,
  locked_by text
);

ALTER TABLE public.queue_dispatch_lock ENABLE ROW LEVEL SECURITY;

INSERT INTO public.queue_dispatch_lock (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Try to acquire the dispatch lock. Returns true if acquired, false if another dispatcher is active.
-- Lock auto-expires after 30 seconds to prevent deadlocks from crashed instances.
CREATE OR REPLACE FUNCTION public.try_acquire_dispatch_lock(p_locked_by text DEFAULT 'process-queue')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_acquired boolean;
BEGIN
  UPDATE queue_dispatch_lock
  SET locked_at = now(), locked_by = p_locked_by
  WHERE id = 1
    AND (locked_at IS NULL OR locked_at < now() - interval '30 seconds')
  RETURNING true INTO v_acquired;

  RETURN COALESCE(v_acquired, false);
END;
$$;

-- Release the dispatch lock
CREATE OR REPLACE FUNCTION public.release_dispatch_lock()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE queue_dispatch_lock
  SET locked_at = NULL, locked_by = NULL
  WHERE id = 1;
END;
$$;
