import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from '@/lib/brandedToast';
import { generateShotPlan, FILM_TYPE_OPTIONS } from '@/lib/shortFilmPlanner';
import { buildShotPrompt, estimateShortFilmCredits, distributeShotDurations } from '@/lib/shortFilmPromptBuilder';
import { enqueueWithRetry, isEnqueueError, getAuthToken, paceDelay, sendWake } from '@/lib/enqueueGeneration';
import type {
  FilmType,
  StoryStructure,
  ShortFilmSettings,
  ShortFilmStep,
  ShotPlanItem,
  AudioAssets,
  AudioPhase,
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
  preservationLevel: 'medium',
  shotDuration: '5',
  quality: 'pro',
};

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
        setSettings(d.settings || DEFAULT_SETTINGS);
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
              // Audio was expected but missing — allow retry
              const restoredSettings = d.settings || DEFAULT_SETTINGS;
              if (restoredSettings.audioMode !== 'silent' && restoredSettings.audioMode !== 'ambient') {
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
          with_audio: settings.audioMode === 'ambient',
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
    const mode = settings.audioMode;
    if (mode === 'silent' || mode === 'ambient') return;

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
      voiceover: (mode === 'voiceover' || mode === 'full_mix') && s.script_line ? 'idle' as const : 'idle' as const,
    }));
    setAudioShotStatuses(initStatuses);

    try {
      // Music track
      if (mode === 'music' || mode === 'full_mix') {
        setAudioPhase('music');
        const totalDuration = shotsToUse.reduce((sum, s) => sum + s.duration_sec, 0);
        const musicPrompt = settings.musicPrompt || buildContextualMusicPrompt(filmType, settings.tone, shotsToUse);
        try {
          const res = await fetch(`${baseUrl}/functions/v1/elevenlabs-music`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ prompt: musicPrompt, duration: Math.min(totalDuration, 120) }),
          });
          if (res.ok) {
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            newAssets.backgroundTrackUrl = blobUrl;
            musicOk = true;

            // Persist to storage
            const storageUrl = await uploadAudioToStorage(blob, `${pid || 'preview'}/music-track.mp3`);
            if (storageUrl && pid) {
              await supabase.from('video_projects').update({ music_track_url: storageUrl } as any).eq('id', pid);
            }
          } else {
            console.error('[ShortFilm] Music generation returned', res.status);
          }
        } catch (e) {
          console.error('[ShortFilm] Music generation failed:', e);
        }
      }

      // SFX per shot (music or full_mix)
      if (mode === 'music' || mode === 'full_mix') {
        setAudioPhase('sfx');
        for (const shot of shotsToUse) {
          setAudioShotStatuses(prev =>
            prev.map(s => s.shot_index === shot.shot_index ? { ...s, sfx: 'generating' } : s)
          );
          try {
            const sfxPrompt = `${shot.scene_type.replace(/_/g, ' ')} ambient sound, ${shot.purpose}`;
            const res = await fetch(`${baseUrl}/functions/v1/elevenlabs-sfx`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ prompt: sfxPrompt, duration: Math.min(shot.duration_sec, 22) }),
            });
            if (res.ok) {
              const blob = await res.blob();
              const blobUrl = URL.createObjectURL(blob);
              newAssets.perShotAudio.push({ shotIndex: shot.shot_index, url: blobUrl, type: 'sfx' });
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

      // Voiceover per shot
      if (mode === 'voiceover' || mode === 'full_mix') {
        setAudioPhase('voiceover');
        const voiceId = settings.voiceId || 'JBFqnCBsd6RMkjVDRZzb';
        for (const shot of shotsToUse) {
          if (!shot.script_line) continue;
          setAudioShotStatuses(prev =>
            prev.map(s => s.shot_index === shot.shot_index ? { ...s, voiceover: 'generating' } : s)
          );
          try {
            const res = await fetch(`${baseUrl}/functions/v1/elevenlabs-tts`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ text: shot.script_line, voiceId }),
            });
            if (res.ok) {
              const blob = await res.blob();
              const blobUrl = URL.createObjectURL(blob);
              newAssets.perShotAudio.push({ shotIndex: shot.shot_index, url: blobUrl, type: 'voiceover' });
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
      const hasFailures = sfxFail > 0 || voFail > 0 || ((mode === 'music' || mode === 'full_mix') && !musicOk);
      const hasSuccess = musicOk || sfxOk > 0 || voOk > 0;

      if (hasFailures && !hasSuccess) {
        setAudioPhase('partial');
        toast.error('Audio generation failed. Tap "Generate Audio" to retry.');
      } else if (hasFailures) {
        setAudioPhase('partial');
        const parts: string[] = [];
        if (musicOk) parts.push('Music ✓');
        else if (mode === 'music' || mode === 'full_mix') parts.push('Music ✗');
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
  }, [user, settings, shots, filmType, projectId, uploadAudioToStorage]);

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
        const sfxPrompt = `${shot.scene_type.replace(/_/g, ' ')} ambient sound, ${shot.purpose}`;
        res = await fetch(`${baseUrl}/functions/v1/elevenlabs-sfx`, {
          method: 'POST', headers,
          body: JSON.stringify({ prompt: sfxPrompt, duration: Math.min(shot.duration_sec, 22) }),
        });
      } else {
        if (!shot.script_line) return;
        const voiceId = settings.voiceId || 'JBFqnCBsd6RMkjVDRZzb';
        res = await fetch(`${baseUrl}/functions/v1/elevenlabs-tts`, {
          method: 'POST', headers,
          body: JSON.stringify({ text: shot.script_line, voiceId }),
        });
      }

      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        setAudioAssets(prev => ({
          ...prev,
          perShotAudio: [
            ...prev.perShotAudio.filter(a => !(a.shotIndex === shotIndex && a.type === type)),
            { shotIndex, url: blobUrl, type },
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
  }, [user, shots, settings.voiceId, projectId, uploadAudioToStorage]);

  // ─── Preview audio (short sample) ─────────────────────────
  const previewAudio = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const session = (await supabase.auth.getSession()).data.session;
    const authToken = session?.access_token || apikey;
    const headers = { 'Content-Type': 'application/json', apikey, Authorization: `Bearer ${authToken}` };

    const mode = settings.audioMode;
    if (mode === 'music' || mode === 'full_mix') {
      const musicPrompt = settings.musicPrompt || `cinematic ${settings.tone || 'ambient'} background music`;
      const res = await fetch(`${baseUrl}/functions/v1/elevenlabs-music`, {
        method: 'POST', headers,
        body: JSON.stringify({ prompt: musicPrompt, duration: 10 }),
      });
      if (res.ok) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    } else if (mode === 'voiceover') {
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

      let generationSucceeded = false;
      try {
        const result = await enqueueWithRetry({
          jobType: 'video_multishot',
          payload: {
            shots: multishotPayload,
            negative_prompt: combinedNegativePrompt,
            total_duration: totalDuration,
            aspect_ratio: settings.aspectRatio,
            mode: 'pro',
            with_audio: settings.audioMode === 'ambient',
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
      await supabase.from('video_projects').update({
        status: projectStatus,
        draft_state_json: JSON.parse(JSON.stringify(draftState)),
      }).eq('id', currentProjectId!);

      if (generationSucceeded) {
        toast.success('Short film generation complete!');
      } else {
        toast.error('Film generation failed');
      }
      refreshBalance();

      // Generate audio layer if needed — pass current shots to avoid stale closure
      if (settings.audioMode !== 'silent' && settings.audioMode !== 'ambient') {
        await generateAudio(currentProjectId, shots);
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

/** Build a rich music prompt from film context */
function buildContextualMusicPrompt(filmType: FilmType | null, tone: string | undefined, shots: ShotPlanItem[]): string {
  const type = filmType?.replace(/_/g, ' ') || 'cinematic';
  const mood = tone || 'ambient';
  const roles = [...new Set(shots.map(s => s.role))].slice(0, 4).join(', ');
  const hasHook = shots.some(s => s.role === 'hook' || s.role === 'tease');
  const hasClosing = shots.some(s => s.role === 'closing' || s.role === 'resolve');

  let prompt = `cinematic ${mood} background music for a ${type} film`;
  if (hasHook && hasClosing) {
    prompt += ', slow building tension with elegant resolution';
  } else if (hasHook) {
    prompt += ', dramatic opening with rising intensity';
  }
  if (roles) prompt += `, featuring ${roles} moments`;
  prompt += ', no vocals, professional production quality';
  return prompt;
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
  return roles.slice(0, 6).map((role, index) => ({
    shot_index: index + 1,
    role,
    purpose: `Custom ${role.replace(/_/g, ' ')} shot`,
    scene_type: 'general',
    camera_motion: 'slow_push',
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
