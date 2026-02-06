import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import type { Product, ProductImage } from '@/types';

type PublishMode = 'add' | 'replace';

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (mode: PublishMode, variantId?: string) => void;
  selectedImages: string[];
  product: Product | null;
  existingImages: ProductImage[];
}

export function PublishModal({
  open,
  onClose,
  onPublish,
  selectedImages,
  product,
  existingImages,
}: PublishModalProps) {
  const [publishMode, setPublishMode] = useState<PublishMode>('add');
  const [selectedVariant, setSelectedVariant] = useState<string>('all');
  const [replaceConfirmation, setReplaceConfirmation] = useState('');

  useEffect(() => {
    if (!open || publishMode !== 'replace') {
      setReplaceConfirmation('');
    }
  }, [open, publishMode]);

  const canPublish = publishMode === 'add' || 
    (publishMode === 'replace' && (existingImages.length === 0 || replaceConfirmation === 'REPLACE'));

  const handlePublish = () => {
    if (!canPublish) return;
    onPublish(publishMode, selectedVariant === 'all' ? undefined : selectedVariant);
  };

  const resultingImageCount = publishMode === 'add'
    ? existingImages.length + selectedImages.length
    : selectedImages.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Download {selectedImages.length} Image{selectedImages.length > 1 ? 's' : ''}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* Product Identity */}
          {product && (
            <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                <img src={product.images[0]?.url || '/placeholder.svg'} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Downloading for</p>
                <p className="font-bold">{product.title}</p>
                <p className="text-sm text-muted-foreground">by {product.vendor}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Selected images preview */}
          <div className="space-y-2">
            <h3 className="font-semibold">Selected Images</h3>
            <div className="flex gap-2 flex-wrap">
              {selectedImages.slice(0, 6).map((img, idx) => (
                <div key={idx} className="w-14 h-14 rounded-lg overflow-hidden border border-border">
                  <img src={img} alt={`Selected ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {selectedImages.length > 6 && (
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-sm font-semibold">+{selectedImages.length - 6}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Mode selection */}
          <div className="space-y-3">
            <h3 className="font-semibold">Download mode</h3>
            <div className="space-y-2">
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  publishMode === 'add' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => setPublishMode('add')}
              >
                <p className="font-semibold">Download individually</p>
                <p className="text-sm text-muted-foreground">Download each image as a separate file.</p>
              </div>
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  publishMode === 'replace' ? 'border-destructive bg-destructive/5' : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => setPublishMode('replace')}
              >
                <div className="flex items-center gap-2">
                  <p className="font-semibold">Replace all existing images</p>
                  {existingImages.length > 0 && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                </div>
                <p className="text-sm text-muted-foreground">Remove current images and use only the new ones.</p>
              </div>
            </div>

            {publishMode === 'replace' && existingImages.length > 0 && (
              <div className="p-4 rounded-lg border-2 border-destructive bg-destructive/5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <p className="font-semibold text-destructive">⚠️ Danger Zone</p>
                </div>
                <p className="text-sm">This will <strong>permanently delete all {existingImages.length} current product images</strong>.</p>
                <div className="space-y-1.5">
                  <Label htmlFor="replace-confirm">Type "REPLACE" to confirm</Label>
                  <Input
                    id="replace-confirm"
                    value={replaceConfirmation}
                    onChange={(e) => setReplaceConfirmation(e.target.value)}
                    placeholder="REPLACE"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Variant assignment */}
          <div className="space-y-1.5">
            <Label>Assign to variant (optional)</Label>
            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All variants</SelectItem>
                <SelectItem value="variant_1">Size: Small</SelectItem>
                <SelectItem value="variant_2">Size: Medium</SelectItem>
                <SelectItem value="variant_3">Size: Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <Alert variant={publishMode === 'replace' ? 'destructive' : 'default'}>
            <AlertDescription>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs font-semibold">Current</p>
                  <p className="text-lg font-bold">{existingImages.length}</p>
                </div>
                <span className="text-2xl self-center">→</span>
                <div>
                  <p className="text-xs font-semibold">After</p>
                  <p className="text-lg font-bold">{resultingImageCount}</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePublish} disabled={!canPublish}>Download to "{product?.title}"</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
