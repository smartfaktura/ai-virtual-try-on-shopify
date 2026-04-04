import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { Coins, Package, Layers, AlertTriangle } from 'lucide-react';
import { ALL_SCENES } from './sceneData';
import type { UserProduct, DetailSettings } from './types';

interface Step4Props {
  selectedProducts: UserProduct[];
  selectedSceneIds: Set<string>;
  details: DetailSettings;
  creditsPerImage: number;
  balance: number;
}

export function ProductImagesStep4Review({ selectedProducts, selectedSceneIds, details, creditsPerImage, balance }: Step4Props) {
  const selectedScenes = ALL_SCENES.filter(s => selectedSceneIds.has(s.id));
  const imageCount = parseInt(details.imageCount || '1', 10);
  const totalImages = selectedProducts.length * selectedScenes.length * imageCount;
  const quality = details.quality || 'high';
  const costPerImage = quality === 'standard' ? 3 : 6;
  const totalCredits = totalImages * costPerImage;
  const canAfford = balance >= totalCredits;
  const isLargeBatch = totalImages > 20;

  const activeDetails = Object.entries(details).filter(([k, v]) => v && v !== '' && k !== 'aspectRatio' && k !== 'quality' && k !== 'imageCount');

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Review your generation plan</h2>
        <p className="text-sm text-muted-foreground mt-1">Confirm your selections before generating.</p>
      </div>

      {isLargeBatch && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Large batch — {totalImages} images</p>
              <p className="text-xs text-muted-foreground mt-0.5">Generation may take several minutes. You can leave this page and find results in your library.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Products */}
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

        {/* Scenes */}
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

        {/* Credits */}
        <Card className={!canAfford ? 'border-destructive/50' : 'border-primary/30'}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Credits</span>
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
    </div>
  );
}
