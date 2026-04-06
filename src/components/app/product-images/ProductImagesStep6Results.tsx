import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, CheckCircle, Archive } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/shimmer-image';

import { useState } from 'react';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { downloadDropAsZip, type DropImage } from '@/lib/dropDownload';
import { toast } from '@/lib/brandedToast';

interface ResultImage {
  url: string;
  sceneName: string;
}

interface Step6Props {
  results: Map<string, { images: ResultImage[]; productName: string }>;
  onGenerateMore: () => void;
  onGoToLibrary: () => void;
}

export function ProductImagesStep6Results({ results, onGenerateMore, onGoToLibrary }: Step6Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const allImages = Array.from(results.values()).flatMap(r => r.images);
  const totalImages = allImages.length;

  const openLightbox = (images: ResultImage[], idx: number) => {
    setLightboxImages(images.map(i => i.url));
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const handleDownloadAll = async () => {
    if (downloading || totalImages === 0) return;
    setDownloading(true);
    try {
      const dropImages: DropImage[] = [];
      for (const [, { images, productName }] of results.entries()) {
        for (const img of images) {
          dropImages.push({ url: img.url, workflow_name: 'Product Images', product_title: productName });
        }
      }
      await downloadDropAsZip(dropImages, 'Product_Images');
      toast.success('Download complete');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <CheckCircle className="w-6 h-6" />
          <h2 className="text-xl font-semibold tracking-tight">Your visuals are ready</h2>
        </div>
        <p className="text-sm text-muted-foreground">{totalImages} image{totalImages !== 1 ? 's' : ''} generated successfully</p>
      </div>

      {/* Results grouped by product */}
      {Array.from(results.entries()).map(([productId, { images, productName }]) => (
        <div key={productId} className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{productName}</h3>
            <Badge variant="secondary" className="text-[10px]">{images.length} images</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => openLightbox(images, i)}
                className="rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="aspect-square bg-muted/30 overflow-hidden">
                  <ShimmerImage
                    src={img.url}
                    alt={`${productName} - ${img.sceneName} - ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="px-2 py-1.5 bg-card border-t border-border">
                  <p className="text-[10px] text-muted-foreground truncate">{img.sceneName}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Actions */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center justify-center">
          <Button variant="outline" onClick={onGenerateMore} className="gap-1.5">
            <RefreshCw className="w-4 h-4" />Generate More
          </Button>
          <Button variant="outline" onClick={handleDownloadAll} disabled={downloading || totalImages === 0} className="gap-1.5">
            <Archive className="w-4 h-4" />{downloading ? 'Downloading…' : 'Download All'}
          </Button>
          <Button variant="outline" onClick={onGoToLibrary} className="gap-1.5">
            <Download className="w-4 h-4" />View in Library
          </Button>
        </CardContent>
      </Card>

      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}

export default ProductImagesStep6Results;
