import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/lib/brandedToast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { enqueueWithRetry, isEnqueueError } from '@/lib/enqueueGeneration';

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
  jobType: 'tryon' | 'freestyle' | 'workflow' | 'upscale' | 'video';
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
  /** When set, restoreActiveJob only picks up jobs matching these types */
  jobTypes?: Array<'tryon' | 'freestyle' | 'workflow' | 'upscale' | 'video'>;
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
  const { jobTypes: filterJobTypes, onContentBlocked, onGenerationFailed, onCreditRefresh } = options || {};
  const { user } = useAuth();
  const [activeJob, setActiveJob] = useState<QueueJob | null>(null);
  const [isEnqueuing, setIsEnqueuing] = useState(false);
  const [lastCompletedAt, setLastCompletedAt] = useState<string | null>(null);

  // Stable ref for onCreditRefresh to avoid stale closures in polling chains
  const onCreditRefreshRef = useRef(onCreditRefresh);
  useEffect(() => { onCreditRefreshRef.current = onCreditRefresh; }, [onCreditRefresh]);

  // Single-flight polling refs
  const jobIdRef = useRef<string | null>(null);
  const pollVersionRef = useRef(0); // Incremented on each new poll session; stale responses are ignored
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCleanupTriggerRef = useRef(0);
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

    // Always refresh credits on any terminal state
    onCreditRefreshRef.current?.();
  }, [stopPolling, onContentBlocked, onGenerationFailed]);

  const pollJobStatus = useCallback((jobId: string) => {
    // Start a new poll session — any in-flight responses from the old session are ignored
    stopPolling();
    const sessionVersion = ++pollVersionRef.current;
    missCountRef.current = 0;
    lastCleanupTriggerRef.current = 0;

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
          // Stuck detection: if queued > 30s, re-trigger process-queue (periodic, every 60s)
          const queuedDuration = Date.now() - new Date(job.created_at).getTime();
          if (queuedDuration > 30_000 && Date.now() - lastCleanupTriggerRef.current > 60_000) {
            lastCleanupTriggerRef.current = Date.now();
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
          const CLEANUP_INTERVAL = 60_000;
          const HARD_TIMEOUT = 10 * 60 * 1000; // 10 min

          // Hard client timeout: force-fail after 10 min so user is never stuck
          if (processingDuration > HARD_TIMEOUT) {
            console.warn(`[queue] Job ${job.id} hard timeout at ${Math.round(processingDuration / 1000)}s — force-failing`);

            // One final cleanup trigger
            fetch(`${SUPABASE_URL}/functions/v1/retry-queue`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ trigger: 'hard-timeout-cleanup' }),
            }).catch(() => {});

            const syntheticJob: QueueJob = {
              ...job,
              status: 'failed',
              error_message: 'Generation timed out. Your credits have been refunded.',
              completed_at: new Date().toISOString(),
            };
            setActiveJob(prev => ({ ...syntheticJob, generationMeta: prev?.generationMeta }));
            handleTerminalJob(syntheticJob);
            return;
          }

          // Periodic cleanup trigger (every 60s after 3 min)
          if (processingDuration > 3 * 60 * 1000 && Date.now() - lastCleanupTriggerRef.current > CLEANUP_INTERVAL) {
            lastCleanupTriggerRef.current = Date.now();
            console.warn(`[queue] Job ${job.id} processing for ${Math.round(processingDuration / 1000)}s, triggering cleanup`);
            fetch(`${SUPABASE_URL}/functions/v1/retry-queue`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ trigger: 'stuck-processing-retry' }),
            }).catch(() => {});

            // Self-heal removed: the 10-min hard timeout covers all job types reliably.
            // The previous freestyle-only check didn't work for workflow/tryon/upscale jobs.
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
  }, [stopPolling, handleTerminalJob, user?.id]);

  // Restore in-progress job on mount (e.g. after page refresh)
  const hasRestoredRef = useRef(false);
  const pollJobStatusRef = useRef(pollJobStatus);
  pollJobStatusRef.current = pollJobStatus;

  useEffect(() => {
    if (!user || hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const restoreActiveJob = async () => {
      if (jobIdRef.current) return;

      const { SUPABASE_URL, SUPABASE_KEY, token } = await getRestHeaders();

      const jobTypeFilter = filterJobTypes?.length ? `&job_type=in.(${filterJobTypes.join(',')})` : '';
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/generation_queue?user_id=eq.${user.id}&status=in.(queued,processing)${jobTypeFilter}&order=created_at.desc&limit=1&select=id,status,priority_score,error_message,created_at,started_at,completed_at,job_type`,
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
      pollJobStatusRef.current(row.id);
    };

    restoreActiveJob();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const enqueue = useCallback(async (params: EnqueueParams, meta?: GenerationMeta): Promise<EnqueueResult | null> => {
    if (!user) {
      toast.error('Please sign in to generate images');
      return null;
    }

    setIsEnqueuing(true);
    stopPolling();

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      if (!token) {
        toast.error('Please sign in first');
        return null;
      }

      const body = {
        jobType: params.jobType,
        payload: params.payload,
        imageCount: params.imageCount,
        quality: params.quality,
        additionalProductCount: params.additionalProductCount || 0,
        hasModel: meta?.hasModel || false,
        hasScene: meta?.hasScene || false,
      };

      const res = await enqueueWithRetry(body, token);

      if (isEnqueueError(res)) {
        if (res.type === 'rate_limit') {
          const msg = res.message || '';
          if (msg.includes('concurrent')) {
            toast.error('You\'ve reached the maximum concurrent generations. Please wait for a current job to finish.');
          } else {
            toast.error('Rate limit exceeded. Please wait and try again.');
          }
        } else if (res.type === 'insufficient_credits') {
          toast.error(res.message || 'Insufficient credits');
        } else if (res.type === 'network') {
          toast.error('Connection issue — please check your network and try again.');
        } else {
          toast.error(res.message || 'Failed to start generation');
        }
        return null;
      }

      const result = res as unknown as EnqueueResult;

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

    // Check current job status before attempting cancel
    const { data: checkRows } = await supabase
      .from('generation_queue')
      .select('status')
      .eq('id', jobIdRef.current)
      .maybeSingle();

    if (!checkRows || checkRows.status === 'completed') {
      toast.info('Generation already completed!');
      pollJobStatus(jobIdRef.current!);
      return;
    }
    if (checkRows.status === 'failed' || checkRows.status === 'cancelled') {
      toast.info('Generation already ended.');
      stopPolling();
      setActiveJob(prev => prev ? { ...prev, status: checkRows.status as QueueJobStatus } : null);
      return;
    }

    // Cancel via secure RPC (no direct UPDATE policy)
    const { data: cancelled, error: rpcError } = await supabase.rpc('cancel_queue_job', {
      p_job_id: jobIdRef.current,
    });

    if (!rpcError && cancelled === true) {
      stopPolling();
      setActiveJob(prev => prev ? { ...prev, status: 'cancelled' } : null);
      toast.info('Cancelled — credits returned ✨');
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
