import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toSignedUrl } from '@/lib/signedUrl';
import { useGenerationQueue, type QueueJob } from '@/hooks/useGenerationQueue';
import { useCredits } from '@/contexts/CreditContext';
import { estimateCredits } from '@/config/videoCreditPricing';

export type VideoGenStatus = 'idle' | 'queued' | 'creating' | 'processing' | 'complete' | 'error';

export interface GeneratedVideo {
  id: string;
  source_image_url: string;
  prompt: string;
  video_url: string | null;
  kling_task_id: string | null;
  model_name: string;
  duration: string;
  aspect_ratio: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

interface UseGenerateVideoResult {
  status: VideoGenStatus;
  videoUrl: string | null;
  error: string | null;
  elapsedSeconds: number;
  activeJob: QueueJob | null;
  startGeneration: (params: {
    imageUrl: string;
    prompt?: string;
    duration?: '5' | '10';
    modelName?: string;
    aspectRatio?: '1:1' | '16:9' | '9:16';
    imageTailUrl?: string;
    mode?: 'std' | 'pro';
    negativePrompt?: string;
    cfgScale?: number;
    cameraControl?: { type: string; config: Record<string, number> };
    withAudio?: boolean;
    projectId?: string;
    workflowType?: string;
    cameraMotion?: string;
  }) => void;
  reset: () => void;
  history: GeneratedVideo[];
  isLoadingHistory: boolean;
  refreshHistory: () => void;
}

export function useGenerateVideo(): UseGenerateVideoResult {
  const [status, setStatus] = useState<VideoGenStatus>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedVideo[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const { refreshBalance } = useCredits();

  // Use the shared generation queue for video jobs
  const queue = useGenerationQueue({
    jobTypes: ['video'],
    onGenerationFailed: (_jobId, message) => {
      setStatus('error');
      setError(message);
      toast.error(message);
      fetchHistory();
      refreshBalance();
    },
    onCreditRefresh: refreshBalance,
  });

  // Derive elapsed seconds from activeJob
  const elapsedSeconds = (() => {
    const job = queue.activeJob;
    if (!job || (job.status !== 'processing' && job.status !== 'queued')) return 0;
    const start = job.started_at || job.created_at;
    return Math.floor((Date.now() - new Date(start).getTime()) / 1000);
  })();

  // Sync status from queue job state
  useEffect(() => {
    const job = queue.activeJob;
    if (!job) return;

    if (job.status === 'queued') {
      setStatus('queued');
    } else if (job.status === 'processing') {
      setStatus('processing');
    } else if (job.status === 'completed') {
      setStatus('complete');
      // Extract video_url from job result
      const result = job.result as Record<string, unknown> | null;
      if (result?.video_url) {
        toSignedUrl(result.video_url as string).then(signed => setVideoUrl(signed));
      }
      toast.success('Video generated successfully!');
      fetchHistory();
      refreshBalance();
    }
    // failed is handled by onGenerationFailed callback
  }, [queue.activeJob?.status, queue.activeJob?.id]);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const { data, error: fetchError } = await supabase
        .from('generated_videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) {
        console.error('[useGenerateVideo] History fetch error:', fetchError);
        return;
      }

      const signedHistory = await Promise.all(
        ((data as GeneratedVideo[]) || []).map(async (v) => ({
          ...v,
          video_url: v.video_url ? await toSignedUrl(v.video_url) : null,
          source_image_url: await toSignedUrl(v.source_image_url),
        }))
      );
      setHistory(signedHistory);
    } catch (err) {
      console.error('[useGenerateVideo] History fetch error:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Auto-recover stuck "processing" videos on mount
  const recoverStuckVideos = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-video', {
        body: { action: 'recover' },
      });
      if (fnError) return;
      if (data?.recovered > 0) {
        toast.info(`${data.recovered} video(s) updated from processing`);
        fetchHistory();
      }
    } catch (_) { /* silent */ }
  }, [fetchHistory]);

  // Load history on mount, then auto-recover
  useEffect(() => {
    fetchHistory().then(() => recoverStuckVideos());
  }, [fetchHistory, recoverStuckVideos]);

  const reset = useCallback(() => {
    queue.reset();
    setStatus('idle');
    setVideoUrl(null);
    setError(null);
  }, [queue]);

  const startGeneration = useCallback(
    async (params: {
      imageUrl: string;
      prompt?: string;
      duration?: '5' | '10';
      modelName?: string;
      aspectRatio?: '1:1' | '16:9' | '9:16';
      imageTailUrl?: string;
      mode?: 'std' | 'pro';
      negativePrompt?: string;
      cfgScale?: number;
      cameraControl?: { type: string; config: Record<string, number> };
      withAudio?: boolean;
      projectId?: string;
      workflowType?: string;
      cameraMotion?: string;
    }) => {
      setStatus('creating');
      setVideoUrl(null);
      setError(null);

      try {
        // Calculate credit cost
        const creditCost = estimateCredits({
          workflowType: 'animate',
          duration: params.duration || '5',
          audioMode: params.withAudio ? 'ambient' : 'silent',
          motionRecipe: params.cameraMotion,
        });

        const payload: Record<string, unknown> = {
          image_url: params.imageUrl,
          prompt: params.prompt || '',
          duration: params.duration || '5',
          model_name: params.modelName || 'kling-v3',
          aspect_ratio: params.aspectRatio || '16:9',
          mode: params.mode || 'std',
          with_audio: params.withAudio || false,
          cameraMotion: params.cameraMotion || '',
          audioMode: params.withAudio ? 'ambient' : 'silent',
        };
        if (params.negativePrompt) payload.negative_prompt = params.negativePrompt;
        if (typeof params.cfgScale === 'number') payload.cfg_scale = params.cfgScale;
        if (params.projectId) payload.project_id = params.projectId;
        if (params.workflowType) payload.workflow_type = params.workflowType;

        const result = await queue.enqueue({
          jobType: 'video' as any,
          payload,
          imageCount: 1,
          quality: 'standard',
        });

        if (!result) {
          setStatus('idle');
          return;
        }

        setStatus('queued');
        toast.success('Video queued — it will start automatically');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start video generation';
        setStatus('error');
        setError(message);
        toast.error(message);
      }
    },
    [queue]
  );

  return {
    status,
    videoUrl,
    error,
    elapsedSeconds,
    activeJob: queue.activeJob,
    startGeneration,
    reset,
    history,
    isLoadingHistory,
    refreshHistory: fetchHistory,
  };
}
