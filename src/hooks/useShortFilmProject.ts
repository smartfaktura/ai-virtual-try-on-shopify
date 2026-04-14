import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from '@/lib/brandedToast';
import { generateShotPlan, FILM_TYPE_OPTIONS } from '@/lib/shortFilmPlanner';
import { buildShotPrompt, estimateShortFilmCredits, distributeShotDurations, TONE_PRESETS } from '@/lib/shortFilmPromptBuilder';
import { enqueueWithRetry, isEnqueueError, getAuthToken, paceDelay, sendWake } from '@/lib/enqueueGeneration';
import type {
  FilmType,
  StoryStructure,
  ShortFilmSettings,
  ShortFilmStep,
  ShotPlanItem,
  AudioAssets,
  AudioPhase,
  AudioLayers,
} from '@/types/shortFilm';
import type { ReferenceAsset } from '@/components/app/video/short-film/ReferenceUploadPanel';
import { toSignedUrl } from '@/lib/signedUrl';

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

// AudioPhase is now imported from @/types/shortFilm

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
  audioMode: 'full_mix',
  audioLayers: { music: true, sfx: true, voiceover: true },
  preservationLevel: 'medium',
  shotDuration: '5',
  quality: 'pro',
};

/** Map legacy audioMode to audioLayers for backward compatibility */
function audioModeToLayers(mode: string): AudioLayers {
  switch (mode) {
    case 'silent': return { music: false, sfx: false, voiceover: false };
    case 'ambient': return { music: false, sfx: false, voiceover: false };
    case 'music': return { music: true, sfx: true, voiceover: false };
    case 'voiceover': return { music: false, sfx: false, voiceover: true };
    case 'full_mix': return { music: true, sfx: true, voiceover: true };
    default: return { music: true, sfx: true, voiceover: true };
  }
}

/** Resolve effective audio layers from settings (with backward compat) */
function getEffectiveLayers(settings: ShortFilmSettings): AudioLayers {
  if (settings.audioLayers) return settings.audioLayers;
  return audioModeToLayers(settings.audioMode);
}

