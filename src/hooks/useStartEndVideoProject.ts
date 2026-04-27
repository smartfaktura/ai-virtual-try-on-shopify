import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';
import { useGenerateVideo } from '@/hooks/useGenerateVideo';
import {
  buildTransitionPrompt,
  type BuildTransitionPromptParams,
} from '@/lib/transitionPromptBuilder';
import {
  resolveTransitionCompatibility,
  type TransitionCompatibility,
} from '@/lib/transitionCompatibilityResolver';
import type { VideoAnalysis } from '@/lib/videoStrategyResolver';

export type StartEndStage =
  | 'idle'
  | 'analyzing'
  | 'creating_project'
  | 'queued'
  | 'processing'
  | 'complete'
  | 'error';

export interface RunStartEndPipelineParams
  extends Omit<BuildTransitionPromptParams, 'compatibility' | 'category'> {
  startImageUrl: string;
  endImageUrl: string;
  aspectRatio: '1:1' | '16:9' | '9:16';
  /** Optional pre-resolved analysis pair (skips re-analysis). */
  preAnalysis?: { start: VideoAnalysis | null; end: VideoAnalysis | null };
  category?: string | null;
}

interface UseStartEndVideoProjectResult {
  pipelineStage: StartEndStage;
  pipelineError: string | null;
  analysisStart: VideoAnalysis | null;
  analysisEnd: VideoAnalysis | null;
  compatibility: TransitionCompatibility | null;
  videoUrl: string | null;
  videoError: string | null;
  isAnalyzing: boolean;
  isGenerating: boolean;
  isComplete: boolean;
  elapsedSeconds: number;
  activeJob: ReturnType<typeof useGenerateVideo>['activeJob'];
  /** Analyze both frames upfront so the user can preview compatibility. */
  analyzePair: (startUrl: string, endUrl: string) => Promise<TransitionCompatibility | null>;
  runPipeline: (params: RunStartEndPipelineParams) => Promise<void>;
  reset: () => void;
}

async function analyzeOne(url: string): Promise<VideoAnalysis | null> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-video-input', {
      body: { image_urls: [url], workflow_type: 'start_end' },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return (data?.analysis as VideoAnalysis) ?? null;
  } catch (err) {
    console.warn('[useStartEndVideoProject] analyze failed', err);
    return null;
  }
}

