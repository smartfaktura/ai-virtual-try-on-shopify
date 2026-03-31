import { useMemo } from 'react';
import { mockTryOnPoses } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, Sparkles, AlertCircle, Package, Users, Move, Image, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { Product, ModelProfile, TryOnPose } from '@/types';
import type { CatalogBatchState } from '@/hooks/useCatalogGenerate';

const CREDITS_PER_IMAGE = 6;

interface CatalogStepReviewProps {
  products: Product[];
  selectedProductIds: Set<string>;
  models: ModelProfile[];
  selectedModelIds: Set<string>;
  selectedPoseIds: Set<string>;
  selectedBackgroundIds: Set<string>;
  allPoses: TryOnPose[];
  balance: number;
  onBack: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  batchState: CatalogBatchState | null;
  onOpenBuyModal: () => void;
}

export function CatalogStepReview({
  products,
  selectedProductIds,
  models,
  selectedModelIds,
  selectedPoseIds,
  selectedBackgroundIds,
  allPoses,
  balance,
  onBack,
  onGenerate,
  isGenerating,
  batchState,
  onOpenBuyModal,
}: CatalogStepReviewProps) {
  const poseMap = useMemo(() => new Map(allPoses.map(p => [p.poseId, p])), [allPoses]);

  const selectedProducts = useMemo(() => products.filter(p => selectedProductIds.has(p.id)), [products, selectedProductIds]);
  const selectedModels = useMemo(() => models.filter(m => selectedModelIds.has(m.modelId)), [models, selectedModelIds]);
  const selectedPoses = useMemo(() => Array.from(selectedPoseIds).map(id => poseMap.get(id)).filter(Boolean) as TryOnPose[], [selectedPoseIds, poseMap]);
  const selectedBgs = useMemo(() => Array.from(selectedBackgroundIds).map(id => poseMap.get(id)).filter(Boolean) as TryOnPose[], [selectedBackgroundIds, poseMap]);

  const totalImages = selectedProducts.length * selectedModels.length * selectedPoses.length * Math.max(selectedBgs.length, 1);
  const totalCredits = totalImages * CREDITS_PER_IMAGE;
  const hasEnoughCredits = balance >= totalCredits;

  // If batch is active, show progress
  if (batchState) {
    const progress = batchState.totalJobs > 0
      ? Math.round(((batchState.completedJobs + batchState.failedJobs) / batchState.totalJobs) * 100)
      : 0;

    return (
      <div className="space-y-6">
        <div className="text-center space-y-3 py-8">
          {batchState.allDone ? (
            <>
              <CheckCircle className="w-12 h-12 mx-auto text-primary" />
              <h2 className="text-xl font-bold">Catalog Complete!</h2>
              <p className="text-muted-foreground">
                {batchState.completedJobs} of {batchState.totalJobs} images generated successfully
                {batchState.failedJobs > 0 && ` (${batchState.failedJobs} failed)`}
              </p>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
              <h2 className="text-xl font-bold">Generating Your Catalog...</h2>
              <p className="text-muted-foreground">
                {batchState.completedJobs} of {batchState.totalJobs} images complete
              </p>
            </>
          )}
        </div>

        <Progress value={progress} className="h-2" />

        {batchState.aggregatedImages.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Generated Images</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {batchState.aggregatedImages.map((url, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                  <ShimmerImage src={url} alt={`Generated ${i + 1}`} className="w-full h-full object-cover" aspectRatio="3/4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {batchState.failedJobs > 0 && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">
              {batchState.failedJobs} image{batchState.failedJobs > 1 ? 's' : ''} failed to generate. Credits for failed images are refunded automatically.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Review & Generate</h2>
        <p className="text-sm text-muted-foreground">
          Confirm your catalog configuration before generating
        </p>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={Package} label="Products" count={selectedProducts.length} items={selectedProducts.map(p => ({ name: p.title, imageUrl: p.images[0]?.url }))} />
        <SummaryCard icon={Users} label="Models" count={selectedModels.length} items={selectedModels.map(m => ({ name: m.name, imageUrl: m.previewUrl }))} />
        <SummaryCard icon={Move} label="Poses" count={selectedPoses.length} items={selectedPoses.map(p => ({ name: p.name, imageUrl: p.previewUrl }))} />
        <SummaryCard icon={Image} label="Backgrounds" count={selectedBgs.length} items={selectedBgs.map(b => ({ name: b.name, imageUrl: b.previewUrl }))} />
      </div>

      {/* Matrix calculation */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{selectedProducts.length}</span>
            <span className="text-muted-foreground">×</span>
            <span className="font-medium">{selectedModels.length}</span>
            <span className="text-muted-foreground">×</span>
            <span className="font-medium">{selectedPoses.length}</span>
            <span className="text-muted-foreground">×</span>
            <span className="font-medium">{Math.max(selectedBgs.length, 1)}</span>
            <span className="text-muted-foreground">=</span>
            <span className="font-bold text-lg">{totalImages}</span>
            <span className="text-muted-foreground">images</span>
          </div>
        </div>

        <div className={`flex items-center justify-between rounded-lg p-3 ${hasEnoughCredits ? 'bg-background' : 'bg-destructive/5 border border-destructive/20'}`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{totalCredits} credits needed</span>
            <span className="text-xs text-muted-foreground">({CREDITS_PER_IMAGE} per image)</span>
          </div>
          {hasEnoughCredits ? (
            <span className="text-sm text-muted-foreground">{balance} available</span>
          ) : (
            <button onClick={onOpenBuyModal} className="flex items-center gap-1 text-sm text-destructive font-semibold hover:underline">
              <AlertCircle className="w-3.5 h-3.5" />
              {balance} available — need {totalCredits - balance} more
            </button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={hasEnoughCredits ? onGenerate : onOpenBuyModal}
          disabled={isGenerating || totalImages === 0}
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {hasEnoughCredits
            ? `Generate ${totalImages} Images`
            : 'Buy Credits'}
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, count, items }: {
  icon: any;
  label: string;
  count: number;
  items: Array<{ name: string; imageUrl?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
        <Badge variant="secondary" className="ml-auto text-[10px]">{count}</Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.slice(0, 4).map((item, i) => (
          <div key={i} className="w-8 h-8 rounded-md overflow-hidden bg-muted" title={item.name}>
            {item.imageUrl ? (
              <img src={getOptimizedUrl(item.imageUrl, { quality: 40 })} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
        ))}
        {items.length > 4 && (
          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-medium">
            +{items.length - 4}
          </div>
        )}
      </div>
    </div>
  );
}
