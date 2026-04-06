import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Coins, Package, Layers, AlertTriangle, Pencil, Paintbrush, User, Shirt } from 'lucide-react';
import { ALL_SCENES } from './sceneData';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { UserProduct, DetailSettings } from './types';

interface Step4Props {
  selectedProducts: UserProduct[];
  selectedSceneIds: Set<string>;
  details: DetailSettings;
  balance: number;
  onEditStep?: (step: number) => void;
}

const AESTHETIC_LABELS: Record<string, string> = {
  'auto': 'Auto', 'warm-neutral': 'Warm neutrals', 'cool-neutral': 'Cool neutrals',
  'monochrome': 'Soft monochrome', 'brand-led': 'Brand-led',
  'pure-white': 'Pure white', 'soft-white': 'Soft white', 'light-grey': 'Light grey',
  'warm-beige': 'Warm beige', 'taupe': 'Taupe', 'stone': 'Stone',
  'minimal-studio': 'Minimal studio', 'stone-plaster': 'Stone / plaster',
  'warm-wood': 'Warm wood', 'fabric': 'Fabric', 'glossy': 'Glossy',
  'soft-diffused': 'Soft diffused', 'warm-editorial': 'Warm editorial',
  'crisp-studio': 'Crisp studio', 'natural-daylight': 'Natural daylight', 'side-lit': 'Side-lit',
  'none': 'None', 'soft': 'Soft', 'natural': 'Natural', 'defined': 'Defined',
  'minimal-luxury': 'Minimal luxury', 'clean-commercial': 'Clean commercial',
  'fashion-editorial': 'Fashion editorial', 'beauty-clean': 'Beauty clean',
  'organic-natural': 'Organic natural', 'modern-sleek': 'Modern sleek',
  'product-accent': 'Product accent', 'brand-accent': 'Brand accent',
  'subtle': 'Subtle', 'strong': 'Strong',
  'auto-balance': 'Auto-balance', 'anchor-first': 'Anchor first', 'manual': 'Manual',
  'strict': 'Strict',
};

