import { Package, Users, Move, Image, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CatalogMatrixSummaryProps {
  productCount: number;
  modelCount: number;
  poseCount: number;
  backgroundCount: number;
  step: number;
  totalSteps: number;
  stepLabel: string;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

const CREDITS_PER_IMAGE = 4;

export function CatalogMatrixSummary({
  productCount, modelCount, poseCount, backgroundCount,
  step, totalSteps, stepLabel, onBack, onNext, canProceed,
}: CatalogMatrixSummaryProps) {
  const effectivePoses = Math.max(poseCount, 1);
  const effectiveBackgrounds = Math.max(backgroundCount, 1);
  const totalImages = productCount * Math.max(modelCount, 1) * effectivePoses * effectiveBackgrounds;
  const totalCredits = totalImages * CREDITS_PER_IMAGE;
  const isLastStep = step >= totalSteps;

  if (productCount === 0 && modelCount === 0) return null;

  return (
    <div className="fixed bottom-4 z-30 w-[calc(100%-2rem)] max-w-3xl" style={{ left: 'calc(var(--sidebar-width, 16rem) + (100% - var(--sidebar-width, 16rem)) / 2)', transform: 'translateX(-50%)' }}>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-xl">
        {/* Back button */}
        <Button variant="outline" size="sm" onClick={onBack} className="gap-1 shrink-0">
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </Button>

        {/* Center — dimensions summary */}
        <div className="flex items-center gap-2.5 text-sm min-w-0">
          <DimensionChip icon={Package} count={productCount} label="Products" />
          <span className="text-muted-foreground">×</span>
          <DimensionChip icon={Users} count={modelCount} label="Models" />
          {poseCount > 0 && (
            <>
              <span className="text-muted-foreground">×</span>
              <DimensionChip icon={Move} count={poseCount} label="Poses" />
            </>
          )}
          {backgroundCount > 0 && (
            <>
              <span className="text-muted-foreground">×</span>
              <DimensionChip icon={Image} count={backgroundCount} label="BGs" />
            </>
          )}
          <span className="text-muted-foreground mx-1">=</span>
          <div className="text-right shrink-0">
            <span className="text-sm font-semibold">{totalImages} img</span>
            <span className="text-xs text-muted-foreground ml-1.5">
              <Sparkles className="w-3 h-3 inline -mt-0.5" /> {totalCredits}
            </span>
          </div>
        </div>

        {/* Next button */}
        <Button size="sm" onClick={onNext} disabled={!canProceed} className="gap-1 shrink-0">
          {isLastStep ? 'Review' : `Next: ${stepLabel}`} <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function DimensionChip({ icon: Icon, count, label }: { icon: any; count: number; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <Badge variant={count > 0 ? 'default' : 'secondary'} className="text-xs px-1.5 py-0">
        {count}
      </Badge>
      <span className="text-xs text-muted-foreground hidden lg:inline">{label}</span>
    </div>
  );
}
