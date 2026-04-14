import { ShotCard } from './ShotCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { ShotPlanItem } from '@/types/shortFilm';
import { Loader2, CheckCircle2, Clapperboard, RotateCw } from 'lucide-react';
import { TEAM_MEMBERS } from '@/data/teamData';

interface ShotStatus {
  shot_index: number;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  result_url?: string;
}

interface ShortFilmProgressPanelProps {
  shots: ShotPlanItem[];
  shotStatuses: ShotStatus[];
  onRetryShot?: (shotIndex: number) => void;
}

const DIRECTOR_MESSAGES = [
  'Setting up the first frame...',
  'Composing the hero shot...',
  'Capturing product details...',
  'Framing the closing scene...',
  'Adding final polish...',
  'Building cinematic motion...',
];

export function ShortFilmProgressPanel({ shots, shotStatuses, onRetryShot }: ShortFilmProgressPanelProps) {
  const completedCount = shotStatuses.filter(s => s.status === 'complete').length;
  const failedCount = shotStatuses.filter(s => s.status === 'failed').length;
  const currentIndex = shotStatuses.findIndex(s => s.status === 'processing');
  const progress = shots.length > 0 ? (completedCount / shots.length) * 100 : 0;
  const isAllDone = shotStatuses.every(s => s.status === 'complete' || s.status === 'failed') && shots.length > 0;

  const teamMember = TEAM_MEMBERS[Math.min(currentIndex >= 0 ? currentIndex : 0, TEAM_MEMBERS.length - 1)];
  const directorMessage = currentIndex >= 0
    ? DIRECTOR_MESSAGES[currentIndex % DIRECTOR_MESSAGES.length]
    : isAllDone
      ? failedCount > 0 ? `Done with ${failedCount} failed shot${failedCount > 1 ? 's' : ''} — retry below` : 'Your short film is ready!'
      : 'Preparing your film...';

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {isAllDone ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          )}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isAllDone ? 'Film Complete' : 'Generating Short Film'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {completedCount} / {shots.length} shots complete
              {failedCount > 0 && ` • ${failedCount} failed`}
            </p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
        {teamMember?.avatar ? (
          <img
            src={teamMember.avatar}
            alt=""
            className="h-10 w-10 rounded-full object-cover border-2 border-primary/20"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Clapperboard className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-foreground">
            {teamMember?.name || 'VOVV Director'}
          </p>
          <p className="text-sm text-muted-foreground">{directorMessage}</p>
        </div>
      </div>

      <div className="space-y-2">
        {shots.map((shot) => {
          const status = shotStatuses.find(s => s.shot_index === shot.shot_index);
          const isFailed = status?.status === 'failed';
          return (
            <div key={shot.shot_index} className="relative">
              <ShotCard
                shot={shot}
                isGenerating={status?.status === 'processing'}
                isComplete={status?.status === 'complete'}
                resultUrl={status?.result_url}
              />
              {isFailed && onRetryShot && (
                <div className="absolute top-2 right-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5 h-7 text-xs"
                    onClick={() => onRetryShot(shot.shot_index)}
                  >
                    <RotateCw className="h-3 w-3" />
                    Retry
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
