import { Coins } from 'lucide-react';
import { ShotCard } from './ShotCard';
import type { ShotPlanItem, FilmType, StoryStructure, ShortFilmSettings } from '@/types/shortFilm';

interface ShortFilmReviewSummaryProps {
  filmType: FilmType | null;
  storyStructure: StoryStructure | null;
  shots: ShotPlanItem[];
  settings: ShortFilmSettings;
  totalCredits: number;
}

export function ShortFilmReviewSummary({
  filmType,
  storyStructure,
  shots,
  settings,
  totalCredits,
}: ShortFilmReviewSummaryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Review & Generate</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Everything looks good? Generate your {shots.length}-shot brand film.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Film Type</span>
            <p className="font-medium text-foreground capitalize">
              {filmType?.replace(/_/g, ' ')}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Structure</span>
            <p className="font-medium text-foreground capitalize">
              {storyStructure?.replace(/_/g, ' → ').slice(0, 30)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Shots</span>
            <p className="font-medium text-foreground">{shots.length} shots × {settings.shotDuration}s</p>
          </div>
          <div>
            <span className="text-muted-foreground">Audio</span>
            <p className="font-medium text-foreground capitalize">{settings.audioMode}</p>
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
