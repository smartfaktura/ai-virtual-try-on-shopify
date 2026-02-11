import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';

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
  jobType: 'product' | 'tryon' | 'freestyle' | 'workflow' | 'video';
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

export function useGenerationQueue(): UseGenerationQueueReturn {
  const { user } = useAuth();
  const { addCredits } = useCredits();
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
      // Use raw fetch to query generation_queue since it's not in the generated types
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token || SUPABASE_KEY;

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/generation_queue?id=eq.${jobId}&select=id,status,result,error_message,created_at,started_at,completed_at,priority_score`,
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
      const job: QueueJob = {
        id: row.id,
        status: row.status,
        position: 0, // Will be calculated if queued
        priority: row.priority_score,
        result: row.result,
        error_message: row.error_message,
        created_at: row.created_at,
        started_at: row.started_at,
        completed_at: row.completed_at,
      };

      // Calculate position if still queued
      if (job.status === 'queued') {
        const posRes = await fetch(
          `${SUPABASE_URL}/rest/v1/generation_queue?status=eq.queued&priority_score=lt.${job.priority}&select=id`,
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
          job.position = match ? parseInt(match[1]) : 0;
        }
      }

      setActiveJob(job);

      // Stop polling on terminal states
      if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        stopPolling();

        if (job.status === 'failed') {
          toast.error(job.error_message || 'Generation failed. Credits have been refunded.');
        }
      }
    };

    // Poll immediately, then every 3 seconds
    poll();
    pollingRef.current = setInterval(poll, 3000);
  }, [stopPolling]);

  const enqueue = useCallback(async (params: EnqueueParams): Promise<EnqueueResult | null> => {
    if (!user) {
      toast.error('Please sign in to generate images');
      return null;
    }

    setIsEnqueuing(true);

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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          toast.error(errorData.message || 'Rate limit exceeded. Please wait and try again.');
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
      } else {
        toast.info('Generation started!');
      }

      return result;
    } catch (err) {
      console.error('Enqueue error:', err);
      toast.error('Failed to start generation');
      return null;
    } finally {
      setIsEnqueuing(false);
    }
  }, [user, pollJobStatus]);

  const cancel = useCallback(async () => {
    if (!jobIdRef.current || !activeJob || activeJob.status !== 'queued') return;

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token || SUPABASE_KEY;

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