export function useShortFilmProject() {
  const { user } = useAuth();
  const { balance, refreshBalance } = useCredits();

  const [step, setStep] = useState<ShortFilmStep>('film_type');
  const [filmType, setFilmTypeRaw] = useState<FilmType | null>(null);
  const [storyStructure, setStoryStructure] = useState<StoryStructure | null>(null);

  // Apply film-type defaults when changed
  const setFilmType = useCallback((ft: FilmType | null) => {
    setFilmTypeRaw(ft);
    if (ft) {
      const option = FILM_TYPE_OPTIONS.find(o => o.value === ft);
      if (option) {
        // Apply default structure unless custom
        if (option.defaultStructure !== 'custom') {
          setStoryStructure(option.defaultStructure);
        }
        // Apply default tone
        if (option.defaultTone) {
          setSettings(prev => ({ ...prev, tone: option.defaultTone }));
        }
      }
    }
  }, []);
  const [references, setReferences] = useState<ReferenceAsset[]>([]);
  const [shots, setShots] = useState<ShotPlanItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shotStatuses, setShotStatuses] = useState<ShotStatus[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [planMode, setPlanMode] = useState<'auto' | 'ai'>('ai');
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
        .select('id, draft_state_json, music_track_url, status')
        .eq('id', projectIdToLoad)
        .single();

      if (data?.draft_state_json) {
        const d = data.draft_state_json as unknown as DraftState;
        setStep(d.step || 'film_type');
        setFilmType(d.filmType || null);
        setStoryStructure(d.storyStructure || null);
        setReferences(d.references || []);
        setShots(d.shots || []);
        
        // Backward compat: migrate old audioMode to audioLayers
        const restoredSettings = d.settings || DEFAULT_SETTINGS;
        if (!restoredSettings.audioLayers) {
          restoredSettings.audioLayers = audioModeToLayers(restoredSettings.audioMode || 'full_mix');
          console.log('[ShortFilm] Migrated audioMode to audioLayers:', restoredSettings.audioLayers);
        }
        if (restoredSettings.audioMode === 'silent') {
          restoredSettings.audioMode = 'full_mix';
          restoredSettings.audioLayers = { music: true, sfx: true, voiceover: true };
        }
        setSettings(restoredSettings);
        
        setPlanMode(d.planMode || 'ai');
        setCustomRoles(d.customRoles || []);
        setDraftProjectId(data.id);
        setProjectId(data.id);

        // Restore shot statuses (result_url) so playback/download works on reload
        {
          const { data: shotRows } = await supabase
            .from('video_shots')
            .select('shot_index, status, result_url, audio_url, sfx_url')
            .eq('project_id', data.id)
            .order('shot_index');
          if (shotRows && shotRows.length > 0) {
            const restoredStatuses: ShotStatus[] = await Promise.all(shotRows.map(async (r: any) => ({
              shot_index: r.shot_index,
              status: r.status === 'complete' ? 'complete' : r.status === 'failed' ? 'failed' : 'pending',
              result_url: r.result_url ? await toSignedUrl(r.result_url) : undefined,
            })));
            setShotStatuses(restoredStatuses);

            // Restore audio assets
            const restoredAssets: AudioAssets = { perShotAudio: [] };
            if (data.music_track_url) {
              restoredAssets.backgroundTrackUrl = await toSignedUrl(data.music_track_url);
            }
            for (const row of shotRows) {
              if ((row as any).sfx_url) {
                restoredAssets.perShotAudio.push({ shotIndex: (row as any).shot_index, url: await toSignedUrl((row as any).sfx_url), type: 'sfx' });
              }
              if ((row as any).audio_url) {
                restoredAssets.perShotAudio.push({ shotIndex: (row as any).shot_index, url: await toSignedUrl((row as any).audio_url), type: 'voiceover' });
              }
            }
            if (restoredAssets.backgroundTrackUrl || restoredAssets.perShotAudio.length > 0) {
              setAudioAssets(restoredAssets);
              setAudioPhase('done');
            } else {
              // Audio was expected but missing — set idle so user can trigger
              if (restoredSettings.audioMode !== 'ambient') {
                console.log('[ShortFilm] Audio missing on restored draft — setting phase to idle for retry');
                setAudioPhase('idle');
              }
            }
          }
        }

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
      // Resolve the role sequence from story structure
      const { STORY_STRUCTURE_OPTIONS, FILM_TYPE_OPTIONS } = await import('@/lib/shortFilmPlanner');
      const structureOption = STORY_STRUCTURE_OPTIONS.find(s => s.value === storyStructure);
      const filmOption = FILM_TYPE_OPTIONS.find(f => f.value === filmType);
      const structureRoles = storyStructure === 'custom' && customRoles.length > 0
        ? customRoles
        : structureOption?.roles || [];

      // Build richer reference descriptions including style/scene preset names
      const refParts = references.map(r => {
        if (r.role === 'style' && r.name) return `Style: ${r.name}`;
        if (r.role === 'scene' && r.name) return `Scene: ${r.name}`;
        return `${r.role}: ${r.name || r.url}`;
      });

      const stylePresetNames = references
        .filter(r => r.role === 'style')
        .map(r => r.name)
        .filter(Boolean)
        .join(', ');

      const scenePresetNames = references
        .filter(r => r.role === 'scene')
        .map(r => r.name)
        .filter(Boolean)
        .join(', ');

      const { data, error } = await supabase.functions.invoke('ai-shot-planner', {
        body: {
          filmType,
          storyStructure,
          shotDuration: settings.shotDuration,
          tone: settings.tone || '',
          tonePresetText: TONE_PRESETS[filmType] || TONE_PRESETS.custom,
          referenceDescriptions: refParts.join('; '),
          customRoles: storyStructure === 'custom' ? customRoles : undefined,
          structureRoles,
          filmDescription: filmOption?.description || '',
          stylePresetNames: stylePresetNames || undefined,
          scenePresetNames: scenePresetNames || undefined,
          audioLayers: settings.audioLayers || { music: true, sfx: true, voiceover: true },
        },
      });
      if (error) throw new Error(error.message);
      if (data?.shots && Array.isArray(data.shots)) {
        setShots(data.shots);
        // Store AI-generated music direction and pre-select AI Director preset
        if (data.music_direction) {
          setSettings(prev => ({ ...prev, musicPrompt: data.music_direction, musicPresetKey: 'ai_director' }));
        }
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
    setPlanMode('ai');
    setCustomRoles([]);
    setSettings(DEFAULT_SETTINGS);
    setAudioAssets({ perShotAudio: [] });
    setIsGeneratingAudio(false);
    setAudioPhase('idle');
    setAudioShotStatuses([]);
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
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const result = await enqueueWithRetry({
        jobType: 'video',
        payload: {
          image_url: sourceImageUrl || '',
          prompt,
          duration: settings.shotDuration,
          model_name: 'kling-v3',
          aspect_ratio: settings.aspectRatio,
          mode: 'pro',
          negative_prompt,
          with_audio: false,
          project_id: projectId,
          workflow_type: 'short_film',
        },
        imageCount: 1,
      }, token);

      if (isEnqueueError(result)) {
        throw new Error(result.message);
      }

      sendWake(token);

      const resultUrl = await pollQueueJobCompletion(result.jobId, 60);
      const signedResult = resultUrl ? await toSignedUrl(resultUrl) : undefined;
      setShotStatuses(prev =>
        prev.map(s =>
          s.shot_index === shotIndex
            ? { ...s, status: signedResult ? 'complete' : 'failed', result_url: signedResult }
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
      refreshBalance();
    } catch (err) {
      console.error(`[ShortFilm] Retry shot ${shotIndex} failed:`, err);
      setShotStatuses(prev =>
        prev.map(s => s.shot_index === shotIndex ? { ...s, status: 'failed' } : s)
      );
      toast.error(`Shot ${shotIndex} retry failed`);
    }
  }, [projectId, user, filmType, shots, settings, references, refreshBalance]);

  // ─── Upload audio blob to storage ─────────────────────────────
  const uploadAudioToStorage = useCallback(async (blob: Blob, filename: string): Promise<string | null> => {
    if (!user) return null;
    const path = `${user.id}/${filename}`;
    const { error } = await supabase.storage.from('generated-audio').upload(path, blob, {
      contentType: 'audio/mpeg',
      upsert: true,
    });
    if (error) {
      console.error('[ShortFilm] Audio upload failed:', error);
      return null;
    }
    // Return the public-format URL for DB persistence; toSignedUrl() will sign on load
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    return `${SUPABASE_URL}/storage/v1/object/public/generated-audio/${path}`;
  }, [user]);

  // ─── Audio generation ────────────────────────────────────────
  const generateAudio = useCallback(async (targetProjectId?: string, currentShots?: ShotPlanItem[]) => {
    if (!user) return;
    const layers = getEffectiveLayers(settings);
    const anyLayerOn = layers.music || layers.sfx || layers.voiceover;
    console.log('[ShortFilm Audio] generateAudio called — layers:', layers, 'shots:', (currentShots || shots).length);
    if (!anyLayerOn) {
      console.log('[ShortFilm Audio] Skipping — all layers disabled');
      return;
    }

    const shotsToUse = currentShots || shots;
    const pid = targetProjectId || projectId;
    setIsGeneratingAudio(true);
    setAudioPhase('idle');
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

    // Error tracking
    let musicOk = false;
    let sfxOk = 0;
    let sfxFail = 0;
    let voOk = 0;
    let voFail = 0;

    // Init per-shot audio statuses
    const initStatuses: AudioShotStatus[] = shotsToUse.map(s => ({
      shot_index: s.shot_index,
      sfx: 'idle' as const,
      voiceover: layers.voiceover && s.script_line ? 'idle' as const : 'idle' as const,
    }));
    setAudioShotStatuses(initStatuses);

    // ── Build timing manifest for precise audio cues ──
    let cumulativeTime = 0;
    const timingManifest = shotsToUse.map(s => {
      const startAt = cumulativeTime;
      cumulativeTime += s.duration_sec;
      return {
        shot_index: s.shot_index,
        role: s.role,
        start_sec: startAt,
        end_sec: cumulativeTime,
        duration_sec: s.duration_sec,
        sfx_trigger_at: s.sfx_trigger_at ?? 0,
        has_vo: layers.voiceover && s.vo_enabled !== false && !!s.script_line && s.duration_sec >= 3,
        has_sfx: layers.sfx && s.sfx_enabled !== false,
      };
    });
    console.log('[ShortFilm Audio] Timing manifest:', timingManifest);

    try {
      // Music track
      if (layers.music) {
        setAudioPhase('music');
        const totalDuration = shotsToUse.reduce((sum, s) => sum + s.duration_sec, 0);

        // Build timing cues for the music prompt
        const timingCues = timingManifest.map(t =>
          `${t.role} at ${t.start_sec.toFixed(1)}s–${t.end_sec.toFixed(1)}s`
        ).join(', ');

        // Resolve music prompt from preset key or custom input
        const resolvedMusicPrompt = resolveMusicPrompt(settings, filmType, shotsToUse, references);
        const enrichedMusicPrompt = `${resolvedMusicPrompt}. Shot timing cues: ${timingCues}`;

        try {
          console.log('[ShortFilm Audio] Calling elevenlabs-music — prompt:', enrichedMusicPrompt, 'duration:', Math.min(totalDuration, 120));
          const res = await fetch(`${baseUrl}/functions/v1/elevenlabs-music`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ prompt: enrichedMusicPrompt, duration: Math.min(totalDuration, 120) }),
          });
          console.log('[ShortFilm Audio] Music response status:', res.status);
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('audio')) {
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            newAssets.backgroundTrackUrl = blobUrl;
            musicOk = true;

            const storageUrl = await uploadAudioToStorage(blob, `${pid || 'preview'}/music-track.mp3`);
            if (storageUrl && pid) {
              await supabase.from('video_projects').update({ music_track_url: storageUrl } as any).eq('id', pid);
            }
          } else {
            // Graceful fallback — ElevenLabs may be temporarily unavailable
            const body = contentType.includes('json') ? await res.json().catch(() => ({})) : {};
            console.warn('[ShortFilm] Music generation unavailable:', body.error || res.status, body.fallback ? '(fallback)' : '');
          }
        } catch (e) {
          console.error('[ShortFilm] Music generation failed:', e);
        }
      }

      // SFX per shot
      if (layers.sfx) {
        setAudioPhase('sfx');
        for (const shot of shotsToUse) {
          if (shot.sfx_enabled === false) continue;
          setAudioShotStatuses(prev =>
            prev.map(s => s.shot_index === shot.shot_index ? { ...s, sfx: 'generating' } : s)
          );
          try {
            const sfxPrompt = shot.sfx_prompt || buildContextualSfxPrompt(shot, references);
            console.log(`[ShortFilm Audio] Calling elevenlabs-sfx for shot ${shot.shot_index} — prompt:`, sfxPrompt, 'duration:', shot.duration_sec);
            const res = await fetch(`${baseUrl}/functions/v1/elevenlabs-sfx`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ prompt: sfxPrompt, duration: Math.min(shot.duration_sec, 22) }),
            });
            console.log(`[ShortFilm Audio] SFX shot ${shot.shot_index} response status:`, res.status);
            if (res.ok) {
              const blob = await res.blob();
              const blobUrl = URL.createObjectURL(blob);
              // Use timing manifest offset for precise playback
              const manifest = timingManifest.find(t => t.shot_index === shot.shot_index);
              const offset = manifest ? manifest.start_sec + (shot.sfx_trigger_at ?? 0) : undefined;
              newAssets.perShotAudio.push({ shotIndex: shot.shot_index, url: blobUrl, type: 'sfx', offset_sec: offset });
              sfxOk++;

              const storageUrl = await uploadAudioToStorage(blob, `${pid || 'preview'}/sfx-shot-${shot.shot_index}.mp3`);
              if (storageUrl && pid) {
                await supabase.from('video_shots').update({ sfx_url: storageUrl } as any)
                  .eq('project_id', pid).eq('shot_index', shot.shot_index);
              }
              setAudioShotStatuses(prev =>
                prev.map(s => s.shot_index === shot.shot_index ? { ...s, sfx: 'done' } : s)
              );
            } else {
              sfxFail++;
              setAudioShotStatuses(prev =>
                prev.map(s => s.shot_index === shot.shot_index ? { ...s, sfx: 'failed' } : s)
              );
            }
          } catch (e) {
            sfxFail++;
            console.error(`[ShortFilm] SFX shot ${shot.shot_index} failed:`, e);
            setAudioShotStatuses(prev =>
              prev.map(s => s.shot_index === shot.shot_index ? { ...s, sfx: 'failed' } : s)
            );
          }
        }
      }

      // Voiceover per shot — duration-aware, layer-aware
      if (layers.voiceover) {
        setAudioPhase('voiceover');
        const voiceId = settings.voiceId || 'JBFqnCBsd6RMkjVDRZzb';
        for (const shot of shotsToUse) {
          if (!shot.script_line || shot.duration_sec < 3 || shot.vo_enabled === false) continue;
          setAudioShotStatuses(prev =>
            prev.map(s => s.shot_index === shot.shot_index ? { ...s, voiceover: 'generating' } : s)
          );
          try {
            const { text: fittedText, speed } = fitTextToDuration(shot.script_line, shot.duration_sec);
            console.log(`[ShortFilm Audio] Calling elevenlabs-tts for shot ${shot.shot_index} — text: "${fittedText}" (orig: "${shot.script_line}"), speed: ${speed}, duration: ${shot.duration_sec}s`);
            const res = await fetch(`${baseUrl}/functions/v1/elevenlabs-tts`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ text: fittedText, voiceId, speed }),
            });
            console.log(`[ShortFilm Audio] TTS shot ${shot.shot_index} response status:`, res.status);
            if (res.ok) {
              const blob = await res.blob();
              const blobUrl = URL.createObjectURL(blob);
              const manifest = timingManifest.find(t => t.shot_index === shot.shot_index);
              const offset = manifest ? manifest.start_sec : undefined;
              newAssets.perShotAudio.push({ shotIndex: shot.shot_index, url: blobUrl, type: 'voiceover', offset_sec: offset });
              voOk++;

              const storageUrl = await uploadAudioToStorage(blob, `${pid || 'preview'}/vo-shot-${shot.shot_index}.mp3`);
              if (storageUrl && pid) {
                await supabase.from('video_shots').update({ audio_url: storageUrl } as any)
                  .eq('project_id', pid).eq('shot_index', shot.shot_index);
              }
              setAudioShotStatuses(prev =>
                prev.map(s => s.shot_index === shot.shot_index ? { ...s, voiceover: 'done' } : s)
              );
            } else {
              voFail++;
              setAudioShotStatuses(prev =>
                prev.map(s => s.shot_index === shot.shot_index ? { ...s, voiceover: 'failed' } : s)
              );
            }
          } catch (e) {
            voFail++;
            console.error(`[ShortFilm] TTS shot ${shot.shot_index} failed:`, e);
            setAudioShotStatuses(prev =>
              prev.map(s => s.shot_index === shot.shot_index ? { ...s, voiceover: 'failed' } : s)
            );
          }
        }
      }

      setAudioAssets(newAssets);

      // Determine phase based on results
      const hasFailures = sfxFail > 0 || voFail > 0 || (layers.music && !musicOk);
      const hasSuccess = musicOk || sfxOk > 0 || voOk > 0;

      if (hasFailures && !hasSuccess) {
        setAudioPhase('partial');
        toast.error('Audio generation failed. Tap "Generate Audio" to retry.');
      } else if (hasFailures) {
        setAudioPhase('partial');
        const parts: string[] = [];
        if (musicOk) parts.push('Music ✓');
        else if (layers.music) parts.push('Music ✗');
        if (sfxOk > 0 || sfxFail > 0) parts.push(`SFX ${sfxOk}/${sfxOk + sfxFail}`);
        if (voOk > 0 || voFail > 0) parts.push(`Voice ${voOk}/${voOk + voFail}`);
        toast.error(`Audio partially generated: ${parts.join(', ')}`);
      } else if (hasSuccess) {
        setAudioPhase('done');
        toast.success('Audio layer generated');
      } else {
        setAudioPhase('done');
      }
    } catch (err) {
      console.error('[ShortFilm] Audio generation failed:', err);
      setAudioPhase('partial');
      toast.error('Audio generation failed');
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [user, settings, shots, filmType, projectId, uploadAudioToStorage, references]);

  // ─── Retry single audio track ──────────────────────────────
  const retryAudioForShot = useCallback(async (shotIndex: number, type: 'sfx' | 'voiceover') => {
    if (!user) return;
    const shot = shots.find(s => s.shot_index === shotIndex);
    if (!shot) return;

    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const session = (await supabase.auth.getSession()).data.session;
    const authToken = session?.access_token || apikey;
    const headers = { 'Content-Type': 'application/json', apikey, Authorization: `Bearer ${authToken}` };

    const statusKey = type === 'sfx' ? 'sfx' : 'voiceover';
    setAudioShotStatuses(prev =>
      prev.map(s => s.shot_index === shotIndex ? { ...s, [statusKey]: 'generating' } : s)
    );

    try {
      let res: Response;
      if (type === 'sfx') {
        const sfxPrompt = shot.sfx_prompt || buildContextualSfxPrompt(shot, references);
        res = await fetch(`${baseUrl}/functions/v1/elevenlabs-sfx`, {
          method: 'POST', headers,
          body: JSON.stringify({ prompt: sfxPrompt, duration: Math.min(shot.duration_sec, 22) }),
        });
      } else {
        if (!shot.script_line) return;
        const voiceId = settings.voiceId || 'JBFqnCBsd6RMkjVDRZzb';
        const { text: fittedText, speed } = fitTextToDuration(shot.script_line, shot.duration_sec);
        res = await fetch(`${baseUrl}/functions/v1/elevenlabs-tts`, {
          method: 'POST', headers,
          body: JSON.stringify({ text: fittedText, voiceId, speed }),
        });
      }

      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        // Compute offset_sec from cumulative shot durations
        const offsetSec = shots
          .filter(s => s.shot_index < shotIndex)
          .reduce((sum, s) => sum + (s.duration_sec || 3), 0);

        setAudioAssets(prev => ({
          ...prev,
          perShotAudio: [
            ...prev.perShotAudio.filter(a => !(a.shotIndex === shotIndex && a.type === type)),
            { shotIndex, url: blobUrl, type, offset_sec: offsetSec },
          ],
        }));

        const storageUrl = await uploadAudioToStorage(blob, `${projectId || 'preview'}/${type === 'sfx' ? 'sfx' : 'vo'}-shot-${shotIndex}.mp3`);
        if (storageUrl && projectId) {
          const col = type === 'sfx' ? 'sfx_url' : 'audio_url';
          await supabase.from('video_shots').update({ [col]: storageUrl } as any)
            .eq('project_id', projectId).eq('shot_index', shotIndex);
        }

        setAudioShotStatuses(prev =>
          prev.map(s => s.shot_index === shotIndex ? { ...s, [statusKey]: 'done' } : s)
        );
        toast.success(`${type === 'sfx' ? 'SFX' : 'Voiceover'} for shot ${shotIndex} regenerated`);
      } else {
        setAudioShotStatuses(prev =>
          prev.map(s => s.shot_index === shotIndex ? { ...s, [statusKey]: 'failed' } : s)
        );
        toast.error(`Failed to retry ${type} for shot ${shotIndex}`);
      }
    } catch (e) {
      console.error(`[ShortFilm] Retry ${type} shot ${shotIndex} failed:`, e);
      setAudioShotStatuses(prev =>
        prev.map(s => s.shot_index === shotIndex ? { ...s, [statusKey]: 'failed' } : s)
      );
    }
  }, [user, shots, settings.voiceId, projectId, uploadAudioToStorage, references]);

  // ─── Preview audio (short sample) ─────────────────────────
  const previewAudio = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const session = (await supabase.auth.getSession()).data.session;
    const authToken = session?.access_token || apikey;
    const headers = { 'Content-Type': 'application/json', apikey, Authorization: `Bearer ${authToken}` };

    const previewLayers = getEffectiveLayers(settings);
    if (previewLayers.music) {
      const musicPrompt = settings.musicPrompt || `cinematic ${settings.tone || 'ambient'} background music`;
      const res = await fetch(`${baseUrl}/functions/v1/elevenlabs-music`, {
        method: 'POST', headers,
        body: JSON.stringify({ prompt: musicPrompt, duration: 10 }),
      });
      if (res.ok) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    } else if (previewLayers.voiceover) {
      const sampleText = shots.find(s => s.script_line)?.script_line || 'This is a preview of your voiceover.';
      const voiceId = settings.voiceId || 'JBFqnCBsd6RMkjVDRZzb';
      const res = await fetch(`${baseUrl}/functions/v1/elevenlabs-tts`, {
        method: 'POST', headers,
        body: JSON.stringify({ text: sampleText, voiceId }),
      });
      if (res.ok) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    }
    return null;
  }, [user, settings, shots]);

  // ─── Real generation pipeline ───────────────────────────────

  const startGeneration = useCallback(async () => {
    if (!user || !filmType || !storyStructure || shots.length === 0) return;

    if (balance < totalCredits) {
      toast.error(`Not enough credits. Need ${totalCredits}, have ${balance}.`);
      return;
    }

    setIsGenerating(true);
    setShotStatuses(shots.map(s => ({ shot_index: s.shot_index, status: 'pending' })));

    let generationSucceeded = false;
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Not authenticated');

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
              audioLayers: { ...getEffectiveLayers(settings) },
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
              audioLayers: { ...getEffectiveLayers(settings) },
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
          audio_mode: JSON.stringify(settings.audioLayers || { music: true, sfx: true, voiceover: true }),
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

      // ── Multi-shot: build single combined request ──
      // Cap at 6 shots, use actual per-shot durations (Kling: 1-6 shots, 3-15s total)
      const safeShots = shots.slice(0, 6);
      const perShotDurations = distributeShotDurations(safeShots);
      const totalDuration = perShotDurations.reduce((a, b) => a + b, 0);

      // Collect unique image URLs for Kling image_list
      const imageUrlSet = new Set<string>();
      const shotImageMap: Map<number, number> = new Map(); // shot_index → image_N index (1-based)
      shots.forEach((shot) => {
        const url = getSourceImageForShot(shot, references);
        if (url) {
          if (!imageUrlSet.has(url)) {
            imageUrlSet.add(url);
          }
          const idx = Array.from(imageUrlSet).indexOf(url) + 1;
          shotImageMap.set(shot.shot_index, idx);
        }
      });
      const imageUrls = Array.from(imageUrlSet);

      // Build per-shot prompts with <<<image_N>>> references
      let combinedNegativePrompt = '';
      const multishotPayload = safeShots.map((shot, i) => {
        const imageIdx = shotImageMap.get(shot.shot_index);
        const { prompt, negative_prompt } = buildShotPrompt(shot, {
          filmType,
          tone: settings.tone || '',
          settings,
          references,
        }, imageIdx);

        // Capture negative prompt from first shot (base negatives are shared)
        if (i === 0) combinedNegativePrompt = negative_prompt;

        return {
          index: i + 1,
          prompt,
          duration: perShotDurations[i],
        };
      });

      // Set all shots to processing
      setShotStatuses(prev => prev.map(s => ({ ...s, status: 'processing' as const })));

      generationSucceeded = false;
      try {
        const result = await enqueueWithRetry({
          jobType: 'video_multishot',
          payload: {
            shots: multishotPayload,
            negative_prompt: combinedNegativePrompt,
            total_duration: totalDuration,
            aspect_ratio: settings.aspectRatio,
            mode: 'pro',
            cfg_scale: 0.5,
            preservation_strength: settings.preservationLevel || 'medium',
            with_audio: false,
            project_id: currentProjectId,
            image_urls: imageUrls,
          },
          imageCount: 1,
        }, token);

        if (isEnqueueError(result)) {
          throw new Error(result.message);
        }

        sendWake(token);

        // Poll single job
        const resultUrl = await pollQueueJobCompletion(result.jobId, 90);

        if (resultUrl) {
          generationSucceeded = true;
          const signedResultUrl = await toSignedUrl(resultUrl);
          // All shots succeeded — mark all complete with the single video URL
          setShotStatuses(prev => prev.map(s => ({
            ...s, status: 'complete' as const, result_url: signedResultUrl,
          })));

          // Update all video_shots rows
          for (const shot of shots) {
            await supabase
              .from('video_shots')
              .update({ status: 'complete', result_url: resultUrl })
              .eq('project_id', currentProjectId!)
              .eq('shot_index', shot.shot_index);
          }
        } else {
          setShotStatuses(prev => prev.map(s => ({ ...s, status: 'failed' as const })));
        }
      } catch (enqueueErr) {
        console.error('[ShortFilm] Multi-shot enqueue failed:', enqueueErr);
        setShotStatuses(prev => prev.map(s => ({ ...s, status: 'failed' as const })));
      }

      const projectStatus = generationSucceeded ? 'complete' : 'failed';

      // Persist full draft state for reopening
      const draftState: DraftState = {
        step: 'review', filmType, storyStructure, references, shots, settings, planMode, customRoles,
      };
      try {
        await supabase.from('video_projects').update({
          status: projectStatus,
          draft_state_json: JSON.parse(JSON.stringify(draftState)),
        }).eq('id', currentProjectId!);
      } catch (dbErr) {
        console.error('[ShortFilm] DB update after generation failed:', dbErr);
      }

      if (generationSucceeded) {
        toast.success('Short film generation complete!');
      } else {
        toast.error('Film generation failed');
      }
      refreshBalance();

    } catch (err) {
      console.error('[ShortFilm] Generation failed:', err);
      toast.error(err instanceof Error ? err.message : 'Generation failed');
    }

    // Generate audio layer INDEPENDENTLY — outside the main try block
    const audioProjectId = projectId || draftProjectId;
    const audioLayers = getEffectiveLayers(settings);
    const anyAudioLayerOn = audioLayers.music || audioLayers.sfx || audioLayers.voiceover;
    if (anyAudioLayerOn) {
      console.log('[ShortFilm] Starting audio generation independently for project:', audioProjectId);
      try {
        await generateAudio(audioProjectId || undefined, shots);
      } catch (audioErr) {
        console.error('[ShortFilm] Audio generation failed independently:', audioErr);
        toast.error('Audio generation failed — you can retry from the player');
      }
    }

    // Lip-sync post-processing for character shots with voiceover
    if (generationSucceeded && audioLayers.voiceover) {
      const characterShotsWithVO = shots.filter(
        s => s.character_visible && s.script_line && s.vo_enabled !== false && s.duration_sec >= 3
      );
      if (characterShotsWithVO.length > 0) {
        console.log(`[ShortFilm] Starting lip-sync for ${characterShotsWithVO.length} character shots`);
        try {
          const videoUrl = shotStatuses.find(s => s.result_url)?.result_url;
          // Get stored VO audio URLs for character shots
          for (const shot of characterShotsWithVO) {
            const voAsset = audioAssets.perShotAudio.find(
              a => a.shotIndex === shot.shot_index && a.type === 'voiceover'
            );
            if (!voAsset || !videoUrl) continue;

            try {
              const { data: lipSyncData } = await supabase.functions.invoke('kling-lip-sync', {
                body: { action: 'create', video_url: videoUrl, audio_url: voAsset.url },
              });

              if (lipSyncData?.task_id) {
                console.log(`[ShortFilm] Lip-sync task created for shot ${shot.shot_index}: ${lipSyncData.task_id}`);
                // Poll for lip-sync completion (max 60 polls @ 10s = 10 min)
                for (let poll = 0; poll < 60; poll++) {
                  await new Promise(r => setTimeout(r, 10_000));
                  const { data: statusData } = await supabase.functions.invoke('kling-lip-sync', {
                    body: { action: 'status', task_id: lipSyncData.task_id },
                  });
                  if (statusData?.status === 'succeed' && statusData?.video_url) {
                    console.log(`[ShortFilm] Lip-sync complete for shot ${shot.shot_index}`);
                    const signedLipSync = await toSignedUrl(statusData.video_url);
                    setShotStatuses(prev => prev.map(s => ({ ...s, result_url: signedLipSync })));
                    toast.success('Lip-sync applied to character shots!');
                    break;
                  }
                  if (statusData?.status === 'failed') {
                    console.warn(`[ShortFilm] Lip-sync failed for shot ${shot.shot_index}`);
                    break;
                  }
                }
              }
            } catch (lsErr) {
              console.error(`[ShortFilm] Lip-sync failed for shot ${shot.shot_index}:`, lsErr);
            }
          }
        } catch (lipSyncErr) {
          console.error('[ShortFilm] Lip-sync post-processing failed:', lipSyncErr);
        }
      }
    }

    setIsGenerating(false);
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
        role: 'detail_closeup',
        purpose: 'New custom shot',
        scene_type: 'macro_closeup',
        camera_motion: 'slow_push_in',
        subject_motion: 'static',
        duration_sec: 3,
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
    audioPhase,
    audioShotStatuses,
    retryAudioForShot,
    previewAudio,
  };
}

