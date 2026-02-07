import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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

  const handleStartGeneration = (config: BulkGenerationConfig) => {
    bulkGeneration.startBulkGeneration(selectedProducts, config);
    setCurrentStep('processing');
  };

  const handlePublishAll = () => toast.success('Downloading all images...');
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
      <div className="space-y-6">
        {currentStep === 'select' && (
          <Alert>
            <AlertDescription>
              Select multiple products to generate images for all of them at once using the same settings.
              Maximum {MAX_PRODUCTS_PER_BATCH} products per batch.
            </AlertDescription>
          </Alert>
        )}

        {currentStep === 'select' && (
          <Card>
            <CardContent className="p-5 space-y-5">
              <div>
                <h2 className="text-base font-semibold">Select Products</h2>
                <p className="text-sm text-muted-foreground">Choose the products you want to generate images for.</p>
              </div>

              <ProductMultiSelect
                products={mockProducts}
                selectedIds={selectedProductIds}
                onSelectionChange={setSelectedProductIds}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <Separator />

              {selectedProductIds.size >= 2 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Estimated credits (4 images/product):</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span>Product-only: <strong>{calculateBulkCredits(selectedProductIds.size, 4, 'product-only')}</strong></span>
                          <span className="text-muted-foreground">|</span>
                          <span>Virtual Try-On: <strong>{calculateBulkCredits(selectedProductIds.size, 4, 'virtual-try-on')}</strong></span>
                        </div>
                      </div>
                      <p className="text-sm">Balance: <strong>{mockShop.creditsBalance}</strong> credits</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate('/app/generate')}>Cancel</Button>
                <Button onClick={handleProceedToSettings} disabled={selectedProductIds.size < 2}>
                  <Play className="w-4 h-4 mr-2" />
                  Continue to Settings ({selectedProductIds.size} products)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'settings' && (
          <BulkSettingsCard
            onBack={() => setCurrentStep('select')}
            onConfirm={handleStartGeneration}
            selectedProducts={selectedProducts}
            templates={mockTemplates}
            models={mockModels}
            poses={mockTryOnPoses}
            creditsBalance={mockShop.creditsBalance}
          />
        )}

        {currentStep === 'processing' && bulkGeneration.state && (
          <BulkProgressTracker
            state={bulkGeneration.state}
            onPause={bulkGeneration.pauseGeneration}
            onResume={bulkGeneration.resumeGeneration}
            onCancel={bulkGeneration.cancelGeneration}
          />
        )}

        {currentStep === 'results' && bulkGeneration.results && (
          <BulkResultsView
            results={bulkGeneration.results}
            onPublishAll={handlePublishAll}
            onPublishSelected={handlePublishSelected}
            onStartNew={handleStartNew}
          />
        )}
      </div>
    </PageHeader>
  );
}
