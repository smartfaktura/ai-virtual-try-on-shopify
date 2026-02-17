import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toSignedUrl } from '@/lib/signedUrl';

export type VideoGenStatus = 'idle' | 'creating' | 'processing' | 'complete' | 'error';

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
  startGeneration: (params: {
    imageUrl: string;
    prompt?: string;
    duration?: '5' | '10';
    modelName?: string;
    aspectRatio?: '1:1' | '16:9' | '9:16';
    imageTailUrl?: string;
    mode?: 'std' | 'pro';
  }) => void;
  reset: () => void;
  history: GeneratedVideo[];
  isLoadingHistory: boolean;
  refreshHistory: () => void;
}

const POLL_INTERVAL = 8000;
const MAX_POLLS = 75; // 8s x 75 = 10 minutes

export function useGenerateVideo(): UseGenerateVideoResult {
  const [status, setStatus] = useState<VideoGenStatus>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [history, setHistory] = useState<GeneratedVideo[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const historyRef = useRef<GeneratedVideo[]>([]);

  // Keep historyRef in sync
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const cleanup = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    pollRef.current = null;
    timerRef.current = null;
    pollCountRef.current = 0;
  }, []);

  useEffect(() => cleanup, [cleanup]);

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
      console.log('[useGenerateVideo] Running auto-recovery for stuck videos...');
      const { data, error: fnError } = await supabase.functions.invoke('generate-video', {
        body: { action: 'recover' },
      });

      if (fnError) {
        console.error('[useGenerateVideo] Recovery error:', fnError);
        return;
      }

      if (data?.recovered > 0) {
        console.log(`[useGenerateVideo] Recovered ${data.recovered} stuck video(s)`);
        toast.info(`${data.recovered} video(s) updated from processing`);
        fetchHistory();
      }
    } catch (err) {
      console.error('[useGenerateVideo] Recovery error:', err);
    }
  }, [fetchHistory]);

  // Load history on mount, then auto-recover
  useEffect(() => {
    fetchHistory().then(() => {
      recoverStuckVideos();
    });
  }, [fetchHistory, recoverStuckVideos]);

  const reset = useCallback(() => {
    cleanup();
    setStatus('idle');
    setVideoUrl(null);
    setError(null);
    setElapsedSeconds(0);
  }, [cleanup]);

  // Graceful final status check when polling times out
  const handlePollTimeout = useCallback(async (taskId: string) => {
    console.log('[useGenerateVideo] Poll limit reached, doing final status check...');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-video', {
        body: { action: 'status', task_id: taskId },
      });

      if (fnError) throw new Error(fnError.message);

      if (data.status === 'succeed' && data.video_url) {
        cleanup();
        setStatus('complete');
        const signedVideoUrl = await toSignedUrl(data.video_url);
        setVideoUrl(signedVideoUrl);
        toast.success('Video generated successfully!');
        fetchHistory();
      } else if (data.status === 'failed') {
        cleanup();
        setStatus('error');
        setError(data.error || 'Video generation failed');
        toast.error(data.error || 'Video generation failed');
        fetchHistory();
      } else {
        // Still processing — show gentle message instead of error
        cleanup();
        setStatus('idle');
        toast.info('Still processing on our end. We\'ll update your history when it\'s ready.');
        fetchHistory();
      }
    } catch (err) {
      console.error('[useGenerateVideo] Final status check error:', err);
      cleanup();
      setStatus('idle');
      toast.info('Video is still processing. Check back shortly.');
      fetchHistory();
    }
  }, [cleanup, fetchHistory]);

  const startPolling = useCallback((taskId: string) => {
    setStatus('processing');
    pollCountRef.current = 0;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      if (pollCountRef.current > MAX_POLLS) {
        clearInterval(pollRef.current!);
        clearInterval(timerRef.current!);
        pollRef.current = null;
        timerRef.current = null;
        handlePollTimeout(taskId);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('generate-video', {
          body: { action: 'status', task_id: taskId },
        });

        if (fnError) throw new Error(fnError.message);

        if (data.status === 'succeed' && data.video_url) {
          cleanup();
          setStatus('complete');
          const signedVideoUrl = await toSignedUrl(data.video_url);
          setVideoUrl(signedVideoUrl);
          toast.success('Video generated successfully!');
          fetchHistory();
        } else if (data.status === 'failed') {
          cleanup();
          setStatus('error');
          setError(data.error || 'Video generation failed');
          toast.error(data.error || 'Video generation failed');
          fetchHistory();
        }
      } catch (err) {
        console.error('[useGenerateVideo] Poll error:', err);
      }
    }, POLL_INTERVAL);
  }, [cleanup, fetchHistory, handlePollTimeout]);

  const startGeneration = useCallback(
    async (params: {
      imageUrl: string;
      prompt?: string;
      duration?: '5' | '10';
      modelName?: string;
      aspectRatio?: '1:1' | '16:9' | '9:16';
      imageTailUrl?: string;
      mode?: 'std' | 'pro';
    }) => {
      // Duplicate prevention: block if a video is already processing
      const hasProcessing = historyRef.current.some((v) => v.status === 'processing');
      if (hasProcessing) {
        toast.warning('You already have a video processing. Please wait for it to finish.');
        return;
      }

      cleanup();
      setStatus('creating');
      setVideoUrl(null);
      setError(null);
      setElapsedSeconds(0);

      try {
        const body: Record<string, unknown> = {
          action: 'create',
          image_url: params.imageUrl,
          prompt: params.prompt || '',
          duration: params.duration || '5',
          model_name: params.modelName || 'kling-v2-1',
          aspect_ratio: params.aspectRatio || '16:9',
        };
        if (params.imageTailUrl) body.image_tail = params.imageTailUrl;
        if (params.mode) body.mode = params.mode;

        const { data, error: fnError } = await supabase.functions.invoke('generate-video', {
          body,
        });

        if (fnError) throw new Error(fnError.message);
        if (data.error) throw new Error(data.error);

        const taskId = data.task_id;
        if (!taskId) throw new Error('No task ID returned');

        toast.info('Video generation started — this typically takes 1-3 minutes');
        startPolling(taskId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start video generation';
        setStatus('error');
        setError(message);
        toast.error(message);
      }
    },
    [cleanup, startPolling]
  );

  return {
    status,
    videoUrl,
    error,
    elapsedSeconds,
    startGeneration,
    reset,
    history,
    isLoadingHistory,
    refreshHistory: fetchHistory,
  };
}
