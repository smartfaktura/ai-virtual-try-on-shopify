import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Camera, Sparkles, Info, Mic2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const BRANDED_MESSAGES = [
  { member: 'Sophia', message: 'Locking the camera for a clean talking-head shot…' },
  { member: 'Luna',   message: 'Shaping the voice to match the script rhythm…' },
  { member: 'Kenji',  message: 'Choreographing natural blinks and breathing…' },
  { member: 'Leo',    message: 'Aligning lip movement frame-by-frame…' },
  { member: 'Amara',  message: 'Polishing skin and lighting for camera…' },
  { member: 'Zara',   message: 'Adding final warmth to the voiceover…' },
];

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

interface Props {
  /** Approximate target seconds — talking pipeline = base video + lip-sync. */
  estimatedSeconds?: number;
  status: 'queued' | 'processing' | 'complete' | 'failed';
  videoUrl?: string | null;
  errorMessage?: string | null;
  thumbnailUrl?: string | null;
  onGoToHub: () => void;
  onReset: () => void;
  /** Optional: start another video while this one keeps generating in background. */
  onStartAnother?: () => void;
}

export function TalkingVideoGenerating({
  estimatedSeconds = 5 * 60,
  status,
  videoUrl,
  errorMessage,
  thumbnailUrl,
  onGoToHub,
  onReset,
  onStartAnother,
}: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (status === 'complete' || status === 'failed') return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [status, startTime]);

  useEffect(() => {
    if (status !== 'processing' && status !== 'queued') return;
    const t = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % BRANDED_MESSAGES.length);
        setMsgVisible(true);
      }, 350);
    }, 6000);
    return () => clearInterval(t);
  }, [status]);

  const pct = status === 'complete'
    ? 100
    : Math.min(95, Math.max(3, Math.round((elapsed / estimatedSeconds) * 100)));

  const phase: 'queuing' | 'generating' | 'finishing' =
    status === 'queued' ? 'queuing' : pct >= 80 ? 'finishing' : 'generating';

  const showSlow = elapsed >= estimatedSeconds && status === 'processing';

  const currentMsg = BRANDED_MESSAGES[msgIndex];
  const member = TEAM_MEMBERS.find(m => m.name === currentMsg.member);

  // === COMPLETE ===
  if (status === 'complete' && videoUrl) {
    return (
      <div className="flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 sm:p-8 space-y-5">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Your talking video is ready</h2>
            <p className="text-sm text-muted-foreground">Preview, download, or generate another</p>
          </div>
          <video
            src={videoUrl}
            controls
            playsInline
            className="w-full rounded-xl border border-border bg-black aspect-[9/16] object-contain"
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onReset}>Generate another</Button>
            <Button className="flex-1" onClick={onGoToHub}>Open Video Hub</Button>
          </div>
        </div>
      </div>
    );
  }

  // === FAILED ===
  if (status === 'failed') {
    return (
      <div className="flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 sm:p-8 space-y-5">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Generation failed</h2>
            <p className="text-sm text-muted-foreground">
              {errorMessage || 'Something went wrong. Your credits were refunded.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onGoToHub}>Video Hub</Button>
            <Button className="flex-1" onClick={onReset}>Try again</Button>
          </div>
        </div>
      </div>
    );
  }

  // === QUEUED / PROCESSING ===
  return (
    <div className="flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 sm:p-10 space-y-6">

        <div className="flex justify-center">
          {phase === 'finishing' ? (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              {phase === 'queuing'
                ? <Mic2 className="w-6 h-6 text-foreground animate-pulse" />
                : <Camera className="w-6 h-6 text-foreground animate-pulse" />}
            </div>
          )}
        </div>

        <div className="text-center space-y-1.5">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            {phase === 'queuing'   && 'Queueing your talking video'}
            {phase === 'generating' && 'Generating your talking video'}
            {phase === 'finishing' && 'Polishing the final cut'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Typically 4–6 minutes — base render then lip-sync
          </p>
        </div>

        {thumbnailUrl && (
          <div className="mx-auto w-32 aspect-[9/16] rounded-lg overflow-hidden border border-border bg-muted">
            <img src={thumbnailUrl} alt="Reference" className="w-full h-full object-cover opacity-90" />
          </div>
        )}

        <div className="space-y-2">
          <Progress value={pct} className="h-2.5" />
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1.5 text-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono">{formatElapsed(elapsed)}</span>
            </div>
            <span className="font-medium text-foreground">{pct}%</span>
          </div>
        </div>

        {member && (
          <div className="transition-all duration-300" style={{ opacity: msgVisible ? 1 : 0 }}>
            <div className="flex items-center gap-3 bg-muted/50 rounded-full px-4 py-2.5">
              <Avatar className="w-7 h-7 border border-border flex-shrink-0">
                <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
                <AvatarFallback className="text-[10px]">{member.name[0]}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-foreground">
                <span className="font-medium">{member.name}</span>
                <span className="text-muted-foreground"> — {currentMsg.message}</span>
              </p>
            </div>
          </div>
        )}

        {showSlow && (
          <div className="flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-2 text-[hsl(38,92%,50%)] bg-[hsl(38,92%,50%,0.05)]">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Taking longer than expected — still working on it</span>
          </div>
        )}

        <div className="flex items-start gap-2 text-center justify-center">
          <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground max-w-sm">
            Safe to leave this page — your video keeps generating and will appear in Video Hub
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
          {onStartAnother && (
            <Button variant="default" size="sm" onClick={onStartAnother} className="text-xs">
              Start another
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onGoToHub} className="text-xs">
            Go to Video Hub
          </Button>
        </div>
        {onStartAnother && (
          <p className="text-[11px] text-muted-foreground text-center">
            Your current video keeps generating in the background
          </p>
        )}
      </div>
    </div>
  );
}

export default TalkingVideoGenerating;
