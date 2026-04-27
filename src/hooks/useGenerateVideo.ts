import { useState, useCallback, useEffect, useRef } from 'react';
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
  preview_url: string | null;
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
    /** For start_end workflow — premium styles add a surcharge backend-side. */
    transitionStyle?: string;
  }) => void;
  reset: () => void;
  history: GeneratedVideo[];
  isLoadingHistory: boolean;
  refreshHistory: () => void;
  removeFromHistory: (id: string) => void;
  loadMore: () => void;
  hasMore: boolean;
  totalCount: number;
  isLoadingMore: boolean;
}

const PAGE_SIZE = 20;

/** Status priority for dedup merge — higher wins */
const STATUS_PRIORITY: Record<string, number> = {
  queued: 0,
  processing: 1,
  failed: 2,
  complete: 3,
  completed: 3,
};

export function useGenerateVideo(): UseGenerateVideoResult {
  const [status, setStatus] = useState<VideoGenStatus>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedVideo[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Track real backend rows fetched (not deduplicated count)
  const fetchedRowCountRef = useRef(0);
  const initialLoadDoneRef = useRef(false);

  const { refreshBalance } = useCredits();

  const queue = useGenerationQueue({
    jobTypes: ['video'],
    onGenerationFailed: (_jobId, message) => {
      setStatus('error');
      setError(message);
      toast.error(message);
      silentRefreshHistory();
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
      silentRefreshHistory();
      refreshBalance();
    }
  }, [queue.activeJob?.status, queue.activeJob?.id]);

  // Client-side Kling status polling when job is processing
  useEffect(() => {
    const job = queue.activeJob;
    if (!job || job.status !== 'processing') return;

    const result = job.result as Record<string, unknown> | null;
    const klingTaskId = result?.kling_task_id as string | undefined;
    if (!klingTaskId) return;

    let cancelled = false;
    const MAX_POLLS = 60;
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
          // Edge function may need a moment to persist the row update — refresh shortly after.
          if (!cancelled) setTimeout(() => silentRefreshHistory(), 1500);
          return;
        }
        if (data.status === 'failed') {
          if (!cancelled) setTimeout(() => silentRefreshHistory(), 1500);
          return;
        }
        if (!cancelled) setTimeout(poll, 10000);
      } catch (err) {
        console.warn('[useGenerateVideo] Status poll exception:', err);
        if (!cancelled) setTimeout(poll, 10000);
      }
    };

    const initialDelay = setTimeout(poll, 5000);
    return () => { cancelled = true; clearTimeout(initialDelay); };
  }, [queue.activeJob?.id, queue.activeJob?.status]);

  const mapVideos = useCallback(async (data: any[]): Promise<GeneratedVideo[]> => {
    const signed = await Promise.all(
      data.map(async (v) => {
        const project = v.video_projects as Record<string, unknown> | null;
        return {
          ...v,
          video_url: v.video_url ? await toSignedUrl(v.video_url) : null,
          source_image_url: await toSignedUrl(v.source_image_url),
          preview_url: v.preview_url ? await toSignedUrl(v.preview_url) : null,
          settings_json: (project?.settings_json as Record<string, unknown>) || null,
          workflow_type: v.workflow_type || (project?.workflow_type as string) || null,
          project_title: (project?.title as string) || null,
          video_projects: undefined,
        } as GeneratedVideo;
      })
    );
    return signed;
  }, []);

  /**
   * Merge-dedup: group by kling_task_id (fallback to id), keep the row
   * with the strongest status (completed > failed > processing > queued).
   * Tie-break by completed_at then created_at descending.
   */
  const mergeDeduplicateVideos = useCallback((videos: GeneratedVideo[]): GeneratedVideo[] => {
    const map = new Map<string, GeneratedVideo>();
    for (const v of videos) {
      const key = v.kling_task_id || v.id;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, v);
        continue;
      }
      // Prefer the row with stronger status
      const existingPri = STATUS_PRIORITY[existing.status] ?? 1;
      const newPri = STATUS_PRIORITY[v.status] ?? 1;
      if (newPri > existingPri) {
        map.set(key, v);
      } else if (newPri === existingPri) {
        // Same status — prefer the one with a video_url, or newer timestamp
        if (v.video_url && !existing.video_url) {
          map.set(key, v);
        } else if (v.completed_at && existing.completed_at && v.completed_at > existing.completed_at) {
          map.set(key, v);
        } else if (v.created_at > existing.created_at) {
          map.set(key, v);
        }
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, []);

  /**
   * Fetch initial page — shows loading skeleton only on first load.
   */
  const fetchHistory = useCallback(async () => {
    try {
      if (!initialLoadDoneRef.current) setIsLoadingHistory(true);

      const { data, error: fetchError, count } = await supabase
        .from('generated_videos')
        .select('*, video_projects(settings_json, workflow_type, title)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (fetchError) {
        console.error('[useGenerateVideo] History fetch error:', fetchError);
        return;
      }

      const rawRows = data || [];
      const total = count ?? 0;
      setTotalCount(total);
      fetchedRowCountRef.current = rawRows.length;

      const signed = await mapVideos(rawRows);
      setHistory(prev => {
        // Merge new data with existing to preserve any extra pages already loaded
        const combined = [...signed, ...prev.filter(p => !signed.some(s => s.id === p.id))];
        return mergeDeduplicateVideos(combined);
      });
      setHasMore(total > PAGE_SIZE);
    } catch (err) {
      console.error('[useGenerateVideo] History fetch error:', err);
    } finally {
      setIsLoadingHistory(false);
      initialLoadDoneRef.current = true;
    }
  }, [mapVideos, mergeDeduplicateVideos]);

  /**
   * Silent refresh — no loading state change, used for background polls.
   */
  const silentRefreshHistory = useCallback(async () => {
    try {
      // Fetch at least as many rows as we've previously loaded
      const rowsToFetch = Math.max(fetchedRowCountRef.current, PAGE_SIZE);
      const { data, error: fetchError, count } = await supabase
        .from('generated_videos')
        .select('*, video_projects(settings_json, workflow_type, title)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, rowsToFetch - 1);

      if (fetchError) {
        console.error('[useGenerateVideo] Silent refresh error:', fetchError);
        return;
      }

      const rawRows = data || [];
      const total = count ?? 0;
      setTotalCount(total);

      const signed = await mapVideos(rawRows);
      setHistory(prev => {
        // Merge: keep any extra paginated rows not in this fetch
        const fetchedIds = new Set(signed.map(s => s.id));
        const extras = prev.filter(p => !fetchedIds.has(p.id));
        return mergeDeduplicateVideos([...signed, ...extras]);
      });
      setHasMore(total > rowsToFetch);
    } catch (err) {
      console.error('[useGenerateVideo] Silent refresh error:', err);
    }
  }, [mapVideos, mergeDeduplicateVideos]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      // Use the real fetched row count as offset, not deduplicated history length
      const from = fetchedRowCountRef.current;
      const { data, error: fetchError } = await supabase
        .from('generated_videos')
        .select('*, video_projects(settings_json, workflow_type, title)')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (fetchError) {
        console.error('[useGenerateVideo] Load more error:', fetchError);
        return;
      }

      const rawRows = data || [];
      fetchedRowCountRef.current += rawRows.length;

      const signed = await mapVideos(rawRows);
      setHistory(prev => mergeDeduplicateVideos([...prev, ...signed]));
      setHasMore(rawRows.length >= PAGE_SIZE);
    } catch (err) {
      console.error('[useGenerateVideo] Load more error:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, mapVideos, mergeDeduplicateVideos]);

  // Auto-recover stuck "processing" videos on mount
  const recoverStuckVideos = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-video', {
        body: { action: 'recover' },
      });
      if (fnError) return;
      if (data?.recovered > 0) {
        silentRefreshHistory();
      }
    } catch (_) { /* silent */ }
  }, [silentRefreshHistory]);

  // Load history on mount, then auto-recover
  useEffect(() => {
    fetchHistory().then(() => recoverStuckVideos());
  }, [fetchHistory, recoverStuckVideos]);

  // Auto-refresh history silently while any video is still processing.
  // Also fires a watchdog `recoverStuckVideos` for rows stuck > 6 minutes.
  useEffect(() => {
    const processing = history.filter(v => v.status === 'processing' || v.status === 'queued');
    if (processing.length === 0) return;

    const interval = setInterval(() => {
      silentRefreshHistory();
      // Watchdog: if any processing row is older than 6 minutes, ask backend to reconcile.
      const sixMinAgo = Date.now() - 6 * 60 * 1000;
      const hasStuck = processing.some(v => new Date(v.created_at).getTime() < sixMinAgo);
      if (hasStuck) recoverStuckVideos();
    }, 4000);
    return () => clearInterval(interval);
  }, [history, silentRefreshHistory, recoverStuckVideos]);

  // Silent refresh history on window focus (no flash)
  useEffect(() => {
    const onFocus = () => silentRefreshHistory();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [silentRefreshHistory]);

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
        // Start & End workflow — Kling start+end frame interpolation.
        // When image_tail is set, the edge function strips camera_control and uses the cfg_scale we send.
        if (params.imageTailUrl) {
          payload.image_tail = params.imageTailUrl;
        } else if (params.cameraControlConfig) {
          // Camera control is forwarded ONLY when there's no tail frame (Kling incompatibility).
          payload.camera_control_config = params.cameraControlConfig;
        }

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
    removeFromHistory: (id: string) => {
      setHistory(prev => prev.filter(v => v.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
    },
    loadMore,
    hasMore,
    totalCount,
    isLoadingMore,
  };
}
