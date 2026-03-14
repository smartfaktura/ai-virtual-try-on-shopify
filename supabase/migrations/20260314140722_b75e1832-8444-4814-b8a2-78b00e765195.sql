DROP TRIGGER IF EXISTS trg_queue_cancel ON generation_queue;

CREATE TRIGGER trg_queue_cancel
  BEFORE UPDATE ON generation_queue
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status IN ('queued', 'processing'))
  EXECUTE FUNCTION handle_queue_cancellation();