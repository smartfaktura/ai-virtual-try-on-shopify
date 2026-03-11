import { Plus, ArrowRight } from 'lucide-react';
import type { Product, ModelProfile, TryOnPose, ScratchUpload, ModelGender } from '@/types';
import { Card } from '@/components/ui/card';

interface TryOnPreviewProps {
  product?: Product | null;
  scratchUpload?: ScratchUpload | null;
  model: ModelProfile | null;
  pose: TryOnPose | null;
  poses?: TryOnPose[];
  creditCost?: number;
  selectedGender?: ModelGender;
  products?: Product[];
}

export function TryOnPreview({ product, scratchUpload, model, pose, poses, creditCost = 0, selectedGender, products }: TryOnPreviewProps) {
  const allPoses = poses && poses.length > 0 ? poses : pose ? [pose] : [];
  const firstPose = allPoses[0] || null;
  const poseImage = selectedGender === 'male' && firstPose?.previewUrlMale ? firstPose.previewUrlMale : firstPose?.previewUrl;
  const productImageUrl = product?.images[0]?.url || scratchUpload?.previewUrl;
  const productTitle = product?.title || scratchUpload?.productInfo.title || '';
  const hasProduct = !!(product || scratchUpload);
  const isMultiProduct = products && products.length > 1;
  const isMultiScene = allPoses.length > 1;
  const hasAllSelections = hasProduct && model && allPoses.length > 0;

  const description = hasAllSelections
    ? isMultiProduct
      ? `${model.name} wearing ${products.length} products in ${allPoses.length} scene${allPoses.length > 1 ? 's' : ''}`
      : isMultiScene
        ? `${model.name} wearing ${productTitle} in ${allPoses.length} scenes`
        : `${model.name} in ${firstPose!.name} wearing ${productTitle}`
    : 'Complete your selections to see preview';

  return (
    <Card className="p-3 sm:p-4 bg-gradient-to-br from-muted/30 to-muted/50 border-2 border-dashed border-border">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">Preview</h3>
          {creditCost > 0 && <span className="px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-primary/10 text-primary">{creditCost} credits</span>}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {isMultiProduct ? (
            <MultiProductThumbs products={products} />
          ) : (
            <Thumb image={productImageUrl} label="Product" active={hasProduct} />
          )}
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center"><Plus className="w-3 h-3 text-muted-foreground" /></div>
          <Thumb image={model?.previewUrl} label="Model" active={!!model} round />
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center"><Plus className="w-3 h-3 text-muted-foreground" /></div>
          <Thumb image={poseImage} label="Scene" active={!!pose} />
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
          <StatusPill label="Product" completed={hasProduct} count={isMultiProduct ? products.length : undefined} />
          <StatusPill label="Model" completed={!!model} />
          <StatusPill label="Scene" completed={!!pose} />
        </div>
      </div>
    </Card>
  );
}

function MultiProductThumbs({ products }: { products: Product[] }) {
  const visibleCount = Math.min(products.length, 3);
  const remaining = products.length - visibleCount;

  return (
    <div className="relative flex items-center">
      <div className="flex gap-1.5">
        {products.slice(0, visibleCount).map((p) => (
          <div
            key={p.id}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 border-primary bg-card flex-shrink-0"
          >
            {p.images[0]?.url ? (
              <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-[8px] text-muted-foreground">No img</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-primary text-primary-foreground">
          +{remaining}
        </span>
      )}
      <span className="ml-2 text-[10px] sm:text-xs font-medium text-primary">{products.length} products</span>
    </div>
  );
}

function Thumb({ image, label, active, round }: { image?: string; label: string; active: boolean; round?: boolean }) {
  return (
    <div className={`w-14 h-14 sm:w-20 sm:h-20 ${round ? 'rounded-full' : 'rounded-lg sm:rounded-xl'} overflow-hidden border-2 flex-shrink-0 ${active ? 'border-primary bg-card' : 'border-dashed border-muted-foreground/30 bg-muted'}`}>
      {image ? <img src={image} alt={label} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-[8px] sm:text-[10px] text-muted-foreground text-center px-1">{label}</span></div>}
    </div>
  );
}

function StatusPill({ label, completed, count }: { label: string; completed: boolean; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${completed ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
      <span className={`text-xs ${completed ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
        {label}{count && count > 1 ? ` (${count})` : ''}
      </span>
    </div>
  );
}
