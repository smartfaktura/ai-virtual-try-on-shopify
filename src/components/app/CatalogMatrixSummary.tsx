import { Package, Users, Move, Image, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CatalogMatrixSummaryProps {
  productCount: number;
  modelCount: number;
  poseCount: number;
  backgroundCount: number;
}

const CREDITS_PER_IMAGE = 4;

export function CatalogMatrixSummary({ productCount, modelCount, poseCount, backgroundCount }: CatalogMatrixSummaryProps) {
  const effectivePoses = Math.max(poseCount, 1);
  const effectiveBackgrounds = Math.max(backgroundCount, 1);
  const totalImages = productCount * Math.max(modelCount, 1) * effectivePoses * effectiveBackgrounds;
  const totalCredits = totalImages * CREDITS_PER_IMAGE;

  if (productCount === 0 && modelCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-2xl">
      <div className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3 text-sm">
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
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold">{totalImages} images</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              <span>{totalCredits} credits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DimensionChip({ icon: Icon, count, label }: { icon: any; count: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <Badge variant={count > 0 ? 'default' : 'secondary'} className="text-xs px-1.5 py-0">
        {count}
      </Badge>
      <span className="text-xs text-muted-foreground hidden sm:inline">{label}</span>
    </div>
  );
}
