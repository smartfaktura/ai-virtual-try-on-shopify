import { Plus, ArrowRight } from 'lucide-react';
import type { Product, ModelProfile, TryOnPose, ScratchUpload } from '@/types';
import { Card } from '@/components/ui/card';

interface TryOnPreviewProps {
  product?: Product | null;
  scratchUpload?: ScratchUpload | null;
  model: ModelProfile | null;
  pose: TryOnPose | null;
  creditCost?: number;
}

export function TryOnPreview({ product, scratchUpload, model, pose, creditCost = 0 }: TryOnPreviewProps) {
  const productImageUrl = product?.images[0]?.url || scratchUpload?.previewUrl;
  const productTitle = product?.title || scratchUpload?.productInfo.title || '';
  const hasProduct = !!(product || scratchUpload);
  const hasAllSelections = hasProduct && model && pose;
  const description = hasAllSelections ? `${model.name} in ${pose.name} wearing ${productTitle}` : 'Complete your selections to see preview';

  return (
    <Card className="p-3 sm:p-4 bg-gradient-to-br from-muted/30 to-muted/50 border-2 border-dashed border-border">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">Preview</h3>
          {creditCost > 0 && <span className="px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-primary/10 text-primary">{creditCost} credits</span>}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Thumb image={productImageUrl} label="Product" active={hasProduct} />
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center"><Plus className="w-3 h-3 text-muted-foreground" /></div>
          <Thumb image={model?.previewUrl} label="Model" active={!!model} round />
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center"><Plus className="w-3 h-3 text-muted-foreground" /></div>
          <Thumb image={pose?.previewUrl} label="Pose" active={!!pose} />
          {hasAllSelections && (
            <>
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center"><ArrowRight className="w-3 h-3 text-primary" /></div>
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg border-2 border-primary bg-primary/5 flex items-center justify-center"><span className="text-[8px] sm:text-[10px] text-primary font-medium text-center px-1">AI Generated</span></div>
            </>
          )}
        </div>
        <div className="text-center">
          {hasAllSelections ? <p className="font-medium text-xs sm:text-sm">"{description}"</p> : <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex justify-center gap-3 sm:gap-4 pt-2 border-t border-border">
          <StatusPill label="Product" completed={hasProduct} />
          <StatusPill label="Model" completed={!!model} />
          <StatusPill label="Pose" completed={!!pose} />
        </div>
      </div>
    </Card>
  );
}

function Thumb({ image, label, active, round }: { image?: string; label: string; active: boolean; round?: boolean }) {
  return (
    <div className={`w-14 h-14 sm:w-20 sm:h-20 ${round ? 'rounded-full' : 'rounded-lg sm:rounded-xl'} overflow-hidden border-2 flex-shrink-0 ${active ? 'border-primary bg-card' : 'border-dashed border-muted-foreground/30 bg-muted'}`}>
      {image ? <img src={image} alt={label} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-[8px] sm:text-[10px] text-muted-foreground text-center px-1">{label}</span></div>}
    </div>
  );
}

function StatusPill({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${completed ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
      <span className={`text-xs ${completed ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
    </div>
  );
}
