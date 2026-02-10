import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Image as ImageIcon, AlertCircle } from 'lucide-react';
import type { Product, Template, AspectRatio, ImageQuality } from '@/types';
import { getTemplateImage } from './TemplatePreviewCard';
import { categoryLabels } from '@/data/mockData';

interface GenerateConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
  template: Template | null;
  sourceImageIds: Set<string>;
  imageCount: number;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  creditsRemaining: number;
  onBuyCredits?: () => void;
}

export function GenerateConfirmModal({
  open,
  onClose,
  onConfirm,
  product,
  template,
  sourceImageIds,
  imageCount,
  aspectRatio,
  quality,
  creditsRemaining,
  onBuyCredits,
}: GenerateConfirmModalProps) {
  if (!product || !template) return null;

  const creditsPerImage = quality === 'high' ? 10 : 4;
  const totalCredits = imageCount * creditsPerImage;
  const hasEnoughCredits = creditsRemaining >= totalCredits;
  
  const selectedSourceImages = product?.images.filter(img => sourceImageIds.has(img.id)) || [];
  const templateImage = getTemplateImage(template.templateId);

  const aspectRatioLabels: Record<AspectRatio, string> = {
    '1:1': 'Square (1:1)',
    '4:5': 'Portrait (4:5)',
    '9:16': 'Story (9:16)',
    '16:9': 'Wide (16:9)',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Generation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Product */}
            <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 space-y-3">
              <p className="text-sm font-semibold">Generating for</p>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                  <img src={selectedSourceImages[0]?.url || product.images[0]?.url || '/placeholder.svg'} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-sm">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.vendor}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Source reference ({selectedSourceImages.length} image{selectedSourceImages.length !== 1 ? 's' : ''})</p>
                <div className="flex gap-1">
                  {selectedSourceImages.map(img => (
                    <div key={img.id} className="w-8 h-8 rounded overflow-hidden ring-1 ring-primary/50">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Template */}
            <div className="p-4 rounded-lg border border-border bg-muted/50 space-y-2">
              <p className="text-xs text-muted-foreground">Template</p>
              <div className="flex items-center gap-2">
                {templateImage ? (
                  <div className="w-10 h-10 rounded-md overflow-hidden">
                    <img src={templateImage} alt={template.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{categoryLabels[template.category]}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Settings summary */}
          <div className="space-y-2">
            <h3 className="font-semibold">Generation Settings</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{`${imageCount} images`}</Badge>
              <Badge variant="secondary">{aspectRatioLabels[aspectRatio]}</Badge>
              <Badge variant={quality === 'high' ? 'default' : 'secondary'}>
                {quality === 'high' ? 'High Quality' : 'Standard Quality'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Credit cost */}
          <div className="p-4 rounded-lg bg-muted border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <div>
                <p className="font-semibold">Credit Cost</p>
                <p className="text-sm text-muted-foreground">{creditsPerImage} credit × {imageCount} images</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{totalCredits} credits</p>
              <p className="text-sm text-muted-foreground">{creditsRemaining - totalCredits} remaining after</p>
            </div>
          </div>

          {!hasEnoughCredits && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p>You don't have enough credits. You need {totalCredits} credits but only have {creditsRemaining}.</p>
                {onBuyCredits && <Button size="sm" onClick={onBuyCredits}>Buy Credits</Button>}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Go Back</Button>
          <Button onClick={onConfirm} disabled={!hasEnoughCredits}>Generate {imageCount} Images</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
