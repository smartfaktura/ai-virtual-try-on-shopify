import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, CheckCircle, Archive, Loader2 } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/shimmer-image';

import { useState, useMemo } from 'react';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { downloadDropAsZip, type DropImage } from '@/lib/dropDownload';
import { toast } from '@/lib/brandedToast';
import { saveOrShareImage } from '@/lib/mobileImageSave';
import { useProductImageScenes } from '@/hooks/useProductImageScenes';
import { ContextualFeedbackCard } from '@/components/app/ContextualFeedbackCard';

interface ResultImage {
  url: string;
  sceneName: string;
  sceneId?: string;
  aspectRatio?: string;
}

interface Step6Props {
  results: Map<string, { images: Array<{ url: string; sceneName: string; sceneId?: string; aspectRatio?: string }>; productName: string }>;
  onGenerateMore: () => void;
  onGoToLibrary: () => void;
}

export function ProductImagesStep6Results({ results, onGenerateMore, onGoToLibrary }: Step6Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const { rawScenes } = useProductImageScenes();

  // Build a sort map from product_image_scenes sort_order
  const sceneSortMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of rawScenes) {
      m.set(s.scene_id, s.sort_order);
    }
    return m;
  }, [rawScenes]);

  // Sort images within each product group by admin scene order
  const sortedResults = useMemo(() => {
    const sorted = new Map<string, { images: ResultImage[]; productName: string }>();
    for (const [productId, { images, productName }] of results.entries()) {
      const sortedImages = [...images].sort((a, b) => {
        const sa = a.sceneId ? (sceneSortMap.get(a.sceneId) ?? 9999) : 9999;
        const sb = b.sceneId ? (sceneSortMap.get(b.sceneId) ?? 9999) : 9999;
        return sa - sb;
      });
      sorted.set(productId, { images: sortedImages, productName });
    }
    return sorted;
  }, [results, sceneSortMap]);

  const allImages = Array.from(sortedResults.values()).flatMap(r => r.images);
  const totalImages = allImages.length;
  const hasMultipleRatios = useMemo(() => {
    const ratios = new Set(allImages.map(i => i.aspectRatio).filter(Boolean));
    return ratios.size > 1;
  }, [allImages]);

  const [lightboxProductName, setLightboxProductName] = useState('');
  const [lightboxSceneNames, setLightboxSceneNames] = useState<string[]>([]);

  const openLightbox = (images: ResultImage[], idx: number, productName: string) => {
    setLightboxImages(images.map(i => i.url));
    setLightboxSceneNames(images.map(i => i.sceneName));
    setLightboxProductName(productName);
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const handleDownloadAll = async () => {
    if (downloading || totalImages === 0) return;
    setDownloading(true);
    try {
      const dropImages: DropImage[] = [];
      for (const [, { images, productName }] of sortedResults.entries()) {
        for (const img of images) {
          dropImages.push({ url: img.url, workflow_name: 'Product Images', product_title: productName, scene_name: img.sceneName });
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

  const handleSingleDownload = (url: string, productName: string, sceneName: string) => {
    const safeProd = productName.replace(/[^a-zA-Z0-9À-ÿ _-]/g, '').replace(/\s+/g, '_');
    const safeScene = sceneName.replace(/[^a-zA-Z0-9À-ÿ _-]/g, '').replace(/\s+/g, '_');
    saveOrShareImage(url, `${safeProd}_${safeScene}`);
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
      {Array.from(sortedResults.entries()).map(([productId, { images, productName }]) => (
        <div key={productId} className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{productName}</h3>
            <Badge variant="secondary" className="text-[10px]">{images.length} images</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => openLightbox(images, i, productName)}
                className="rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all cursor-pointer group relative"
              >
                <div
                  className="bg-muted/30 overflow-hidden"
                  style={{ aspectRatio: img.aspectRatio ? img.aspectRatio.replace(':', '/') : '1/1' }}
                >
                  <ShimmerImage
                    src={img.url}
                    alt={`${productName} - ${img.sceneName} - ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="px-2 py-1.5 bg-card border-t border-border flex items-center gap-1.5">
                  <p className="text-[10px] text-muted-foreground truncate">{img.sceneName}</p>
                  {hasMultipleRatios && img.aspectRatio && (
                    <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-3.5 shrink-0 font-medium">{img.aspectRatio}</Badge>
                  )}
                </div>
                {/* Per-image download button */}
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); handleSingleDownload(img.url, productName, img.sceneName); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </span>
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
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}{downloading ? 'Downloading…' : 'Download All'}
          </Button>
          <Button variant="outline" onClick={onGoToLibrary} className="gap-1.5">
            <Download className="w-4 h-4" />View in Library
          </Button>
        </CardContent>
      </Card>

      {/* Contextual feedback — below actions */}
      <ContextualFeedbackCard
        workflow="product-visuals"
        questionText="Are these visuals ready to use?"
        buttonLabels={{ yes: 'Yes, ready', almost: 'Almost', no: 'No' }}
        reasonChips={['Need better background', 'Wrong angle / shot', 'Product details off', 'Lighting / shadows', 'Not consistent enough', 'Missing shot type', 'Needs higher realism', 'Other']}
        textPlaceholder="What is missing? e.g. cleaner background, sharper details"
        resultId={Array.from(results.keys())[0]}
        imageUrl={allImages[0]?.url}
        triggerType="result_ready"
      />

      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
          onDownload={(idx) => handleSingleDownload(lightboxImages[idx], lightboxProductName, lightboxSceneNames[idx] || `image_${idx + 1}`)}
        />
      )}
    </div>
  );
}

export default ProductImagesStep6Results;
