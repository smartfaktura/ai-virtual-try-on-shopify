import { useState } from 'react';
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { BulkGenerationResult, BulkProductResult } from '@/types/bulk';
import { toast } from 'sonner';

interface BulkResultsViewProps {
  results: BulkGenerationResult;
  onPublishAll: () => void;
  onPublishSelected: (productIds: string[], selectedImages: Map<string, number[]>) => void;
  onStartNew: () => void;
}

interface ProductResultSectionProps {
  result: BulkProductResult;
  isExpanded: boolean;
  onToggle: () => void;
  selectedImages: Set<number>;
  onImageToggle: (index: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

function ProductResultSection({
  result,
  isExpanded,
  onToggle,
  selectedImages,
  onImageToggle,
  onSelectAll,
  onClearAll,
}: ProductResultSectionProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {result.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                )}
                <div>
                  <p className="text-sm font-semibold">{result.productTitle}</p>
                  <p className="text-xs text-muted-foreground">{result.images.length} images generated</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={result.status === 'success' ? 'default' : result.status === 'partial' ? 'secondary' : 'destructive'}>
                  {result.status === 'success' ? 'Success' : result.status === 'partial' ? 'Partial' : 'Failed'}
                </Badge>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-3 border-t">
            {result.images.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={onSelectAll}>Select All</Button>
                  <Button size="sm" variant="outline" onClick={onClearAll}>Clear</Button>
                  <span className="text-xs text-muted-foreground">
                    {selectedImages.size} of {result.images.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {result.images.map((imgUrl, index) => {
                    const isSelected = selectedImages.has(index);
                    return (
                      <div
                        key={String(index)}
                        onClick={() => onImageToggle(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'
                        }`}
                      >
                        <img src={imgUrl} alt={`Generated ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-primary border-primary text-primary-foreground' : 'bg-white/80 border-border'
                          }`}>
                            {isSelected && <CheckCircle className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No images generated for this product.</p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function BulkResultsView({ results, onPublishAll, onPublishSelected, onStartNew }: BulkResultsViewProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [selectedImages, setSelectedImages] = useState<Map<string, Set<number>>>(new Map());

  const toggleExpanded = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  const toggleImage = (productId: string, index: number) => {
    setSelectedImages(prev => {
      const next = new Map(prev);
      const productSelection = next.get(productId) || new Set();
      productSelection.has(index) ? productSelection.delete(index) : productSelection.add(index);
      next.set(productId, productSelection);
      return next;
    });
  };

  const selectAllImages = (productId: string, imageCount: number) => {
    setSelectedImages(prev => {
      const next = new Map(prev);
      next.set(productId, new Set(Array.from({ length: imageCount }, (_, i) => i)));
      return next;
    });
  };

  const clearProductImages = (productId: string) => {
    setSelectedImages(prev => { const next = new Map(prev); next.set(productId, new Set()); return next; });
  };

  const getTotalSelectedCount = () => {
    let total = 0;
    selectedImages.forEach(set => { total += set.size; });
    return total;
  };

  const handlePublishSelected = () => {
    const productIds = Array.from(selectedImages.entries()).filter(([_, set]) => set.size > 0).map(([id]) => id);
    const imageMap = new Map<string, number[]>();
    selectedImages.forEach((set, productId) => { if (set.size > 0) imageMap.set(productId, Array.from(set)); });
    onPublishSelected(productIds, imageMap);
  };

  const successCount = results.summary.successfulProducts;
  const failedCount = results.summary.failedProducts;

  return (
    <div className="space-y-5">
      <Alert variant={failedCount === 0 ? 'default' : undefined}>
        <AlertDescription>
          <p className="font-semibold">Bulk Generation Complete!</p>
          <p>
            Successfully generated images for {successCount} of {results.summary.totalProducts} products.
            {failedCount > 0 && ` ${failedCount} products failed.`}
          </p>
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-6 flex-wrap">
            {[
              { label: 'Total Images', value: results.summary.totalImages },
              { label: 'Successful', value: successCount },
              { label: 'Failed', value: failedCount },
              { label: 'Credits Used', value: results.summary.creditsUsed },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-4">
                {i > 0 && <Separator orientation="vertical" className="h-8" />}
                <div className="text-center">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={onPublishAll}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Publish All ({results.summary.totalImages})
        </Button>
        <Button variant="outline" onClick={handlePublishSelected} disabled={getTotalSelectedCount() === 0}>
          Publish Selected ({getTotalSelectedCount()})
        </Button>
        <Button variant="outline" onClick={onStartNew}>Start New Batch</Button>
      </div>

      {/* Product results */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Results by Product</h3>
        {results.productResults.map(result => (
          <ProductResultSection
            key={result.productId}
            result={result}
            isExpanded={expandedProducts.has(result.productId)}
            onToggle={() => toggleExpanded(result.productId)}
            selectedImages={selectedImages.get(result.productId) || new Set()}
            onImageToggle={index => toggleImage(result.productId, index)}
            onSelectAll={() => selectAllImages(result.productId, result.images.length)}
            onClearAll={() => clearProductImages(result.productId)}
          />
        ))}
      </div>
    </div>
  );
}
