import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/lib/brandedToast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { enqueueWithRetry, isEnqueueError, sendWake, getAuthToken, paceDelay } from '@/lib/enqueueGeneration';
import { gtmFirstGenerationStarted, gtmFirstGenerationCompleted } from '@/lib/gtm';

const MAX_IMAGES_PER_JOB = 1;

export interface BatchJob {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  result: { images?: string[]; variations?: Array<{ label: string }> } | null;
  error_message: string | null;
}

export interface BatchState {
  jobs: BatchJob[];
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalImages: number;
  readyImages: number;
  allDone: boolean;
  aggregatedImages: string[];
  aggregatedLabels: string[];
  hasPartialFailure: boolean;
}

interface UseGenerationBatchOptions {
  onCreditRefresh?: () => Promise<void> | void;
}

interface StartBatchResult {
  success: boolean;
  newBalance: number | null;
}

interface UseGenerationBatchReturn {
  startBatch: (params: BatchParams) => Promise<StartBatchResult>;
  batchState: BatchState | null;
  isBatching: boolean;
  resetBatch: () => void;
}

interface BatchParams {
  payload: Record<string, unknown>;
  selectedVariationIndices: number[];
  angleMultiplier: number;
  quality: string;
  imageCount: number; // total expected images
  hasModel?: boolean;
  hasScene?: boolean;
  onJobEnqueued?: (jobId: string) => void;
}

const INITIAL_BATCH_STATE: BatchState = {
  jobs: [],
  totalJobs: 0,
  completedJobs: 0,
  failedJobs: 0,
  totalImages: 0,
  readyImages: 0,
  allDone: false,
  aggregatedImages: [],
  aggregatedLabels: [],
  hasPartialFailure: false,
};

