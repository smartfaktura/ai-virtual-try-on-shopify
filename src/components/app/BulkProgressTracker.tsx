import {
  BlockStack,
  InlineStack,
  Card,
  Text,
  Button,
  Badge,
  Thumbnail,
  Spinner,
} from '@shopify/polaris';
import { PlayIcon, XIcon, CheckCircleIcon, AlertCircleIcon, PauseCircleIcon } from '@shopify/polaris-icons';
import type { BulkGenerationState, BulkQueueItem } from '@/types/bulk';
import { Progress } from '@/components/ui/progress';

interface BulkProgressTrackerProps {
  state: BulkGenerationState;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

function getStatusIcon(status: BulkQueueItem['status']) {
  switch (status) {
    case 'completed':
      return <span className="text-emerald-600"><CheckCircleIcon /></span>;
    case 'failed':
      return <span className="text-destructive"><AlertCircleIcon /></span>;
    case 'generating':
    case 'converting':
      return <Spinner size="small" />;
    default:
      return null;
  }
}

function getStatusLabel(status: BulkQueueItem['status']) {
  switch (status) {
    case 'pending':
      return 'Waiting...';
    case 'converting':
      return 'Preparing image...';
    case 'generating':
      return 'Generating...';
    case 'completed':
      return 'Done';
    case 'failed':
      return 'Failed';
  }
}

export function BulkProgressTracker({
  state,
  onPause,
  onResume,
  onCancel,
}: BulkProgressTrackerProps) {
  const completedCount = state.queue.filter(q => q.status === 'completed').length;
  const failedCount = state.queue.filter(q => q.status === 'failed').length;
  const totalCount = state.queue.length;
  const overallProgress = Math.round(((completedCount + failedCount) / totalCount) * 100);

  const isRunning = state.status === 'running';
  const isPaused = state.status === 'paused';

  return (
    <Card>
      <BlockStack gap="500">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="100">
            <Text as="h2" variant="headingMd">Bulk Generation Progress</Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {completedCount}/{totalCount} products completed
              {failedCount > 0 && ` • ${failedCount} failed`}
            </Text>
          </BlockStack>
          
          <InlineStack gap="200">
            {isRunning && (
              <Button icon={PauseCircleIcon} onClick={onPause} size="slim">
                Pause
              </Button>
            )}
            {isPaused && (
              <Button icon={PlayIcon} onClick={onResume} size="slim" variant="primary">
                Resume
              </Button>
            )}
            <Button icon={XIcon} onClick={onCancel} size="slim" tone="critical">
              Cancel
            </Button>
          </InlineStack>
        </InlineStack>

        {/* Overall progress */}
        <BlockStack gap="200">
          <InlineStack align="space-between">
            <Text as="span" variant="bodySm">Overall progress</Text>
            <Text as="span" variant="bodySm" fontWeight="semibold">{overallProgress}%</Text>
          </InlineStack>
          <Progress value={overallProgress} className="h-2" />
        </BlockStack>

        {/* Status badges */}
        <InlineStack gap="200">
          <Badge tone="info">{state.status === 'running' ? 'Running' : state.status === 'paused' ? 'Paused' : 'Processing'}</Badge>
          {state.config.mode === 'virtual-try-on' && (
            <Badge>Virtual Try-On</Badge>
          )}
          <Badge>{state.config.imageCount} images/product</Badge>
        </InlineStack>

        {/* Queue items */}
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {state.queue.map((item, index) => {
            const isCurrent = state.currentIndex === index && isRunning;
            
            return (
              <div 
                key={item.productId}
                className={`
                  p-3 rounded-lg border transition-all
                  ${isCurrent ? 'border-primary bg-primary/5' : 'border-border'}
                  ${item.status === 'completed' ? 'bg-green-50/50' : ''}
                  ${item.status === 'failed' ? 'bg-red-50/50' : ''}
                `}
              >
                <InlineStack gap="300" align="space-between" blockAlign="center">
                  <InlineStack gap="300" blockAlign="center">
                    {/* Product thumbnail */}
                    <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                      {item.product.images[0] ? (
                        <img 
                          src={item.product.images[0].url} 
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Thumbnail source="" alt="" size="small" />
                        </div>
                      )}
                    </div>
                    
                    {/* Product info */}
                    <BlockStack gap="050">
                      <Text as="p" variant="bodySm" fontWeight="medium" truncate>
                        {item.product.title}
                      </Text>
                      <InlineStack gap="100" blockAlign="center">
                        {getStatusIcon(item.status)}
                        <Text as="span" variant="bodySm" tone="subdued">
                          {getStatusLabel(item.status)}
                        </Text>
                      </InlineStack>
                    </BlockStack>
                  </InlineStack>
                  
                  {/* Progress or results */}
                  <div className="flex-shrink-0">
                  {(item.status === 'generating' || item.status === 'converting') && (
                      <div className="w-24">
                        <Progress value={item.progress} className="h-1.5" />
                      </div>
                    )}
                    {item.status === 'completed' && item.results && (
                      <Badge tone="success">{String(item.results.length)} images</Badge>
                    )}
                    {item.status === 'failed' && (
                      <Badge tone="critical">Error</Badge>
                    )}
                  </div>
                </InlineStack>
                
                {/* Error message */}
                {item.status === 'failed' && item.error && (
                  <Text as="p" variant="bodySm" tone="critical">
                    {item.error}
                  </Text>
                )}
                
                {/* Generated image previews */}
                {item.status === 'completed' && item.results && item.results.length > 0 && (
                  <div className="mt-2 flex gap-1 overflow-x-auto">
                    {item.results.slice(0, 4).map((imgUrl, imgIndex) => (
                      <div key={String(imgIndex)} className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={imgUrl} 
                          alt={`Generated ${imgIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {item.results.length > 4 && (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <Text as="span" variant="bodySm">+{item.results.length - 4}</Text>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </BlockStack>
    </Card>
  );
}
