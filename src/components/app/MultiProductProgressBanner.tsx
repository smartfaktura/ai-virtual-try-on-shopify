import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, Loader2, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TEAM_MEMBERS } from '@/data/teamData';
import type { QueueJob } from '@/hooks/useGenerationQueue';
import { QueuePositionIndicator } from './QueuePositionIndicator';

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
  const completedCount = multiProductResults.size;
  const estimatePerProduct = 90; // seconds for try-on / pro model
  const totalEstimate = totalProducts * estimatePerProduct;
  const estLowMin = Math.max(1, Math.ceil((totalEstimate * 0.7) / 60));
  const estHighMin = Math.ceil((totalEstimate * 1.3) / 60);

  const ratio = elapsed / totalEstimate;
  const overtimeMsg = ratio >= 2
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
          {completedCount} of {totalProducts} products complete
        </span>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono text-xs">{formatElapsed(elapsed)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={generatingProgress} className="h-2" />

      {/* Time estimate */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Est. ~{estLowMin}-{estHighMin} min for {totalProducts} product{totalProducts !== 1 ? 's' : ''}</span>
        <span>{generatingProgress}%</span>
      </div>

      {/* Overtime message */}
      {overtimeMsg && (
        <p className="text-xs text-amber-500 font-medium">{overtimeMsg}</p>
      )}

      {/* Product chips */}
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

      {/* Active job indicator with team avatar */}
      {activeJob && (
        <QueuePositionIndicator job={activeJob} onCancel={onCancel} />
      )}

      {/* Rotating team message (fallback when no activeJob) */}
      {!activeJob && (
        <div className="flex items-center gap-2.5 pl-0.5 transition-opacity duration-500">
          <Avatar className="w-6 h-6 border border-border">
            <AvatarImage src={currentMember.avatar} alt={currentMember.name} />
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
