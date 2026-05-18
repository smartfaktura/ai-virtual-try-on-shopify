import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enqueueWithRetry, isEnqueueError } from '@/lib/enqueueGeneration';
import { toast } from '@/lib/brandedToast';

export interface StartTalkingVideoParams {
  imageUrl: string;
  script: string;
  voiceId: string;
  voiceLanguage?: 'en' | 'zh';
  voiceSpeed?: number;
  duration: '5' | '10';
  aspectRatio?: '9:16' | '1:1' | '16:9';
  sceneHint?: string;
}

export function useTalkingVideoProject() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setJobId(null);
    setError(null);
  }, []);

  const start = useCallback(async (params: StartTalkingVideoParams): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const trimmed = params.script.trim();
      if (!trimmed) {
        setError('Script is required');
        toast.error('Add a short script first');
        return false;
      }
      if (trimmed.length > 120) {
        setError('Script must be 120 characters or fewer');
        toast.error('Script must be 120 characters or fewer');
        return false;
      }
      if (!params.imageUrl) {
        setError('Reference image is required');
        toast.error('Pick a reference photo first');
        return false;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError('Sign in required');
        toast.error('Please sign in to generate');
        return false;
      }

      const result = await enqueueWithRetry({
        jobType: 'talking_video',
        imageCount: 1,
        quality: 'standard',
        payload: {
          image_url: params.imageUrl,
          script: trimmed,
          voice_id: params.voiceId,
          voice_language: params.voiceLanguage || 'en',
          voice_speed: params.voiceSpeed ?? 1,
          duration: params.duration,
          aspect_ratio: params.aspectRatio || '9:16',
          scene_hint: params.sceneHint || undefined,
        },
      }, token);

      if (isEnqueueError(result)) {
        setError(result.message);
        if (result.type === 'insufficient_credits') {
          toast.error('Not enough credits');
        } else {
          toast.error(result.message);
        }
        return false;
      }

      setJobId(result.jobId);
      toast.success('Talking video queued — we will notify you when ready');
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to start';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, jobId, error, start, reset };
}
