import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type QueueJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface GenerationMeta {
  imageCount: number;
  quality: string;
  hasModel: boolean;
  hasScene: boolean;
  hasProduct: boolean;
}

export interface QueueJob {
  id: string;
  status: QueueJobStatus;
  position: number;
  priority: number;
  result: unknown | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  job_type?: string;
  generationMeta?: GenerationMeta;
}

interface EnqueueParams {
  jobType: 'tryon' | 'freestyle' | 'workflow' | 'upscale';
  payload: Record<string, unknown>;
  imageCount: number;
  quality: string;
  additionalProductCount?: number;
}

interface EnqueueResult {
  jobId: string;
  position: number;
  priority: number;
  newBalance: number;
  creditsCost: number;
}

export type FailedErrorType = 'timeout' | 'rate_limit' | 'generic';

interface UseGenerationQueueOptions {
  onContentBlocked?: (jobId: string, reason: string) => void;
  onGenerationFailed?: (jobId: string, message: string, errorType: FailedErrorType) => void;
  onCreditRefresh?: () => Promise<void> | void;
}

interface UseGenerationQueueReturn {
  enqueue: (params: EnqueueParams, meta?: GenerationMeta) => Promise<EnqueueResult | null>;
  activeJob: QueueJob | null;
  isEnqueuing: boolean;
  isProcessing: boolean;
  cancel: () => Promise<void>;
  reset: () => void;
  lastCompletedAt: string | null;
}

// Helper to get auth headers for REST calls
async function getRestHeaders() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token || SUPABASE_KEY;
  return { SUPABASE_URL, SUPABASE_KEY, token };
}

