import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Info, Expand } from 'lucide-react';
import { StatusBadge } from '@/components/app/StatusBadge';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import type { GenerationJob } from '@/types';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface JobDetailModalProps {
  open: boolean;
  onClose: () => void;
  job: GenerationJob | null;
  onPublish?: (job: GenerationJob, selectedImageUrls: string[]) => void;
  onRetry?: (job: GenerationJob) => void;
}

export function JobDetailModal({ open, onClose, job, onPublish, onRetry }: JobDetailModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedForPublish, setSelectedForPublish] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open && job) {
      setSelectedForPublish(new Set());
    }
  }, [open, job?.jobId]);

  const handleDownload = useCallback(async (index: number) => {
    if (!job) return;
    const imageUrl = job.results[index]?.imageUrl;
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${job.productSnapshot.title.replace(/\s+/g, '-')}-${index + 1}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, [job]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (!job) return null;

  const unpublishedResults = job.results.filter(r => !r.publishedToShopify);
  const unpublishedIndices = job.results
    .map((r, idx) => ({ result: r, idx }))
    .filter(item => !item.result.publishedToShopify)
    .map(item => item.idx);

  const toggleSelection = (index: number) => {
    const result = job.results[index];
    if (result.publishedToShopify) return;
    setSelectedForPublish(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  const handlePublishSelected = () => {
    if (onPublish && selectedForPublish.size > 0) {
      const selectedUrls = Array.from(selectedForPublish).map(idx => job.results[idx].imageUrl);
      onPublish(job, selectedUrls);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={job.status} />
              <p className="text-sm text-muted-foreground">Created {new Date(job.createdAt).toLocaleString()}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="font-semibold">Product</h3>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                  <img src={getOptimizedUrl(job.productSnapshot.images[0]?.url, { quality: 60 }) || '/placeholder.svg'} alt={job.productSnapshot.title} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">{job.productSnapshot.title}</p>
                  <p className="text-sm text-muted-foreground">{job.productSnapshot.vendor}</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {job.results.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Generated Images ({job.results.length})</h3>
                
                {unpublishedResults.length > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>👆 Click images to select for downloading</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedForPublish(new Set(unpublishedIndices))}>Select All</Button>
                        {selectedForPublish.size > 0 && (
                          <Button size="sm" variant="ghost" onClick={() => setSelectedForPublish(new Set())}>Clear</Button>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {selectedForPublish.size > 0 && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-sm font-semibold">✓ {selectedForPublish.size} selected</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {job.results.map((result, index) => (
                    <div
                      key={result.assetId}
                      onClick={() => !result.publishedToShopify && toggleSelection(index)}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all ${
                        selectedForPublish.has(index) ? 'ring-2 ring-primary ring-offset-2' : result.publishedToShopify ? 'opacity-60' : 'hover:ring-2 hover:ring-primary/50'
                      }`}
                    >
                      <img src={getOptimizedUrl(result.imageUrl, { quality: 60 })} alt={`Generated ${index + 1}`} className="w-full aspect-square object-cover" />
                      {result.publishedToShopify && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Published</div>
                      )}
                      {!result.publishedToShopify && (
                        <div className={`absolute top-2 right-2 w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                          selectedForPublish.has(index) ? 'bg-primary border-primary' : 'border-white bg-black/50'
                        }`}>
                          {selectedForPublish.has(index) ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          )}
                        </div>
                      )}
                      {/* Expand button to open lightbox */}
                      <button
                        onClick={(e) => { e.stopPropagation(); openLightbox(index); }}
                        className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Expand className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {job.status === 'failed' && onRetry && (
              <Button variant="outline" onClick={() => onRetry(job)}>Retry</Button>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
            {selectedForPublish.size > 0 && onPublish && (
              <Button onClick={handlePublishSelected}>Download {selectedForPublish.size} Selected</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ImageLightbox
        images={job.results.map(r => r.imageUrl)}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
        onSelect={toggleSelection}
        onDownload={handleDownload}
        selectedIndices={selectedForPublish}
        productName={job.productSnapshot.title}
      />
    </>
  );
}