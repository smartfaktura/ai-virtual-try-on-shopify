
-- Layer 3: Add retry_count to generation_queue for auto-retry on timeout
ALTER TABLE public.generation_queue ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0;

-- Update cleanup_stale_jobs to auto-retry timed-out jobs once before failing
CREATE OR REPLACE FUNCTION public.cleanup_stale_jobs()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_stale RECORD;
  v_count INTEGER := 0;
  v_generated_count INTEGER;
  v_requested_count INTEGER;
  v_refund INTEGER;
  v_per_image_cost INTEGER;
  v_images jsonb;
BEGIN
  FOR v_stale IN
    SELECT id, user_id, credits_reserved, result, payload, retry_count
    FROM generation_queue
    WHERE status = 'processing' AND timeout_at < now()
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Check if there are partial results saved
    v_generated_count := COALESCE((v_stale.result->>'generatedCount')::int, 0);
    v_requested_count := COALESCE((v_stale.result->>'requestedCount')::int, 1);
    v_images := COALESCE(v_stale.result->'images', '[]'::jsonb);

    IF v_generated_count > 0 AND jsonb_array_length(v_images) > 0 THEN
      -- PARTIAL SUCCESS: save what we have, refund only ungenerated portion
      v_per_image_cost := v_stale.credits_reserved / v_requested_count;
      v_refund := v_per_image_cost * (v_requested_count - v_generated_count);

      UPDATE generation_queue
      SET status = 'completed',
          result = jsonb_set(
            COALESCE(v_stale.result, '{}'::jsonb),
            '{partialTimeout}', 'true'::jsonb
          ),
          error_message = 'Completed with ' || v_generated_count || '/' || v_requested_count || ' images (timed out)',
          completed_at = now()
      WHERE id = v_stale.id;

      -- Insert into generation_jobs so images appear in library
      INSERT INTO generation_jobs (
        user_id, results, status, completed_at,
        product_id, workflow_id, brand_profile_id,
        ratio, quality, requested_count, credits_used,
        creative_drop_id, error_message
      ) VALUES (
        v_stale.user_id,
        v_images,
        'completed',
        now(),
        (v_stale.payload->>'product_id')::uuid,
        (v_stale.payload->>'workflow_id')::uuid,
        (v_stale.payload->>'brand_profile_id')::uuid,
        COALESCE(v_stale.payload->>'aspectRatio', '1:1'),
        COALESCE(v_stale.payload->>'quality', 'standard'),
        v_requested_count,
        v_stale.credits_reserved - v_refund,
        (v_stale.payload->>'creative_drop_id')::uuid,
        'Partial: ' || v_generated_count || '/' || v_requested_count || ' images generated before timeout'
      );

      IF v_refund > 0 THEN
        UPDATE profiles SET credits_balance = credits_balance + v_refund
        WHERE user_id = v_stale.user_id;
      END IF;

      RAISE LOG 'cleanup_stale_jobs: partial completion for job %, saved % images, refunded % credits',
        v_stale.id, v_generated_count, v_refund;

    ELSIF v_stale.retry_count < 1 THEN
      -- AUTO-RETRY: first timeout with no results — re-queue for another attempt
      UPDATE generation_queue
      SET status = 'queued',
          started_at = NULL,
          timeout_at = NULL,
          completed_at = NULL,
          error_message = NULL,
          retry_count = v_stale.retry_count + 1
      WHERE id = v_stale.id;

      RAISE LOG 'cleanup_stale_jobs: auto-retry job % (retry_count now %)',
        v_stale.id, v_stale.retry_count + 1;

    ELSE
      -- FULL FAILURE: already retried once, no images generated — refund everything
      UPDATE generation_queue
      SET status = 'failed',
          error_message = 'Timed out after retry (attempt ' || (v_stale.retry_count + 1) || ')',
          completed_at = now()
      WHERE id = v_stale.id;

      UPDATE profiles SET credits_balance = credits_balance + v_stale.credits_reserved
      WHERE user_id = v_stale.user_id;
    END IF;

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('cleaned', v_count);
END;
$function$;