/** Film-type-specific instrumentation & tempo defaults for ElevenLabs music generation */
const FILM_MUSIC_PRESETS: Record<string, string> = {
  product_launch: 'cinematic orchestral with deep bass hits and rising strings, 80-90 BPM, building from sparse tension to powerful reveal',
  brand_story: 'warm cinematic piano with subtle strings and soft percussion, 75-85 BPM, gentle narrative arc',
  fashion_campaign: 'minimal deep house with soft synth pads and clean percussion, 100-110 BPM, sleek editorial feel',
  beauty_film: 'ethereal ambient with delicate harp and soft crystalline textures, 65-75 BPM, dreamy and luxurious',
  luxury_mood: 'minimal piano with ambient pads and deep sub-bass, 60-70 BPM, no percussion, languid and atmospheric',
  sports_campaign: 'driving electronic beats with punchy drums and aggressive synths, 120-140 BPM, high energy throughout',
  lifestyle_teaser: 'warm acoustic guitar with soft ambient pads and gentle beats, 85-95 BPM, aspirational and inviting',
  custom: 'cinematic ambient background with subtle instrumentation, 80 BPM, professional production quality',
};

/** Resolve the final music prompt from preset key, AI direction, or custom input */
function resolveMusicPrompt(
  settings: ShortFilmSettings,
  filmType: FilmType | null,
  shots: ShotPlanItem[],
  refs?: ReferenceAsset[],
): string {
  const key = settings.musicPresetKey;

  // AI Director suggestion — use musicPrompt which was set from music_direction
  if (key === 'ai_director' && settings.musicPrompt) {
    return settings.musicPrompt;
  }

  // Custom — use the user's free-text input
  if (key === 'custom' && settings.musicPrompt) {
    return settings.musicPrompt;
  }

  // Named preset key — use FILM_MUSIC_PRESETS directly
  if (key && FILM_MUSIC_PRESETS[key]) {
    return FILM_MUSIC_PRESETS[key];
  }

  // Fallback: build contextual prompt from film type
  return buildContextualMusicPrompt(filmType, settings.tone, shots, refs);
}

