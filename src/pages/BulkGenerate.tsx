import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BlockStack,
  InlineStack,
  Card,
  Text,
  Button,
  Banner,
  Divider,
} from '@shopify/polaris';
import { PlayIcon } from '@shopify/polaris-icons';
import { PageHeader } from '@/components/app/PageHeader';
import { ProductMultiSelect } from '@/components/app/ProductMultiSelect';
import { BulkSettingsCard } from '@/components/app/BulkSettingsCard';
import { BulkProgressTracker } from '@/components/app/BulkProgressTracker';
import { BulkResultsView } from '@/components/app/BulkResultsView';
import { useBulkGeneration } from '@/hooks/useBulkGeneration';
import { mockProducts, mockTemplates, mockModels, mockTryOnPoses, mockShop } from '@/data/mockData';
import type { BulkGenerationConfig } from '@/types/bulk';
import type { Product } from '@/types';
import { calculateBulkCredits, MAX_PRODUCTS_PER_BATCH } from '@/types/bulk';
import { toast } from 'sonner';

type BulkStep = 'select' | 'settings' | 'processing' | 'results';

export default function BulkGenerate() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if products were passed from Generate page
  const passedProducts = (location.state as { selectedProducts?: Product[] })?.selectedProducts;
  const hasPassedProducts = passedProducts && passedProducts.length >= 2;
  
  const [currentStep, setCurrentStep] = useState<BulkStep>(hasPassedProducts ? 'settings' : 'select');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    hasPassedProducts ? new Set(passedProducts.map(p => p.id)) : new Set()
  );
  const [searchQuery, setSearchQuery] = useState('');

  const bulkGeneration = useBulkGeneration({
    models: mockModels,
    poses: mockTryOnPoses,
    templates: mockTemplates,
  });

  // Check for incomplete batches on mount
  useEffect(() => {
    const incompleteBatch = bulkGeneration.checkForIncompleteBatch();
    if (incompleteBatch) {
      toast.info('Found an incomplete bulk generation batch', {
        action: {
          label: 'Resume',
          onClick: () => {
            bulkGeneration.resumeIncompleteBatch(incompleteBatch);
            setCurrentStep('processing');
          },
        },
      });
    }
  }, []);

  // Watch for state changes to update step
  useEffect(() => {
    if (bulkGeneration.state?.status === 'running' || bulkGeneration.state?.status === 'paused') {
      setCurrentStep('processing');
    } else if (bulkGeneration.results) {
      setCurrentStep('results');
    }
  }, [bulkGeneration.state?.status, bulkGeneration.results]);

  const selectedProducts = mockProducts.filter(p => selectedProductIds.has(p.id));

  const handleProceedToSettings = () => {
    if (selectedProductIds.size < 2) {
      toast.error('Select at least 2 products for bulk generation');
      return;
    }
    setCurrentStep('settings');
  };

  const handleBackToSelection = () => {
    setCurrentStep('select');
  };

  const handleStartGeneration = (config: BulkGenerationConfig) => {
    bulkGeneration.startBulkGeneration(selectedProducts, config);
    setCurrentStep('processing');
  };

  const handlePublishAll = () => {
    toast.success('Downloading all images...');
  };

  const handlePublishSelected = (productIds: string[], selectedImages: Map<string, number[]>) => {
    const totalImages = Array.from(selectedImages.values()).reduce((acc, arr) => acc + arr.length, 0);
    toast.success(`Downloading ${totalImages} selected images...`);
  };

  const handleStartNew = () => {
    bulkGeneration.clearResults();
    setSelectedProductIds(new Set());
    setCurrentStep('select');
  };

  return (
    <PageHeader
      title="Bulk Generation"
      backAction={{ content: 'Generate', onAction: () => navigate('/app/generate') }}
    >
      <BlockStack gap="600">
        {/* Info banner */}
        {currentStep === 'select' && (
          <Banner tone="info">
            <Text as="p">
              Select multiple products to generate images for all of them at once using the same settings.
              Maximum {MAX_PRODUCTS_PER_BATCH} products per batch.
            </Text>
          </Banner>
        )}

        {/* Step: Product Selection */}
        {currentStep === 'select' && (
          <Card>
            <BlockStack gap="500">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Select Products
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Choose the products you want to generate images for.
                </Text>
              </BlockStack>

              <ProductMultiSelect
                products={mockProducts}
                selectedIds={selectedProductIds}
                onSelectionChange={setSelectedProductIds}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <Divider />

              {/* Credit estimate preview */}
              {selectedProductIds.size >= 2 && (
                <Card>
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="050">
                      <Text as="p" variant="bodySm" tone="subdued">Estimated credits (4 images/product):</Text>
                      <InlineStack gap="200">
                        <Text as="span" variant="bodyMd">
                          Product-only: <strong>{calculateBulkCredits(selectedProductIds.size, 4, 'product-only')}</strong>
                        </Text>
                        <Text as="span" variant="bodyMd" tone="subdued">|</Text>
                        <Text as="span" variant="bodyMd">
                          Virtual Try-On: <strong>{calculateBulkCredits(selectedProductIds.size, 4, 'virtual-try-on')}</strong>
                        </Text>
                      </InlineStack>
                    </BlockStack>
                    <Text as="p" variant="bodySm">
                      Balance: <strong>{mockShop.creditsBalance}</strong> credits
                    </Text>
                  </InlineStack>
                </Card>
              )}

              <InlineStack align="end" gap="300">
                <Button onClick={() => navigate('/app/generate')}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  icon={PlayIcon}
                  onClick={handleProceedToSettings}
                  disabled={selectedProductIds.size < 2}
                >
                  {`Continue to Settings (${selectedProductIds.size} products)`}
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        )}

        {/* Step: Settings (Inline) */}
        {currentStep === 'settings' && (
          <BulkSettingsCard
            onBack={handleBackToSelection}
            onConfirm={handleStartGeneration}
            selectedProducts={selectedProducts}
            templates={mockTemplates}
            models={mockModels}
            poses={mockTryOnPoses}
            creditsBalance={mockShop.creditsBalance}
          />
        )}

        {/* Step: Processing */}
        {currentStep === 'processing' && bulkGeneration.state && (
          <BulkProgressTracker
            state={bulkGeneration.state}
            onPause={bulkGeneration.pauseGeneration}
            onResume={bulkGeneration.resumeGeneration}
            onCancel={bulkGeneration.cancelGeneration}
          />
        )}

        {/* Step: Results */}
        {currentStep === 'results' && bulkGeneration.results && (
          <BulkResultsView
            results={bulkGeneration.results}
            onPublishAll={handlePublishAll}
            onPublishSelected={handlePublishSelected}
            onStartNew={handleStartNew}
          />
        )}
      </BlockStack>
    </PageHeader>
  );
}
