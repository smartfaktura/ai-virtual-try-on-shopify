import React from 'react';
import { CheckCircle2, Loader2, XCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

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

export function BulkProgressBanner({ items, isComplete }: BulkProgressBannerProps) {
  const navigate = useNavigate();
  const completed = items.filter(i => i.status === 'complete').length;
  const failed = items.filter(i => i.status === 'failed').length;
  const total = items.length;
  const pct = total > 0 ? Math.round(((completed + failed) / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {isComplete ? 'Batch complete' : `Generating ${completed + failed}/${total} videos`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isComplete
              ? `${completed} completed${failed > 0 ? `, ${failed} failed` : ''}`
              : 'Each video is queued and processed individually'}
          </p>
        </div>
        {isComplete && (
          <Button onClick={() => navigate('/app/video-hub')} className="gap-2">
            View in Video Hub
          </Button>
        )}
      </div>

      <Progress value={pct} className="h-2" />

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'relative aspect-square rounded-md overflow-hidden border',
              item.status === 'complete' ? 'border-primary/40' :
              item.status === 'failed' ? 'border-destructive/40' :
              item.status === 'generating' ? 'border-primary/20' :
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
    </div>
  );
}
