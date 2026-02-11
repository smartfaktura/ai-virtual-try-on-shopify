import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type QueueJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

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
}

interface EnqueueParams {
  jobType: 'product' | 'tryon' | 'freestyle' | 'workflow';
  payload: Record<string, unknown>;
  imageCount: number;
  quality: string;
}

interface EnqueueResult {
  jobId: string;
  position: number;
  priority: number;
  newBalance: number;
  creditsCost: number;
}

interface UseGenerationQueueReturn {
  enqueue: (params: EnqueueParams) => Promise<EnqueueResult | null>;
  activeJob: QueueJob | null;
  isEnqueuing: boolean;
  isProcessing: boolean;
  cancel: () => Promise<void>;
  reset: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function getAuthToken(): Promise<string> {
  const { data: session } = await supabase.auth.getSession();
  return session?.session?.access_token || SUPABASE_KEY;
}

// Lightweight polling select — excludes the heavy `result` column
const POLL_SELECT = 'id,status,error_message,created_at,started_at,completed_at,priority_score';

export function useGenerationQueue(): UseGenerationQueueReturn {
  const { user } = useAuth();
  const [activeJob, setActiveJob] = useState<QueueJob | null>(null);
  const [isEnqueuing, setIsEnqueuing] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jobIdRef = useRef<string | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollJobStatus = useCallback((jobId: string) => {
    stopPolling();

    const poll = async () => {
      const token = await getAuthToken();

      // Lightweight poll — no `result` column
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/generation_queue?id=eq.${jobId}&select=${POLL_SELECT}`,
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
      const status: QueueJobStatus = row.status;

      // On completion, fetch result in a separate request
      if (status === 'completed' || status === 'failed' || status === 'cancelled') {
        stopPolling();

        let result: unknown = null;
        if (status === 'completed') {
          const resultRes = await fetch(
            `${SUPABASE_URL}/rest/v1/generation_queue?id=eq.${jobId}&select=result`,
            {
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (resultRes.ok) {
            const resultRows = await resultRes.json();
            if (resultRows?.[0]) {
              result = resultRows[0].result;
            }
          }
        }

        setActiveJob({
          id: row.id,
          status,
          position: 0,
          priority: row.priority_score,
          result,
          error_message: row.error_message,
          created_at: row.created_at,
          started_at: row.started_at,
          completed_at: row.completed_at,
        });

        if (status === 'failed') {
          toast.error(row.error_message || 'Generation failed. Credits have been refunded.');
        }
        return;
      }

      // Still in progress — calculate position if queued
      let position = 0;
      if (status === 'queued') {
        const posRes = await fetch(
          `${SUPABASE_URL}/rest/v1/generation_queue?status=eq.queued&priority_score=lte.${row.priority_score}&id=neq.${jobId}&select=id`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${token}`,
              Prefer: 'count=exact',
            },
          }
        );
        const countHeader = posRes.headers.get('content-range');
        if (countHeader) {
          const match = countHeader.match(/\/(\d+)/);
          position = match ? parseInt(match[1]) : 0;
        }
      }

      setActiveJob({
        id: row.id,
        status,
        position,
        priority: row.priority_score,
        result: null,
        error_message: row.error_message,
        created_at: row.created_at,
        started_at: row.started_at,
        completed_at: row.completed_at,
      });
    };

    // Poll immediately, then every 3 seconds
    poll();
    pollingRef.current = setInterval(poll, 3000);
  }, [stopPolling]);

  // --- Recovery: resume polling for in-flight jobs after page refresh ---
  useEffect(() => {
    if (!user || activeJob || jobIdRef.current) return;

    const recover = async () => {
      const token = await getAuthToken();

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/generation_queue?user_id=eq.${user.id}&status=in.(queued,processing)&order=created_at.desc&limit=1&select=${POLL_SELECT}`,
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
      jobIdRef.current = row.id;
      pollJobStatus(row.id);
    };

    recover();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Helper to attempt recovery of an active job (used after concurrent error)
  const attemptRecovery = useCallback(async () => {
    if (!user) return;
    const token = await getAuthToken();

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/generation_queue?user_id=eq.${user.id}&status=in.(queued,processing)&order=created_at.desc&limit=1&select=${POLL_SELECT}`,
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
    jobIdRef.current = row.id;
    pollJobStatus(row.id);
  }, [user, pollJobStatus]);

  const enqueue = useCallback(async (params: EnqueueParams): Promise<EnqueueResult | null> => {
    if (!user) {
      toast.error('Please sign in to generate images');
      return null;
    }

    setIsEnqueuing(true);

    try {
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          const msg = String(errorData.error || '');
          if (msg.includes('concurrent')) {
            toast.error(`You've reached the maximum concurrent generations (${errorData.max_concurrent || '?'}). Please wait for a current job to finish.`);
            // Attempt to recover and resume polling for the existing job
            attemptRecovery();
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

      // Set initial active job state
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
      });

      jobIdRef.current = result.jobId;

      // Start polling
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
  }, [user, pollJobStatus, attemptRecovery]);

  const cancel = useCallback(async () => {
    if (!jobIdRef.current || !activeJob || activeJob.status !== 'queued') return;

    const token = await getAuthToken();

    // Cancel by updating status
    await fetch(
      `${SUPABASE_URL}/rest/v1/generation_queue?id=eq.${jobIdRef.current}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      }
    );

    stopPolling();
    setActiveJob(prev => prev ? { ...prev, status: 'cancelled' } : null);
    toast.info('Generation cancelled. Credits will be refunded.');
  }, [activeJob, stopPolling]);

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
  };
}
