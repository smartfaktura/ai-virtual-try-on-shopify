import { ShotCard } from './ShotCard';
import { Progress } from '@/components/ui/progress';
import type { ShotPlanItem } from '@/types/shortFilm';
import { Loader2, CheckCircle2, Clapperboard } from 'lucide-react';
import { TEAM_MEMBERS } from '@/data/teamData';

interface ShotStatus {
  shot_index: number;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  result_url?: string;
}

interface ShortFilmProgressPanelProps {
  shots: ShotPlanItem[];
  shotStatuses: ShotStatus[];
}

const DIRECTOR_MESSAGES = [
  'Setting up the first frame...',
  'Composing the hero shot...',
  'Capturing product details...',
  'Framing the closing scene...',
  'Adding final polish...',
  'Building cinematic motion...',
];

export function ShortFilmProgressPanel({ shots, shotStatuses }: ShortFilmProgressPanelProps) {
  const completedCount = shotStatuses.filter(s => s.status === 'complete').length;
  const currentIndex = shotStatuses.findIndex(s => s.status === 'processing');
  const progress = shots.length > 0 ? (completedCount / shots.length) * 100 : 0;
  const isAllDone = completedCount === shots.length && shots.length > 0;

  // Pick a team avatar for the "director" message
  const teamMember = TEAM_MEMBERS[Math.min(currentIndex >= 0 ? currentIndex : 0, TEAM_MEMBERS.length - 1)];
  const directorMessage = currentIndex >= 0
    ? DIRECTOR_MESSAGES[currentIndex % DIRECTOR_MESSAGES.length]
    : isAllDone
      ? 'Your short film is ready!'
      : 'Preparing your film...';

  return (
    <div className="space-y-6">
      {/* Progress header */}
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
            </p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Director message */}
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

      {/* Shot list */}
      <div className="space-y-2">
        {shots.map((shot) => {
          const status = shotStatuses.find(s => s.shot_index === shot.shot_index);
          return (
            <ShotCard
              key={shot.shot_index}
              shot={shot}
              isGenerating={status?.status === 'processing'}
              isComplete={status?.status === 'complete'}
              resultUrl={status?.result_url}
            />
          );
        })}
      </div>
    </div>
  );
}
