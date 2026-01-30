import {
  Modal,
  BlockStack,
  InlineStack,
  Text,
  Thumbnail,
  Badge,
  Divider,
  Banner,
  Icon,
} from '@shopify/polaris';
import { ImageIcon, WalletIcon } from '@shopify/polaris-icons';
import type { Product, Template, AspectRatio, ImageQuality } from '@/types';
import { getTemplateImage } from './TemplatePreviewCard';
import { categoryLabels } from '@/data/mockData';

interface GenerateConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
  template: Template | null;
  imageCount: number;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  creditsRemaining: number;
}

export function GenerateConfirmModal({
  open,
  onClose,
  onConfirm,
  product,
  template,
  imageCount,
  aspectRatio,
  quality,
  creditsRemaining,
}: GenerateConfirmModalProps) {
  if (!product || !template) return null;

  const creditsPerImage = quality === 'high' ? 2 : 1;
  const totalCredits = imageCount * creditsPerImage;
  const hasEnoughCredits = creditsRemaining >= totalCredits;
  const templateImage = getTemplateImage(template.templateId);

  const aspectRatioLabels: Record<AspectRatio, string> = {
    '1:1': 'Square (1:1)',
    '4:5': 'Portrait (4:5)',
    '16:9': 'Wide (16:9)',
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm Generation"
      primaryAction={{
        content: `Generate ${imageCount} Images`,
        onAction: onConfirm,
        disabled: !hasEnoughCredits,
      }}
      secondaryActions={[
        {
          content: 'Go Back',
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="500">
          {/* Summary cards */}
          <InlineStack gap="400">
            {/* Product - Larger thumbnail for clear verification */}
            <div className="flex-1 p-4 rounded-lg border-2 border-primary bg-primary/5">
              <BlockStack gap="300">
                <Text as="p" variant="bodySm" fontWeight="semibold">Generating for</Text>
                <InlineStack gap="300" blockAlign="center">
                  <Thumbnail
                    source={product.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
                    alt={product.title}
                    size="large"
                  />
                  <BlockStack gap="100">
                    <Text as="p" variant="headingSm" fontWeight="bold">
                      {product.title}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {product.vendor}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {product.images.length} existing image{product.images.length !== 1 ? 's' : ''}
                    </Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </div>

            {/* Template */}
            <div className="flex-1 p-4 rounded-lg border border-border bg-surface-subdued">
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" tone="subdued">Template</Text>
                <InlineStack gap="200" blockAlign="center">
                  {templateImage ? (
                    <div className="w-10 h-10 rounded-md overflow-hidden">
                      <img src={templateImage} alt={template.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                      <Icon source={ImageIcon} tone="subdued" />
                    </div>
                  )}
                  <BlockStack gap="050">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {template.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {categoryLabels[template.category]}
                    </Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </div>
          </InlineStack>

          <Divider />

          {/* Settings summary */}
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">
              Generation Settings
            </Text>
            <InlineStack gap="200" wrap>
              <Badge tone="info">{`${imageCount} images`}</Badge>
              <Badge tone="info">{aspectRatioLabels[aspectRatio]}</Badge>
              <Badge tone={quality === 'high' ? 'success' : 'info'}>
                {quality === 'high' ? 'High Quality' : 'Standard Quality'}
              </Badge>
            </InlineStack>
          </BlockStack>

          <Divider />

          {/* Credit cost */}
          <div className="p-4 rounded-lg bg-surface-subdued border border-border">
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <Icon source={WalletIcon} />
                <BlockStack gap="050">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Credit Cost
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {creditsPerImage} credit × {imageCount} images
                  </Text>
                </BlockStack>
              </InlineStack>
              <BlockStack gap="050" inlineAlign="end">
                <Text as="p" variant="headingLg" fontWeight="bold">
                  {totalCredits} credits
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {`${creditsRemaining - totalCredits} remaining after`}
                </Text>
              </BlockStack>
            </InlineStack>
          </div>

          {/* Warning if not enough credits */}
          {!hasEnoughCredits && (
            <Banner tone="critical">
              <Text as="p">
                You don't have enough credits. You need {totalCredits} credits but only have {creditsRemaining}.
              </Text>
            </Banner>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
