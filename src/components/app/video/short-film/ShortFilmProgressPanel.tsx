import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, Clapperboard, XCircle, Clock, Info, Music } from 'lucide-react';
import { TEAM_MEMBERS } from '@/data/teamData';
import type { ShotPlanItem, AudioPhase } from '@/types/shortFilm';

interface ShotStatus {
  shot_index: number;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  result_url?: string;
}

interface ShortFilmProgressPanelProps {
  shots: ShotPlanItem[];
  shotStatuses: ShotStatus[];
  onRetryShot?: (shotIndex: number) => void;
  generationStartTime?: number;
  audioPhase?: AudioPhase;
  musicEnabled?: boolean;
}

const DIRECTOR_PHASES = [
  { min: 0, message: 'Preparing your cinematic vision...' },
  { min: 30, message: 'Building multi-shot sequence...' },
  { min: 90, message: 'Rendering and compositing shots...' },
  { min: 180, message: 'Applying transitions and polish...' },
  { min: 270, message: 'Almost there — final compositing...' },
];

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function ShortFilmProgressPanel({ shots, shotStatuses, onRetryShot, generationStartTime, audioPhase, musicEnabled }: ShortFilmProgressPanelProps) {
  const hasAnyFailed = shotStatuses.some(s => s.status === 'failed');
  const isProcessing = shotStatuses.some(s => s.status === 'processing');
  const videosDone = shotStatuses.length > 0 && shotStatuses.every(s => s.status === 'complete' || s.status === 'failed');

  // Unified "all done" — video done AND music done (if enabled)
  const musicDone = !musicEnabled || audioPhase === 'done';
  const allDone = videosDone && musicDone;
  const isMusicPhase = videosDone && !hasAnyFailed && musicEnabled && audioPhase !== 'done';

  const [elapsed, setElapsed] = useState(0);
  const startTime = generationStartTime || Date.now();

  useEffect(() => {
    if (allDone) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [allDone, startTime]);

  const teamMember = TEAM_MEMBERS[0];
  const totalDuration = shots.reduce((sum, s) => sum + (s.duration_sec || 3), 0);

  // Phase-based director message
  let directorMessage: string;
  if (allDone) {
    directorMessage = hasAnyFailed ? 'Film generation encountered issues' : 'Your short film is ready!';
  } else if (isMusicPhase) {
    directorMessage = 'Adding background music...';
  } else {
    directorMessage = DIRECTOR_PHASES.slice().reverse().find(p => elapsed >= p.min)?.message || DIRECTOR_PHASES[0].message;
  }

  // Realistic ETA: ~4-6 minutes for Kling multishot
  const etaMinSec = 240;
  const etaMaxSec = 360;

  return (
    <div className="space-y-5">
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
                : isMusicPhase
                  ? 'Adding Music'
                  : 'Generating Your Film'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {allDone
                ? (hasAnyFailed ? 'Something went wrong. You can retry.' : `${shots.length} shots · ${totalDuration}s combined video`)
                : isMusicPhase
                  ? 'Video is ready — generating background music track'
                  : `${shots.length} shots · ${totalDuration}s total duration`}
            </p>
          </div>
        </div>

        {!allDone && (
          <>
            <div className="relative h-2 rounded-full bg-muted overflow-hidden">
              <div className="absolute inset-0 bg-primary/60 animate-pulse rounded-full" />
            </div>

            {/* Elapsed time + ETA */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Elapsed: {formatElapsed(elapsed)}
              </span>
              <span>
                Estimated: {formatElapsed(etaMinSec)} – {formatElapsed(etaMaxSec)}
              </span>
            </div>
          </>
        )}
        {allDone && !hasAnyFailed && <Progress value={100} className="h-2" />}
      </div>

      {/* Director message */}
      {!allDone && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
          {isMusicPhase ? (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Music className="h-5 w-5 text-primary" />
            </div>
          ) : teamMember?.avatar ? (
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
              {isMusicPhase ? 'Music Producer' : (teamMember?.name || 'VOVV Director')}
            </p>
            <p className="text-sm text-muted-foreground">{directorMessage}</p>
          </div>
        </div>
      )}

      {/* Safe-to-close notice */}
      {!allDone && (
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
          <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            You can safely close this page — your film will keep rendering in the background. Come back anytime to check the result.
          </p>
        </div>
      )}

      {/* Storyboard reference with actual durations */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Storyboard · {totalDuration}s
        </p>
        <div className="grid gap-1.5">
          {shots.map((shot) => (
            <div key={shot.shot_index} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <span className="text-xs font-mono text-muted-foreground w-5">{shot.shot_index}</span>
              <span className="text-xs font-medium text-foreground">
                {shot.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
              <span className="text-[10px] text-muted-foreground">{shot.duration_sec}s</span>
              {shot.script_line && (
                <span className="text-[10px] text-muted-foreground/70 italic truncate ml-1 max-w-[200px]">
                  "{shot.script_line}"
                </span>
              )}
              <span className="ml-auto text-[10px] text-muted-foreground">
                {shot.scene_type.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