function friendlyLabel(val: string | undefined): string {
  if (!val) return '';
  return AESTHETIC_LABELS[val] || val.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function ProductImagesStep4Review({ selectedProducts, selectedSceneIds, details, balance, onEditStep }: Step4Props) {
  const selectedScenes = ALL_SCENES.filter(s => selectedSceneIds.has(s.id));
  const imageCount = parseInt(details.imageCount || '1', 10);
  const totalImages = selectedProducts.length * selectedScenes.length * imageCount;
  const quality = details.quality || 'high';
  const costPerImage = quality === 'standard' ? 3 : 6;
  const totalCredits = totalImages * costPerImage;
  const canAfford = balance >= totalCredits;
  const isLargeBatch = totalImages > 20;

  const aestheticEntries: { label: string; value: string }[] = [];
  if (details.backgroundTone) aestheticEntries.push({ label: 'Color world', value: friendlyLabel(details.backgroundTone) });
  if (details.negativeSpace) aestheticEntries.push({ label: 'Background', value: friendlyLabel(details.negativeSpace) });
  if (details.surfaceType) aestheticEntries.push({ label: 'Surface', value: friendlyLabel(details.surfaceType) });
  if (details.lightingStyle) aestheticEntries.push({ label: 'Lighting', value: friendlyLabel(details.lightingStyle) });
  if (details.shadowStyle) aestheticEntries.push({ label: 'Shadow', value: friendlyLabel(details.shadowStyle) });
  if (details.mood) aestheticEntries.push({ label: 'Style', value: friendlyLabel(details.mood) });
  if (details.brandingVisibility) aestheticEntries.push({ label: 'Accent', value: friendlyLabel(details.brandingVisibility) });
  if (details.consistency) aestheticEntries.push({ label: 'Consistency', value: friendlyLabel(details.consistency) });

  const personEntries: { label: string; value: string }[] = [];
  if (details.selectedModelId) {
    // When a model is selected, person detail fields are ignored by the prompt builder
    personEntries.push({ label: 'Model', value: 'Selected' });
  } else {
    if (details.presentation) personEntries.push({ label: 'Presentation', value: friendlyLabel(details.presentation) });
    if (details.ageRange) personEntries.push({ label: 'Age', value: details.ageRange });
    if (details.skinTone) personEntries.push({ label: 'Skin', value: friendlyLabel(details.skinTone) });
  }

  // Outfit summary entries
  const outfitEntries: { label: string; value: string }[] = [];
  if (details.outfitConfig) {
    const oc = details.outfitConfig;
    if (oc.top) outfitEntries.push({ label: 'Top', value: [oc.top.fit, oc.top.color, oc.top.material, oc.top.garment].filter(Boolean).join(' ') });
    if (oc.bottom) outfitEntries.push({ label: 'Bottom', value: [oc.bottom.fit, oc.bottom.color, oc.bottom.material, oc.bottom.garment].filter(Boolean).join(' ') });
    if (oc.shoes) outfitEntries.push({ label: 'Shoes', value: [oc.shoes.fit, oc.shoes.color, oc.shoes.material, oc.shoes.garment].filter(Boolean).join(' ') });
    if (oc.accessories) outfitEntries.push({ label: 'Accessories', value: oc.accessories });
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Review your generation plan</h2>
        <p className="text-sm text-muted-foreground mt-1">Confirm your selections before generating.</p>
      </div>

      {isLargeBatch && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Large batch — {totalImages} images</p>
              <p className="text-xs text-muted-foreground mt-0.5">Generation may take several minutes. You can leave this page and find results in your library.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Products */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">{selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}</span>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(1)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {selectedProducts.slice(0, 12).map(p => (
                <div key={p.id} className="space-y-1">
                  <div className="aspect-square rounded-lg overflow-hidden bg-white border border-border/40 p-1">
                    <ShimmerImage
                      src={p.image_url}
                      alt={p.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{p.title}</p>
                </div>
              ))}
              {selectedProducts.length > 12 && (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{selectedProducts.length - 12}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scenes */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">{selectedScenes.length} Scene{selectedScenes.length !== 1 ? 's' : ''}</span>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(2)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedScenes.slice(0, 12).map(s => (
                <Badge key={s.id} variant="outline" className="text-[10px]">{s.title}</Badge>
              ))}
              {selectedScenes.length > 12 && (
                <Badge variant="secondary" className="text-[10px]">+{selectedScenes.length - 12} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Credits */}
        <Card className={!canAfford ? 'border-destructive/50' : 'border-primary/30'}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Credits</span>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(3)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium">{details.aspectRatio || '1:1'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Quality</span>
                <span className="font-medium">{quality === 'high' ? 'Pro' : 'Standard'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Images per scene</span>
                <span className="font-medium">{imageCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total images</span>
                <span className="font-medium">{totalImages}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Cost per image</span>
                <span className="font-medium">{costPerImage} credits</span>
              </div>
              <Separator className="my-1.5" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total cost</span>
                <span className={canAfford ? 'text-primary' : 'text-destructive'}>{totalCredits} credits</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Your balance</span>
                <span>{balance} credits</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aesthetic summary */}
      {aestheticEntries.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Paintbrush className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-semibold">Aesthetic settings</p>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(3)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {aestheticEntries.map(e => (
                <Badge key={e.label} variant="secondary" className="text-[10px]">
                  {e.label}: {e.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Person styling summary */}
      {personEntries.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-semibold">Person styling</p>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(3)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {personEntries.map(e => (
                <Badge key={e.label} variant="secondary" className="text-[10px]">
                  {e.label}: {e.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outfit summary */}
      {outfitEntries.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shirt className="w-3.5 h-3.5 text-primary" />
                <p className="text-xs font-semibold">Locked outfit</p>
              </div>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(3)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {outfitEntries.map(e => (
                <Badge key={e.label} variant="secondary" className="text-[10px]">
                  {e.label}: {e.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom note */}
      {details.customNote && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold">Custom note</p>
              {onEditStep && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground" onClick={() => onEditStep(3)}>
                  <Pencil className="w-3 h-3" />Edit
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{details.customNote}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProductImagesStep4Review;