/** Build a rich music prompt from film context, incorporating style references and specific instrumentation */
function buildContextualMusicPrompt(filmType: FilmType | null, tone: string | undefined, shots: ShotPlanItem[], refs?: ReferenceAsset[]): string {
  const totalDuration = shots.reduce((sum, s) => sum + s.duration_sec, 0);
  const filmKey = filmType || 'custom';
  const basePreset = FILM_MUSIC_PRESETS[filmKey] || FILM_MUSIC_PRESETS.custom;

  // Extract style keywords from selected style references
  const styleKeywords = (refs || [])
    .filter(r => r.role === 'style')
    .map(r => r.name?.split(':')[0]?.trim())
    .filter(Boolean)
    .slice(0, 3);

  // Extract scene context from scene references
  const sceneKeywords = (refs || [])
    .filter(r => r.role === 'scene')
    .map(r => r.name?.split(':')[0]?.trim())
    .filter(Boolean)
    .slice(0, 2);

  // Build energy arc from shot roles
  const roleNames = shots.map(s => s.role);
  const hasHook = roleNames.some(r => r === 'hook' || r === 'tease');
  const hasReveal = roleNames.some(r => r === 'product_reveal' || r === 'highlight');
  const hasResolve = roleNames.some(r => r === 'resolve' || r === 'brand_finish' || r === 'end_frame');

  let energyArc = '';
  if (hasHook && hasReveal && hasResolve) {
    energyArc = ', energy arc: starts sparse and mysterious, builds to powerful peak at the reveal, resolves softly';
  } else if (hasHook && hasReveal) {
    energyArc = ', energy arc: dramatic opening building to powerful reveal climax';
  } else if (hasReveal && hasResolve) {
    energyArc = ', energy arc: confident opening into hero moment then gentle resolution';
  }

  let prompt = basePreset;

  if (styleKeywords.length > 0) {
    prompt += `, ${styleKeywords.join(', ')} visual mood`;
  }
  if (sceneKeywords.length > 0) {
    prompt += `, set in ${sceneKeywords.join(' and ')} environment`;
  }
  if (tone && !basePreset.includes(tone)) {
    prompt += `, ${tone} tone`;
  }

  prompt += energyArc;
  prompt += `, exactly ${totalDuration} seconds long, no vocals, professional production quality`;
  return prompt;
}

