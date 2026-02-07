import { Pause, Play, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { BulkGenerationState, BulkQueueItem } from '@/types/bulk';

interface BulkProgressTrackerProps {
  state: BulkGenerationState;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

function getStatusIcon(status: BulkQueueItem['status']) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-primary" />;
    case 'failed':
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    case 'generating':
    case 'converting':
      return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    default:
      return null;
  }
}

function getStatusLabel(status: BulkQueueItem['status']) {
  switch (status) {
    case 'pending': return 'Waiting...';
    case 'converting': return 'Preparing image...';
    case 'generating': return 'Generating...';
    case 'completed': return 'Done';
    case 'failed': return 'Failed';
  }
}

export function BulkProgressTracker({ state, onPause, onResume, onCancel }: BulkProgressTrackerProps) {
  const completedCount = state.queue.filter(q => q.status === 'completed').length;
  const failedCount = state.queue.filter(q => q.status === 'failed').length;
  const totalCount = state.queue.length;
  const overallProgress = Math.round(((completedCount + failedCount) / totalCount) * 100);

  const isRunning = state.status === 'running';
  const isPaused = state.status === 'paused';

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Bulk Generation Progress</h2>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} products completed
              {failedCount > 0 && ` • ${failedCount} failed`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isRunning && (
              <Button size="sm" variant="outline" onClick={onPause}>
                <Pause className="w-4 h-4 mr-1" /> Pause
              </Button>
            )}
            {isPaused && (
              <Button size="sm" onClick={onResume}>
                <Play className="w-4 h-4 mr-1" /> Resume
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        </div>

        {/* Overall progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Overall progress</span>
            <span className="text-sm font-semibold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{state.status === 'running' ? 'Running' : state.status === 'paused' ? 'Paused' : 'Processing'}</Badge>
          {state.config.mode === 'virtual-try-on' && <Badge variant="outline">Virtual Try-On</Badge>}
          <Badge variant="outline">{state.config.imageCount} images/product</Badge>
        </div>

        {/* Queue */}
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {state.queue.map((item, index) => {
            const isCurrent = state.currentIndex === index && isRunning;
            return (
              <div
                key={item.productId}
                className={`p-3 rounded-lg border transition-all ${
                  isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                } ${item.status === 'completed' ? 'bg-slate-50/50' : ''} ${item.status === 'failed' ? 'bg-red-50/50' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                      {item.product.images[0] ? (
                        <img src={item.product.images[0].url} alt={item.product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate">{item.product.title}</p>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(item.status)}
                        <span className="text-xs text-muted-foreground">{getStatusLabel(item.status)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {(item.status === 'generating' || item.status === 'converting') && (
                      <div className="w-24">
                        <Progress value={item.progress} className="h-1.5" />
                      </div>
                    )}
                    {item.status === 'completed' && item.results && (
                      <Badge className="bg-primary/10 text-primary">{item.results.length} images</Badge>
                    )}
                    {item.status === 'failed' && (
                      <Badge variant="destructive">Error</Badge>
                    )}
                  </div>
                </div>
                {item.status === 'failed' && item.error && (
                  <p className="text-xs text-destructive mt-1">{item.error}</p>
                )}
                {item.status === 'completed' && item.results && item.results.length > 0 && (
                  <div className="mt-2 flex gap-1 overflow-x-auto">
                    {item.results.slice(0, 4).map((imgUrl, imgIndex) => (
                      <div key={String(imgIndex)} className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <img src={imgUrl} alt={`Generated ${imgIndex + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {item.results.length > 4 && (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0 text-xs">
                        +{item.results.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
