import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { resolveVideoStrategy, type VideoAnalysis, type WorkflowType } from '@/lib/videoStrategyResolver';
import { CAMERA_MOTIONS } from '@/lib/videoMotionRecipes';
import { buildVideoPrompt } from '@/lib/videoPromptTemplates';
import { useGenerateVideo } from '@/hooks/useGenerateVideo';
import { toast } from '@/lib/brandedToast';

export type PipelineStage = 'idle' | 'creating_project' | 'analyzing' | 'building_prompt' | 'generating' | 'queued' | 'complete' | 'error';

interface AnimateParams {
  imageUrl: string;
  category: string;
  sceneType: string;
  motionGoalId: string;
  cameraMotion: string;
  subjectMotion: string;
  realismLevel: string;
  loopStyle: string;
  motionIntensity: 'low' | 'medium' | 'high';
  preserveScene: boolean;
  preserveProductDetails: boolean;
  preserveIdentity: boolean;
  preserveOutfit: boolean;
  aspectRatio: '1:1' | '16:9' | '9:16';
  duration: '5' | '10';
  audioMode: 'silent' | 'ambient';
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

  // Phase B: Generate video from confirmed settings (now queue-based)
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

      // 4. Resolve strategy
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

      // 5. Build prompt
      const builtPrompt = buildVideoPrompt({
        analysis,
        strategy,
        userPrompt: params.userPrompt,
        motionIntensity: params.motionIntensity,
        preserveScene: params.preserveScene,
        audioMode: params.audioMode,
        sceneType: params.sceneType,
      });

      // 6. Create video_shot record
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

      // 7. Submit to queue (replaces direct Kling call)
      setPipelineStage('generating');
      console.log('[useVideoProject] Prompt:', builtPrompt.prompt);

      generateVideo.startGeneration({
        imageUrl: params.imageUrl,
        prompt: builtPrompt.prompt,
        duration: params.duration,
        aspectRatio: params.aspectRatio,
        mode: 'std',
        negativePrompt: builtPrompt.negative_prompt,
        cfgScale: builtPrompt.cfg_scale,
        withAudio: params.audioMode === 'ambient',
        projectId: project.id,
        workflowType: 'animate',
        cameraMotion: params.cameraMotion,
        cameraControlConfig: strategy.camera_control_config,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Pipeline failed';
      setPipelineStage('error');
      setPipelineError(message);
      toast.error(message);
      console.error('[useVideoProject] Pipeline error:', err);
    }
  }, [generateVideo, analysisResult]);

  // Sync pipelineStage with generateVideo terminal states
  useEffect(() => {
    if (generateVideo.status === 'complete' && pipelineStage !== 'complete' && pipelineStage !== 'idle') {
      setPipelineStage('complete');
    }
    if (generateVideo.status === 'queued' && pipelineStage === 'generating') {
      setPipelineStage('queued');
    }
    if (generateVideo.status === 'processing' && pipelineStage === 'queued') {
      setPipelineStage('generating');
    }
    if (generateVideo.status === 'error' && pipelineStage !== 'error' && pipelineStage !== 'idle') {
      setPipelineStage('error');
      setPipelineError(generateVideo.error || 'Video generation failed');
    }
  }, [generateVideo.status, generateVideo.error, pipelineStage]);

  // Derived states
  const isAnalyzing = pipelineStage === 'analyzing';
  const isBuildingPrompt = pipelineStage === 'building_prompt';
  const isGenerating = pipelineStage === 'generating' || pipelineStage === 'queued' ||
    generateVideo.status === 'creating' || generateVideo.status === 'processing' || generateVideo.status === 'queued';
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
    activeJob: generateVideo.activeJob,
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
