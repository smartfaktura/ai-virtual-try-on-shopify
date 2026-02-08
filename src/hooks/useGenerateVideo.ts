import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  }) => void;
  reset: () => void;
  history: GeneratedVideo[];
  isLoadingHistory: boolean;
  refreshHistory: () => void;
}

const POLL_INTERVAL = 8000;
const MAX_POLLS = 50;

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

      setHistory((data as GeneratedVideo[]) || []);
    } catch (err) {
      console.error('[useGenerateVideo] History fetch error:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const reset = useCallback(() => {
    cleanup();
    setStatus('idle');
    setVideoUrl(null);
    setError(null);
    setElapsedSeconds(0);
  }, [cleanup]);

  const startPolling = useCallback((taskId: string) => {
    setStatus('processing');
    pollCountRef.current = 0;

    // Elapsed time counter
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      if (pollCountRef.current > MAX_POLLS) {
        cleanup();
        setStatus('error');
        setError('Video generation timed out. Please try again.');
        toast.error('Video generation timed out');
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
          setVideoUrl(data.video_url);
          toast.success('Video generated successfully!');
          // Refresh history to include the new video
          fetchHistory();
        } else if (data.status === 'failed') {
          cleanup();
          setStatus('error');
          setError(data.error || 'Video generation failed');
          toast.error(data.error || 'Video generation failed');
          fetchHistory();
        }
        // else still processing — keep polling
      } catch (err) {
        console.error('[useGenerateVideo] Poll error:', err);
        // Don't stop polling on transient errors, just log
      }
    }, POLL_INTERVAL);
  }, [cleanup, fetchHistory]);

  const startGeneration = useCallback(
    async (params: {
      imageUrl: string;
      prompt?: string;
      duration?: '5' | '10';
      modelName?: string;
      aspectRatio?: '1:1' | '16:9' | '9:16';
    }) => {
      cleanup();
      setStatus('creating');
      setVideoUrl(null);
      setError(null);
      setElapsedSeconds(0);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('generate-video', {
          body: {
            action: 'create',
            image_url: params.imageUrl,
            prompt: params.prompt || '',
            duration: params.duration || '5',
            model_name: params.modelName || 'kling-v2-1',
            aspect_ratio: params.aspectRatio || '16:9',
          },
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