/** Build contextual SFX prompt based on shot role, motion, and scene references */
function buildContextualSfxPrompt(shot: ShotPlanItem, refs?: ReferenceAsset[]): string {
  const ROLE_SFX: Record<string, string> = {
    hook: 'dramatic cinematic whoosh impact with bass hit',
    tease: 'subtle mysterious tension riser, soft wind',
    build: 'rising cinematic tension swells, building energy',
    intro: 'soft ambient cinematic opening, gentle atmospheric pad',
    atmosphere: 'deep ambient atmosphere, ethereal soundscape',
    product_reveal: 'elegant reveal shimmer with subtle sparkle whoosh',
    highlight: 'powerful cinematic impact with reverb tail',
    product_moment: 'satisfying premium product sound, smooth mechanical',
    detail_closeup: 'soft mechanical focus click, precision close-up sound',
    product_focus: 'clean studio ambience with gentle product handling',
    lifestyle_moment: 'warm natural ambient, gentle background life sounds',
    human_interaction: 'soft fabric movement, gentle human presence',
    brand_finish: 'deep cinematic bass hit with elegant resolve',
    end_frame: 'soft logo resolve sound, gentle cinematic ending',
    resolve: 'warm cinematic resolution, satisfying closing tone',
    closing: 'gentle fade-out ambience, soft cinematic outro',
  };

  const baseSfx = ROLE_SFX[shot.role] || 'subtle cinematic ambient sound';

  const motionSfx: Record<string, string> = {
    orbit: ', smooth rotational movement whoosh',
    push_in: ', gentle forward motion',
    slow_push_in: ', very subtle forward glide',
    pull_back: ', gentle pull-back reveal',
    tracking: ', smooth lateral tracking',
    slow_drift: ', ethereal floating drift',
    handheld_gentle: ', organic handheld movement',
  };

  const motionExtra = motionSfx[shot.camera_motion] || '';

  // Incorporate scene reference context
  const sceneContext = (refs || [])
    .filter(r => r.role === 'scene')
    .map(r => r.name?.split(':')[0]?.trim())
    .filter(Boolean)
    .slice(0, 2);
  const sceneExtra = sceneContext.length > 0 ? `, ${sceneContext.join(', ')} ambience` : '';

  return `${baseSfx}${motionExtra}${sceneExtra}, ${shot.duration_sec} seconds, professional cinematic quality`;
}

