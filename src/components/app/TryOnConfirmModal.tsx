import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, User, AlertCircle, Info } from 'lucide-react';
import type { Product, AspectRatio, ModelProfile, TryOnPose } from '@/types';
import { poseCategoryLabels } from '@/data/mockData';

interface TryOnConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
  model: ModelProfile | null;
  pose: TryOnPose | null;
  imageCount: number;
  aspectRatio: AspectRatio;
  creditsRemaining: number;
  isLoading?: boolean;
  sourceImageUrl?: string;
  onBuyCredits?: () => void;
}

export function TryOnConfirmModal({
  open,
  onClose,
  onConfirm,
  product,
  model,
  pose,
  imageCount,
  aspectRatio,
  creditsRemaining,
  isLoading = false,
  sourceImageUrl,
  onBuyCredits,
}: TryOnConfirmModalProps) {
  if (!product || !model || !pose) return null;

  const displaySourceImage = sourceImageUrl || product.images[0]?.url || '/placeholder.svg';
  const creditsPerImage = 8;
  const totalCredits = imageCount * creditsPerImage;
  const hasEnoughCredits = creditsRemaining >= totalCredits;

  const aspectRatioLabels: Record<AspectRatio, string> = {
    '1:1': 'Square (1:1)',
    '4:5': 'Portrait (4:5)',
    '16:9': 'Wide (16:9)',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Virtual Try-On Generation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* Summary cards - 3 column */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border-2 border-primary bg-primary/5 space-y-2">
              <p className="text-xs font-semibold">Source</p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={displaySourceImage} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{product.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{product.vendor}</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/50 space-y-2">
              <p className="text-xs font-semibold">Model</p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img src={model.previewUrl} alt={model.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{model.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{model.ethnicity}</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/50 space-y-2">
              <p className="text-xs font-semibold">Pose</p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={pose.previewUrl} alt={pose.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{pose.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{poseCategoryLabels[pose.category]}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* What will be generated */}
          <div className="space-y-2">
            <h3 className="font-semibold">What You'll Get</h3>
            <div className="p-3 rounded-lg bg-muted border border-border space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">
                  AI-generated photos of <strong>{model.name}</strong> wearing your <strong>{product.title}</strong>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">The garment will be digitally placed on the model with realistic fabric draping</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{`${imageCount} images`}</Badge>
              <Badge variant="secondary">{aspectRatioLabels[aspectRatio]}</Badge>
              <Badge>High Quality</Badge>
            </div>
          </div>

          <Separator />

          {/* Credit cost */}
          <div className="p-4 rounded-lg bg-muted border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <div>
                <p className="font-semibold">Credit Cost</p>
                <p className="text-xs text-muted-foreground">{creditsPerImage} credits × {imageCount} images</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{totalCredits} credits</p>
              <p className="text-xs text-muted-foreground">{creditsRemaining - totalCredits} remaining after</p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Virtual Try-On uses advanced AI and typically takes 20-30 seconds to generate {imageCount} images.
            </AlertDescription>
          </Alert>

          {!hasEnoughCredits && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p>You need {totalCredits} credits but only have {creditsRemaining}.</p>
                {onBuyCredits && <Button size="sm" onClick={onBuyCredits}>Buy Credits</Button>}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Go Back</Button>
          <Button onClick={onConfirm} disabled={!hasEnoughCredits || isLoading}>
            {isLoading ? 'Generating...' : `Generate ${imageCount} Images`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
