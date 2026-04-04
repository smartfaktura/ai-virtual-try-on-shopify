import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { Sparkles, Coins, Package, Layers } from 'lucide-react';
import { ALL_SCENES } from './sceneData';
import type { UserProduct, DetailSettings } from './types';

interface Step4Props {
  selectedProducts: UserProduct[];
  selectedSceneIds: Set<string>;
  details: DetailSettings;
  creditsPerImage: number;
  balance: number;
  onGenerate: () => void;
  onBack: () => void;
  onOpenBuyCredits: () => void;
}

export function ProductImagesStep4Review({ selectedProducts, selectedSceneIds, details, creditsPerImage, balance, onGenerate, onBack, onOpenBuyCredits }: Step4Props) {
  const selectedScenes = ALL_SCENES.filter(s => selectedSceneIds.has(s.id));
  const totalImages = selectedProducts.length * selectedScenes.length;
  const totalCredits = totalImages * creditsPerImage;
  const canAfford = balance >= totalCredits;

  // Collect non-empty detail overrides for display
  const activeDetails = Object.entries(details).filter(([, v]) => v && v !== '');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Review your generation plan</h2>
        <p className="text-sm text-muted-foreground mt-1">Confirm your selections before generating.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Products summary */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">{selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedProducts.slice(0, 8).map(p => (
                <div key={p.id} className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                  <ShimmerImage src={getOptimizedUrl(p.image_url, { width: 80, quality: 60 })} alt={p.title} className="w-full h-full object-cover" />
                </div>
              ))}
              {selectedProducts.length > 8 && (
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{selectedProducts.length - 8}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scenes summary */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">{selectedScenes.length} Scene{selectedScenes.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedScenes.map(s => (
                <Badge key={s.id} variant="outline" className="text-[10px]">{s.title}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Credits summary */}
        <Card className={!canAfford ? 'border-destructive/50' : 'border-primary/30'}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Credits</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total images</span>
                <span className="font-medium">{totalImages}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Cost per image</span>
                <span className="font-medium">{creditsPerImage} credits</span>
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

      {/* Detail overrides */}
      {activeDetails.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold mb-2">Applied settings</p>
            <div className="flex flex-wrap gap-1.5">
              {activeDetails.map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-[10px]">
                  {key.replace(/([A-Z])/g, ' $1').trim()}: {String(value)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!canAfford && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-sm text-destructive">You need {totalCredits - balance} more credits to generate.</p>
            <Button variant="outline" size="sm" onClick={onOpenBuyCredits}>Buy Credits</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button size="lg" disabled={!canAfford} onClick={onGenerate} className="gap-2">
          <Sparkles className="w-4 h-4" />
          Generate {totalImages} image{totalImages !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