/** Fit voiceover text to shot duration with word-budget trimming and speed adjustment.
 *  Shots shorter than MIN_VO_DURATION get no voiceover — too short for natural speech. */
function fitTextToDuration(scriptLine: string, durationSec: number): { text: string; speed: number } {
  const MIN_VO_DURATION = 3; // seconds — skip VO for very short shots
  const WORDS_PER_SEC = 2.0; // cinematic pace (~120 WPM)
  const MAX_SPEED = 1.2;

  if (durationSec < MIN_VO_DURATION) {
    return { text: '', speed: 1.0 };
  }

  const wordBudget = Math.floor(durationSec * WORDS_PER_SEC);
  const words = scriptLine.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return { text: '', speed: 1.0 };

  if (words.length <= wordBudget) {
    const estimatedDuration = words.length / WORDS_PER_SEC;
    const speed = estimatedDuration > durationSec ? Math.min(MAX_SPEED, estimatedDuration / durationSec) : 1.0;
    return { text: scriptLine, speed: Math.round(speed * 100) / 100 };
  }

  const trimmed = words.slice(0, wordBudget).join(' ');
  const cleanText = trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?')
    ? trimmed
    : trimmed + '.';
  return { text: cleanText, speed: Math.min(MAX_SPEED, 1.1) };
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

  // Multi-angle product matching: prefer angle based on shot role
  const productRefs = references.filter(r => r.role === 'product' && r.url);
  if (productRefs.length > 0) {
    const role = shot.role?.toLowerCase() || '';
    const sceneType = shot.scene_type?.toLowerCase() || '';

    // Detail/texture shots → prefer texture or side
    if (role.includes('detail') || sceneType.includes('closeup') || sceneType.includes('detail') || sceneType.includes('texture')) {
      const tex = productRefs.find(r => r.subRole === 'texture');
      if (tex) return tex.url;
      const side = productRefs.find(r => r.subRole === 'side');
      if (side) return side.url;
    }
    // Packaging shots
    if (role.includes('packaging') || sceneType.includes('packaging') || sceneType.includes('unboxing')) {
      const pkg = productRefs.find(r => r.subRole === 'packaging');
      if (pkg) return pkg.url;
    }
    // Inside/interior shots
    if (role.includes('inside') || role.includes('interior') || sceneType.includes('interior')) {
      const ins = productRefs.find(r => r.subRole === 'inside');
      if (ins) return ins.url;
    }
    // Back view shots
    if (role.includes('back') || sceneType.includes('back')) {
      const back = productRefs.find(r => r.subRole === 'back');
      if (back) return back.url;
    }
    // Default to main
    const main = productRefs.find(r => r.subRole === 'main');
    if (main) return main.url;
    return productRefs[0].url;
  }

  const sceneRef = references.find(r => r.role === 'scene');
  return sceneRef?.url || '';
}

