import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type VideoGenStatus = 'idle' | 'creating' | 'processing' | 'complete' | 'error';

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
}

const POLL_INTERVAL = 8000;
const MAX_POLLS = 50;

export function useGenerateVideo(): UseGenerateVideoResult {
  const [status, setStatus] = useState<VideoGenStatus>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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
        } else if (data.status === 'failed') {
          cleanup();
          setStatus('error');
          setError(data.error || 'Video generation failed');
          toast.error(data.error || 'Video generation failed');
        }
        // else still processing — keep polling
      } catch (err) {
        console.error('[useGenerateVideo] Poll error:', err);
        // Don't stop polling on transient errors, just log
      }
    }, POLL_INTERVAL);
  }, [cleanup]);

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

  return { status, videoUrl, error, elapsedSeconds, startGeneration, reset };
}
