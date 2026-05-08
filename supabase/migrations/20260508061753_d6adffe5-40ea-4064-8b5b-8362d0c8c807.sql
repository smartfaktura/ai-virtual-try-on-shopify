
-- Attach the existing handle_queue_cancellation function as a BEFORE UPDATE trigger
-- This ensures credits are refunded when a job is cancelled
CREATE TRIGGER trg_queue_cancellation
  BEFORE UPDATE ON public.generation_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_queue_cancellation();
