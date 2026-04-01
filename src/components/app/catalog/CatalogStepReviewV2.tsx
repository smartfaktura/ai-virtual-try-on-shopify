import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getFashionStyle, getBackground, getShotDefinition } from '@/lib/catalogEngine';
import { cn } from '@/lib/utils';
import { ChevronLeft, Sparkles, Loader2, Package, Users, Camera, Image, Palette, Ban } from 'lucide-react';
import type { Product, ModelProfile } from '@/types';
import type { FashionStyleId, CatalogShotId } from '@/types/catalog';

const CREDITS_PER_IMAGE = 4;

interface CatalogStepReviewV2Props {
  products: Product[];
  models: ModelProfile[];
  productOnlyMode: boolean;
  fashionStyleId: FashionStyleId | null;
  backgroundId: string | null;
  selectedShots: Set<CatalogShotId>;
  totalImages: number;
  totalCredits: number;
  balance: number;
  isGenerating: boolean;
  onBack: () => void;
  onGenerate: () => void;
  onOpenBuyModal: () => void;
}

export function CatalogStepReviewV2({
  products, models, productOnlyMode, fashionStyleId, backgroundId,
  selectedShots, totalImages, totalCredits, balance, isGenerating,
  onBack, onGenerate, onOpenBuyModal,
}: CatalogStepReviewV2Props) {
  const style = fashionStyleId ? getFashionStyle(fashionStyleId) : null;
  const bg = backgroundId ? getBackground(backgroundId) : null;
  const shots = useMemo(() => Array.from(selectedShots).map(id => getShotDefinition(id)).filter(Boolean), [selectedShots]);
  const hasEnoughCredits = balance >= totalCredits;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Review & Generate</h3>
        <p className="text-sm text-muted-foreground mt-1">Confirm your catalog settings before generating.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          icon={Package}
          label="Products"
          count={products.length}
          thumbnails={products.slice(0, 4).map(p => ({ src: p.images[0]?.url, name: p.title }))}
          overflow={products.length > 4 ? products.length - 4 : 0}
        />
        <SummaryCard
          icon={Users}
          label={productOnlyMode ? 'Product Only' : 'Models'}
          count={productOnlyMode ? 0 : models.length}
          thumbnails={productOnlyMode ? [] : models.slice(0, 4).map(m => ({ src: m.previewUrl, name: m.name }))}
          overflow={!productOnlyMode && models.length > 4 ? models.length - 4 : 0}
        />
        <div className="rounded-lg border border-border bg-card p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Style</span>
          </div>
          <p className="text-xs text-foreground font-medium">{style?.label || '—'}</p>
          {bg && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: bg.hex }} />
              <span className="text-[10px] text-muted-foreground font-mono">{bg.hex}</span>
            </div>
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Shots</span>
            <Badge variant="secondary" className="text-[9px] ml-auto">{shots.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {shots.map(s => (
              <span key={s!.id} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{s!.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Credit calculation */}
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="font-medium">{products.length} product{products.length !== 1 ? 's' : ''}</span>
          {!productOnlyMode && models.length > 0 && (
            <>
              <span className="text-muted-foreground">×</span>
              <span className="font-medium">{models.length} model{models.length !== 1 ? 's' : ''}</span>
            </>
          )}
          <span className="text-muted-foreground">×</span>
          <span className="font-medium">{shots.length} shot{shots.length !== 1 ? 's' : ''}</span>
          <span className="text-muted-foreground">×</span>
          <span className="font-medium">{CREDITS_PER_IMAGE} credits</span>
          <span className="text-muted-foreground">=</span>
          <span className="font-bold">{totalCredits} credits</span>
          <span className="text-muted-foreground text-xs">({totalImages} images)</span>
        </div>
        <div className={cn(
          'flex items-center justify-between rounded-lg p-3',
          hasEnoughCredits ? 'bg-card border border-border' : 'bg-destructive/5 border border-destructive/20',
        )}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{totalCredits} credits needed</span>
          </div>
          {hasEnoughCredits ? (
            <span className="text-xs text-muted-foreground">{balance} available</span>
          ) : (
            <button onClick={onOpenBuyModal} className="flex items-center gap-1 text-xs text-destructive font-semibold hover:underline">
              <Ban className="w-3 h-3" />
              {balance} available — need {totalCredits - balance} more
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
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
          {hasEnoughCredits ? `Generate ${totalImages} Images` : 'Buy Credits'}
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, count, thumbnails, overflow }: {
  icon: any;
  label: string;
  count: number;
  thumbnails: Array<{ src?: string; name: string }>;
  overflow: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium">{label}</span>
        {count > 0 && <Badge variant="secondary" className="ml-auto text-[9px]">{count}</Badge>}
      </div>
      {thumbnails.length > 0 && (
        <div className="flex gap-1">
          {thumbnails.map((t, i) => (
            <div key={i} className="w-7 h-7 rounded overflow-hidden bg-muted" title={t.name}>
              {t.src ? (
                <img src={getOptimizedUrl(t.src, { quality: 40 })} alt={t.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
            </div>
          ))}
          {overflow > 0 && (
            <div className="w-7 h-7 rounded bg-muted flex items-center justify-center text-[9px] text-muted-foreground font-medium">
              +{overflow}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