/** Generate shot plan from custom roles */
function generateShotPlanFromRoles(roles: string[], shotDuration: '5' | '10'): ShotPlanItem[] {
  return roles.slice(0, 6).map((role, index) => ({
    shot_index: index + 1,
    role,
    purpose: `Custom ${role.replace(/_/g, ' ')} shot`,
    scene_type: 'product_hero',
    camera_motion: 'slow_push_in',
    subject_motion: 'minimal',
    duration_sec: 3,
    script_line: `Custom ${role.replace(/_/g, ' ')} narration.`,
    product_visible: role.includes('product') || role.includes('detail') || role.includes('highlight'),
    character_visible: role.includes('human') || role.includes('lifestyle'),
    preservation_strength: role.includes('product') || role.includes('detail') ? 'high' : 'medium',
  }));
}

/** Poll generation_queue for a job, then trigger status polling via generate-video */
async function pollQueueJobCompletion(jobId: string, maxPolls: number): Promise<string | null> {
  let klingTaskId: string | null = null;
  let endpoint: string | null = null;

  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, 10_000));

    // Phase 1: Get kling_task_id + endpoint from queue result
    if (!klingTaskId) {
      const { data } = await supabase
        .from('generation_queue')
        .select('status, result, error_message')
        .eq('id', jobId)
        .single();

      if (!data) continue;
      if (data.status === 'failed' || data.status === 'cancelled') return null;
      if (data.status === 'completed') {
        const result = data.result as Record<string, unknown> | null;
        return (result?.video_url as string) || null;
      }

      const result = data.result as Record<string, unknown> | null;
      klingTaskId = (result?.kling_task_id as string) || null;
      endpoint = (result?.endpoint as string) || null;
      if (!klingTaskId) continue;
    }

    // Phase 2: Poll Kling via the status action — pass endpoint for omni-video tasks
    try {
      const { data: statusData } = await supabase.functions.invoke('generate-video', {
        body: {
          action: 'status',
          task_id: klingTaskId,
          queue_job_id: jobId,
          ...(endpoint ? { endpoint } : {}),
        },
      });

      if (statusData?.status === 'succeed' && statusData?.video_url) {
        return statusData.video_url as string;
      }
      if (statusData?.status === 'failed') return null;
    } catch {
      // Continue polling on transient errors
    }
  }
  return null;
}
