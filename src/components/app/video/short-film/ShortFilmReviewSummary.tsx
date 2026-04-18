import { Coins } from 'lucide-react';
import { ShotCard } from './ShotCard';
import { PreflightPanel } from './PreflightPanel';
import { FILM_TYPE_OPTIONS, STORY_STRUCTURE_OPTIONS } from '@/lib/shortFilmPlanner';
import { INTENT_OPTIONS } from '@/lib/commerceVideo/contentIntents';
import { validateProject } from '@/lib/commerceVideo/preflight';
import type { ShotPlanItem, FilmType, StoryStructure, ShortFilmSettings } from '@/types/shortFilm';
import type { ReferenceAsset } from './ReferenceUploadPanel';
import type {
  ContentIntent,
  Platform,
  SoundMode,
  EndingStyle,
} from '@/types/commerceVideo';
import { useMemo } from 'react';

interface ShortFilmReviewSummaryProps {
  filmType: FilmType | null;
  storyStructure: StoryStructure | null;
  shots: ShotPlanItem[];
  settings: ShortFilmSettings;
  totalCredits: number;
  // ── Commerce Video Engine context (Phase 4) ──
  references?: ReferenceAsset[];
  contentIntent?: ContentIntent | null;
  platform?: Platform;
  soundMode?: SoundMode;
  endingStyle?: EndingStyle;
  clarityFirst?: boolean;
}

const AUDIO_LABELS: Record<string, string> = {
  silent: 'Silent',
  ambient: 'Ambient (Kling native)',
  music: 'AI Music',
  voiceover: 'AI Voiceover',
  full_mix: 'Full Mix',
};

export function ShortFilmReviewSummary({
  filmType,
  storyStructure,
  shots,
  settings,
  totalCredits,
  references = [],
  contentIntent = null,
  platform,
  soundMode,
  endingStyle,
  clarityFirst,
}: ShortFilmReviewSummaryProps) {
  const filmLabel = FILM_TYPE_OPTIONS.find(f => f.value === filmType)?.label || filmType?.replace(/_/g, ' ') || '--';
  const structureLabel = STORY_STRUCTURE_OPTIONS.find(s => s.value === storyStructure)?.label || storyStructure?.replace(/_/g, ' ') || '--';
  const audioLabel = AUDIO_LABELS[settings.audioMode] || settings.audioMode;
  const intentLabel = INTENT_OPTIONS.find(i => i.value === contentIntent)?.label || contentIntent?.replace(/_/g, ' ') || '--';

  const preflight = useMemo(
    () =>
      validateProject({
        intent: contentIntent,
        platform,
        soundMode,
        endingStyle,
        shots,
        references,
        settings,
        clarityFirst,
      }),
    [contentIntent, platform, soundMode, endingStyle, shots, references, settings, clarityFirst],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Review & Generate</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Everything looks good? Generate your {shots.length}-shot brand film
        </p>
      </div>

      <PreflightPanel result={preflight} />

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Intent</span>
            <p className="font-medium text-foreground capitalize">{intentLabel}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Platform</span>
            <p className="font-medium text-foreground capitalize">{(platform || 'general').replace(/_/g, ' ')}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Film Type</span>
            <p className="font-medium text-foreground">{filmLabel}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Structure</span>
            <p className="font-medium text-foreground truncate">{structureLabel}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Shots</span>
            <p className="font-medium text-foreground">{shots.length} shots · {shots.reduce((sum, s) => sum + (s.duration_sec || 3), 0)}s total</p>
          </div>
          <div>
            <span className="text-muted-foreground">Audio</span>
            <p className="font-medium text-foreground">{audioLabel}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Ending</span>
            <p className="font-medium text-foreground capitalize">{(endingStyle || 'auto').replace(/_/g, ' ')}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Clarity-first</span>
            <p className="font-medium text-foreground">{clarityFirst ? 'On' : 'Off'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {shots.map((shot) => (
          <ShotCard key={shot.shot_index} shot={shot} />
        ))}
      </div>

      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/50 border border-border">
        <Coins className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Estimated cost:</span>
        <span className="text-sm font-semibold text-foreground">{totalCredits} credits</span>
      </div>
    </div>
  );
}
