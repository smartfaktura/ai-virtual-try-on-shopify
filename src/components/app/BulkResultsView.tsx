import { useState } from 'react';
import {
  BlockStack,
  InlineStack,
  Card,
  Text,
  Button,
  Badge,
  Divider,
  Banner,
  Checkbox,
  Collapsible,
} from '@shopify/polaris';
import { 
  CheckCircleIcon, 
  AlertCircleIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ExternalIcon,
  ImageIcon,
} from '@shopify/polaris-icons';
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
  const statusTone = result.status === 'success' ? 'success' : result.status === 'partial' ? 'attention' : 'critical';
  const statusIcon = result.status === 'success' ? CheckCircleIcon : AlertCircleIcon;
  
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        onClick={onToggle}
        className="p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="300" blockAlign="center">
            <span className={result.status === 'success' ? 'text-green-600' : 'text-yellow-600'}>
              {result.status === 'success' ? <CheckCircleIcon /> : <AlertCircleIcon />}
            </span>
            <BlockStack gap="050">
              <Text as="p" variant="bodyMd" fontWeight="semibold">{result.productTitle}</Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {result.images.length} images generated
              </Text>
            </BlockStack>
          </InlineStack>
          
          <InlineStack gap="200" blockAlign="center">
            <Badge tone={statusTone}>
              {result.status === 'success' ? 'Success' : result.status === 'partial' ? 'Partial' : 'Failed'}
            </Badge>
            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </InlineStack>
        </InlineStack>
      </div>
      
      {/* Expandable content */}
      <Collapsible open={isExpanded} id={`product-${result.productId}`}>
        <div className="p-3 border-t">
          {result.images.length > 0 ? (
            <BlockStack gap="300">
              {/* Selection controls */}
              <InlineStack gap="200">
                <Button size="slim" onClick={onSelectAll}>Select All</Button>
                <Button size="slim" onClick={onClearAll}>Clear</Button>
                <Text as="span" variant="bodySm" tone="subdued">
                  {selectedImages.size} of {result.images.length} selected
                </Text>
              </InlineStack>
              
              {/* Image grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {result.images.map((imgUrl, index) => {
                  const isSelected = selectedImages.has(index);
                  return (
                    <div 
                      key={index}
                      onClick={() => onImageToggle(index)}
                      className={`
                        relative aspect-square rounded-lg overflow-hidden cursor-pointer
                        border-2 transition-all
                        ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}
                      `}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Generated ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Selection overlay */}
                      <div className="absolute top-2 left-2">
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center
                          ${isSelected ? 'bg-primary border-primary text-white' : 'bg-white/80 border-border'}
                        `}>
                          {isSelected && <CheckCircleIcon />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </BlockStack>
          ) : (
            <Text as="p" tone="subdued">No images generated for this product.</Text>
          )}
        </div>
      </Collapsible>
    </div>
  );
}

export function BulkResultsView({
  results,
  onPublishAll,
  onPublishSelected,
  onStartNew,
}: BulkResultsViewProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [selectedImages, setSelectedImages] = useState<Map<string, Set<number>>>(new Map());

  const toggleExpanded = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleImage = (productId: string, index: number) => {
    setSelectedImages(prev => {
      const next = new Map(prev);
      const productSelection = next.get(productId) || new Set();
      
      if (productSelection.has(index)) {
        productSelection.delete(index);
      } else {
        productSelection.add(index);
      }
      
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
    setSelectedImages(prev => {
      const next = new Map(prev);
      next.set(productId, new Set());
      return next;
    });
  };

  const getTotalSelectedCount = () => {
    let total = 0;
    selectedImages.forEach(set => {
      total += set.size;
    });
    return total;
  };

  const handlePublishSelected = () => {
    const productIds = Array.from(selectedImages.entries())
      .filter(([_, set]) => set.size > 0)
      .map(([id, _]) => id);
    
    const imageMap = new Map<string, number[]>();
    selectedImages.forEach((set, productId) => {
      if (set.size > 0) {
        imageMap.set(productId, Array.from(set));
      }
    });
    
    onPublishSelected(productIds, imageMap);
  };

  const successCount = results.summary.successfulProducts;
  const failedCount = results.summary.failedProducts;

  return (
    <BlockStack gap="500">
      {/* Summary banner */}
      <Banner tone={failedCount === 0 ? 'success' : 'warning'}>
        <BlockStack gap="200">
          <Text as="p" fontWeight="semibold">
            Bulk Generation Complete!
          </Text>
          <Text as="p">
            Successfully generated images for {successCount} of {results.summary.totalProducts} products.
            {failedCount > 0 && ` ${failedCount} products failed.`}
          </Text>
        </BlockStack>
      </Banner>

      {/* Stats */}
      <Card>
        <InlineStack gap="400" wrap>
          <BlockStack gap="050" inlineAlign="center">
            <Text as="p" variant="headingLg">{results.summary.totalImages}</Text>
            <Text as="p" variant="bodySm" tone="subdued">Total Images</Text>
          </BlockStack>
          <Divider />
          <BlockStack gap="050" inlineAlign="center">
            <Text as="p" variant="headingLg">{successCount}</Text>
            <Text as="p" variant="bodySm" tone="subdued">Successful</Text>
          </BlockStack>
          <Divider />
          <BlockStack gap="050" inlineAlign="center">
            <Text as="p" variant="headingLg">{failedCount}</Text>
            <Text as="p" variant="bodySm" tone="subdued">Failed</Text>
          </BlockStack>
          <Divider />
          <BlockStack gap="050" inlineAlign="center">
            <Text as="p" variant="headingLg">{results.summary.creditsUsed}</Text>
            <Text as="p" variant="bodySm" tone="subdued">Credits Used</Text>
          </BlockStack>
        </InlineStack>
      </Card>

      {/* Action buttons */}
      <InlineStack gap="300">
        <Button variant="primary" onClick={onPublishAll} icon={ExternalIcon}>
          Publish All ({results.summary.totalImages})
        </Button>
        <Button 
          onClick={handlePublishSelected} 
          disabled={getTotalSelectedCount() === 0}
        >
          Publish Selected ({getTotalSelectedCount()})
        </Button>
        <Button onClick={onStartNew}>
          Start New Batch
        </Button>
      </InlineStack>

      {/* Product results */}
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">Results by Product</Text>
        
        {results.productResults.map(result => (
          <ProductResultSection
            key={result.productId}
            result={result}
            isExpanded={expandedProducts.has(result.productId)}
            onToggle={() => toggleExpanded(result.productId)}
            selectedImages={selectedImages.get(result.productId) || new Set()}
            onImageToggle={(index) => toggleImage(result.productId, index)}
            onSelectAll={() => selectAllImages(result.productId, result.images.length)}
            onClearAll={() => clearProductImages(result.productId)}
          />
        ))}
      </BlockStack>
    </BlockStack>
  );
}
