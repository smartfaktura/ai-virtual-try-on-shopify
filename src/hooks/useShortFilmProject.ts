import { useState, useCallback, useMemo } from 'react';
import type {
  FilmType,
  StoryStructure,
  ShortFilmSettings,
  ShortFilmStep,
  ShotPlanItem,
} from '@/types/shortFilm';
import type { ReferenceAsset } from '@/components/app/video/short-film/ReferenceUploadPanel';
import { generateShotPlan } from '@/lib/shortFilmPlanner';

interface ShotStatus {
  shot_index: number;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  result_url?: string;
}

export function useShortFilmProject() {
  const [step, setStep] = useState<ShortFilmStep>('film_type');
  const [filmType, setFilmType] = useState<FilmType | null>(null);
  const [storyStructure, setStoryStructure] = useState<StoryStructure | null>(null);
  const [references, setReferences] = useState<ReferenceAsset[]>([]);
  const [shots, setShots] = useState<ShotPlanItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shotStatuses, setShotStatuses] = useState<ShotStatus[]>([]);
  const [settings, setSettings] = useState<ShortFilmSettings>({
    aspectRatio: '16:9',
    audioMode: 'silent',
    preservationLevel: 'medium',
    shotDuration: '5',
  });

  const steps: ShortFilmStep[] = ['film_type', 'references', 'story', 'shot_plan', 'settings', 'review'];
  const currentStepIndex = steps.indexOf(step);

  const canAdvance = useMemo(() => {
    switch (step) {
      case 'film_type': return !!filmType;
      case 'references': return true; // references are optional
      case 'story': return !!storyStructure;
      case 'shot_plan': return shots.length > 0;
      case 'settings': return true;
      case 'review': return !isGenerating;
      default: return false;
    }
  }, [step, filmType, storyStructure, shots, isGenerating]);

  const goNext = useCallback(() => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) {
      const nextStep = steps[idx + 1];
      // Auto-generate shot plan when entering that step
      if (nextStep === 'shot_plan' && filmType && storyStructure) {
        setShots(generateShotPlan(filmType, storyStructure, settings.shotDuration));
      }
      setStep(nextStep);
    }
  }, [step, filmType, storyStructure, settings.shotDuration]);

  const goBack = useCallback(() => {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  }, [step]);

  const regeneratePlan = useCallback(() => {
    if (filmType && storyStructure) {
      setShots(generateShotPlan(filmType, storyStructure, settings.shotDuration));
    }
  }, [filmType, storyStructure, settings.shotDuration]);

  const startGeneration = useCallback(async () => {
    if (shots.length === 0) return;
    setIsGenerating(true);
    setShotStatuses(shots.map(s => ({ shot_index: s.shot_index, status: 'pending' })));

    // Sequential generation simulation — in production this calls generate-video per shot
    for (let i = 0; i < shots.length; i++) {
      setShotStatuses(prev =>
        prev.map(s =>
          s.shot_index === shots[i].shot_index
            ? { ...s, status: 'processing' }
            : s
        )
      );

      // Simulate generation time — replace with real edge function call
      await new Promise(resolve => setTimeout(resolve, 3000));

      setShotStatuses(prev =>
        prev.map(s =>
          s.shot_index === shots[i].shot_index
            ? { ...s, status: 'complete' }
            : s
        )
      );
    }

    setIsGenerating(false);
  }, [shots]);

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
  };
}
