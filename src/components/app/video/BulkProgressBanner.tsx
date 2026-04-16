import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Loader2, XCircle, Clock, Images } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { TEAM_MEMBERS, getStableStatusMessage } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';

export type BulkItemStatus = 'pending' | 'queued' | 'generating' | 'complete' | 'failed';

export interface BulkProgressItem {
  id: string;
  preview: string;
  status: BulkItemStatus;
}

interface BulkProgressBannerProps {
  items: BulkProgressItem[];
  isComplete: boolean;
}

const STATUS_ICON: Record<BulkItemStatus, React.ReactNode> = {
  pending: <Clock className="h-3 w-3 text-muted-foreground" />,
  queued: <Clock className="h-3 w-3 text-muted-foreground" />,
  generating: <Loader2 className="h-3 w-3 animate-spin text-primary" />,
  complete: <CheckCircle2 className="h-3 w-3 text-primary" />,
  failed: <XCircle className="h-3 w-3 text-destructive" />,
};

const SECONDS_PER_VIDEO = 90;

export function BulkProgressBanner({ items, isComplete }: BulkProgressBannerProps) {
  const navigate = useNavigate();
  const completed = items.filter(i => i.status === 'complete').length;
  const failed = items.filter(i => i.status === 'failed').length;
  const total = items.length;
  const done = completed + failed;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Phase detection: enqueuing vs processing
  const isEnqueuing = !isComplete && done < total;
  const isProcessing = isComplete; // all enqueued, now waiting for generation

  // Elapsed timer
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    startRef.current = Date.now();
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(iv);
  }, []);

  // Rotating team member
  const [memberIdx, setMemberIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setMemberIdx(p => (p + 1) % TEAM_MEMBERS.length), 4000);
    return () => clearInterval(iv);
  }, []);

  const member = TEAM_MEMBERS[memberIdx];

  // Time estimates
  const estimatedTotalSec = total * SECONDS_PER_VIDEO;
  const estimatedMin = Math.ceil(estimatedTotalSec / 60);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card shadow-sm p-8 space-y-6">
        {/* Branded header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={getOptimizedUrl(member.avatar, { quality: 60 })}
              alt={member.name}
              className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover transition-all duration-700"
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
              <Loader2 className="h-2.5 w-2.5 animate-spin text-primary-foreground" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">VOVV.AI Studio</p>
            <h2 className="text-lg font-semibold text-foreground">
              {isEnqueuing
                ? `Queueing ${done + 1} of ${total} videos…`
                : `${completed} of ${total} videos started generating`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEnqueuing
                ? getStableStatusMessage(member, memberIdx)
                : `Estimated time: ~${estimatedMin}m · Elapsed: ${formatTime(elapsed)}`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={isComplete ? 100 : Math.max(pct, 5)} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{done}/{total} videos queued</span>
            {elapsed > 0 && (
              <span>
                {formatTime(elapsed)} elapsed
                {!isComplete && ` · ~${estimatedMin}m estimated`}
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail grid */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'relative aspect-square rounded-md overflow-hidden border transition-colors',
                item.status === 'complete' ? 'border-primary/40' :
                item.status === 'failed' ? 'border-destructive/40' :
                item.status === 'generating' ? 'border-primary/20 ring-1 ring-primary/30' :
                'border-border'
              )}
            >
              <img src={item.preview} alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-0.5 right-0.5">
                {STATUS_ICON[item.status]}
              </div>
            </div>
          ))}
        </div>

        {/* CTA when complete */}
        {isComplete && (
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate('/app/video')} className="gap-2">
              <Images className="h-4 w-4" />
              View in Video Hub
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
