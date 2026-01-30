import { useState } from 'react';
import {
  BlockStack,
  InlineStack,
  Card,
  Text,
  Button,
  TextField,
  Select,
  Checkbox,
  Divider,
  Banner,
  InlineGrid,
  ProgressBar,
  Badge,
} from '@shopify/polaris';
import { PageHeader } from '@/components/app/PageHeader';
import { mockShop } from '@/data/mockData';
import type { BrandTone, BackgroundStyle } from '@/types';
import { toast } from 'sonner';

export default function Settings() {
  // Brand defaults
  const [brandTone, setBrandTone] = useState<BrandTone>(mockShop.brandDefaults.tone);
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>(mockShop.brandDefaults.backgroundStyle);
  const [negatives, setNegatives] = useState(mockShop.brandDefaults.negatives.join(', '));
  const [consistencyEnabled, setConsistencyEnabled] = useState(mockShop.brandDefaults.consistencyEnabled);

  // Publishing defaults
  const [publishMode, setPublishMode] = useState<'add' | 'replace'>('add');
  const [autoPublish, setAutoPublish] = useState(false);

  // AI settings
  const [defaultQuality, setDefaultQuality] = useState<'standard' | 'high'>('standard');

  // Permissions
  const [restrictPromptEditing, setRestrictPromptEditing] = useState(true);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const creditsUsed = 1000 - mockShop.creditsBalance;
  const creditsTotal = 1000;
  const creditsPercentage = (mockShop.creditsBalance / creditsTotal) * 100;

  return (
    <PageHeader title="Settings">
      <BlockStack gap="600">
        {/* Brand Defaults */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">
                Brand Defaults
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Set default brand settings for all new generations
              </Text>
            </BlockStack>
            
            <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
              <Select
                label="Default Brand Tone"
                options={[
                  { label: 'Clean', value: 'clean' },
                  { label: 'Luxury', value: 'luxury' },
                  { label: 'Playful', value: 'playful' },
                  { label: 'Bold', value: 'bold' },
                  { label: 'Minimal', value: 'minimal' },
                ]}
                value={brandTone}
                onChange={(v) => setBrandTone(v as BrandTone)}
              />
              <Select
                label="Default Background Style"
                options={[
                  { label: 'Studio', value: 'studio' },
                  { label: 'Lifestyle', value: 'lifestyle' },
                  { label: 'Gradient', value: 'gradient' },
                  { label: 'Pattern', value: 'pattern' },
                  { label: 'Contextual Scene', value: 'contextual' },
                ]}
                value={backgroundStyle}
                onChange={(v) => setBackgroundStyle(v as BackgroundStyle)}
              />
            </InlineGrid>
            
            <TextField
              label="Default Negative List"
              value={negatives}
              onChange={setNegatives}
              autoComplete="off"
              helpText="Comma-separated list of things to avoid in generations"
            />
            
            <Checkbox
              label="Enable style consistency by default"
              checked={consistencyEnabled}
              onChange={setConsistencyEnabled}
              helpText="Keep visual style consistent across all generations"
            />
          </BlockStack>
        </Card>

        {/* Publishing Defaults */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">
                Publishing Defaults
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Configure how generated images are published to Shopify
              </Text>
            </BlockStack>
            
            <Select
              label="Default Publish Mode"
              options={[
                { label: 'Add as new images', value: 'add' },
                { label: 'Replace existing images', value: 'replace' },
              ]}
              value={publishMode}
              onChange={(v) => setPublishMode(v as 'add' | 'replace')}
              helpText="How images are added to products by default"
            />
            
            <Checkbox
              label="Auto-publish successful generations"
              checked={autoPublish}
              onChange={setAutoPublish}
              helpText="Automatically publish images to Shopify when generation completes"
            />
          </BlockStack>
        </Card>

        {/* AI Model Settings */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">
                AI Model Settings
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Configure the AI image generation model
              </Text>
            </BlockStack>
            
            <InlineStack gap="200" blockAlign="center">
              <Text as="p" variant="bodyMd">
                Model:
              </Text>
              <Badge tone="info">nanobanna-v1</Badge>
              <Text as="p" variant="bodySm" tone="subdued">
                (Latest stable version)
              </Text>
            </InlineStack>
            
            <Select
              label="Default Quality Mode"
              options={[
                { label: 'Standard (1 credit/image)', value: 'standard' },
                { label: 'High (2 credits/image)', value: 'high' },
              ]}
              value={defaultQuality}
              onChange={(v) => setDefaultQuality(v as 'standard' | 'high')}
            />
          </BlockStack>
        </Card>

        {/* Billing & Credits */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">
                Billing & Credits
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Manage your subscription and view credit usage
              </Text>
            </BlockStack>
            
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text as="p" variant="bodyMd">
                  Current Plan
                </Text>
                <InlineStack gap="200" blockAlign="center">
                  <Badge tone="success">Pro</Badge>
                  <Text as="p" variant="bodySm" tone="subdued">
                    1,000 credits/month
                  </Text>
                </InlineStack>
              </BlockStack>
              <Button>Upgrade Plan</Button>
            </InlineStack>

            <Divider />
            
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text as="p" variant="bodyMd">
                  Credits Remaining
                </Text>
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  {mockShop.creditsBalance} / {creditsTotal}
                </Text>
              </InlineStack>
              <ProgressBar progress={creditsPercentage} size="small" tone="primary" />
              <Text as="p" variant="bodySm" tone="subdued">
                Resets on the 1st of each month
              </Text>
            </BlockStack>

            <Banner tone="info">
              Need more credits? Upgrade your plan or purchase additional credits.
            </Banner>
          </BlockStack>
        </Card>

        {/* Team & Permissions */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">
                Team & Permissions
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Control access to advanced features
              </Text>
            </BlockStack>
            
            <Checkbox
              label="Restrict prompt editing to admins only"
              checked={restrictPromptEditing}
              onChange={setRestrictPromptEditing}
              helpText="Only admin users can edit prompts directly"
            />
          </BlockStack>
        </Card>

        {/* Save Button */}
        <InlineStack align="end">
          <Button variant="primary" onClick={handleSave}>
            Save Settings
          </Button>
        </InlineStack>
      </BlockStack>
    </PageHeader>
  );
}
