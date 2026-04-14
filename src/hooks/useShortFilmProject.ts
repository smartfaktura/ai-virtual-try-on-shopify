import { useState, useCallback, useMemo, useEffect } from 'react';
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
  AudioAssets,
} from '@/types/shortFilm';
import type { ReferenceAsset } from '@/components/app/video/short-film/ReferenceUploadPanel';

interface ShotStatus {
  shot_index: number;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  result_url?: string;
}

export interface AudioShotStatus {
  shot_index: number;
  sfx: 'idle' | 'generating' | 'done' | 'failed';
  voiceover: 'idle' | 'generating' | 'done' | 'failed';
}

export type AudioPhase = 'idle' | 'music' | 'sfx' | 'voiceover' | 'done';

interface DraftState {
  step: ShortFilmStep;
  filmType: FilmType | null;
  storyStructure: StoryStructure | null;
  references: ReferenceAsset[];
  shots: ShotPlanItem[];
  settings: ShortFilmSettings;
  planMode: 'auto' | 'ai';
  customRoles?: string[];
}

const DEFAULT_SETTINGS: ShortFilmSettings = {
  aspectRatio: '16:9',
  audioMode: 'silent',
  preservationLevel: 'medium',
  shotDuration: '5',
};

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
  const [customRoles, setCustomRoles] = useState<string[]>([]);
  const [draftProjectId, setDraftProjectId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ShortFilmSettings>(DEFAULT_SETTINGS);
  const [audioAssets, setAudioAssets] = useState<AudioAssets>({ perShotAudio: [] });
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioPhase, setAudioPhase] = useState<AudioPhase>('idle');
  const [audioShotStatuses, setAudioShotStatuses] = useState<AudioShotStatus[]>([]);

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
      case 'story': return !!storyStructure && (storyStructure !== 'custom' || customRoles.length >= 2);
      case 'shot_plan': return shots.length > 0 && !isAiPlanning;
      case 'settings': return true;
      case 'review': return !isGenerating;
      default: return false;
    }
  }, [step, filmType, storyStructure, shots, isGenerating, isAiPlanning, customRoles]);

  // ─── Save Draft ────────────────────────────────────────────
  const saveDraft = useCallback(async () => {
    if (!user) return;
    const draftState: DraftState = {
      step, filmType, storyStructure, references, shots, settings, planMode, customRoles,
    };

    try {
      if (draftProjectId) {
        await supabase
          .from('video_projects')
          .update({
          draft_state_json: JSON.parse(JSON.stringify(draftState)),
            title: `Draft — ${filmType?.replace(/_/g, ' ') || 'Short Film'}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', draftProjectId);
      } else {
        const { data } = await supabase
          .from('video_projects')
          .insert([{
            user_id: user.id,
            workflow_type: 'short_film',
            title: `Draft — ${filmType?.replace(/_/g, ' ') || 'Short Film'}`,
            status: 'draft',
            analysis_status: 'complete',
            draft_state_json: JSON.parse(JSON.stringify(draftState)),
            settings_json: JSON.parse(JSON.stringify(settings)),
          }])
          .select('id')
          .single();
        if (data) setDraftProjectId(data.id);
      }
      toast.success('Draft saved');
    } catch (err) {
      console.error('[ShortFilm] Save draft failed:', err);
      toast.error('Failed to save draft');
    }
  }, [user, step, filmType, storyStructure, references, shots, settings, planMode, customRoles, draftProjectId]);

  // ─── Load Draft ────────────────────────────────────────────
  const loadDraft = useCallback(async (projectIdToLoad: string) => {
    try {
      const { data } = await supabase
        .from('video_projects')
        .select('id, draft_state_json')
        .eq('id', projectIdToLoad)
        .single();

      if (data?.draft_state_json) {
        const d = data.draft_state_json as unknown as DraftState;
        setStep(d.step || 'film_type');
        setFilmType(d.filmType || null);
        setStoryStructure(d.storyStructure || null);
        setReferences(d.references || []);
        setShots(d.shots || []);
        setSettings(d.settings || DEFAULT_SETTINGS);
        setPlanMode(d.planMode || 'auto');
        setCustomRoles(d.customRoles || []);
        setDraftProjectId(data.id);
        toast.success('Draft resumed');
      }
    } catch (err) {
      console.error('[ShortFilm] Load draft failed:', err);
      toast.error('Failed to load draft');
    }
  }, []);

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
          customRoles: storyStructure === 'custom' ? customRoles : undefined,
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
      if (storyStructure === 'custom' && customRoles.length > 0) {
        setShots(generateShotPlanFromRoles(customRoles, settings.shotDuration));
      } else {
        setShots(generateShotPlan(filmType, storyStructure, settings.shotDuration));
      }
    } finally {
      setIsAiPlanning(false);
    }
  }, [filmType, storyStructure, settings.shotDuration, settings.tone, references, customRoles]);

  const goNext = useCallback(() => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) {
      const nextStep = steps[idx + 1];
      if (nextStep === 'shot_plan' && filmType && storyStructure) {
        if (planMode === 'ai') {
          setShots([]);
          setStep(nextStep);
          setTimeout(() => { generateAiPlan(); }, 0);
          return;
        } else if (storyStructure === 'custom' && customRoles.length > 0) {
          setShots(generateShotPlanFromRoles(customRoles, settings.shotDuration));
        } else {
          setShots(generateShotPlan(filmType, storyStructure, settings.shotDuration));
        }
      }
      setStep(nextStep);
    }
  }, [step, filmType, storyStructure, settings.shotDuration, planMode, generateAiPlan, customRoles]);

  const goBack = useCallback(() => {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  }, [step]);

  const regeneratePlan = useCallback(() => {
    if (planMode === 'ai') {
      generateAiPlan();
    } else if (filmType && storyStructure) {
      if (storyStructure === 'custom' && customRoles.length > 0) {
        setShots(generateShotPlanFromRoles(customRoles, settings.shotDuration));
      } else {
        setShots(generateShotPlan(filmType, storyStructure, settings.shotDuration));
      }
    }
  }, [filmType, storyStructure, settings.shotDuration, planMode, generateAiPlan, customRoles]);

  // ─── Reset project ─────────────────────────────────────────
  const resetProject = useCallback(() => {
    setStep('film_type');
    setFilmType(null);
    setStoryStructure(null);
    setReferences([]);
    setShots([]);
    setShotStatuses([]);
    setProjectId(null);
    setDraftProjectId(null);
    setIsGenerating(false);
    setPlanMode('auto');
    setCustomRoles([]);
    setSettings(DEFAULT_SETTINGS);
    setAudioAssets({ perShotAudio: [] });
    setIsGeneratingAudio(false);
  }, []);

  // ─── Retry single failed shot ──────────────────────────────
  const retryShotGeneration = useCallback(async (shotIndex: number) => {
    if (!projectId || !user || !filmType) return;

    const shot = shots.find(s => s.shot_index === shotIndex);
    if (!shot) return;

    setShotStatuses(prev =>
      prev.map(s => s.shot_index === shotIndex ? { ...s, status: 'processing' } : s)
    );

    const sourceImageUrl = getSourceImageForShot(shot, references);

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

  // ─── Audio generation ────────────────────────────────────────
  const generateAudio = useCallback(async () => {
    if (!user) return;
    const mode = settings.audioMode;
    if (mode === 'silent' || mode === 'ambient') return;

    setIsGeneratingAudio(true);
    const newAssets: AudioAssets = { perShotAudio: [] };
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const session = (await supabase.auth.getSession()).data.session;
    const authToken = session?.access_token || apikey;

    const headers = {
      'Content-Type': 'application/json',
      apikey,
      Authorization: `Bearer ${authToken}`,
    };

    try {
      // Music track
      if (mode === 'music' || mode === 'full_mix') {
        const totalDuration = shots.reduce((sum, s) => sum + s.duration_sec, 0);
        const musicPrompt = settings.musicPrompt || `cinematic ${settings.tone || 'ambient'} background music for a ${filmType?.replace(/_/g, ' ')} film`;
        try {
          const res = await fetch(`${baseUrl}/functions/v1/elevenlabs-music`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ prompt: musicPrompt, duration: Math.min(totalDuration, 120) }),
          });
          if (res.ok) {
            const blob = await res.blob();
            newAssets.backgroundTrackUrl = URL.createObjectURL(blob);
          }
        } catch (e) {
          console.error('[ShortFilm] Music generation failed:', e);
        }
      }

      // SFX per shot (full_mix only)
      if (mode === 'full_mix') {
        for (const shot of shots) {
          try {
            const sfxPrompt = `${shot.scene_type.replace(/_/g, ' ')} ambient sound, ${shot.purpose}`;
            const res = await fetch(`${baseUrl}/functions/v1/elevenlabs-sfx`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ prompt: sfxPrompt, duration: Math.min(shot.duration_sec, 22) }),
            });
            if (res.ok) {
              const blob = await res.blob();
              newAssets.perShotAudio.push({
                shotIndex: shot.shot_index,
                url: URL.createObjectURL(blob),
                type: 'sfx',
              });
            }
          } catch (e) {
            console.error(`[ShortFilm] SFX shot ${shot.shot_index} failed:`, e);
          }
        }
      }

      // Voiceover per shot
      if (mode === 'voiceover' || mode === 'full_mix') {
        const voiceId = settings.voiceId || 'JBFqnCBsd6RMkjVDRZzb';
        for (const shot of shots) {
          if (!shot.script_line) continue;
          try {
            const res = await fetch(`${baseUrl}/functions/v1/elevenlabs-tts`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ text: shot.script_line, voiceId }),
            });
            if (res.ok) {
              const blob = await res.blob();
              newAssets.perShotAudio.push({
                shotIndex: shot.shot_index,
                url: URL.createObjectURL(blob),
                type: 'voiceover',
              });
            }
          } catch (e) {
            console.error(`[ShortFilm] TTS shot ${shot.shot_index} failed:`, e);
          }
        }
      }

      setAudioAssets(newAssets);
      if (newAssets.backgroundTrackUrl || newAssets.perShotAudio.length > 0) {
        toast.success('Audio layer generated');
      }
    } catch (err) {
      console.error('[ShortFilm] Audio generation failed:', err);
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [user, settings, shots, filmType]);

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
      // If we have a draft, update it; otherwise create new project
      let currentProjectId = draftProjectId;

      if (currentProjectId) {
        await supabase
          .from('video_projects')
          .update({
            status: 'processing',
            settings_json: {
              filmType,
              storyStructure,
              aspectRatio: settings.aspectRatio,
              audioMode: settings.audioMode,
              preservationLevel: settings.preservationLevel,
              shotDuration: settings.shotDuration,
            },
            estimated_credits: totalCredits,
            title: `Short Film — ${filmType.replace(/_/g, ' ')}`,
          })
          .eq('id', currentProjectId);
      } else {
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
        currentProjectId = project.id;
      }

      setProjectId(currentProjectId);

      if (references.length > 0) {
        const inputRows = references.map((ref, i) => ({
          project_id: currentProjectId!,
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
          project_id: currentProjectId!,
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

      for (let i = 0; i < shots.length; i++) {
        const shot = shots[i];
        setShotStatuses(prev =>
          prev.map(s =>
            s.shot_index === shot.shot_index ? { ...s, status: 'processing' } : s
          )
        );

        const sourceImageUrl = getSourceImageForShot(shot, references);

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
              project_id: currentProjectId,
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
                .eq('project_id', currentProjectId!)
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

      await supabase.from('video_projects').update({ status: 'complete' }).eq('id', currentProjectId!);
      toast.success('Short film generation complete!');
      refreshBalance();

      // Generate audio layer if needed
      if (settings.audioMode !== 'silent' && settings.audioMode !== 'ambient') {
        await generateAudio();
      }

    } catch (err) {
      console.error('[ShortFilm] Generation failed:', err);
      toast.error(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [user, filmType, storyStructure, shots, settings, references, balance, totalCredits, refreshBalance, draftProjectId, generateAudio]);

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
    saveDraft,
    loadDraft,
    customRoles,
    setCustomRoles,
    audioAssets,
    isGeneratingAudio,
    generateAudio,
  };
}

/** Get the best source image for a specific shot based on its source_reference_id or role */
function getSourceImageForShot(shot: ShotPlanItem, references: ReferenceAsset[]): string {
  // Per-shot override
  if (shot.scene_reference_id) {
    const ref = references.find(r => r.id === shot.scene_reference_id);
    if (ref) return ref.url;
  }
  if (shot.model_reference_id) {
    const ref = references.find(r => r.id === shot.model_reference_id);
    if (ref) return ref.url;
  }
  // Fallback based on shot properties
  if (shot.character_visible) {
    const modelRef = references.find(r => r.role === 'model');
    if (modelRef) return modelRef.url;
  }
  const productRef = references.find(r => r.role === 'product');
  const sceneRef = references.find(r => r.role === 'scene');
  return productRef?.url || sceneRef?.url || '';
}

/** Generate shot plan from custom roles */
function generateShotPlanFromRoles(roles: string[], shotDuration: '5' | '10'): ShotPlanItem[] {
  // Import the generateShotPlan logic but with custom roles
  const durationSec = Number(shotDuration);
  return roles.map((role, index) => ({
    shot_index: index + 1,
    role,
    purpose: `Custom ${role.replace(/_/g, ' ')} shot`,
    scene_type: 'general',
    camera_motion: 'slow_push',
    subject_motion: 'minimal',
    duration_sec: durationSec,
    product_visible: role.includes('product') || role.includes('detail') || role.includes('highlight'),
    character_visible: role.includes('human') || role.includes('lifestyle'),
    preservation_strength: role.includes('product') || role.includes('detail') ? 'high' : 'medium',
  }));
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
