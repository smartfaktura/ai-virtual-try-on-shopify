import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BulkProgressItem, BulkItemStatus } from '@/components/app/video/BulkProgressBanner';
import { toast } from '@/lib/brandedToast';
import { resolveVideoStrategy, type VideoAnalysis, type WorkflowType } from '@/lib/videoStrategyResolver';
import { CAMERA_MOTIONS } from '@/lib/videoMotionRecipes';
import { buildVideoPrompt } from '@/lib/videoPromptTemplates';
import { enqueueWithRetry, isEnqueueError, paceDelay, sendWake, getAuthToken } from '@/lib/enqueueGeneration';
import { gtmFirstGenerationStarted } from '@/lib/gtm';

interface BulkImage {
  id: string;
  url: string;
  preview: string;
}

interface BulkAnimateParams {
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

export function useBulkVideoProject() {
  const [bulkItems, setBulkItems] = useState<BulkProgressItem[]>([]);
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [isBulkComplete, setIsBulkComplete] = useState(false);

  const updateItem = (id: string, status: BulkItemStatus) => {
    setBulkItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const runBulkAnimatePipeline = useCallback(async (
    images: BulkImage[],
    params: BulkAnimateParams,
    perImageParams?: Map<string, Record<string, any>>,
  ) => {
    if (images.length === 0) return;

    const token = await getAuthToken();
    if (!token) {
      toast.error('Please sign in to generate videos');
      return;
    }

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      toast.error('Please sign in to generate videos');
      return;
    }

    setIsBulkRunning(true);
    setIsBulkComplete(false);
    setBulkItems(images.map(img => ({ id: img.id, preview: img.preview, status: 'pending' as BulkItemStatus })));

    const batchId = crypto.randomUUID();
    let completed = 0;
    let failed = 0;
    let firstgenFired = false;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      updateItem(img.id, 'queued');

      try {
        // Merge per-image overrides
        const overrides = perImageParams?.get(img.id) || {};
        const mergedParams = { ...params, ...overrides };

        // 1. Create video_project
        const cameraLabel = CAMERA_MOTIONS.find(c => c.id === mergedParams.cameraMotion)?.label || mergedParams.cameraMotion.replace(/_/g, ' ');
        const productName = mergedParams.category.replace(/_/g, ' ');

        const { data: project, error: projectError } = await supabase
          .from('video_projects')
          .insert({
            user_id: userId,
            workflow_type: 'animate',
            title: `${cameraLabel}-${productName}`,
            settings_json: {
              category: mergedParams.category,
              sceneType: mergedParams.sceneType,
              motionGoalId: mergedParams.motionGoalId,
              cameraMotion: mergedParams.cameraMotion,
              subjectMotion: mergedParams.subjectMotion,
              realismLevel: mergedParams.realismLevel,
              loopStyle: mergedParams.loopStyle,
              motionIntensity: mergedParams.motionIntensity,
              preserveScene: mergedParams.preserveScene,
              preserveProductDetails: mergedParams.preserveProductDetails,
              preserveIdentity: mergedParams.preserveIdentity,
              preserveOutfit: mergedParams.preserveOutfit,
              aspectRatio: mergedParams.aspectRatio,
              duration: mergedParams.duration,
              audioMode: mergedParams.audioMode,
            },
            status: 'processing',
            analysis_status: 'pending',
          })
          .select('id')
          .single();

        if (projectError || !project) throw new Error(projectError?.message || 'Failed to create project');

        const shortId = project.id.slice(0, 6);
        await supabase.from('video_projects').update({ title: `${cameraLabel}-${productName}-${shortId}` }).eq('id', project.id);

        // 2. Insert video_input
        await supabase.from('video_inputs').insert({
          project_id: project.id,
          asset_url: img.url,
          type: 'image',
          input_role: 'main_reference',
          sort_order: 0,
        });

        // 3. Resolve strategy + build prompt
        const fallbackAnalysis: VideoAnalysis = {
          subject_category: mergedParams.category,
          scene_type: mergedParams.sceneType,
          motion_potential: 'medium',
          risk_flags: [],
          dominant_colors: [],
          composition_notes: '',
        } as unknown as VideoAnalysis;

        const strategy = resolveVideoStrategy({
          analysis: fallbackAnalysis,
          workflowType: 'animate' as WorkflowType,
          category: mergedParams.category,
          sceneType: mergedParams.sceneType,
          motionGoalId: mergedParams.motionGoalId,
          cameraMotion: mergedParams.cameraMotion,
          subjectMotion: mergedParams.subjectMotion,
          realismLevel: mergedParams.realismLevel,
          loopStyle: mergedParams.loopStyle,
          motionIntensity: mergedParams.motionIntensity,
          preserveScene: mergedParams.preserveScene,
          preserveProductDetails: mergedParams.preserveProductDetails,
          preserveIdentity: mergedParams.preserveIdentity,
          preserveOutfit: mergedParams.preserveOutfit,
          userAudioMode: mergedParams.audioMode,
          userPrompt: mergedParams.userPrompt,
        });

        const builtPrompt = buildVideoPrompt({
          analysis: fallbackAnalysis,
          strategy,
          userPrompt: mergedParams.userPrompt,
          motionIntensity: mergedParams.motionIntensity,
          preserveScene: mergedParams.preserveScene,
          audioMode: mergedParams.audioMode,
          sceneType: mergedParams.sceneType,
        });

        // 4. Create video_shot
        await supabase.from('video_shots').insert([{
          project_id: project.id,
          shot_index: 0,
          prompt_text: builtPrompt.prompt,
          duration_sec: parseInt(mergedParams.duration),
          status: 'pending',
          audio_mode: mergedParams.audioMode,
          model_route: strategy.recommended_model_route,
          prompt_template_name: builtPrompt.prompt_template_name,
          strategy_json: JSON.parse(JSON.stringify(strategy)),
        }]);

        // 5. Enqueue via shared batch_id
        updateItem(img.id, 'generating');

        await paceDelay(i);

        const payload: Record<string, unknown> = {
          image_url: img.url,
          prompt: builtPrompt.prompt,
          duration: mergedParams.duration,
          model_name: 'kling-v3',
          aspect_ratio: mergedParams.aspectRatio,
          mode: 'pro',
          with_audio: mergedParams.audioMode === 'ambient',
          cameraMotion: mergedParams.cameraMotion,
          audioMode: mergedParams.audioMode,
          project_id: project.id,
          workflow_type: 'animate',
          batch_id: batchId,
        };
        if (builtPrompt.negative_prompt) payload.negative_prompt = builtPrompt.negative_prompt;
        if (builtPrompt.cfg_scale) payload.cfg_scale = builtPrompt.cfg_scale;
        if (strategy.camera_control_config) payload.camera_control_config = strategy.camera_control_config;

        const result = await enqueueWithRetry(
          {
            jobType: 'video',
            payload,
            imageCount: 1,
            quality: 'standard',
            skipWake: i < images.length - 1,
          },
          token,
        );

        if (isEnqueueError(result)) {
          console.error(`[useBulkVideoProject] Enqueue error for ${img.id}:`, result);
          updateItem(img.id, 'failed');
          failed++;
          continue;
        }

        updateItem(img.id, 'complete');
        completed++;
      } catch (err) {
        console.error(`[useBulkVideoProject] Failed for image ${img.id}:`, err);
        updateItem(img.id, 'failed');
        failed++;
      }
    }

    // Single wake after all jobs enqueued
    sendWake(token);

    setIsBulkRunning(false);
    setIsBulkComplete(true);

    if (failed === 0) {
      toast.success(`All ${completed} videos queued successfully!`);
    } else {
      toast.info(`${completed} videos queued, ${failed} failed`);
    }
  }, []);

  const resetBulk = useCallback(() => {
    setBulkItems([]);
    setIsBulkRunning(false);
    setIsBulkComplete(false);
  }, []);

  return {
    bulkItems,
    isBulkRunning,
    isBulkComplete,
    runBulkAnimatePipeline,
    resetBulk,
  };
}
