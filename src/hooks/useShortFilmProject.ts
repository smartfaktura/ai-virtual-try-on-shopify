import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from '@/lib/brandedToast';
import { generateShotPlan } from '@/lib/shortFilmPlanner';
import { buildShotPrompt, estimateShortFilmCredits } from '@/lib/shortFilmPromptBuilder';
import type {
  FilmType,
  StoryStructure,
  ShortFilmSettings,
  ShortFilmStep,
  ShotPlanItem,
} from '@/types/shortFilm';
import type { ReferenceAsset } from '@/components/app/video/short-film/ReferenceUploadPanel';

interface ShotStatus {
  shot_index: number;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  result_url?: string;
}

export function useShortFilmProject() {
  const { user } = useAuth();
  const { balance, refreshBalance } = useCredits();

  const [step, setStep] = useState<ShortFilmStep>('film_type');
  const [filmType, setFilmType] = useState<FilmType | null>(null);
  const [storyStructure, setStoryStructure] = useState<StoryStructure | null>(null);
  const [references, setReferences] = useState<ReferenceAsset[]>([]);
  const [shots, setShots] = useState<ShotPlanItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shotStatuses, setShotStatuses] = useState<ShotStatus[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [planMode, setPlanMode] = useState<'auto' | 'ai'>('auto');
  const [isAiPlanning, setIsAiPlanning] = useState(false);
  const [settings, setSettings] = useState<ShortFilmSettings>({
    aspectRatio: '16:9',
    audioMode: 'silent',
    preservationLevel: 'medium',
    shotDuration: '5',
  });

  const steps: ShortFilmStep[] = ['film_type', 'references', 'story', 'shot_plan', 'settings', 'review'];
  const currentStepIndex = steps.indexOf(step);

  const totalCredits = useMemo(
    () => estimateShortFilmCredits(shots.length, settings),
    [shots.length, settings],
  );

  const canAdvance = useMemo(() => {
    switch (step) {
      case 'film_type': return !!filmType;
      case 'references': return true;
      case 'story': return !!storyStructure;
      case 'shot_plan': return shots.length > 0 && !isAiPlanning;
      case 'settings': return true;
      case 'review': return !isGenerating;
      default: return false;
    }
  }, [step, filmType, storyStructure, shots, isGenerating, isAiPlanning]);

  // ─── AI Shot Plan Generation ────────────────────────────────
  const generateAiPlan = useCallback(async () => {
    if (!filmType || !storyStructure) return;
    setIsAiPlanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-shot-planner', {
        body: {
          filmType,
          storyStructure,
          shotDuration: settings.shotDuration,
          tone: settings.tone || '',
          referenceDescriptions: references.map(r => `${r.role}: ${r.name || r.url}`).join('; '),
        },
      });
      if (error) throw new Error(error.message);
      if (data?.shots && Array.isArray(data.shots)) {
        setShots(data.shots);
        toast.success(`AI Director generated ${data.shots.length} shots`);
      } else {
        throw new Error('Invalid AI response');
      }
    } catch (err) {
      console.error('[ShortFilm] AI planning failed:', err);
      toast.error('AI planning failed. Using auto plan instead.');
      setShots(generateShotPlan(filmType, storyStructure, settings.shotDuration));
    } finally {
      setIsAiPlanning(false);
    }
  }, [filmType, storyStructure, settings.shotDuration, settings.tone, references]);

  const goNext = useCallback(() => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) {
      const nextStep = steps[idx + 1];
      if (nextStep === 'shot_plan' && filmType && storyStructure) {
        if (planMode === 'ai') {
          setShots([]); // clear while AI generates
          setStep(nextStep);
          // Fire AI plan after step transition
          setTimeout(() => {
            generateAiPlan();
          }, 0);
          return;
        } else {
          setShots(generateShotPlan(filmType, storyStructure, settings.shotDuration));
        }
      }
      setStep(nextStep);
    }
  }, [step, filmType, storyStructure, settings.shotDuration, planMode, generateAiPlan]);

  const goBack = useCallback(() => {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  }, [step]);

  const regeneratePlan = useCallback(() => {
    if (planMode === 'ai') {
      generateAiPlan();
    } else if (filmType && storyStructure) {
      setShots(generateShotPlan(filmType, storyStructure, settings.shotDuration));
    }
  }, [filmType, storyStructure, settings.shotDuration, planMode, generateAiPlan]);

  // ─── Reset project ─────────────────────────────────────────
  const resetProject = useCallback(() => {
    setStep('film_type');
    setFilmType(null);
    setStoryStructure(null);
    setReferences([]);
    setShots([]);
    setShotStatuses([]);
    setProjectId(null);
    setIsGenerating(false);
    setPlanMode('auto');
    setSettings({
      aspectRatio: '16:9',
      audioMode: 'silent',
      preservationLevel: 'medium',
      shotDuration: '5',
    });
  }, []);

  // ─── Retry single failed shot ──────────────────────────────
  const retryShotGeneration = useCallback(async (shotIndex: number) => {
    if (!projectId || !user || !filmType) return;

    const shot = shots.find(s => s.shot_index === shotIndex);
    if (!shot) return;

    setShotStatuses(prev =>
      prev.map(s => s.shot_index === shotIndex ? { ...s, status: 'processing' } : s)
    );

    const productRef = references.find(r => r.role === 'product');
    const sceneRef = references.find(r => r.role === 'scene');
    const sourceImageUrl = productRef?.url || sceneRef?.url;

    const { prompt, negative_prompt } = buildShotPrompt(shot, {
      filmType,
      tone: settings.tone || '',
      settings,
      references,
    });

    try {
      const { data: enqueueResult, error: enqueueError } = await supabase.functions.invoke('generate-video', {
        body: {
          action: 'create',
          image_url: sourceImageUrl || '',
          prompt,
          duration: settings.shotDuration,
          model_name: 'kling-v3',
          aspect_ratio: settings.aspectRatio,
          mode: 'pro',
          negative_prompt,
          with_audio: settings.audioMode === 'ambient',
          project_id: projectId,
          workflow_type: 'short_film',
        },
      });

      if (enqueueError) throw new Error(enqueueError.message);

      const taskId = enqueueResult?.task_id || enqueueResult?.kling_task_id;
      const videoId = enqueueResult?.video_id;

      if (taskId && videoId) {
        const resultUrl = await pollShotCompletion(videoId, 60);
        setShotStatuses(prev =>
          prev.map(s =>
            s.shot_index === shotIndex
              ? { ...s, status: resultUrl ? 'complete' : 'failed', result_url: resultUrl || undefined }
              : s
          )
        );
        if (resultUrl) {
          await supabase
            .from('video_shots')
            .update({ status: 'complete', result_url: resultUrl })
            .eq('project_id', projectId)
            .eq('shot_index', shotIndex);
        }
      }
    } catch (err) {
      console.error(`[ShortFilm] Retry shot ${shotIndex} failed:`, err);
      setShotStatuses(prev =>
        prev.map(s => s.shot_index === shotIndex ? { ...s, status: 'failed' } : s)
      );
      toast.error(`Shot ${shotIndex} retry failed`);
    }
  }, [projectId, user, filmType, shots, settings, references]);

  // ─── Real generation pipeline ───────────────────────────────

  const startGeneration = useCallback(async () => {
    if (!user || !filmType || !storyStructure || shots.length === 0) return;

    if (balance < totalCredits) {
      toast.error(`Not enough credits. Need ${totalCredits}, have ${balance}.`);
      return;
    }

    setIsGenerating(true);
    setShotStatuses(shots.map(s => ({ shot_index: s.shot_index, status: 'pending' })));

    try {
      const { data: project, error: projectError } = await supabase
        .from('video_projects')
        .insert({
          user_id: user.id,
          workflow_type: 'short_film',
          title: `Short Film — ${filmType.replace(/_/g, ' ')}`,
          settings_json: {
            filmType,
            storyStructure,
            aspectRatio: settings.aspectRatio,
            audioMode: settings.audioMode,
            preservationLevel: settings.preservationLevel,
            shotDuration: settings.shotDuration,
          },
          status: 'processing',
          analysis_status: 'complete',
          estimated_credits: totalCredits,
        })
        .select('id')
        .single();

      if (projectError || !project) throw new Error(projectError?.message || 'Failed to create project');
      setProjectId(project.id);

      if (references.length > 0) {
        const inputRows = references.map((ref, i) => ({
          project_id: project.id,
          type: 'image',
          asset_url: ref.url,
          input_role: `${ref.role}_ref`,
          sort_order: i,
        }));
        await supabase.from('video_inputs').insert(inputRows);
      }

      const shotRows = shots.map((shot) => {
        const { prompt, negative_prompt } = buildShotPrompt(shot, {
          filmType,
          tone: settings.tone || '',
          settings,
          references,
        });
        return {
          project_id: project.id,
          shot_index: shot.shot_index,
          prompt_text: prompt,
          duration_sec: shot.duration_sec,
          status: 'pending',
          shot_role: shot.role,
          audio_mode: settings.audioMode,
          model_route: 'kling_v3',
          strategy_json: {
            camera_motion: shot.camera_motion,
            subject_motion: shot.subject_motion,
            preservation_strength: shot.preservation_strength,
            scene_type: shot.scene_type,
            negative_prompt,
          },
        };
      });
      await supabase.from('video_shots').insert(shotRows);

      const productRef = references.find(r => r.role === 'product');
      const sceneRef = references.find(r => r.role === 'scene');
      const sourceImageUrl = productRef?.url || sceneRef?.url;

      for (let i = 0; i < shots.length; i++) {
        const shot = shots[i];
        setShotStatuses(prev =>
          prev.map(s =>
            s.shot_index === shot.shot_index ? { ...s, status: 'processing' } : s
          )
        );

        const { prompt, negative_prompt } = buildShotPrompt(shot, {
          filmType,
          tone: settings.tone || '',
          settings,
          references,
        });

        try {
          const { data: enqueueResult, error: enqueueError } = await supabase.functions.invoke('generate-video', {
            body: {
              action: 'create',
              image_url: sourceImageUrl || '',
              prompt,
              duration: settings.shotDuration,
              model_name: 'kling-v3',
              aspect_ratio: settings.aspectRatio,
              mode: 'pro',
              negative_prompt,
              with_audio: settings.audioMode === 'ambient',
              project_id: project.id,
              workflow_type: 'short_film',
            },
          });

          if (enqueueError) throw new Error(enqueueError.message);

          const taskId = enqueueResult?.task_id || enqueueResult?.kling_task_id;
          const videoId = enqueueResult?.video_id;

          if (taskId && videoId) {
            const resultUrl = await pollShotCompletion(videoId, 60);
            setShotStatuses(prev =>
              prev.map(s =>
                s.shot_index === shot.shot_index
                  ? { ...s, status: resultUrl ? 'complete' : 'failed', result_url: resultUrl || undefined }
                  : s
              )
            );

            if (resultUrl) {
              await supabase
                .from('video_shots')
                .update({ status: 'complete', result_url: resultUrl })
                .eq('project_id', project.id)
                .eq('shot_index', shot.shot_index);
            }
          } else {
            setShotStatuses(prev =>
              prev.map(s =>
                s.shot_index === shot.shot_index ? { ...s, status: 'complete' } : s
              )
            );
          }
        } catch (shotErr) {
          console.error(`[ShortFilm] Shot ${shot.shot_index} failed:`, shotErr);
          setShotStatuses(prev =>
            prev.map(s =>
              s.shot_index === shot.shot_index ? { ...s, status: 'failed' } : s
            )
          );
        }
      }

      await supabase.from('video_projects').update({ status: 'complete' }).eq('id', project.id);
      toast.success('Short film generation complete!');
      refreshBalance();

    } catch (err) {
      console.error('[ShortFilm] Generation failed:', err);
      toast.error(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [user, filmType, storyStructure, shots, settings, references, balance, totalCredits, refreshBalance]);

  const updateShot = useCallback((index: number, updated: ShotPlanItem) => {
    setShots(prev => prev.map((s, i) => i === index ? updated : s));
  }, []);

  const deleteShot = useCallback((index: number) => {
    setShots(prev => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((s, i) => ({ ...s, shot_index: i + 1 }));
    });
  }, []);

  const addShot = useCallback(() => {
    setShots(prev => [
      ...prev,
      {
        shot_index: prev.length + 1,
        role: 'detail',
        purpose: 'New custom shot',
        scene_type: 'product_closeup',
        camera_motion: 'slow_push',
        subject_motion: 'static',
        duration_sec: Number(settings.shotDuration),
        product_visible: true,
        character_visible: false,
        preservation_strength: settings.preservationLevel,
      },
    ]);
  }, [settings.shotDuration, settings.preservationLevel]);

  const reorderShots = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0) return;
    setShots(prev => {
      if (toIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next.map((s, i) => ({ ...s, shot_index: i + 1 }));
    });
  }, []);

  return {
    step,
    setStep,
    steps,
    currentStepIndex,
    filmType,
    setFilmType,
    storyStructure,
    setStoryStructure,
    references,
    setReferences,
    shots,
    settings,
    setSettings,
    canAdvance,
    goNext,
    goBack,
    regeneratePlan,
    isGenerating,
    shotStatuses,
    startGeneration,
    projectId,
    totalCredits,
    updateShot,
    deleteShot,
    addShot,
    reorderShots,
    resetProject,
    retryShotGeneration,
    planMode,
    setPlanMode,
    isAiPlanning,
  };
}

/** Poll generated_videos for a specific video to complete */
async function pollShotCompletion(videoId: string, maxPolls: number): Promise<string | null> {
  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, 10_000));

    const { data } = await supabase
      .from('generated_videos')
      .select('status, video_url')
      .eq('id', videoId)
      .single();

    if (data?.status === 'completed' && data.video_url) {
      return data.video_url;
    }
    if (data?.status === 'failed') {
      return null;
    }
  }
  return null;
}
