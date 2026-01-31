import { useState } from 'react';
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Divider,
  Banner,
  Select,
  ChoiceList,
} from '@shopify/polaris';
import { ArrowLeftIcon, PlayIcon } from '@shopify/polaris-icons';
import type { Product, Template, ModelProfile, TryOnPose, GenerationMode, AspectRatio, ImageQuality } from '@/types';
import type { BulkGenerationConfig } from '@/types/bulk';
import { calculateBulkCredits } from '@/types/bulk';
import { getTemplateImage } from './TemplatePreviewCard';

interface BulkSettingsCardProps {
  onBack: () => void;
  onConfirm: (config: BulkGenerationConfig) => void;
  selectedProducts: Product[];
  templates: Template[];
  models: ModelProfile[];
  poses: TryOnPose[];
  creditsBalance: number;
}

export function BulkSettingsCard({
  onBack,
  onConfirm,
  selectedProducts,
  templates,
  models,
  poses,
  creditsBalance,
}: BulkSettingsCardProps) {
  const [mode, setMode] = useState<GenerationMode>('product-only');
  const [templateId, setTemplateId] = useState<string>(templates[0]?.templateId || '');
  const [modelId, setModelId] = useState<string>(models[0]?.modelId || '');
  const [poseId, setPoseId] = useState<string>(poses[0]?.poseId || '');
  const [imageCount, setImageCount] = useState<1 | 4 | 8>(4);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [quality, setQuality] = useState<ImageQuality>('standard');

  const productCount = selectedProducts.length;
  const estimatedCredits = calculateBulkCredits(productCount, imageCount, mode);
  const hasEnoughCredits = estimatedCredits <= creditsBalance;

  // Check if all products are clothing (for virtual try-on)
  const allClothing = selectedProducts.every(p => {
    const type = p.productType.toLowerCase();
    const clothingKeywords = ['sweater', 'shirt', 'apparel', 'dress', 'jacket', 'pants', 'hoodie', 'legging', 'bra', 'tank', 'jogger', 'top'];
    return clothingKeywords.some(kw => type.includes(kw)) || 
           p.tags.some(tag => clothingKeywords.some(kw => tag.toLowerCase().includes(kw)));
  });

  const handleConfirm = () => {
    const config: BulkGenerationConfig = {
      mode,
      templateId: mode === 'product-only' ? templateId : undefined,
      modelId: mode === 'virtual-try-on' ? modelId : undefined,
      poseId: mode === 'virtual-try-on' ? poseId : undefined,
      imageCount,
      aspectRatio,
      quality,
    };
    onConfirm(config);
  };

  return (
    <Card>
      <BlockStack gap="500">
        {/* Summary banner */}
        <Banner tone="info">
          <Text as="p">
            Generating for <strong>{productCount} products</strong> • {imageCount} images each • 
            <strong> {productCount * imageCount} total images</strong>
          </Text>
        </Banner>

        {/* Mode selection */}
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm">Generation Mode</Text>
          <ChoiceList
            title=""
            titleHidden
            choices={[
              {
                label: 'Product Photography',
                value: 'product-only',
                helpText: 'Use templates for product-focused shots (~1 credit/image)',
              },
              {
                label: 'Virtual Try-On',
                value: 'virtual-try-on',
                helpText: 'Place clothing on AI models (~3 credits/image)',
                disabled: !allClothing,
              },
            ]}
            selected={[mode]}
            onChange={(selected) => setMode(selected[0] as GenerationMode)}
          />
          {!allClothing && mode === 'product-only' && (
            <Text as="p" variant="bodySm" tone="subdued">
              Virtual Try-On requires all selected products to be clothing items.
            </Text>
          )}
        </BlockStack>

        <Divider />

        {/* Template or Model+Pose selection */}
        {mode === 'product-only' ? (
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">Select Template</Text>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {templates.filter(t => t.enabled).map(template => (
                <div
                  key={template.templateId}
                  onClick={() => setTemplateId(template.templateId)}
                  className={`cursor-pointer rounded-lg border-2 transition-all ${
                    templateId === template.templateId 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="aspect-square rounded-t-md overflow-hidden">
                    <img 
                      src={getTemplateImage(template.templateId)} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <Text as="p" variant="bodySm" fontWeight="medium" truncate>
                      {template.name}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </BlockStack>
        ) : (
          <BlockStack gap="400">
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">Select Model</Text>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {models.map(model => (
                  <div
                    key={model.modelId}
                    onClick={() => setModelId(model.modelId)}
                    className={`cursor-pointer rounded-lg border-2 p-1 transition-all ${
                      modelId === model.modelId 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="aspect-[3/4] rounded overflow-hidden mb-1">
                      <img 
                        src={model.previewUrl} 
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Text as="p" variant="bodySm" truncate alignment="center">
                      {model.name}
                    </Text>
                  </div>
                ))}
              </div>
            </BlockStack>

            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">Select Pose</Text>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {poses.map(pose => (
                  <div
                    key={pose.poseId}
                    onClick={() => setPoseId(pose.poseId)}
                    className={`cursor-pointer rounded-lg border-2 p-1 transition-all ${
                      poseId === pose.poseId 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="aspect-[3/4] rounded overflow-hidden mb-1">
                      <img 
                        src={pose.previewUrl} 
                        alt={pose.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Text as="p" variant="bodySm" truncate alignment="center">
                      {pose.name}
                    </Text>
                  </div>
                ))}
              </div>
            </BlockStack>
          </BlockStack>
        )}

        <Divider />

        {/* Generation options */}
        <InlineStack gap="400" wrap>
          <div className="flex-1 min-w-[120px]">
            <Select
              label="Images per product"
              options={[
                { label: '1 image', value: '1' },
                { label: '4 images', value: '4' },
                { label: '8 images', value: '8' },
              ]}
              value={String(imageCount)}
              onChange={(val) => setImageCount(Number(val) as 1 | 4 | 8)}
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <Select
              label="Aspect Ratio"
              options={[
                { label: '1:1 Square', value: '1:1' },
                { label: '4:5 Portrait', value: '4:5' },
                { label: '16:9 Wide', value: '16:9' },
              ]}
              value={aspectRatio}
              onChange={(val) => setAspectRatio(val as AspectRatio)}
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <Select
              label="Quality"
              options={[
                { label: 'Standard', value: 'standard' },
                { label: 'High', value: 'high' },
              ]}
              value={quality}
              onChange={(val) => setQuality(val as ImageQuality)}
            />
          </div>
        </InlineStack>

        <Divider />

        {/* Credit summary */}
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <BlockStack gap="200">
            <InlineStack align="space-between">
              <Text as="span" variant="bodyMd">Estimated cost:</Text>
              <InlineStack gap="200" align="center">
                <Badge tone={hasEnoughCredits ? 'success' : 'critical'}>
                  {`${estimatedCredits} credits`}
                </Badge>
              </InlineStack>
            </InlineStack>
            <InlineStack align="space-between">
              <Text as="span" variant="bodySm" tone="subdued">Your balance:</Text>
              <Text as="span" variant="bodySm">{creditsBalance} credits</Text>
            </InlineStack>
            {!hasEnoughCredits && (
              <Banner tone="critical">
                <Text as="p">
                  Not enough credits. You need {estimatedCredits - creditsBalance} more credits.
                </Text>
              </Banner>
            )}
          </BlockStack>
        </div>

        {/* Action buttons */}
        <InlineStack align="space-between">
          <Button icon={ArrowLeftIcon} onClick={onBack}>
            Back to Selection
          </Button>
          <Button
            variant="primary"
            icon={PlayIcon}
            onClick={handleConfirm}
            disabled={!hasEnoughCredits || (mode === 'virtual-try-on' && !allClothing)}
          >
            {`Generate ${productCount * imageCount} Images`}
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
