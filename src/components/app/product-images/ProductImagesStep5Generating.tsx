import { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Clock, AlertTriangle, Loader2, Camera, Info, Sparkles } from 'lucide-react';
import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { UserProduct } from './types';

const BRANDED_MESSAGES = [
  { member: 'Sophia', message: 'Dialing in studio lighting for your product…' },
  { member: 'Kenji', message: 'Finding the best camera angle for this scene…' },
  { member: 'Amara', message: 'Balancing highlights and shadows…' },
  { member: 'Luna', message: 'Polishing every detail to pixel perfection…' },
  { member: 'Sienna', message: 'Making sure this matches your brand look…' },
  { member: 'Leo', message: 'Constructing the perfect background…' },
  { member: 'Omar', message: 'Fine-tuning contrast for maximum impact…' },
  { member: 'Zara', message: 'Styling the final frame — almost there…' },
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
  const [msgVisible, setMsgVisible] = useState(true);
  const [startTime] = useState(() => Date.now());
  const pendingIndex = useRef(msgIndex);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgVisible(false);
      pendingIndex.current = (pendingIndex.current + 1) % BRANDED_MESSAGES.length;
      setTimeout(() => {
        setMsgIndex(pendingIndex.current);
        setMsgVisible(true);
      }, 400);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const effectiveTotal = expectedJobCount > 0 ? expectedJobCount : totalJobs;
  const isQueuing = expectedJobCount > 0 && enqueuedJobs < expectedJobCount;
  const failedCount = failedJobIds?.size || 0;
  const completedOk = completedJobs - failedCount;

  const pct = effectiveTotal > 0 ? Math.round((completedJobs / effectiveTotal) * 100) : 0;

  const estimatePerImage = 8;
  const totalEstSeconds = Math.max(effectiveTotal * estimatePerImage, 1);
  const timeFloor = Math.min((elapsed / totalEstSeconds) * 15, 15);
  const displayPct = isQueuing
    ? Math.max(2, Math.round((enqueuedJobs / Math.max(expectedJobCount, 1)) * 10))
    : Math.max(Math.round(Math.max(timeFloor, 2)), pct);

  const phase: 'queuing' | 'generating' | 'finishing' =
    isQueuing ? 'queuing' : pct >= 80 ? 'finishing' : 'generating';

  const showSlowWarning = elapsed >= 180 && completedJobs < effectiveTotal;
  const nearComplete = effectiveTotal > 0 && completedOk >= Math.ceil(effectiveTotal * 0.9);
  const halfComplete = effectiveTotal > 0 && completedOk >= Math.ceil(effectiveTotal * 0.5);
  const showCancelButton = (elapsed >= 30 && halfComplete && completedJobs < effectiveTotal) || (elapsed >= 60 && completedJobs < effectiveTotal);

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

  const currentMsg = BRANDED_MESSAGES[msgIndex];
  const member = TEAM_MEMBERS.find(m => m.name === currentMsg.member);

  const lowMin = Math.max(1, Math.ceil((effectiveTotal * 10) / 60));
  const highMin = Math.max(lowMin, Math.ceil((effectiveTotal * 15) / 60));
  const bottomCopy = effectiveTotal <= 1
    ? 'Usually under a minute. Safe to leave — results appear in your library'
    : lowMin === highMin
      ? `About ${lowMin} minute${lowMin !== 1 ? 's' : ''} for your batch. Safe to leave — results appear in your library`
      : `About ${lowMin}–${highMin} minutes for your batch. Safe to leave — results appear in your library`;

  return (
    <div className="flex items-center justify-center px-4 py-10 sm:py-16 lg:py-20">
      <div className="w-full max-w-md sm:max-w-lg rounded-2xl border border-border bg-background p-6 sm:p-10 lg:p-12 space-y-6 sm:space-y-8">

        {/* Phase icon */}
        <div className="flex justify-center">
          {phase === 'finishing' ? (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Camera className="w-6 h-6 text-foreground animate-pulse" />
            </div>
          )}
        </div>

        {/* Phase headline */}
        <div className="text-center space-y-1.5">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
            {phase === 'queuing' && 'Setting up your scenes'}
            {phase === 'generating' && 'Generating your visuals'}
            {phase === 'finishing' && 'Finishing touches'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isQueuing
              ? `Queuing scene ${enqueuedJobs} of ${expectedJobCount}`
              : `${completedOk} of ${effectiveTotal} image${effectiveTotal !== 1 ? 's' : ''} completed`}
            {productCount > 1 && !isQueuing && ` across ${productCount} products`}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={displayPct} className="h-2.5" />
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1.5 text-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono">{formatElapsed(elapsed)}</span>
            </div>
            <span className="font-medium text-foreground">{displayPct}%</span>
          </div>
        </div>

        {/* Team message bubble */}
        {member && (
          <div
            className="transition-all duration-300"
            style={{
              opacity: msgVisible ? 1 : 0,
              transform: msgVisible ? 'translateY(0)' : 'translateY(4px)',
            }}
          >
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

        {/* Per-product progress */}
        {productStatuses && productStatuses.length > 1 && (
          <div className="space-y-2">
            {productStatuses.map((ps, i) => {
              const productPct = ps.total > 0 ? Math.round((ps.done / ps.total) * 100) : 0;
              return (
                <div key={i} className="bg-muted/30 rounded-lg px-3.5 py-2.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    {ps.done >= ps.total ? (
                      ps.failed > 0
                        ? <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                        : <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    ) : (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="truncate flex-1 text-foreground font-medium">{ps.name}</span>
                    <span className="text-muted-foreground whitespace-nowrap">{ps.done}/{ps.total}</span>
                  </div>
                  <Progress value={productPct} className="h-1" />
                </div>
              );
            })}
          </div>
        )}

        {/* Slow warning */}
        {showSlowWarning && (
          <div className="flex items-center gap-2 text-xs text-amber-500 font-medium bg-amber-500/5 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Taking longer than expected — still working on it</span>
          </div>
        )}

        {/* Failed jobs summary */}
        {failedCount > 0 && completedJobs >= effectiveTotal && (
          <p className="text-xs text-destructive font-medium text-center">
            {failedCount} image{failedCount !== 1 ? 's' : ''} failed to generate. Credits have been refunded
          </p>
        )}

        {/* View results button */}
        {showCancelButton && onViewResults && (
          <div className="flex justify-center">
            <Button
              variant={nearComplete ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={onViewResults}
            >
              {nearComplete
                ? `View ${completedOk} completed result${completedOk !== 1 ? 's' : ''}`
                : 'Skip waiting & view results so far'}
            </Button>
          </div>
        )}

        {/* Bottom info */}
        <div className="flex items-start gap-2 justify-center text-center">
          <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground max-w-sm">
            {bottomCopy}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductImagesStep5Generating;
