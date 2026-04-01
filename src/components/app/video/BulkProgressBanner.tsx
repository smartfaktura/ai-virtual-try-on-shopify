import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Loader2, XCircle, Clock, Images } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { TEAM_MEMBERS } from '@/data/teamData';
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

const SECONDS_PER_QUEUE = 15;

export function BulkProgressBanner({ items, isComplete }: BulkProgressBannerProps) {
  const navigate = useNavigate();
  const completed = items.filter(i => i.status === 'complete').length;
  const failed = items.filter(i => i.status === 'failed').length;
  const total = items.length;
  const done = completed + failed;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Elapsed timer
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isComplete) return;
    startRef.current = Date.now();
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [isComplete]);

  // Rotating team member
  const [memberIdx, setMemberIdx] = useState(0);
  useEffect(() => {
    if (isComplete) return;
    const iv = setInterval(() => setMemberIdx(p => (p + 1) % TEAM_MEMBERS.length), 4000);
    return () => clearInterval(iv);
  }, [isComplete]);

  const member = TEAM_MEMBERS[memberIdx];
  const remaining = Math.max(0, (total - done) * SECONDS_PER_QUEUE - (elapsed % SECONDS_PER_QUEUE));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card shadow-sm p-8 space-y-6">
        {/* Branded header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {isComplete ? (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            ) : (
              <>
                <img
                  src={getOptimizedUrl(member.avatar, { quality: 60 })}
                  alt={member.name}
                  className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover transition-all duration-700"
                />
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <Loader2 className="h-2.5 w-2.5 animate-spin text-primary-foreground" />
                </div>
              </>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">VOVV.AI Studio</p>
            <h2 className="text-lg font-semibold text-foreground">
              {isComplete
                ? 'Batch complete'
                : `Queueing ${done + 1} of ${total} videos…`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isComplete
                ? `${completed} queued successfully${failed > 0 ? `, ${failed} failed` : ''} — they'll process automatically`
                : member.statusMessage}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={isComplete ? 100 : Math.max(pct, 5)} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{done}/{total} videos queued</span>
            {!isComplete && elapsed > 0 && (
              <span>{elapsed}s elapsed · ~{remaining}s remaining</span>
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
            <Button onClick={() => navigate('/app/video-hub')} className="gap-2">
              <Images className="h-4 w-4" />
              View in Video Hub
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
