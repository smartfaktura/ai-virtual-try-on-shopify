import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enqueueWithRetry, isEnqueueError } from '@/lib/enqueueGeneration';
import { toast } from '@/lib/brandedToast';
import { serializeForKling } from '@/lib/talkingDuration';

export interface TalkingPerformance {
  motion: 'still' | 'natural' | 'expressive';
  gaze: 'camera' | 'soft';
}

export interface StartTalkingVideoParams {
  imageUrl: string;
  script: string;
  voiceId: string;
  voiceLanguage?: 'en' | 'zh';
  voiceSpeed?: number;
  duration: '5' | '10';
  aspectRatio?: '9:16' | '1:1' | '16:9';
  sceneHint?: string;
  performance?: TalkingPerformance;
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

  const start = useCallback(async (params: StartTalkingVideoParams): Promise<{ ok: boolean; jobId?: string }> => {
    setError(null);
    setIsSubmitting(true);
    try {
      const trimmed = params.script.trim();
      if (!trimmed) {
        setError('Script is required');
        toast.error('Add a short script first');
        return { ok: false };
      }
      // Convert composer tokens ([.] [..] [...] [em]) to Kling-friendly
      // punctuation so the lip-sync TTS interprets pacing correctly.
      const klingScript = serializeForKling(trimmed);
      if (klingScript.length > 200) {
        setError('Script is too long after expanding pauses — trim a bit');
        toast.error('Script is too long — trim a bit');
        return { ok: false };
      }
      if (!params.imageUrl) {
        setError('Reference image is required');
        toast.error('Pick a reference photo first');
        return { ok: false };
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError('Sign in required');
        toast.error('Please sign in to generate');
        return { ok: false };
      }

      const result = await enqueueWithRetry({
        jobType: 'talking_video',
        imageCount: 1,
        quality: 'standard',
        payload: {
          image_url: params.imageUrl,
          script: klingScript,
          voice_id: params.voiceId,
          voice_language: params.voiceLanguage || 'en',
          voice_speed: params.voiceSpeed ?? 1,
          duration: params.duration,
          aspect_ratio: params.aspectRatio || '9:16',
          scene_hint: params.sceneHint || undefined,
          performance: params.performance || undefined,
        },
      }, token);

      if (isEnqueueError(result)) {
        setError(result.message);
        if (result.type === 'insufficient_credits') {
          toast.error('Not enough credits');
        } else {
          toast.error(result.message);
        }
        return { ok: false };
      }

      setJobId(result.jobId);
      toast.success('Talking video queued — generating now');
      return { ok: true, jobId: result.jobId };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to start';
      setError(msg);
      toast.error(msg);
      return { ok: false };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, jobId, error, start, reset };
}
