import { useState, useEffect } from 'react';
import {
  Modal,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Thumbnail,
  Badge,
  Divider,
  InlineGrid,
  Icon,
  Banner,
} from '@shopify/polaris';
import { ArrowDownIcon, CheckCircleIcon } from '@shopify/polaris-icons';
import { StatusBadge } from '@/components/app/StatusBadge';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import type { GenerationJob } from '@/types';

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

  if (!job) return null;

  const unpublishedResults = job.results.filter(r => !r.publishedToShopify);
  const publishedResults = job.results.filter(r => r.publishedToShopify);
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
      <Modal
        open={open}
        onClose={onClose}
        title="Job Details"
        size="large"
        primaryAction={
          selectedForPublish.size > 0 && onPublish
            ? { content: `Publish ${selectedForPublish.size} Selected`, onAction: handlePublishSelected }
            : unpublishedResults.length > 0 
            ? { content: 'Select images to publish', disabled: true }
            : undefined
        }
        secondaryActions={[
          ...(job.status === 'failed' && onRetry ? [{ content: 'Retry', onAction: () => onRetry(job) }] : []),
          { content: 'Close', onAction: onClose },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="500">
            <InlineStack align="space-between" blockAlign="center">
              <StatusBadge status={job.status} />
              <Text as="p" variant="bodySm" tone="subdued">Created {new Date(job.createdAt).toLocaleString()}</Text>
            </InlineStack>
            <Divider />
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">Product</Text>
              <InlineStack gap="400" blockAlign="center">
                <Thumbnail source={job.productSnapshot.images[0]?.url || ''} alt={job.productSnapshot.title} size="medium" />
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">{job.productSnapshot.title}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">{job.productSnapshot.vendor}</Text>
                </BlockStack>
              </InlineStack>
            </BlockStack>
            <Divider />
            {job.results.length > 0 && (
              <BlockStack gap="400">
                <Text as="h3" variant="headingSm">{`Generated Images (${job.results.length})`}</Text>
                {unpublishedResults.length > 0 && (
                  <Banner tone="info">
                    <Text as="p" variant="bodySm">👆 Click images to select for publishing</Text>
                    <InlineStack gap="200">
                      <Button size="slim" onClick={() => setSelectedForPublish(new Set(unpublishedIndices))}>Select All</Button>
                      {selectedForPublish.size > 0 && <Button size="slim" variant="plain" onClick={() => setSelectedForPublish(new Set())}>Clear</Button>}
                    </InlineStack>
                  </Banner>
                )}
                {selectedForPublish.size > 0 && (
                  <div className="p-3 rounded-lg bg-shopify-green/10 border border-shopify-green">
                    <Text as="p" variant="bodySm" fontWeight="semibold">{`✓ ${selectedForPublish.size} selected`}</Text>
                  </div>
                )}
                <InlineGrid columns={{ xs: 2, md: 4 }} gap="300">
                  {job.results.map((result, index) => (
                    <div
                      key={result.assetId}
                      onClick={() => !result.publishedToShopify && toggleSelection(index)}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all ${
                        selectedForPublish.has(index) ? 'ring-3 ring-shopify-green ring-offset-2' : result.publishedToShopify ? 'opacity-60' : 'hover:ring-2 hover:ring-primary/50'
                      }`}
                    >
                      <img src={result.imageUrl} alt={`Generated ${index + 1}`} className="w-full aspect-square object-cover" />
                      {result.publishedToShopify && <div className="absolute top-2 left-2 bg-shopify-green text-white text-xs px-2 py-1 rounded-full">Published</div>}
                      {!result.publishedToShopify && (
                        <div className={`absolute top-2 right-2 w-7 h-7 rounded-full border-2 flex items-center justify-center ${selectedForPublish.has(index) ? 'bg-shopify-green border-shopify-green' : 'border-white bg-black/50'}`}>
                          {selectedForPublish.has(index) ? <Icon source={CheckCircleIcon} tone="base" /> : <span className="text-white text-xs font-bold">{String(index + 1)}</span>}
                        </div>
                      )}
                      {!result.publishedToShopify && !selectedForPublish.has(index) && <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Click to select</div>}
                    </div>
                  ))}
                </InlineGrid>
              </BlockStack>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
      <ImageLightbox images={job.results.map(r => r.imageUrl)} currentIndex={lightboxIndex} open={lightboxOpen} onClose={() => setLightboxOpen(false)} onNavigate={setLightboxIndex} onSelect={toggleSelection} onDownload={() => {}} selectedIndices={selectedForPublish} productName={job.productSnapshot.title} />
    </>
  );
}