export function useStartEndVideoProject(): UseStartEndVideoProjectResult {
  const [pipelineStage, setPipelineStage] = useState<StartEndStage>('idle');
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [analysisStart, setAnalysisStart] = useState<VideoAnalysis | null>(null);
  const [analysisEnd, setAnalysisEnd] = useState<VideoAnalysis | null>(null);
  const [compatibility, setCompatibility] = useState<TransitionCompatibility | null>(null);

  const generateVideo = useGenerateVideo();

  const reset = useCallback(() => {
    setPipelineStage('idle');
    setPipelineError(null);
    setAnalysisStart(null);
    setAnalysisEnd(null);
    setCompatibility(null);
    generateVideo.reset();
  }, [generateVideo]);

  const analyzePair = useCallback(
    async (startUrl: string, endUrl: string): Promise<TransitionCompatibility | null> => {
      setPipelineStage('analyzing');
      setPipelineError(null);
      try {
        const [a, b] = await Promise.all([analyzeOne(startUrl), analyzeOne(endUrl)]);
        setAnalysisStart(a);
        setAnalysisEnd(b);
        const compat = resolveTransitionCompatibility(a, b);
        setCompatibility(compat);
        setPipelineStage('idle');
        return compat;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Analysis failed';
        setPipelineError(msg);
        setPipelineStage('error');
        toast.error(msg);
        return null;
      }
    },
    []
  );

  const runPipeline = useCallback(
    async (params: RunStartEndPipelineParams) => {
      setPipelineError(null);
      try {
        // 1. Resolve compatibility (use cached if both analyses present)
        let compat = compatibility;
        let aStart = params.preAnalysis?.start ?? analysisStart;
        let aEnd = params.preAnalysis?.end ?? analysisEnd;

        if (!compat || !aStart || !aEnd) {
          setPipelineStage('analyzing');
          const [a, b] = await Promise.all([
            aStart ? Promise.resolve(aStart) : analyzeOne(params.startImageUrl),
            aEnd ? Promise.resolve(aEnd) : analyzeOne(params.endImageUrl),
          ]);
          aStart = a;
          aEnd = b;
          setAnalysisStart(a);
          setAnalysisEnd(b);
          compat = resolveTransitionCompatibility(a, b);
          setCompatibility(compat);
        }

        const category =
          params.category ??
          ((aStart as any)?.category || (aStart as any)?.subject_category || null);

        // 2. Build prompt
        const built = buildTransitionPrompt({
          ...params,
          compatibility: compat,
          category,
        });

        // 3. Create video_projects row
        setPipelineStage('creating_project');
        const userResp = await supabase.auth.getUser();
        const userId = userResp.data.user?.id;
        if (!userId) throw new Error('Not signed in');

        const { data: project, error: projectError } = await supabase
          .from('video_projects')
          .insert({
            user_id: userId,
            workflow_type: 'start_end',
            title: `Start-End-${Date.now()}`,
            settings_json: {
              tailImageUrl: params.endImageUrl,
              startImageUrl: params.startImageUrl,
              tier: compat.tier,
              goalId: params.goalId,
              style: params.style,
              cameraFeel: params.cameraFeel,
              motionStrength: params.motionStrength,
              smoothness: params.smoothness,
              realism: params.realism,
              audioMode: params.audioMode,
              cfgScale: built.cfg_scale,
              prompt: built.prompt,
            },
          })
          .select('id')
          .single();

        if (projectError) throw projectError;

        // 4. Insert video_inputs rows (best-effort — non-blocking)
        try {
          await supabase.from('video_inputs').insert([
            {
              project_id: project.id,
              input_role: 'main_reference',
              asset_url: params.startImageUrl,
              sort_order: 0,
              type: 'image',
            },
            {
              project_id: project.id,
              input_role: 'end_reference',
              asset_url: params.endImageUrl,
              sort_order: 1,
              type: 'image',
            },
          ]);
        } catch (e) {
          console.warn('[useStartEndVideoProject] video_inputs insert failed', e);
        }

        // 5. Trigger generation via existing hook
        setPipelineStage('queued');
        generateVideo.startGeneration({
          imageUrl: params.startImageUrl,
          imageTailUrl: params.endImageUrl,
          prompt: built.prompt,
          negativePrompt: built.negative_prompt,
          cfgScale: built.cfg_scale,
          duration: '5',
          mode: 'pro',
          aspectRatio: params.aspectRatio,
          withAudio: params.audioMode === 'ambient',
          projectId: project.id,
          workflowType: 'start_end',
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to start transition';
        setPipelineError(msg);
        setPipelineStage('error');
        toast.error(msg);
      }
    },
    [analysisStart, analysisEnd, compatibility, generateVideo]
  );

  // Mirror generation status into our pipeline stage
  const genStatus = generateVideo.status;
  let stage: StartEndStage = pipelineStage;
  if (genStatus === 'queued') stage = 'queued';
  else if (genStatus === 'processing') stage = 'processing';
  else if (genStatus === 'complete') stage = 'complete';
  else if (genStatus === 'error') stage = 'error';

  return {
    pipelineStage: stage,
    pipelineError: pipelineError || generateVideo.error,
    analysisStart,
    analysisEnd,
    compatibility,
    videoUrl: generateVideo.videoUrl,
    videoError: generateVideo.error,
    isAnalyzing: pipelineStage === 'analyzing',
    isGenerating: genStatus === 'queued' || genStatus === 'processing' || genStatus === 'creating',
    isComplete: genStatus === 'complete',
    elapsedSeconds: generateVideo.elapsedSeconds,
    activeJob: generateVideo.activeJob,
    analyzePair,
    runPipeline,
    reset,
  };
}
