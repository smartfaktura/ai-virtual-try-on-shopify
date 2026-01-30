import { Modal, BlockStack, InlineStack, Button, Text, Icon } from '@shopify/polaris';
import { ChevronLeftIcon, ChevronRightIcon, XIcon, ArrowDownIcon, RefreshIcon } from '@shopify/polaris-icons';

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Image ${currentIndex + 1} of ${images.length}`}
      size="large"
    >
      <Modal.Section>
        <div onKeyDown={handleKeyDown} tabIndex={0} className="outline-none">
          <BlockStack gap="400">
            {/* Main image with navigation */}
            <div className="relative">
              {/* Previous button */}
              {images.length > 1 && (
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                  aria-label="Previous image"
                >
                  <Icon source={ChevronLeftIcon} />
                </button>
              )}

              {/* Image */}
              <div className="flex items-center justify-center min-h-[400px] bg-muted rounded-lg overflow-hidden">
                <img
                  src={currentImage}
                  alt={`Generated image ${currentIndex + 1}`}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>

              {/* Next button */}
              {images.length > 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-background transition-colors"
                  aria-label="Next image"
                >
                  <Icon source={ChevronRightIcon} />
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
                    } ${selectedIndices.has(idx) ? 'ring-2 ring-shopify-green' : ''}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <InlineStack gap="200" align="center">
              {onSelect && (
                <Button
                  variant={isSelected ? 'primary' : 'secondary'}
                  onClick={() => onSelect(currentIndex)}
                >
                  {isSelected ? '✓ Selected for Publishing' : 'Select for Publishing'}
                </Button>
              )}
              {onDownload && (
                <Button
                  icon={ArrowDownIcon}
                  onClick={() => onDownload(currentIndex)}
                >
                  Download
                </Button>
              )}
              {onRegenerate && (
                <Button
                  icon={RefreshIcon}
                  variant="plain"
                  onClick={() => onRegenerate(currentIndex)}
                >
                  Regenerate Variation
                </Button>
              )}
            </InlineStack>
          </BlockStack>
        </div>
      </Modal.Section>
    </Modal>
  );
}
