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
  Link,
  Icon,
} from '@shopify/polaris';
import { ExternalIcon, QuestionCircleIcon, ChatIcon } from '@shopify/polaris-icons';
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

  // Default image settings
  const [defaultAspectRatio, setDefaultAspectRatio] = useState<string>('1:1');
  const [defaultImageCount, setDefaultImageCount] = useState<string>('4');

  // Permissions
  const [restrictPromptEditing, setRestrictPromptEditing] = useState(true);

  // Notification settings
  const [emailOnComplete, setEmailOnComplete] = useState(true);
  const [emailOnFailed, setEmailOnFailed] = useState(true);
  const [emailLowCredits, setEmailLowCredits] = useState(true);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(false);
  const [inAppComplete, setInAppComplete] = useState(true);
  const [inAppFailed, setInAppFailed] = useState(true);
  const [inAppTips, setInAppTips] = useState(true);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const creditsUsed = 1000 - mockShop.creditsBalance;
  const creditsTotal = 1000;
  const creditsPercentage = (mockShop.creditsBalance / creditsTotal) * 100;

  const appVersion = '1.2.0';
  const lastUpdated = '2026-01-28';

  return (
    <PageHeader title="Settings">
      <BlockStack gap="600">
        {/* Brand Defaults */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">Brand Defaults</Text>
              <Text as="p" variant="bodySm" tone="subdued">Set default brand settings for all new generations</Text>
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

        {/* Default Image Settings */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">Default Image Settings</Text>
              <Text as="p" variant="bodySm" tone="subdued">Set defaults for new generation jobs</Text>
            </BlockStack>
            
            <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
              <Select
                label="Default Aspect Ratio"
                options={[
                  { label: '1:1 (Square)', value: '1:1' },
                  { label: '4:5 (Portrait)', value: '4:5' },
                  { label: '16:9 (Landscape)', value: '16:9' },
                  { label: '9:16 (Story)', value: '9:16' },
                ]}
                value={defaultAspectRatio}
                onChange={setDefaultAspectRatio}
                helpText="Applied when starting a new generation"
              />
              <Select
                label="Default Image Count"
                options={[
                  { label: '1 image', value: '1' },
                  { label: '4 images', value: '4' },
                  { label: '8 images', value: '8' },
                ]}
                value={defaultImageCount}
                onChange={setDefaultImageCount}
                helpText="Number of images per generation"
              />
            </InlineGrid>
          </BlockStack>
        </Card>

        {/* Notification Settings */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">Notifications</Text>
              <Text as="p" variant="bodySm" tone="subdued">Manage how you receive updates</Text>
            </BlockStack>
            
            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">Email Notifications</Text>
              <Checkbox
                label="Generation complete"
                checked={emailOnComplete}
                onChange={setEmailOnComplete}
                helpText="Receive email when image generation finishes"
              />
              <Checkbox
                label="Generation failed"
                checked={emailOnFailed}
                onChange={setEmailOnFailed}
                helpText="Receive email if generation encounters an error"
              />
              <Checkbox
                label="Low credits warning"
                checked={emailLowCredits}
                onChange={setEmailLowCredits}
                helpText="Get notified when credits drop below 10%"
              />
              <Checkbox
                label="Weekly usage digest"
                checked={emailWeeklyDigest}
                onChange={setEmailWeeklyDigest}
                helpText="Weekly summary of generations and credit usage"
              />
            </BlockStack>

            <Divider />

            <BlockStack gap="300">
              <Text as="h3" variant="headingSm">In-App Notifications</Text>
              <Checkbox
                label="Show generation complete"
                checked={inAppComplete}
                onChange={setInAppComplete}
              />
              <Checkbox
                label="Show generation errors"
                checked={inAppFailed}
                onChange={setInAppFailed}
              />
              <Checkbox
                label="Show tips and suggestions"
                checked={inAppTips}
                onChange={setInAppTips}
                helpText="Occasional tips to improve your generations"
              />
            </BlockStack>
          </BlockStack>
        </Card>

        {/* Publishing Defaults */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">Publishing Defaults</Text>
              <Text as="p" variant="bodySm" tone="subdued">Configure how generated images are published to Shopify</Text>
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
              <Text as="h2" variant="headingMd">AI Model Settings</Text>
              <Text as="p" variant="bodySm" tone="subdued">Configure the AI image generation model</Text>
            </BlockStack>
            
            <InlineStack gap="200" blockAlign="center">
              <Text as="p" variant="bodyMd">Model:</Text>
              <Badge tone="info">nanobanna-v1</Badge>
              <Text as="p" variant="bodySm" tone="subdued">(Latest stable version)</Text>
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
              <Text as="h2" variant="headingMd">Billing & Credits</Text>
              <Text as="p" variant="bodySm" tone="subdued">Manage your subscription and view credit usage</Text>
            </BlockStack>
            
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text as="p" variant="bodyMd">Current Plan</Text>
                <InlineStack gap="200" blockAlign="center">
                  <Badge tone="success">Pro</Badge>
                  <Text as="p" variant="bodySm" tone="subdued">1,000 credits/month</Text>
                </InlineStack>
              </BlockStack>
              <Button>Upgrade Plan</Button>
            </InlineStack>

            <Divider />
            
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text as="p" variant="bodyMd">Credits Remaining</Text>
                <Text as="p" variant="bodyMd" fontWeight="semibold">{mockShop.creditsBalance} / {creditsTotal}</Text>
              </InlineStack>
              <ProgressBar progress={creditsPercentage} size="small" tone="primary" />
              <Text as="p" variant="bodySm" tone="subdued">Resets on the 1st of each month</Text>
            </BlockStack>

            <Banner tone="info">Need more credits? Upgrade your plan or purchase additional credits.</Banner>
          </BlockStack>
        </Card>

        {/* Team & Permissions */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">Team & Permissions</Text>
              <Text as="p" variant="bodySm" tone="subdued">Control access to advanced features</Text>
            </BlockStack>
            
            <Checkbox
              label="Restrict prompt editing to admins only"
              checked={restrictPromptEditing}
              onChange={setRestrictPromptEditing}
              helpText="Only admin users can edit prompts directly"
            />
          </BlockStack>
        </Card>

        {/* Help & Support */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">Help & Support</Text>
              <Text as="p" variant="bodySm" tone="subdued">Get help and learn more about the app</Text>
            </BlockStack>
            
            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
              <Button
                icon={QuestionCircleIcon}
                onClick={() => window.open('https://docs.example.com', '_blank')}
                fullWidth
              >
                Documentation
              </Button>
              <Button
                icon={ChatIcon}
                onClick={() => window.open('mailto:support@example.com', '_blank')}
                fullWidth
              >
                Contact Support
              </Button>
              <Button
                icon={QuestionCircleIcon}
                onClick={() => window.open('https://docs.example.com/faq', '_blank')}
                fullWidth
              >
                FAQ
              </Button>
            </InlineGrid>
          </BlockStack>
        </Card>

        {/* About */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingMd">About</Text>
              <Text as="p" variant="bodySm" tone="subdued">App information and updates</Text>
            </BlockStack>
            
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <InlineStack gap="200" blockAlign="center">
                  <Text as="p" variant="bodyMd">Version</Text>
                  <Badge>{appVersion}</Badge>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">Last updated: {lastUpdated}</Text>
              </BlockStack>
              <Button variant="plain" onClick={() => toast.info('Changelog coming soon!')}>
                What's New
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Save Button */}
        <InlineStack align="end">
          <Button variant="primary" onClick={handleSave}>Save Settings</Button>
        </InlineStack>
      </BlockStack>
    </PageHeader>
  );
}