export function useGenerationBatch(options?: UseGenerationBatchOptions): UseGenerationBatchReturn {
  const { onCreditRefresh } = options || {};
  const { user } = useAuth();
  const [batchState, setBatchState] = useState<BatchState | null>(null);
  const [isBatching, setIsBatching] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jobIdsRef = useRef<string[]>([]);
  const liveBatchMetaRef = useRef<{ productId?: string | null; visualType: string } | null>(null);
  const onCreditRefreshRef = useRef(onCreditRefresh);
  useEffect(() => { onCreditRefreshRef.current = onCreditRefresh; }, [onCreditRefresh]);

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

  const pollAllJobs = useCallback(() => {
    stopPolling();
    const jobIds = jobIdsRef.current;
    if (jobIds.length === 0) return;

    const poll = async () => {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      let token = await getAuthToken() || SUPABASE_KEY;

      // Fetch all jobs in one request
      const idsFilter = jobIds.map(id => `"${id}"`).join(',');
      let res = await fetch(
        `${SUPABASE_URL}/rest/v1/generation_queue?id=in.(${idsFilter})&select=id,status,result,error_message`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle expired token — refresh and retry once
      if (res.status === 401) {
        const { data: sessionData } = await supabase.auth.getSession();
        const freshToken = sessionData?.session?.access_token;
        if (freshToken) {
          token = freshToken;
          res = await fetch(
            `${SUPABASE_URL}/rest/v1/generation_queue?id=in.(${idsFilter})&select=id,status,result,error_message`,
            {
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${freshToken}`,
              },
            }
          );
        }
      }

      if (!res.ok) return;
      const rows = await res.json();
      if (!rows || rows.length === 0) return;

      const jobMap = new Map<string, BatchJob>();
      for (const row of rows) {
        jobMap.set(row.id, {
          jobId: row.id,
          status: row.status,
          result: row.result,
          error_message: row.error_message,
        });
      }

      // Build ordered job list
      const updatedJobs: BatchJob[] = jobIds.map(id => jobMap.get(id) || {
        jobId: id,
        status: 'queued' as const,
        result: null,
        error_message: null,
      });

      const completedJobs = updatedJobs.filter(j => j.status === 'completed').length;
      const failedJobs = updatedJobs.filter(j => j.status === 'failed').length;
      const allDone = updatedJobs.every(j => j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled');

      // Aggregate images from completed jobs (in order)
      const aggregatedImages: string[] = [];
      const aggregatedLabels: string[] = [];
      for (const job of updatedJobs) {
        if (job.status === 'completed' && job.result) {
          const r = job.result as { images?: string[]; variations?: Array<{ label: string }> };
          if (r.images) aggregatedImages.push(...r.images);
          if (r.variations) aggregatedLabels.push(...r.variations.map(v => v.label));
        }
      }

      setBatchState({
        jobs: updatedJobs,
        totalJobs: updatedJobs.length,
        completedJobs,
        failedJobs,
        totalImages: updatedJobs.length * MAX_IMAGES_PER_JOB, // approximate
        readyImages: aggregatedImages.length,
        allDone,
        aggregatedImages,
        aggregatedLabels,
        hasPartialFailure: failedJobs > 0 && completedJobs > 0,
      });

      if (allDone) {
        stopPolling();
        onCreditRefreshRef.current?.();
        // first_generation_completed: only fires for live batches with results.
        // Helper itself dedupes per user_id so it never fires twice.
        const meta = liveBatchMetaRef.current;
        const firstCompleted = updatedJobs.find(j => j.status === 'completed');
        if (user && meta && firstCompleted && aggregatedImages.length > 0) {
          gtmFirstGenerationCompleted({
            userId: user.id,
            productId: meta.productId ?? null,
            generationId: firstCompleted.jobId,
            visualType: meta.visualType,
            resultCount: aggregatedImages.length,
          });
        }
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);
  }, [stopPolling, user]);

  const startBatch = useCallback(async (params: BatchParams): Promise<StartBatchResult> => {
    if (!user) {
      toast.error('Sign in to start generating');
      return { success: false, newBalance: null };
    }

    const { payload, selectedVariationIndices, angleMultiplier, quality, imageCount } = params;

    // Calculate scenes per chunk
    const scenesPerChunk = Math.max(1, Math.floor(MAX_IMAGES_PER_JOB / angleMultiplier));

    // Split indices into chunks
    const chunks: number[][] = [];
    for (let i = 0; i < selectedVariationIndices.length; i += scenesPerChunk) {
      chunks.push(selectedVariationIndices.slice(i, i + scenesPerChunk));
    }

    setIsBatching(true);
    setBatchState({
      ...INITIAL_BATCH_STATE,
      totalJobs: chunks.length,
      totalImages: imageCount,
    });

    toast.info(`Splitting into ${chunks.length} generation batch${chunks.length > 1 ? 'es' : ''}...`);

    const batchId = crypto.randomUUID();
    const token = await getAuthToken();

    if (!token) {
      toast.error('Please sign in first');
      setIsBatching(false);
      setBatchState(null);
      return { success: false, newBalance: null };
    }

    const jobIds: string[] = [];
    let lastNewBalance: number | null = null;

    // Enqueue chunks sequentially with pacing + retry.
    // Wave pacing: after every WAVE_SIZE jobs, pause for WAVE_COOLDOWN_MS
    // to stay well under the server-side burst limit.
    const WAVE_SIZE = 30;
    const WAVE_COOLDOWN_MS = 2000;

    for (let c = 0; c < chunks.length; c++) {
      const chunk = chunks[c];
      const chunkImageCount = chunk.length * angleMultiplier;

      const chunkPayload = {
        ...payload,
        selected_variations: chunk,
        batch_id: batchId,
      };

      // Standard per-call pacing
      await paceDelay(c);

      // Wave cooldown: pause longer every WAVE_SIZE jobs
      if (c > 0 && c % WAVE_SIZE === 0) {
        await new Promise(r => setTimeout(r, WAVE_COOLDOWN_MS));
      }

      const result = await enqueueWithRetry(
        {
          jobType: 'workflow',
          payload: chunkPayload,
          imageCount: chunkImageCount,
          quality,
          hasModel: params.hasModel ?? false,
          hasScene: params.hasScene ?? false,
          skipWake: true,
        },
        token,
      );

      if (isEnqueueError(result)) {
        if (result.type === 'insufficient_credits') {
          toast.error(`Insufficient credits. ${c} of ${chunks.length} batches queued.`);
        } else if (result.type === 'rate_limit') {
          toast.error(`Rate limit reached. ${c} of ${chunks.length} batches queued.`);
        } else {
          toast.error(result.message || `Failed to enqueue batch ${c + 1}`);
        }
        break;
      }

      jobIds.push(result.jobId);
      lastNewBalance = result.newBalance;
      params.onJobEnqueued?.(result.jobId);

      // first_generation_started: helper dedupes per user_id, so this only
      // fires once per user lifetime — on the very first successfully
      // enqueued generation across all batches.
      if (jobIds.length === 1) {
        const productId = (payload as Record<string, unknown>).product_id as string | undefined;
        const visualType = ((payload as Record<string, unknown>).workflow_name as string)
          || ((payload as Record<string, unknown>).workflow_slug as string)
          || 'product_images';
        liveBatchMetaRef.current = { productId: productId ?? null, visualType };
        gtmFirstGenerationStarted({
          userId: user.id,
          productId: productId ?? null,
          generationId: result.jobId,
          visualType,
        });
      }
    }

    // Wake the queue once after all jobs are enqueued
    if (jobIds.length > 0) {
      sendWake(token);
    }

    if (jobIds.length === 0) {
      setIsBatching(false);
      setBatchState(null);
      return { success: false, newBalance: null };
    }

    jobIdsRef.current = jobIds;

    // Initialize batch state with all job IDs
    setBatchState(prev => ({
      ...(prev || INITIAL_BATCH_STATE),
      jobs: jobIds.map(id => ({ jobId: id, status: 'queued' as const, result: null, error_message: null })),
      totalJobs: jobIds.length,
      totalImages: imageCount,
    }));

    // Start polling all jobs
    pollAllJobs();

    setIsBatching(false);
    return { success: true, newBalance: lastNewBalance };
  }, [user, pollAllJobs]);

  const resetBatch = useCallback(() => {
    stopPolling();
    setBatchState(null);
    jobIdsRef.current = [];
  }, [stopPolling]);

  return {
    startBatch,
    batchState,
    isBatching,
    resetBatch,
  };
}
