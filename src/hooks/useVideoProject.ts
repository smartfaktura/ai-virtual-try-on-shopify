import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { resolveVideoStrategy, type VideoAnalysis, type WorkflowType } from '@/lib/videoStrategyResolver';
import { buildVideoPrompt } from '@/lib/videoPromptTemplates';
import { useGenerateVideo } from '@/hooks/useGenerateVideo';
import { toast } from 'sonner';

export type PipelineStage = 'idle' | 'creating_project' | 'analyzing' | 'building_prompt' | 'generating' | 'complete' | 'error';

interface AnimateParams {
  imageUrl: string;
  // Product Context
  category: string;
  sceneType: string;
  // Motion Goal
  motionGoalId: string;
  // Refinements
  cameraMotion: string;
  subjectMotion: string;
  realismLevel: string;
  loopStyle: string;
  motionIntensity: 'low' | 'medium' | 'high';
  // Preservation
  preserveScene: boolean;
  preserveProductDetails: boolean;
  preserveIdentity: boolean;
  preserveOutfit: boolean;
  // Settings
  aspectRatio: '1:1' | '16:9' | '9:16';
  duration: '5' | '10';
  audioMode: 'silent' | 'ambient';
  // Optional
  userPrompt?: string;
}

export function useVideoProject() {
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysis | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  const generateVideo = useGenerateVideo();

  const resetPipeline = useCallback(() => {
    setPipelineStage('idle');
    setProjectId(null);
    setAnalysisResult(null);
    setIsAnalyzingImage(false);
    setPipelineError(null);
    generateVideo.reset();
  }, [generateVideo]);

  // Phase A: Analyze image and return suggestions
  const analyzeImage = useCallback(async (imageUrl: string): Promise<VideoAnalysis | null> => {
    setIsAnalyzingImage(true);
    setPipelineError(null);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-video-input', {
        body: { image_urls: [imageUrl], workflow_type: 'animate' },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const analysis: VideoAnalysis = data.analysis;
      setAnalysisResult(analysis);
      return analysis;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setPipelineError(msg);
      toast.error(msg);
      return null;
    } finally {
      setIsAnalyzingImage(false);
    }
  }, []);

  // Phase B: Generate video from confirmed settings
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
            category: params.category,
            sceneType: params.sceneType,
            motionGoalId: params.motionGoalId,
            cameraMotion: params.cameraMotion,
            subjectMotion: params.subjectMotion,
            realismLevel: params.realismLevel,
            loopStyle: params.loopStyle,
            motionIntensity: params.motionIntensity,
            preserveScene: params.preserveScene,
            preserveProductDetails: params.preserveProductDetails,
            preserveIdentity: params.preserveIdentity,
            preserveOutfit: params.preserveOutfit,
            aspectRatio: params.aspectRatio,
            duration: params.duration,
            audioMode: params.audioMode,
          },
          status: 'processing',
          analysis_status: analysisResult ? 'complete' : 'pending',
        })
        .select('id')
        .single();

      if (projectError || !project) throw new Error(projectError?.message || 'Failed to create project');
      setProjectId(project.id);

      // 2. Insert video_input
      await supabase.from('video_inputs').insert({
        project_id: project.id,
        asset_url: params.imageUrl,
        type: 'image',
        input_role: 'main_reference',
        sort_order: 0,
        analysis_json: analysisResult ? JSON.parse(JSON.stringify(analysisResult)) : null,
      });

      // 3. Use existing analysis or run fresh
      let analysis = analysisResult;
      if (!analysis) {
        setPipelineStage('analyzing');
        const { data: analysisData, error: analysisFnError } = await supabase.functions.invoke('analyze-video-input', {
          body: { image_urls: [params.imageUrl], workflow_type: 'animate' },
        });
        if (analysisFnError) throw new Error(analysisFnError.message);
        if (analysisData?.error) throw new Error(analysisData.error);
        analysis = analysisData.analysis as VideoAnalysis;
        setAnalysisResult(analysis);
      }

      // 4. Resolve strategy (now includes action resolver, scene normalization, realism/loop effects)
      setPipelineStage('building_prompt');
      const strategy = resolveVideoStrategy({
        analysis,
        workflowType: 'animate' as WorkflowType,
        category: params.category,
        sceneType: params.sceneType,
        motionGoalId: params.motionGoalId,
        cameraMotion: params.cameraMotion,
        subjectMotion: params.subjectMotion,
        realismLevel: params.realismLevel,
        loopStyle: params.loopStyle,
        motionIntensity: params.motionIntensity,
        preserveScene: params.preserveScene,
        preserveProductDetails: params.preserveProductDetails,
        preserveIdentity: params.preserveIdentity,
        preserveOutfit: params.preserveOutfit,
        userAudioMode: params.audioMode,
        userPrompt: params.userPrompt,
      });

      // 5. Build prompt (now category-specific with action-aware language)
      const builtPrompt = buildVideoPrompt({
        analysis,
        strategy,
        userPrompt: params.userPrompt,
        motionIntensity: params.motionIntensity,
        preserveScene: params.preserveScene,
      });

      // 6. Create video_shot record with enriched strategy
      await supabase.from('video_shots').insert([{
        project_id: project.id,
        shot_index: 0,
        prompt_text: builtPrompt.prompt,
        duration_sec: parseInt(params.duration),
        status: 'pending',
        audio_mode: params.audioMode,
        model_route: strategy.recommended_model_route,
        prompt_template_name: builtPrompt.prompt_template_name,
        strategy_json: JSON.parse(JSON.stringify(strategy)),
        analysis_json: analysis ? JSON.parse(JSON.stringify(analysis)) : null,
      }]);

      // 7. Submit to Kling
      setPipelineStage('generating');
      console.log('[useVideoProject] Prompt:', builtPrompt.prompt);
      console.log('[useVideoProject] Strategy:', JSON.stringify({
        workflow_strategy: strategy.workflow_strategy,
        main_action: strategy.main_action,
        action_verb: strategy.action_verb,
        primary_moving_elements: strategy.primary_moving_elements,
        scene_type_normalized: strategy.scene_type_normalized,
        realism_level: strategy.realism_level,
        loop_style: strategy.loop_style,
        cyclic_motion: strategy.cyclic_motion,
        user_note_conflict: strategy.user_note_conflict,
        cfg_scale: builtPrompt.cfg_scale,
        camera_control: strategy.camera_control_config ? 'structured' : 'prompt_only',
      }));
      console.log('[useVideoProject] Result label:', builtPrompt.result_label);

      // Build generation params
      const genParams: Parameters<typeof generateVideo.startGeneration>[0] = {
        imageUrl: params.imageUrl,
        prompt: builtPrompt.prompt,
        duration: params.duration,
        aspectRatio: params.aspectRatio,
        mode: 'std',
        negativePrompt: builtPrompt.negative_prompt,
        cfgScale: builtPrompt.cfg_scale,
        withAudio: params.audioMode === 'ambient',
      };

      // Pass structured camera control if available
      if (strategy.camera_control_config) {
        (genParams as Record<string, unknown>).cameraControl = strategy.camera_control_config;
      }

      generateVideo.startGeneration(genParams);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Pipeline failed';
      setPipelineStage('error');
      setPipelineError(message);
      toast.error(message);
      console.error('[useVideoProject] Pipeline error:', err);
    }
  }, [generateVideo, analysisResult]);

  // Derived states
  const isAnalyzing = pipelineStage === 'analyzing';
  const isBuildingPrompt = pipelineStage === 'building_prompt';
  const isGenerating = pipelineStage === 'generating' || generateVideo.status === 'creating' || generateVideo.status === 'processing';
  const isComplete = generateVideo.status === 'complete' && generateVideo.videoUrl !== null;

  return {
    pipelineStage,
    projectId,
    analysisResult,
    pipelineError,
    isAnalyzingImage,
    analyzeImage,
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
