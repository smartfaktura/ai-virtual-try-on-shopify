import { useState } from 'react';
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
} from '@shopify/polaris';
import { ArrowDownIcon, RefreshIcon, CheckCircleIcon } from '@shopify/polaris-icons';
import { StatusBadge } from '@/components/app/StatusBadge';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import type { GenerationJob } from '@/types';

interface JobDetailModalProps {
  open: boolean;
  onClose: () => void;
  job: GenerationJob | null;
  onPublish?: (job: GenerationJob) => void;
  onRetry?: (job: GenerationJob) => void;
}

export function JobDetailModal({ open, onClose, job, onPublish, onRetry }: JobDetailModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedForPublish, setSelectedForPublish] = useState<Set<number>>(new Set());

  if (!job) return null;

  const unpublishedResults = job.results.filter(r => !r.publishedToShopify);
  const publishedResults = job.results.filter(r => r.publishedToShopify);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const toggleSelection = (index: number) => {
    setSelectedForPublish(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${job.productSnapshot.title}-image-${index + 1}.jpg`;
    link.click();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Job Details"
        size="large"
        primaryAction={
          unpublishedResults.length > 0 && onPublish
            ? {
                content: `Publish ${unpublishedResults.length} Image${unpublishedResults.length !== 1 ? 's' : ''}`,
                onAction: () => onPublish(job),
              }
            : undefined
        }
        secondaryActions={[
          ...(job.status === 'failed' && onRetry
            ? [{ content: 'Retry Generation', onAction: () => onRetry(job) }]
            : []),
          { content: 'Close', onAction: onClose },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="500">
            {/* Status & Timing */}
            <InlineStack align="space-between" blockAlign="center">
              <StatusBadge status={job.status} />
              <Text as="p" variant="bodySm" tone="subdued">
                Created {new Date(job.createdAt).toLocaleString()}
              </Text>
            </InlineStack>

            <Divider />

            {/* Product Info */}
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">Product</Text>
              <InlineStack gap="400" blockAlign="center">
                <Thumbnail
                  source={job.productSnapshot.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
                  alt={job.productSnapshot.title}
                  size="medium"
                />
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    {job.productSnapshot.title}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {job.productSnapshot.vendor}
                  </Text>
                </BlockStack>
              </InlineStack>
            </BlockStack>

            <Divider />

            {/* Template & Settings */}
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">Settings Used</Text>
              <InlineStack gap="200" wrap>
                <Badge>{job.templateSnapshot.name}</Badge>
                <Badge>{job.ratio}</Badge>
                <Badge>{`${job.quality} quality`}</Badge>
                <Badge>{`${job.requestedCount} images`}</Badge>
              </InlineStack>
            </BlockStack>

            <Divider />

            {/* Generated Images */}
            {job.results.length > 0 && (
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h3" variant="headingSm">
                    Generated Images ({job.results.length})
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {publishedResults.length} published • {unpublishedResults.length} unpublished
                  </Text>
                </InlineStack>
                
                <Text as="p" variant="bodySm" tone="subdued">
                  Click an image to view it larger, or use the icons to download or select for publishing.
                </Text>

                <InlineGrid columns={{ xs: 2, sm: 3, md: 4 }} gap="300">
                  {job.results.map((result, index) => (
                    <div
                      key={result.assetId}
                      className="relative group cursor-pointer rounded-lg overflow-hidden"
                    >
                      <img
                        src={result.imageUrl}
                        alt={`Generated ${index + 1}`}
                        className="w-full aspect-square object-cover"
                        onClick={() => handleImageClick(index)}
                      />

                      {/* Published badge */}
                      {result.publishedToShopify && (
                        <div className="absolute top-2 left-2 bg-shopify-green text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Icon source={CheckCircleIcon} />
                          Published
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(result.imageUrl, index);
                          }}
                          className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                          title="Download"
                        >
                          <Icon source={ArrowDownIcon} />
                        </button>
                      </div>
                    </div>
                  ))}
                </InlineGrid>
              </BlockStack>
            )}

            {/* Error message for failed jobs */}
            {job.status === 'failed' && job.errorMessage && (
              <div className="p-4 bg-critical-surface rounded-lg border border-critical">
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold" tone="critical">
                    Error Details
                  </Text>
                  <Text as="p" variant="bodySm">
                    {job.errorMessage}
                  </Text>
                </BlockStack>
              </div>
            )}

            {/* Generating/Queued status */}
            {(job.status === 'generating' || job.status === 'queued') && (
              <div className="p-4 bg-info-surface rounded-lg border border-info text-center">
                <BlockStack gap="200" inlineAlign="center">
                  <div className="w-8 h-8 border-2 border-info border-t-transparent rounded-full animate-spin" />
                  <Text as="p" variant="bodyMd">
                    {job.status === 'queued' ? 'Waiting in queue...' : 'Generating your images...'}
                  </Text>
                </BlockStack>
              </div>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>

      {/* Lightbox for full-size viewing */}
      <ImageLightbox
        images={job.results.map(r => r.imageUrl)}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
        onSelect={toggleSelection}
        onDownload={(idx) => handleDownload(job.results[idx].imageUrl, idx)}
        selectedIndices={selectedForPublish}
        productName={job.productSnapshot.title}
      />
    </>
  );
}
