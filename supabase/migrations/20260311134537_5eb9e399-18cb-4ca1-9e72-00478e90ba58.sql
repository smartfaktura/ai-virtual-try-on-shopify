
-- Drop the existing restrictive policy that only allows cancelling queued jobs
DROP POLICY IF EXISTS "Users can cancel their own queued jobs" ON public.generation_queue;

-- Create a new policy that allows cancelling both queued and processing jobs
CREATE POLICY "Users can cancel their own jobs"
ON public.generation_queue
FOR UPDATE
USING (auth.uid() = user_id AND status IN ('queued', 'processing'))
WITH CHECK (auth.uid() = user_id AND status = 'cancelled');
