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
import { PersonIcon, WalletIcon } from '@shopify/polaris-icons';
import type { Product, AspectRatio, ModelProfile, TryOnPose } from '@/types';
import { poseCategoryLabels } from '@/data/mockData';

interface TryOnConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
  model: ModelProfile | null;
  pose: TryOnPose | null;
  imageCount: number;
  aspectRatio: AspectRatio;
  creditsRemaining: number;
  isLoading?: boolean;
  sourceImageUrl?: string;
}

export function TryOnConfirmModal({
  open,
  onClose,
  onConfirm,
  product,
  model,
  pose,
  imageCount,
  aspectRatio,
  creditsRemaining,
  isLoading = false,
  sourceImageUrl,
}: TryOnConfirmModalProps) {
  if (!product || !model || !pose) return null;

  // Use provided source image or fallback to first product image
  const displaySourceImage = sourceImageUrl || product.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png';

  const creditsPerImage = 3; // Virtual Try-On is always 3 credits
  const totalCredits = imageCount * creditsPerImage;
  const hasEnoughCredits = creditsRemaining >= totalCredits;

  const aspectRatioLabels: Record<AspectRatio, string> = {
    '1:1': 'Square (1:1)',
    '4:5': 'Portrait (4:5)',
    '16:9': 'Wide (16:9)',
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm Virtual Try-On Generation"
      primaryAction={{
        content: isLoading ? 'Generating...' : `Generate ${imageCount} Images`,
        onAction: onConfirm,
        disabled: !hasEnoughCredits || isLoading,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: 'Go Back',
          onAction: onClose,
          disabled: isLoading,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="500">
          {/* Summary cards - 3 column layout */}
          <InlineStack gap="400" wrap>
            {/* Product */}
            <div className="flex-1 min-w-[140px] p-4 rounded-lg border-2 border-primary bg-primary/5">
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" fontWeight="semibold">Product</Text>
                <InlineStack gap="200" blockAlign="center">
                  <Thumbnail
                    source={product.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
                    alt={product.title}
                    size="medium"
                  />
                  <BlockStack gap="050">
                    <Text as="p" variant="bodySm" fontWeight="bold">
                      {product.title}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {product.vendor}
                    </Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </div>

            {/* Model */}
            <div className="flex-1 min-w-[140px] p-4 rounded-lg border border-border bg-surface-subdued">
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" fontWeight="semibold">Model</Text>
                <InlineStack gap="200" blockAlign="center">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={model.previewUrl} 
                      alt={model.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <BlockStack gap="050">
                    <Text as="p" variant="bodySm" fontWeight="bold">
                      {model.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {model.ethnicity}, {model.bodyType}
                    </Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </div>

            {/* Pose */}
            <div className="flex-1 min-w-[140px] p-4 rounded-lg border border-border bg-surface-subdued">
              <BlockStack gap="200">
                <Text as="p" variant="bodySm" fontWeight="semibold">Pose & Scene</Text>
                <InlineStack gap="200" blockAlign="center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img 
                      src={pose.previewUrl} 
                      alt={pose.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <BlockStack gap="050">
                    <Text as="p" variant="bodySm" fontWeight="bold">
                      {pose.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {poseCategoryLabels[pose.category]}
                    </Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </div>
          </InlineStack>

          <Divider />

          {/* What will be generated */}
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">
              What You'll Get
            </Text>
            <div className="p-3 rounded-lg bg-surface-subdued border border-border">
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={PersonIcon} tone="subdued" />
                  <Text as="p" variant="bodySm">
                    AI-generated photos of <strong>{model.name}</strong> wearing your <strong>{product.title}</strong>
                  </Text>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  The garment will be digitally placed on the model with realistic fabric draping and natural fit
                </Text>
              </BlockStack>
            </div>
            <InlineStack gap="200" wrap>
              <Badge tone="info">{`${imageCount} images`}</Badge>
              <Badge tone="info">{aspectRatioLabels[aspectRatio]}</Badge>
              <Badge tone="success">High Quality</Badge>
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
                    {creditsPerImage} credits × {imageCount} images (premium AI processing)
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

          {/* Processing time note */}
          <Banner tone="info">
            <Text as="p" variant="bodySm">
              Virtual Try-On uses advanced AI and typically takes 20-30 seconds to generate {imageCount} images.
            </Text>
          </Banner>

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
