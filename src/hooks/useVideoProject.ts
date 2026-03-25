import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { resolveVideoStrategy, type VideoAnalysis, type WorkflowType } from '@/lib/videoStrategyResolver';
import { buildVideoPrompt } from '@/lib/videoPromptTemplates';
import { useGenerateVideo } from '@/hooks/useGenerateVideo';
import { toast } from 'sonner';

export type PipelineStage = 'idle' | 'creating_project' | 'analyzing' | 'building_prompt' | 'generating' | 'complete' | 'error';

interface AnimateParams {
  imageUrl: string;
  stylePreset: string;
  motionRecipe: string;
  motionIntensity: 'low' | 'medium' | 'high';
  preserveScene: boolean;
  aspectRatio: '1:1' | '16:9' | '9:16';
  duration: '5' | '10';
  audioMode: 'silent' | 'ambient' | 'voice';
  userPrompt?: string;
}

export function useVideoProject() {
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysis | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  const generateVideo = useGenerateVideo();

  const resetPipeline = useCallback(() => {
    setPipelineStage('idle');
    setProjectId(null);
    setAnalysisResult(null);
    setPipelineError(null);
    generateVideo.reset();
  }, [generateVideo]);

  const runAnimatePipeline = useCallback(async (params: AnimateParams) => {
    setPipelineError(null);

    try {
      // 1. Create video_project
      setPipelineStage('creating_project');
      const { data: project, error: projectError } = await supabase
        .from('video_projects')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user!.id,
          workflow_type: 'animate',
          title: 'Animate Image',
          settings_json: {
            stylePreset: params.stylePreset,
            motionRecipe: params.motionRecipe,
            motionIntensity: params.motionIntensity,
            preserveScene: params.preserveScene,
            aspectRatio: params.aspectRatio,
            duration: params.duration,
            audioMode: params.audioMode,
          },
          status: 'processing',
          analysis_status: 'pending',
        })
        .select('id')
        .single();

      if (projectError || !project) throw new Error(projectError?.message || 'Failed to create project');
      setProjectId(project.id);

      // 2. Insert video_input
      const { error: inputError } = await supabase
        .from('video_inputs')
        .insert({
          project_id: project.id,
          asset_url: params.imageUrl,
          type: 'image',
          input_role: 'main_reference',
          sort_order: 0,
        });

      if (inputError) console.error('[useVideoProject] Input insert error:', inputError);

      // 3. Run AI analysis
      setPipelineStage('analyzing');
      const { data: analysisData, error: analysisFnError } = await supabase.functions.invoke('analyze-video-input', {
        body: { image_urls: [params.imageUrl], workflow_type: 'animate' },
      });

      if (analysisFnError) throw new Error(analysisFnError.message);
      if (analysisData?.error) throw new Error(analysisData.error);

      const analysis: VideoAnalysis = analysisData.analysis;
      setAnalysisResult(analysis);

      // Update analysis_status
      await supabase
        .from('video_projects')
        .update({ analysis_status: 'complete' })
        .eq('id', project.id);

      // Store analysis in video_inputs
      await supabase
        .from('video_inputs')
        .update({ analysis_json: JSON.parse(JSON.stringify(analysis)) })
        .eq('project_id', project.id);

      // 4. Resolve strategy
      setPipelineStage('building_prompt');
      const strategy = resolveVideoStrategy({
        analysis,
        workflowType: 'animate' as WorkflowType,
        userStylePreset: params.stylePreset,
        userAudioMode: params.audioMode,
      });

      // 5. Build prompt
      const builtPrompt = buildVideoPrompt({
        analysis,
        strategy,
        userPrompt: params.userPrompt,
        motionRecipe: params.motionRecipe,
        motionIntensity: params.motionIntensity,
        preserveScene: params.preserveScene,
      });

      // 6. Create video_shot record
      const { error: shotError } = await supabase
        .from('video_shots')
        .insert([{
          project_id: project.id,
          shot_index: 0,
          prompt_text: builtPrompt.prompt,
          duration_sec: parseInt(params.duration),
          status: 'pending',
          audio_mode: params.audioMode,
          model_route: strategy.recommended_model_route,
          prompt_template_name: builtPrompt.prompt_template_name,
          strategy_json: JSON.parse(JSON.stringify(strategy)),
          analysis_json: JSON.parse(JSON.stringify(analysis)),
        }]);

      if (shotError) console.error('[useVideoProject] Shot insert error:', shotError);

      // 7. Submit to Kling via generate-video
      setPipelineStage('generating');
      console.log('[useVideoProject] Pipeline built prompt:', builtPrompt.prompt);
      console.log('[useVideoProject] Strategy:', strategy.workflow_strategy);

      generateVideo.startGeneration({
        imageUrl: params.imageUrl,
        prompt: builtPrompt.prompt,
        duration: params.duration,
        aspectRatio: params.aspectRatio,
        mode: 'std',
        negativePrompt: builtPrompt.negative_prompt,
        cfgScale: builtPrompt.cfg_scale,
        withAudio: params.audioMode === 'ambient',
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Pipeline failed';
      setPipelineStage('error');
      setPipelineError(message);
      toast.error(message);
      console.error('[useVideoProject] Pipeline error:', err);
    }
  }, [generateVideo]);

  // Derive combined status
  const isAnalyzing = pipelineStage === 'analyzing';
  const isBuildingPrompt = pipelineStage === 'building_prompt';
  const isGenerating = pipelineStage === 'generating' || generateVideo.status === 'creating' || generateVideo.status === 'processing';
  const isComplete = generateVideo.status === 'complete' && generateVideo.videoUrl !== null;

  return {
    pipelineStage,
    projectId,
    analysisResult,
    pipelineError,
    runAnimatePipeline,
    resetPipeline,
    // Pass through generate video state
    videoUrl: generateVideo.videoUrl,
    videoError: generateVideo.error,
    elapsedSeconds: generateVideo.elapsedSeconds,
    videoStatus: generateVideo.status,
    history: generateVideo.history,
    isLoadingHistory: generateVideo.isLoadingHistory,
    refreshHistory: generateVideo.refreshHistory,
    // Derived
    isAnalyzing,
    isBuildingPrompt,
    isGenerating,
    isComplete,
  };
}
