import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { UserProduct } from './types';

const BRANDED_MESSAGES = [
  { member: 'Sophia', message: 'Setting up your scene lighting...' },
  { member: 'Kenji', message: 'Composing the perfect angle...' },
  { member: 'Amara', message: 'Adjusting the exposure and color balance...' },
  { member: 'Luna', message: 'Refining details and textures...' },
  { member: 'Sienna', message: 'Applying your brand style...' },
  { member: 'Leo', message: 'Building the background environment...' },
  { member: 'Omar', message: 'Optimizing for visual impact...' },
  { member: 'Zara', message: 'Styling the final composition...' },
];

interface Step5Props {
  totalJobs: number;
  completedJobs: number;
  productCount: number;
  products?: UserProduct[];
  jobMap?: Map<string, string>;
  completedJobIds?: Set<string>;
  failedJobIds?: Set<string>;
  enqueuedJobs?: number;
  expectedJobCount?: number;
  onViewResults?: () => void;
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function ProductImagesStep5Generating({
  totalJobs,
  completedJobs,
  productCount,
  products = [],
  jobMap,
  completedJobIds,
  failedJobIds,
  enqueuedJobs = 0,
  expectedJobCount = 0,
  onViewResults,
}: Step5Props) {
  const [elapsed, setElapsed] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [startTime] = useState(() => Date.now());

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Rotating branded message
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % BRANDED_MESSAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const effectiveTotal = expectedJobCount > 0 ? expectedJobCount : totalJobs;
  const isQueuing = expectedJobCount > 0 && enqueuedJobs < expectedJobCount;
  const failedCount = failedJobIds?.size || 0;
  const completedOk = completedJobs - failedCount;

  // Progress calculation
  const pct = effectiveTotal > 0
    ? Math.round((completedJobs / effectiveTotal) * 100)
    : 0;

  // Time-based floor so progress never sits at 0%
  const estimatePerImage = 8;
  const totalEstSeconds = Math.max(effectiveTotal * estimatePerImage, 1);
  const timeFloor = Math.min((elapsed / totalEstSeconds) * 15, 15);
  const displayPct = isQueuing
    ? Math.max(2, Math.round((enqueuedJobs / Math.max(expectedJobCount, 1)) * 10))
    : Math.max(Math.round(Math.max(timeFloor, 2)), pct);

  // Phase determination
  const phase: 'queuing' | 'generating' | 'finishing' =
    isQueuing ? 'queuing' :
    pct >= 80 ? 'finishing' : 'generating';

  // Overtime warnings
  const showSlowWarning = elapsed >= 180 && completedJobs < effectiveTotal;
  const showCancelButton = elapsed >= 60 && completedJobs < effectiveTotal;

  // Per-product status
  const productStatuses = products.length > 0 && jobMap && jobMap.size > 0
    ? products.map(p => {
        const productJobIds: string[] = [];
        for (const [key, jobId] of jobMap.entries()) {
          if (key.startsWith(p.id + '_')) productJobIds.push(jobId);
        }
        const total = productJobIds.length;
        const done = productJobIds.filter(id => completedJobIds?.has(id) || failedJobIds?.has(id)).length;
        const failed = productJobIds.filter(id => failedJobIds?.has(id)).length;
        return { name: p.title, total, done, failed };
      })
    : null;

  // Current branded message
  const currentMsg = BRANDED_MESSAGES[msgIndex];
  const member = TEAM_MEMBERS.find(m => m.name === currentMsg.member);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-8">
      {/* Animated loader */}
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>

      {/* Phase headline */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          {phase === 'queuing' && 'Setting up your scenes...'}
          {phase === 'generating' && 'Generating your visuals'}
          {phase === 'finishing' && 'Finishing touches...'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isQueuing
            ? `Queuing scene ${enqueuedJobs} of ${expectedJobCount}...`
            : `${completedOk} of ${effectiveTotal} image${effectiveTotal !== 1 ? 's' : ''} completed`
          }
          {productCount > 1 && !isQueuing && ` across ${productCount} products`}
        </p>
      </div>

      {/* Progress card */}
      <Card className="w-full max-w-md">
        <CardContent className="p-5 space-y-3">
          <Progress value={displayPct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{formatElapsed(elapsed)}</span>
            </div>
            <span>{displayPct}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Per-product progress rows */}
      {productStatuses && productStatuses.length > 1 && (
        <Card className="w-full max-w-md">
          <CardContent className="p-4 space-y-1.5">
            {productStatuses.map((ps, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {ps.done >= ps.total ? (
                  ps.failed > 0
                    ? <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                    : <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground flex-shrink-0" />
                )}
                <span className="truncate flex-1 text-foreground">{ps.name}</span>
                <span className="text-muted-foreground whitespace-nowrap">{ps.done}/{ps.total}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Branded rotating team message */}
      {member && (
        <div className="flex items-center gap-2.5 pl-0.5 transition-opacity duration-500">
          <Avatar className="w-7 h-7 border border-border">
            <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
            <AvatarFallback className="text-[10px]">{member.name[0]}</AvatarFallback>
          </Avatar>
          <p className="text-xs text-muted-foreground italic">
            {currentMsg.message}
          </p>
        </div>
      )}

      {/* Slow warning */}
      {showSlowWarning && (
        <div className="flex items-center gap-2 text-xs text-amber-500 font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Taking longer than expected — still working on it…</span>
        </div>
      )}

      {/* Failed jobs summary */}
      {failedCount > 0 && completedJobs >= effectiveTotal && (
        <p className="text-xs text-destructive font-medium">
          {failedCount} image{failedCount !== 1 ? 's' : ''} failed to generate. Credits have been refunded.
        </p>
      )}

      {/* Cancel & view results button */}
      {showCancelButton && onViewResults && (
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={onViewResults}>
          Skip waiting & view results so far
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center max-w-sm">
        This usually takes 30–90 seconds per image. You can leave this page — results will appear in your library.
      </p>
    </div>
  );
}

export default ProductImagesStep5Generating;
