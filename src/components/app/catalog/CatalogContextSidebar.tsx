import { Badge } from '@/components/ui/badge';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getFashionStyle, getBackground } from '@/lib/catalogEngine';
import { Package, Palette, Users, Image, Camera, Gem, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FashionStyleId, CatalogShotId } from '@/types/catalog';

interface SidebarProduct {
  id: string;
  title: string;
  image_url: string;
}

interface SidebarModel {
  modelId: string;
  name: string;
  previewUrl?: string;
}

interface CatalogContextSidebarProps {
  selectedProducts: SidebarProduct[];
  fashionStyleId: FashionStyleId | null;
  models: SidebarModel[];
  productOnlyMode: boolean;
  backgroundId: string | null;
  selectedShots: Set<CatalogShotId>;
  selectedPropCount: number;
  totalCombos: number;
  totalImages: number;
  totalCredits: number;
  currentStep: number;
  balance?: number;
}

export function CatalogContextSidebar({
  selectedProducts, fashionStyleId, models, productOnlyMode,
  backgroundId, selectedShots, selectedPropCount, totalCombos, totalImages, totalCredits, currentStep, balance,
}: CatalogContextSidebarProps) {
  const style = fashionStyleId ? getFashionStyle(fashionStyleId) : null;
  const bg = backgroundId ? getBackground(backgroundId) : null;

  return (
    <div className="sticky top-24 space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">STUDIO SETUP</h4>
          <Badge variant="secondary" className="text-[9px]">Step {currentStep}/7</Badge>
        </div>

        {/* Products */}
        <SidebarRow icon={Package} label="Products" done={selectedProducts.length > 0}>
          {selectedProducts.length > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1.5">
                {selectedProducts.slice(0, 2).map(p => (
                  <div key={p.id} className="w-6 h-6 rounded border border-card overflow-hidden bg-muted">
                    <ShimmerImage src={getOptimizedUrl(p.image_url, { quality: 30 })} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              {selectedProducts.length > 2 && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-5 font-semibold">+{selectedProducts.length - 2}</Badge>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">Not selected</span>
          )}
        </SidebarRow>

        {/* Style */}
        <SidebarRow icon={Palette} label="Style" done={!!style}>
          {style ? (
            <span className="text-[10px] text-foreground font-medium">{style.label}</span>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">Not selected</span>
          )}
        </SidebarRow>

        {/* Models */}
        <SidebarRow icon={Users} label="Models" done={models.length > 0 || productOnlyMode}>
          {productOnlyMode ? (
            <span className="text-[10px] text-foreground font-medium">Product Only</span>
          ) : models.length > 0 ? (
          <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                {models.slice(0, 2).map(m => (
                  <div key={m.modelId} className="w-5 h-5 rounded-full border border-card overflow-hidden bg-muted">
                    {m.previewUrl ? (
                      <ShimmerImage src={getOptimizedUrl(m.previewUrl, { quality: 30 })} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                ))}
              </div>
              {models.length > 2 && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-5 font-semibold">+{models.length - 2}</Badge>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">Not selected</span>
          )}
        </SidebarRow>

        {/* Background */}
        <SidebarRow icon={Image} label="Background" done={!!bg}>
          {bg ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded border border-border" style={{ backgroundColor: bg.hex }} />
              <span className="text-[10px] text-foreground font-medium">{bg.label}</span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">Not selected</span>
          )}
        </SidebarRow>

        {/* Shots */}
        <SidebarRow icon={Camera} label="Shots" done={selectedShots.size > 0}>
          {selectedShots.size > 0 ? (
            <span className="text-[10px] text-foreground font-medium">{selectedShots.size} shot{selectedShots.size !== 1 ? 's' : ''}</span>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">Not selected</span>
          )}
        </SidebarRow>

        {/* Props */}
        <SidebarRow icon={Gem} label="Props" done={selectedPropCount > 0}>
          {selectedPropCount > 0 ? (
            <span className="text-[10px] text-foreground font-medium">{selectedPropCount}/{totalCombos} shots</span>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">None</span>
          )}
        </SidebarRow>
      </div>

      {/* Credit estimate */}
      {totalImages > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Estimate</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-foreground tracking-tight">{totalCredits}</span>
            <span className="text-[10px] text-muted-foreground">credits · {totalImages} images</span>
          </div>
          {balance !== undefined && (
            <p className={cn('text-[10px] font-medium', balance >= totalCredits ? 'text-primary' : 'text-destructive')}>
              {balance} credits available{balance < totalCredits ? ' — not enough' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SidebarRow({ icon: Icon, label, done, children }: {
  icon: any; label: string; done: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className={cn(
          'w-5 h-5 rounded flex items-center justify-center flex-shrink-0',
          done ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground/40',
        )}>
          <Icon className="w-3 h-3" />
        </div>
        <span className={cn(
          'text-[11px] font-medium',
          done ? 'text-foreground' : 'text-muted-foreground/50',
        )}>{label}</span>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}