export function useGenerationQueue(options?: UseGenerationQueueOptions): UseGenerationQueueReturn {
  const { onContentBlocked, onGenerationFailed, onCreditRefresh } = options || {};
  const { user } = useAuth();
  const [activeJob, setActiveJob] = useState<QueueJob | null>(null);
  const [isEnqueuing, setIsEnqueuing] = useState(false);
  const [lastCompletedAt, setLastCompletedAt] = useState<string | null>(null);

  // Single-flight polling refs
  const jobIdRef = useRef<string | null>(null);
  const pollVersionRef = useRef(0); // Incremented on each new poll session; stale responses are ignored
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retriggeredRef = useRef(false);
  const missCountRef = useRef(0); // Consecutive poll misses for self-healing

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pollVersionRef.current++;
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    pollVersionRef.current++;
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const handleTerminalJob = useCallback((job: QueueJob) => {
    stopPolling();

    if (job.status === 'completed' && job.completed_at) {
      setLastCompletedAt(job.completed_at);
    }

    if (job.status === 'failed') {
      const msg = (job.error_message || '').toLowerCase();
      const isContentBlocked = /content|safety|policy|prohibited|blocked|nsfw|inappropriate/.test(msg);

      if (isContentBlocked && onContentBlocked) {
        onContentBlocked(job.id, job.error_message || 'This prompt was flagged by our content safety system.');
      } else if (onGenerationFailed) {
        // Route to gallery card instead of toast
        if (/timed?\s*out|timeout/.test(msg)) {
          onGenerationFailed(job.id, job.error_message || 'Generation timed out', 'timeout');
        } else if (/rate.?limit|concurrent|too many/.test(msg)) {
          onGenerationFailed(job.id, job.error_message || 'Rate limit exceeded', 'rate_limit');
        } else {
          onGenerationFailed(job.id, job.error_message || 'Generation failed', 'generic');
        }
      } else {
        // Fallback toasts if no callback provided
        if (/timed?\s*out|timeout/.test(msg)) {
          toast.error('Generation timed out. Your credits have been refunded.');
        } else if (/rate.?limit|concurrent|too many/.test(msg)) {
          toast.error('Too many generations at once. Your credits have been refunded.');
        } else {
          toast.error('Generation failed. Your credits have been refunded — try again.');
        }
      }
    }
  }, [stopPolling, onContentBlocked, onGenerationFailed]);

  const pollJobStatus = useCallback((jobId: string) => {
    // Start a new poll session — any in-flight responses from the old session are ignored
    stopPolling();
    const sessionVersion = ++pollVersionRef.current;
    missCountRef.current = 0;
    retriggeredRef.current = false;

    const schedulePoll = (delayMs: number) => {
      pollTimeoutRef.current = setTimeout(() => runPoll(), delayMs);
    };

    const runPoll = async () => {
      // Abort if this session is stale
      if (sessionVersion !== pollVersionRef.current) return;

      try {
        const { SUPABASE_URL, SUPABASE_KEY, token } = await getRestHeaders();
        if (sessionVersion !== pollVersionRef.current) return; // Re-check after async

        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/generation_queue?id=eq.${jobId}&select=id,status,result,error_message,created_at,started_at,completed_at,priority_score,job_type`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (sessionVersion !== pollVersionRef.current) return;

        if (!res.ok) {
          // Network error — retry with backoff
          schedulePoll(5000);
          return;
        }

        const rows = await res.json();

        if (sessionVersion !== pollVersionRef.current) return;

        // Self-healing: if the row is missing or empty
        if (!rows || rows.length === 0) {
          missCountRef.current++;

          // After 3 consecutive misses, check if user has ANY active jobs
          if (missCountRef.current >= 3) {
            const fallbackRes = await fetch(
              `${SUPABASE_URL}/rest/v1/generation_queue?user_id=eq.${user?.id}&status=in.(queued,processing)&limit=1&select=id`,
              {
                headers: {
                  apikey: SUPABASE_KEY,
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (sessionVersion !== pollVersionRef.current) return;

            const fallbackRows = await fallbackRes.json();
            if (!fallbackRows || fallbackRows.length === 0) {
              // No active jobs at all — the tracked job must have completed
              console.warn(`[queue] Job ${jobId} vanished after ${missCountRef.current} misses — inferring completion`);
              const inferredJob: QueueJob = {
                id: jobId,
                status: 'completed',
                position: 0,
                priority: 0,
                result: null,
                error_message: null,
                created_at: new Date().toISOString(),
                started_at: null,
                completed_at: new Date().toISOString(),
              };
              setActiveJob(prev => ({ ...inferredJob, generationMeta: prev?.generationMeta }));
              handleTerminalJob(inferredJob);
              onCreditRefresh?.();
              return;
            }
          }

          // Keep polling
          schedulePoll(3000);
          return;
        }

        // Got data — reset miss counter
        missCountRef.current = 0;

        const row = rows[0];
        const job: QueueJob = {
          id: row.id,
          status: row.status,
          position: 0,
          priority: row.priority_score,
          result: row.result,
          error_message: row.error_message,
          created_at: row.created_at,
          started_at: row.started_at,
          completed_at: row.completed_at,
          job_type: row.job_type,
        };

        // Calculate position if still queued
        if (job.status === 'queued') {
          // Stuck detection: if queued > 30s, re-trigger process-queue
          const queuedDuration = Date.now() - new Date(job.created_at).getTime();
          if (queuedDuration > 30_000 && !retriggeredRef.current) {
            retriggeredRef.current = true;
            console.warn(`[queue] Job ${job.id} stuck for ${Math.round(queuedDuration / 1000)}s, re-triggering`);
            fetch(`${SUPABASE_URL}/functions/v1/retry-queue`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ trigger: 'stuck-retry' }),
            }).catch(() => {});
          }

          const posRes = await fetch(
            `${SUPABASE_URL}/rest/v1/generation_queue?status=eq.queued&priority_score=lte.${job.priority}&id=neq.${job.id}&select=id`,
            {
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${token}`,
                Prefer: 'count=exact',
              },
            }
          );
          if (sessionVersion !== pollVersionRef.current) return;

          const countHeader = posRes.headers.get('content-range');
          if (countHeader) {
            const match = countHeader.match(/\/(\d+)/);
            job.position = match ? parseInt(match[1]) : 0;
          }
        }

        // Stuck detection for processing jobs
        if (job.status === 'processing' && job.started_at) {
          const processingDuration = Date.now() - new Date(job.started_at).getTime();
          if (processingDuration > 5 * 60 * 1000 && !retriggeredRef.current) {
            retriggeredRef.current = true;
            console.warn(`[queue] Job ${job.id} processing for ${Math.round(processingDuration / 1000)}s, triggering cleanup`);
            fetch(`${SUPABASE_URL}/functions/v1/retry-queue`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ trigger: 'stuck-processing-retry' }),
            }).catch(() => {});

            // Self-heal: check if images already exist for this user after job started
            try {
              const imgRes = await fetch(
                `${SUPABASE_URL}/rest/v1/freestyle_generations?user_id=eq.${user?.id}&created_at=gte.${job.started_at}&limit=1&select=id`,
                {
                  headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              if (sessionVersion !== pollVersionRef.current) return;
              const imgRows = await imgRes.json();
              if (Array.isArray(imgRows) && imgRows.length > 0) {
                console.warn(`[queue] Job ${job.id} stuck but images already saved — force-completing`);
                const syntheticJob: QueueJob = {
                  ...job,
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                };
                setActiveJob(prev => ({ ...syntheticJob, generationMeta: prev?.generationMeta }));
                handleTerminalJob(syntheticJob);
                onCreditRefresh?.();
                return;
              }
            } catch (e) {
              console.warn('[queue] Image check failed:', e);
            }
          }
        }

        // Preserve generationMeta from local state
        setActiveJob(prev => ({
          ...job,
          generationMeta: prev?.generationMeta,
        }));

        // Terminal state — stop polling
        if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
          handleTerminalJob(job);
          return;
        }

        // Schedule next poll (single-flight: only after this one finishes)
        schedulePoll(3000);
      } catch (err) {
        console.error('[queue] Poll error:', err);
        if (sessionVersion !== pollVersionRef.current) return;
        // Retry with backoff on network errors
        schedulePoll(5000);
      }
    };

    // Start immediately
    runPoll();
  }, [stopPolling, handleTerminalJob, user?.id, onCreditRefresh]);

  // Restore in-progress job on mount (e.g. after page refresh)
  useEffect(() => {
    if (!user) return;

    const restoreActiveJob = async () => {
      if (jobIdRef.current) return;

      const { SUPABASE_URL, SUPABASE_KEY, token } = await getRestHeaders();

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/generation_queue?user_id=eq.${user.id}&status=in.(queued,processing)&order=created_at.desc&limit=1&select=id,status,priority_score,error_message,created_at,started_at,completed_at,job_type`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) return;
      const rows = await res.json();
      if (!rows || rows.length === 0) return;

      const row = rows[0];
      setActiveJob({
        id: row.id,
        status: row.status,
        position: 0,
        priority: row.priority_score,
        result: null,
        error_message: row.error_message,
        created_at: row.created_at,
        started_at: row.started_at,
        completed_at: row.completed_at,
        job_type: row.job_type,
      });
      jobIdRef.current = row.id;
      pollJobStatus(row.id);
    };

    restoreActiveJob();
  }, [user, pollJobStatus]);

  const enqueue = useCallback(async (params: EnqueueParams, meta?: GenerationMeta): Promise<EnqueueResult | null> => {
    if (!user) {
      toast.error('Please sign in to generate images');
      return null;
    }

    setIsEnqueuing(true);
    stopPolling();

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      if (!token) {
        toast.error('Authentication required');
        return null;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/enqueue-generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobType: params.jobType,
          payload: params.payload,
          imageCount: params.imageCount,
          quality: params.quality,
          additionalProductCount: params.additionalProductCount || 0,
          hasModel: meta?.hasModel || false,
          hasScene: meta?.hasScene || false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          const msg = String(errorData.error || '');
          if (msg.includes('concurrent')) {
            toast.error(`You've reached the maximum concurrent generations (${errorData.max_concurrent || '?'}). Please wait for a current job to finish.`);
          } else {
            toast.error(errorData.message || 'Rate limit exceeded. Please wait and try again.');
          }
          return null;
        }

        if (response.status === 402) {
          toast.error(errorData.error || 'Insufficient credits');
          return null;
        }

        toast.error(errorData.error || 'Failed to start generation');
        return null;
      }

      const result: EnqueueResult = await response.json();

      setActiveJob({
        id: result.jobId,
        status: 'queued',
        position: result.position,
        priority: result.priority,
        result: null,
        error_message: null,
        created_at: new Date().toISOString(),
        started_at: null,
        completed_at: null,
        generationMeta: meta,
      });

      jobIdRef.current = result.jobId;
      pollJobStatus(result.jobId);

      if (result.position > 0) {
        toast.info(`Your generation is #${result.position + 1} in queue`);
      }

      return result;
    } catch (err) {
      console.error('Enqueue error:', err);
      toast.error('Failed to start generation');
      return null;
    } finally {
      setIsEnqueuing(false);
    }
  }, [user, pollJobStatus, stopPolling]);

  const cancel = useCallback(async () => {
    if (!jobIdRef.current || !activeJob || (activeJob.status !== 'queued' && activeJob.status !== 'processing')) return;

    const { SUPABASE_URL, SUPABASE_KEY, token } = await getRestHeaders();

    // Check current job status before attempting cancel
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/generation_queue?id=eq.${jobIdRef.current}&select=status`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
    );
    const checkRows = await checkRes.json();
    const currentJob = Array.isArray(checkRows) ? checkRows[0] : null;

    if (!currentJob || currentJob.status === 'completed') {
      toast.info('Generation already completed!');
      pollJobStatus(jobIdRef.current!);
      return;
    }
    if (currentJob.status === 'failed' || currentJob.status === 'cancelled') {
      toast.info('Generation already ended.');
      stopPolling();
      setActiveJob(prev => prev ? { ...prev, status: currentJob.status } : null);
      return;
    }

    // Attempt cancel with return=representation to verify
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/generation_queue?id=eq.${jobIdRef.current}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      }
    );

    const updated = await res.json();
    if (Array.isArray(updated) && updated.length > 0 && updated[0].status === 'cancelled') {
      stopPolling();
      setActiveJob(prev => prev ? { ...prev, status: 'cancelled' } : null);
      toast.info('Generation cancelled. Credits refunded.');
      onCreditRefresh?.();
    } else {
      toast.warning('Could not cancel — generation may have already completed.');
      pollJobStatus(jobIdRef.current!);
    }
  }, [activeJob, stopPolling, pollJobStatus, onCreditRefresh]);

  const reset = useCallback(() => {
    stopPolling();
    setActiveJob(null);
    jobIdRef.current = null;
  }, [stopPolling]);

  const isProcessing = !!activeJob && (activeJob.status === 'queued' || activeJob.status === 'processing');

  return {
    enqueue,
    activeJob,
    isEnqueuing,
    isProcessing,
    cancel,
    reset,
    lastCompletedAt,
  };
}
