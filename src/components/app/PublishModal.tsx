import { useState, useEffect } from 'react';
import {
  Modal,
  BlockStack,
  InlineStack,
  Text,
  RadioButton,
  Banner,
  Thumbnail,
  Divider,
  Select,
  TextField,
  Icon,
} from '@shopify/polaris';
import { AlertTriangleIcon } from '@shopify/polaris-icons';
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

  // Reset confirmation when modal closes or mode changes
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

  const resultingImageCount =
    publishMode === 'add'
      ? existingImages.length + selectedImages.length
      : selectedImages.length;

  // Mock variants for demo
  const variants = [
    { label: 'All variants', value: 'all' },
    { label: 'Size: Small', value: 'variant_1' },
    { label: 'Size: Medium', value: 'variant_2' },
    { label: 'Size: Large', value: 'variant_3' },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Publish ${selectedImages.length} Image${selectedImages.length > 1 ? 's' : ''}`}
      primaryAction={{
        content: `Publish to "${product?.title}"`,
        onAction: handlePublish,
        disabled: !canPublish,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        {/* Product Identity - Critical for verification */}
        {product && (
          <BlockStack gap="400">
            <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
              <InlineStack gap="400" blockAlign="center">
                <Thumbnail
                  source={product.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
                  alt={product.title}
                  size="large"
                />
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Publishing to</Text>
                  <Text as="p" variant="headingMd" fontWeight="bold">
                    {product.title}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    by {product.vendor}
                  </Text>
                </BlockStack>
              </InlineStack>
            </div>

            <Divider />
          </BlockStack>
        )}
        <BlockStack gap="500">
          {/* Selected images preview */}
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">
              Selected Images
            </Text>
            <InlineStack gap="200" wrap>
              {selectedImages.slice(0, 6).map((img, idx) => (
                <Thumbnail
                  key={idx}
                  source={img}
                  alt={`Selected image ${idx + 1}`}
                  size="medium"
                />
              ))}
              {selectedImages.length > 6 && (
                <div className="w-[60px] h-[60px] rounded-lg bg-muted flex items-center justify-center">
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    +{selectedImages.length - 6}
                  </Text>
                </div>
              )}
            </InlineStack>
          </BlockStack>

          <Divider />

          {/* Publishing mode selection */}
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">
              How would you like to publish?
            </Text>
            
            <div className="space-y-3">
              <div
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  publishMode === 'add'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => setPublishMode('add')}
              >
                <InlineStack gap="300" blockAlign="start">
                  <RadioButton
                    label=""
                    checked={publishMode === 'add'}
                    onChange={() => setPublishMode('add')}
                    id="mode-add"
                    name="publishMode"
                  />
                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      Add to existing images
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Keep your current {existingImages.length} image{existingImages.length !== 1 ? 's' : ''} and add {selectedImages.length} new one{selectedImages.length !== 1 ? 's' : ''}.
                    </Text>
                  </BlockStack>
                </InlineStack>
              </div>

              <div
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  publishMode === 'replace'
                    ? 'border-destructive bg-destructive/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => setPublishMode('replace')}
              >
                <InlineStack gap="300" blockAlign="start">
                  <RadioButton
                    label=""
                    checked={publishMode === 'replace'}
                    onChange={() => setPublishMode('replace')}
                    id="mode-replace"
                    name="publishMode"
                  />
                  <BlockStack gap="100">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Replace all existing images
                      </Text>
                      {existingImages.length > 0 && (
                        <Icon source={AlertTriangleIcon} tone="caution" />
                      )}
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Remove current images and use only the {selectedImages.length} new one{selectedImages.length !== 1 ? 's' : ''}.
                    </Text>
                  </BlockStack>
                </InlineStack>
              </div>
            </div>

            {/* Danger zone confirmation for Replace mode */}
            {publishMode === 'replace' && existingImages.length > 0 && (
              <div className="p-4 rounded-lg border-2 border-destructive bg-destructive/5">
                <BlockStack gap="300">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={AlertTriangleIcon} tone="critical" />
                    <Text as="p" variant="headingSm" tone="critical">
                      ⚠️ Danger Zone
                    </Text>
                  </InlineStack>
                  <Text as="p" variant="bodySm">
                    This will <strong>permanently delete all {existingImages.length} current product images</strong>. This cannot be undone.
                  </Text>
                  <TextField
                    label={`Type "REPLACE" to confirm deletion`}
                    value={replaceConfirmation}
                    onChange={setReplaceConfirmation}
                    autoComplete="off"
                    placeholder="REPLACE"
                    error={replaceConfirmation.length > 0 && replaceConfirmation !== 'REPLACE' ? 'Type exactly "REPLACE" to confirm' : undefined}
                  />
                </BlockStack>
              </div>
            )}
          </BlockStack>

          {/* Variant assignment */}
          <BlockStack gap="200">
            <Select
              label="Assign to variant (optional)"
              options={variants}
              value={selectedVariant}
              onChange={setSelectedVariant}
              helpText="Choose which product variant(s) should use these images"
            />
          </BlockStack>

          <Divider />

          {/* Result preview */}
          <Banner tone={publishMode === 'replace' ? 'warning' : 'info'}>
            <BlockStack gap="200">
              <InlineStack gap="400">
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" fontWeight="semibold">
                    Current Images
                  </Text>
                  <Text as="p" variant="headingMd">
                    {existingImages.length}
                  </Text>
                </BlockStack>
                <div className="text-2xl">→</div>
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" fontWeight="semibold">
                    After Publishing
                  </Text>
                  <Text as="p" variant="headingMd">
                    {resultingImageCount}
                  </Text>
                </BlockStack>
              </InlineStack>
              {publishMode === 'replace' && existingImages.length > 0 && (
                <Text as="p" variant="bodySm" tone="caution">
                  This will permanently remove {existingImages.length} existing image{existingImages.length !== 1 ? 's' : ''} from this product.
                </Text>
              )}
            </BlockStack>
          </Banner>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
