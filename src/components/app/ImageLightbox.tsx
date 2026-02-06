import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, RefreshCw } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onSelect?: (index: number) => void;
  onRegenerate?: (index: number) => void;
  onDownload?: (index: number) => void;
  selectedIndices?: Set<number>;
  productName?: string;
}

export function ImageLightbox({
  images,
  currentIndex,
  open,
  onClose,
  onNavigate,
  onSelect,
  onRegenerate,
  onDownload,
  selectedIndices = new Set(),
  productName,
}: ImageLightboxProps) {
  const currentImage = images[currentIndex];
  const isSelected = selectedIndices.has(currentIndex);

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onNavigate(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  };

  const modalTitle = productName 
    ? `Image ${currentIndex + 1} of ${images.length} • ${productName}`
    : `Image ${currentIndex + 1} of ${images.length}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4" tabIndex={0} onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') handlePrevious();
          if (e.key === 'ArrowRight') handleNext();
        }}>
          {/* Main image with navigation */}
          <div className="relative">
            {images.length > 1 && (
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center justify-center min-h-[400px] bg-muted rounded-lg overflow-hidden">
              <img src={currentImage} alt={`Generated image ${currentIndex + 1}`} className="max-w-full max-h-[60vh] object-contain" />
            </div>

            {images.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 justify-center overflow-x-auto py-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate(idx)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === currentIndex
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border hover:border-muted-foreground'
                  } ${selectedIndices.has(idx) ? 'ring-2 ring-primary' : ''}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-2">
            {onSelect && (
              <Button variant={isSelected ? 'default' : 'outline'} onClick={() => onSelect(currentIndex)}>
                {isSelected ? '✓ Selected' : 'Select for Download'}
              </Button>
            )}
            {onDownload && (
              <Button variant="outline" onClick={() => onDownload(currentIndex)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            {onRegenerate && (
              <Button variant="ghost" onClick={() => onRegenerate(currentIndex)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
