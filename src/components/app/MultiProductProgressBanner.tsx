import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, Loader2, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TEAM_MEMBERS } from '@/data/teamData';
import type { QueueJob } from '@/hooks/useGenerationQueue';
import { QueuePositionIndicator } from './QueuePositionIndicator';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface Product {
  id: string;
  title: string;
  images?: { url: string }[];
}

interface MultiProductProgressBannerProps {
  productQueue: Product[];
  multiProductResults: Map<string, { images: string[]; labels: string[] }>;
  multiProductJobIds: Map<string, string>;
  generatingProgress: number;
  activeJob?: QueueJob | null;
  onCancel?: () => void;
  totalExpectedImages?: number;
  totalJobs?: number;
  workflowName?: string;
  /** True for try-on or high-quality jobs that take 60-120s per image */
  isProModel?: boolean;
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function MultiProductProgressBanner({
  productQueue,
  multiProductResults,
  multiProductJobIds,
  generatingProgress,
  activeJob,
  onCancel,
  totalExpectedImages,
  totalJobs,
  workflowName,
  isProModel = false,
}: MultiProductProgressBannerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [teamIndex, setTeamIndex] = useState(0);
  const [startTime] = useState(() => Date.now());

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Rotating team member
  useEffect(() => {
    const interval = setInterval(() => {
      setTeamIndex(prev => (prev + 1) % TEAM_MEMBERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const totalProducts = productQueue.length;
  const rawCompleted = multiProductResults.size;
  const totalJobCount = totalJobs || multiProductJobIds.size;
  const totalImages = totalExpectedImages || totalJobCount;
  const completedCount = Math.min(rawCompleted, totalImages);
  const estimatePerImage = isProModel ? 45 : 8;
  const totalEstSeconds = Math.max(totalImages * estimatePerImage, 1);
  const estLowSec = Math.round(totalEstSeconds * 0.7);
  const estHighSec = Math.round(totalEstSeconds * 1.3);
  const useSeconds = estHighSec < 60;
  const estLow = useSeconds ? estLowSec : Math.max(1, Math.ceil(estLowSec / 60));
  const estHigh = useSeconds ? estHighSec : Math.max(estLow, Math.ceil(estHighSec / 60));
  const estUnit = useSeconds ? 'sec' : 'min';

  const ratio = elapsed / totalEstSeconds;
  // Only show overtime messages after at least 30 seconds have passed
  const overtimeMsg = elapsed < 30 ? null
    : ratio >= 2
      ? 'Almost there — high-quality results take a little extra time…'
      : ratio >= 1.3
        ? 'Taking a bit longer than usual — still working on it…'
        : null;

  const currentMember = TEAM_MEMBERS[teamIndex];

  return (
    <div className="w-full max-w-md space-y-3">
      {/* Header with counts and elapsed */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {totalImages === 0
            ? 'Preparing batch…'
            : completedCount > 0
              ? `${completedCount} of ${totalImages} image${totalImages !== 1 ? 's' : ''} done`
              : workflowName
                ? `Generating ${totalImages} image${totalImages !== 1 ? 's' : ''} for ${workflowName}...`
                : totalProducts > 1
                  ? `Generating ${totalImages} image${totalImages !== 1 ? 's' : ''} for ${totalProducts} products`
                  : `Generating ${totalImages} image${totalImages !== 1 ? 's' : ''}...`}
        </span>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono text-xs">{formatElapsed(elapsed)}</span>
        </div>
      </div>

      {/* Progress bar — apply time-based floor so it never shows 0% */}
      {(() => {
        const timeFloor = Math.min((elapsed / Math.max(totalEstSeconds, 1)) * 15, 15);
        const displayProgress = Math.max(generatingProgress, Math.round(Math.max(timeFloor, 2)));
        return (
          <>
            <Progress value={displayProgress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{totalImages > 0 ? `Est. ~${estLow === estHigh ? estLow : `${estLow}-${estHigh}`} ${estUnit} for ${totalImages} image${totalImages !== 1 ? 's' : ''}` : 'Calculating estimate…'}</span>
              <span>{displayProgress}%</span>
            </div>
          </>
        );
      })()}

      {/* Overtime message */}
      {overtimeMsg && (
        <p className="text-xs text-amber-500 font-medium">{overtimeMsg}</p>
      )}

      {/* Product chips (only for multi-product mode) */}
      {totalProducts > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {productQueue.map((p) => {
            const thumb = p.images?.[0]?.url;
            const isDone = multiProductResults.has(p.id);
            const isProcessing = multiProductJobIds.has(p.id) && !isDone;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] transition-all ${
                  isDone ? 'border-primary/30 bg-primary/5' :
                  isProcessing ? 'border-primary bg-primary/10 ring-1 ring-primary/30' :
                  'border-border bg-muted/30 opacity-60'
                }`}
              >
                {thumb ? (
                  <img src={thumb} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-muted flex-shrink-0" />
                )}
                <span className="truncate max-w-[120px]">{p.title}</span>
                {isDone && <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />}
                {isProcessing && !isDone && <Loader2 className="w-3 h-3 text-primary animate-spin flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Active job indicator — only show QueuePositionIndicator when entire batch is complete */}
      {activeJob && completedCount >= totalJobCount && (
        <QueuePositionIndicator job={activeJob} onCancel={onCancel} />
      )}

      {/* Rotating team message — show during active generation */}
      {completedCount < totalJobCount && (
        <div className="flex items-center gap-2.5 pl-0.5 transition-opacity duration-500">
          <Avatar className="w-6 h-6 border border-border">
            <AvatarImage src={getOptimizedUrl(currentMember.avatar, { quality: 60 })} alt={currentMember.name} />
            <AvatarFallback className="text-[10px]">{currentMember.name[0]}</AvatarFallback>
          </Avatar>
          <p className="text-xs text-muted-foreground italic">
            {currentMember.name} is {currentMember.statusMessage.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
}
