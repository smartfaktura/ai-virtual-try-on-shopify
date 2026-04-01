import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';
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
  camera_type: string | null;
  workflow_type: string | null;
  settings_json: Record<string, unknown> | null;
  project_title: string | null;
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
    cameraControlConfig?: { type: string; config: Record<string, number> };
  }) => void;
  reset: () => void;
  history: GeneratedVideo[];
  isLoadingHistory: boolean;
  refreshHistory: () => void;
  loadMore: () => void;
  hasMore: boolean;
  totalCount: number;
  isLoadingMore: boolean;
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

  // Client-side Kling status polling when job is processing
  useEffect(() => {
    const job = queue.activeJob;
    if (!job || job.status !== 'processing') return;

    const result = job.result as Record<string, unknown> | null;
    const klingTaskId = result?.kling_task_id as string | undefined;
    if (!klingTaskId) return;

    let cancelled = false;
    const MAX_POLLS = 60; // 10 min at 10s intervals
    let pollCount = 0;

    const poll = async () => {
      if (cancelled || pollCount >= MAX_POLLS) return;
      pollCount++;

      try {
        const { data, error: fnError } = await supabase.functions.invoke('generate-video', {
          body: { action: 'status', task_id: klingTaskId, queue_job_id: job.id },
        });

        if (fnError || !data) {
          console.warn('[useGenerateVideo] Status poll error:', fnError);
          if (!cancelled) setTimeout(poll, 10000);
          return;
        }

        if (data.status === 'succeed' && data.video_url) {
          // Queue job was updated by edge function — queue polling will pick it up
          return;
        }

        if (data.status === 'failed') {
          // Queue job was updated by edge function — queue polling will pick it up
          return;
        }

        // Still processing — poll again
        if (!cancelled) setTimeout(poll, 10000);
      } catch (err) {
        console.warn('[useGenerateVideo] Status poll exception:', err);
        if (!cancelled) setTimeout(poll, 10000);
      }
    };

    // Start polling after a short delay (give Kling time to start)
    const initialDelay = setTimeout(poll, 5000);

    return () => {
      cancelled = true;
      clearTimeout(initialDelay);
    };
  }, [queue.activeJob?.id, queue.activeJob?.status]);

  const PAGE_SIZE = 20;
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const mapVideos = useCallback(async (data: any[]): Promise<GeneratedVideo[]> => {
    const signed = await Promise.all(
      data.map(async (v) => {
        const project = v.video_projects as Record<string, unknown> | null;
        return {
          ...v,
          video_url: v.video_url ? await toSignedUrl(v.video_url) : null,
          source_image_url: await toSignedUrl(v.source_image_url),
          settings_json: (project?.settings_json as Record<string, unknown>) || null,
          workflow_type: v.workflow_type || (project?.workflow_type as string) || null,
          project_title: (project?.title as string) || null,
          video_projects: undefined,
        } as GeneratedVideo;
      })
    );
    return signed;
  }, []);

  const deduplicateVideos = useCallback((videos: GeneratedVideo[]): GeneratedVideo[] => {
    const seen = new Set<string>();
    return videos.filter(v => {
      if (!v.kling_task_id) return true;
      if (seen.has(v.kling_task_id)) return false;
      seen.add(v.kling_task_id);
      return true;
    });
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const { data, error: fetchError, count } = await supabase
        .from('generated_videos')
        .select('*, video_projects(settings_json, workflow_type, title)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (fetchError) {
        console.error('[useGenerateVideo] History fetch error:', fetchError);
        return;
      }

      const total = count ?? 0;
      setTotalCount(total);
      const signed = await mapVideos(data || []);
      const deduped = deduplicateVideos(signed);
      setHistory(deduped);
      setHasMore(total > PAGE_SIZE);
    } catch (err) {
      console.error('[useGenerateVideo] History fetch error:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [mapVideos, deduplicateVideos]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      const from = history.length;
      const { data, error: fetchError } = await supabase
        .from('generated_videos')
        .select('*, video_projects(settings_json, workflow_type, title)')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (fetchError) {
        console.error('[useGenerateVideo] Load more error:', fetchError);
        return;
      }

      const signed = await mapVideos(data || []);
      setHistory(prev => {
        const combined = [...prev, ...signed];
        return deduplicateVideos(combined);
      });
      setHasMore((data || []).length >= PAGE_SIZE);
    } catch (err) {
      console.error('[useGenerateVideo] Load more error:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [history.length, isLoadingMore, hasMore, mapVideos, deduplicateVideos]);

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

  // Auto-refresh history while any video is still processing
  useEffect(() => {
    const hasProcessing = history.some(v => v.status === 'processing' || v.status === 'queued');
    if (!hasProcessing) return;
    const interval = setInterval(() => {
      fetchHistory();
      recoverStuckVideos();
    }, 8000);
    return () => clearInterval(interval);
  }, [history, fetchHistory, recoverStuckVideos]);

  // Refresh history on window focus
  useEffect(() => {
    const onFocus = () => fetchHistory();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchHistory]);

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
      cameraControlConfig?: { type: string; config: Record<string, number> };
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
        if (params.cameraControlConfig) payload.camera_control_config = params.cameraControlConfig;

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
    loadMore,
    hasMore,
    totalCount,
    isLoadingMore,
  };
}
