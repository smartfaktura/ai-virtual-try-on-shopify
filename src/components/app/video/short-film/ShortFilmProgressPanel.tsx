import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, Clapperboard, XCircle } from 'lucide-react';
import { TEAM_MEMBERS } from '@/data/teamData';
import type { ShotPlanItem } from '@/types/shortFilm';

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
  'Composing your cinematic vision...',
  'Rendering multi-shot sequence...',
  'Building smooth transitions...',
  'Adding final polish...',
];

export function ShortFilmProgressPanel({ shots, shotStatuses, onRetryShot }: ShortFilmProgressPanelProps) {
  const hasAnyComplete = shotStatuses.some(s => s.status === 'complete');
  const hasAnyFailed = shotStatuses.some(s => s.status === 'failed');
  const isProcessing = shotStatuses.some(s => s.status === 'processing');
  const allDone = shotStatuses.length > 0 && shotStatuses.every(s => s.status === 'complete' || s.status === 'failed');

  const teamMember = TEAM_MEMBERS[0];
  const msgIndex = Math.floor(Date.now() / 5000) % DIRECTOR_MESSAGES.length;

  const directorMessage = allDone
    ? (hasAnyFailed ? 'Film generation failed' : 'Your short film is ready!')
    : DIRECTOR_MESSAGES[msgIndex];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {allDone ? (
            hasAnyFailed ? (
              <XCircle className="h-6 w-6 text-destructive" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            )
          ) : (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              {allDone
                ? (hasAnyFailed ? 'Generation Failed' : 'Film Complete')
                : 'Generating Your Film'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {allDone
                ? (hasAnyFailed ? 'Something went wrong. You can retry.' : `${shots.length} shots · single combined video`)
                : `Rendering ${shots.length}-shot film as one seamless video...`}
            </p>
          </div>
        </div>
        {!allDone && (
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <div className="absolute inset-0 bg-primary/60 animate-pulse rounded-full" />
          </div>
        )}
        {allDone && !hasAnyFailed && <Progress value={100} className="h-2" />}
      </div>

      {!allDone && (
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
      )}

      {/* Storyboard reference */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Storyboard</p>
        <div className="grid gap-1.5">
          {shots.map((shot) => (
            <div key={shot.shot_index} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <span className="text-xs font-mono text-muted-foreground w-5">{shot.shot_index}</span>
              <span className="text-xs font-medium text-foreground">
                {shot.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto">{shot.duration_sec || 3}s</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
