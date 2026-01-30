import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BlockStack,
  InlineStack,
  Card,
  Text,
  Button,
  Tabs,
  Modal,
  TextField,
  Thumbnail,
  Badge,
  Checkbox,
  Select,
  InlineGrid,
  Divider,
  Banner,
  ProgressBar,
  Collapsible,
  Icon,
} from '@shopify/polaris';
import {
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ImageIcon,
  CheckCircleIcon,
} from '@shopify/polaris-icons';
import { PageHeader } from '@/components/app/PageHeader';
import { mockProducts, mockTemplates, categoryLabels } from '@/data/mockData';
import type { Product, Template, TemplateCategory, BrandTone, BackgroundStyle, AspectRatio, ImageQuality } from '@/types';
import { toast } from 'sonner';

type Step = 'product' | 'template' | 'settings' | 'generating' | 'results';

export default function Generate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('product');
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selections
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  
  // Brand settings
  const [brandKitOpen, setBrandKitOpen] = useState(false);
  const [brandTone, setBrandTone] = useState<BrandTone>('clean');
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('studio');
  const [negatives, setNegatives] = useState<string[]>(['text overlays', 'busy backgrounds']);
  const [consistencyEnabled, setConsistencyEnabled] = useState(true);
  
  // Generation settings
  const [imageCount, setImageCount] = useState<'1' | '4' | '8'>('4');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [quality, setQuality] = useState<ImageQuality>('standard');
  const [preserveAccuracy, setPreserveAccuracy] = useState(true);
  
  // Generating state
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedForPublish, setSelectedForPublish] = useState<Set<number>>(new Set());

  const categories: Array<{ id: TemplateCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Templates' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'cosmetics', label: 'Cosmetics' },
    { id: 'food', label: 'Food' },
    { id: 'home', label: 'Home & Interior' },
    { id: 'supplements', label: 'Supplements' },
    { id: 'universal', label: 'Universal' },
  ];

  const filteredTemplates = mockTemplates.filter(t => {
    if (!t.enabled) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const filteredProducts = mockProducts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductPickerOpen(false);
    // Auto-recommend category based on product type
    const productType = product.productType.toLowerCase();
    if (productType.includes('sweater') || productType.includes('shirt') || productType.includes('apparel')) {
      setSelectedCategory('clothing');
    } else if (productType.includes('serum') || productType.includes('cream') || productType.includes('beauty')) {
      setSelectedCategory('cosmetics');
    } else if (productType.includes('food') || productType.includes('cereal')) {
      setSelectedCategory('food');
    } else if (productType.includes('decor') || productType.includes('home')) {
      setSelectedCategory('home');
    } else if (productType.includes('supplement') || productType.includes('vitamin')) {
      setSelectedCategory('supplements');
    }
    setCurrentStep('template');
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setAspectRatio(template.defaults.aspectRatio);
    setQuality(template.defaults.quality);
  };

  const handleGenerate = async () => {
    if (!selectedProduct || !selectedTemplate) return;
    
    setCurrentStep('generating');
    setGeneratingProgress(0);
    
    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setGeneratingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    // Simulate generation completion
    setTimeout(() => {
      clearInterval(progressInterval);
      setGeneratingProgress(100);
      
      // Mock generated images
      const mockGeneratedUrls = [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop',
      ].slice(0, parseInt(imageCount));
      
      setGeneratedImages(mockGeneratedUrls);
      setCurrentStep('results');
      toast.success('Images generated successfully!');
    }, 4000);
  };

  const handlePublish = () => {
    if (selectedForPublish.size === 0) {
      toast.error('Please select at least one image to publish');
      return;
    }
    toast.success(`${selectedForPublish.size} image(s) published to Shopify!`);
    navigate('/jobs');
  };

  const toggleImageSelection = (index: number) => {
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

  const getStepNumber = () => {
    switch (currentStep) {
      case 'product': return 1;
      case 'template': return 2;
      case 'settings': return 3;
      case 'generating': return 4;
      case 'results': return 5;
      default: return 1;
    }
  };

  return (
    <PageHeader
      title="Generate Images"
      backAction={{ content: 'Dashboard', onAction: () => navigate('/') }}
    >
      <BlockStack gap="600">
        {/* Progress indicator */}
        <Card>
          <InlineStack gap="400" align="center">
            {['Product', 'Template', 'Settings', 'Results'].map((step, index) => (
              <InlineStack key={step} gap="200" blockAlign="center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    getStepNumber() > index + 1
                      ? 'bg-primary text-primary-foreground'
                      : getStepNumber() === index + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {getStepNumber() > index + 1 ? '✓' : index + 1}
                </div>
                <Text
                  as="span"
                  variant="bodySm"
                  fontWeight={getStepNumber() === index + 1 ? 'semibold' : 'regular'}
                  tone={getStepNumber() >= index + 1 ? undefined : 'subdued'}
                >
                  {step}
                </Text>
                {index < 3 && (
                  <div className={`w-12 h-0.5 ${getStepNumber() > index + 1 ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </InlineStack>
            ))}
          </InlineStack>
        </Card>

        {/* Step 1: Product Selection */}
        {currentStep === 'product' && (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Select a Product
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Choose the product you want to generate images for.
              </Text>
              <Button
                variant="secondary"
                size="large"
                onClick={() => setProductPickerOpen(true)}
              >
                Browse Products
              </Button>
            </BlockStack>
          </Card>
        )}

        {/* Product Picker Modal */}
        <Modal
          open={productPickerOpen}
          onClose={() => setProductPickerOpen(false)}
          title="Select a Product"
          size="large"
        >
          <Modal.Section>
            <BlockStack gap="400">
              <TextField
                label="Search products"
                labelHidden
                placeholder="Search by name or vendor..."
                value={searchQuery}
                onChange={setSearchQuery}
                prefix={<Icon source={SearchIcon} />}
                autoComplete="off"
              />
              <BlockStack gap="200">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-hovered transition-colors"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <InlineStack gap="400" blockAlign="center">
                      <Thumbnail
                        source={product.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
                        alt={product.title}
                        size="medium"
                      />
                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          {product.title}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {product.vendor} • {product.productType}
                        </Text>
                        <InlineStack gap="100">
                          {product.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} tone="info">{tag}</Badge>
                          ))}
                        </InlineStack>
                      </BlockStack>
                    </InlineStack>
                  </div>
                ))}
              </BlockStack>
            </BlockStack>
          </Modal.Section>
        </Modal>

        {/* Step 2: Template Selection */}
        {(currentStep === 'template' || currentStep === 'settings') && selectedProduct && (
          <>
            {/* Selected Product Card */}
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    Selected Product
                  </Text>
                  <Button variant="plain" onClick={() => setProductPickerOpen(true)}>
                    Change
                  </Button>
                </InlineStack>
                <InlineStack gap="400" blockAlign="center">
                  <Thumbnail
                    source={selectedProduct.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
                    alt={selectedProduct.title}
                    size="large"
                  />
                  <BlockStack gap="100">
                    <Text as="p" variant="bodyLg" fontWeight="semibold">
                      {selectedProduct.title}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {selectedProduct.vendor} • {selectedProduct.productType}
                    </Text>
                    <InlineStack gap="100">
                      {selectedProduct.tags.map(tag => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </InlineStack>
                  </BlockStack>
                </InlineStack>
                {selectedProduct.images.length > 0 && (
                  <>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Current images ({selectedProduct.images.length})
                    </Text>
                    <InlineStack gap="200">
                      {selectedProduct.images.map(img => (
                        <Thumbnail key={img.id} source={img.url} alt={img.altText || ''} size="small" />
                      ))}
                    </InlineStack>
                  </>
                )}
              </BlockStack>
            </Card>

            {/* Template Selection */}
            {currentStep === 'template' && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Choose a Template
                  </Text>
                  
                  {/* Category tabs */}
                  <InlineStack gap="200" wrap>
                    {categories.map(cat => (
                      <Button
                        key={cat.id}
                        pressed={selectedCategory === cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        {cat.label}
                      </Button>
                    ))}
                  </InlineStack>

                  {/* Template grid */}
                  <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
                    {filteredTemplates.map(template => (
                      <div
                        key={template.templateId}
                        className={`template-card p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedTemplate?.templateId === template.templateId
                            ? 'template-card--selected border-primary'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <BlockStack gap="200">
                          <InlineStack align="space-between">
                            <Text as="h3" variant="bodyMd" fontWeight="semibold">
                              {template.name}
                            </Text>
                            {template.recommended && (
                              <Badge tone="success">Recommended</Badge>
                            )}
                          </InlineStack>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {template.description}
                          </Text>
                          <InlineStack gap="100">
                            {template.tags.map(tag => (
                              <Badge key={tag} tone="info">{tag}</Badge>
                            ))}
                          </InlineStack>
                        </BlockStack>
                      </div>
                    ))}
                  </InlineGrid>

                  <InlineStack align="end">
                    <Button
                      variant="primary"
                      disabled={!selectedTemplate}
                      onClick={() => setCurrentStep('settings')}
                    >
                      Continue to Settings
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            )}

            {/* Settings Step */}
            {currentStep === 'settings' && selectedTemplate && (
              <BlockStack gap="400">
                {/* Selected Template */}
                <Card>
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="h3" variant="headingSm" tone="subdued">
                        Selected Template
                      </Text>
                      <Button variant="plain" onClick={() => setCurrentStep('template')}>
                        Change
                      </Button>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Icon source={ImageIcon} />
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {selectedTemplate.name}
                      </Text>
                      <Badge>{categoryLabels[selectedTemplate.category]}</Badge>
                    </InlineStack>
                  </BlockStack>
                </Card>

                {/* Brand Kit */}
                <Card>
                  <BlockStack gap="400">
                    <div
                      className="cursor-pointer"
                      onClick={() => setBrandKitOpen(!brandKitOpen)}
                    >
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text as="h3" variant="headingMd">
                            Brand Kit (Optional)
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Customize the look to match your brand
                          </Text>
                        </BlockStack>
                        <Icon source={brandKitOpen ? ChevronUpIcon : ChevronDownIcon} />
                      </InlineStack>
                    </div>
                    
                    <Collapsible open={brandKitOpen} id="brand-kit">
                      <BlockStack gap="400">
                        <Divider />
                        <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                          <Select
                            label="Brand Tone"
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
                            label="Background Style"
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
                          label="Things to Avoid (comma separated)"
                          value={negatives.join(', ')}
                          onChange={(v) => setNegatives(v.split(',').map(s => s.trim()))}
                          autoComplete="off"
                          helpText="E.g., hands, text overlays, busy backgrounds"
                        />
                        <Checkbox
                          label="Keep style consistent across all generations"
                          checked={consistencyEnabled}
                          onChange={setConsistencyEnabled}
                        />
                      </BlockStack>
                    </Collapsible>
                  </BlockStack>
                </Card>

                {/* Generation Settings */}
                <Card>
                  <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">
                      Generation Settings
                    </Text>
                    <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
                      <Select
                        label="Number of Images"
                        options={[
                          { label: '1 image', value: '1' },
                          { label: '4 images', value: '4' },
                          { label: '8 images', value: '8' },
                        ]}
                        value={imageCount}
                        onChange={(v) => setImageCount(v as '1' | '4' | '8')}
                      />
                      <Select
                        label="Aspect Ratio"
                        options={[
                          { label: 'Square (1:1)', value: '1:1' },
                          { label: 'Portrait (4:5)', value: '4:5' },
                          { label: 'Wide (16:9)', value: '16:9' },
                        ]}
                        value={aspectRatio}
                        onChange={(v) => setAspectRatio(v as AspectRatio)}
                      />
                      <Select
                        label="Output Quality"
                        options={[
                          { label: 'Standard (1 credit/image)', value: 'standard' },
                          { label: 'High (2 credits/image)', value: 'high' },
                        ]}
                        value={quality}
                        onChange={(v) => setQuality(v as ImageQuality)}
                      />
                    </InlineGrid>
                    <Checkbox
                      label="Preserve product accuracy (strongly recommended)"
                      checked={preserveAccuracy}
                      onChange={setPreserveAccuracy}
                      helpText="Ensures the generated images closely match your actual product"
                    />
                  </BlockStack>
                </Card>

                {/* Credits Notice */}
                <Banner tone="info">
                  This generation will use{' '}
                  <strong>
                    {parseInt(imageCount) * (quality === 'high' ? 2 : 1)} credits
                  </strong>
                  . You have 847 credits remaining.
                </Banner>

                {/* Generate Button */}
                <InlineStack align="end" gap="200">
                  <Button onClick={() => setCurrentStep('template')}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={handleGenerate}>
                    Generate {imageCount} Images
                  </Button>
                </InlineStack>
              </BlockStack>
            )}
          </>
        )}

        {/* Generating State */}
        {currentStep === 'generating' && (
          <Card>
            <BlockStack gap="600" inlineAlign="center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-subtle">
                <Icon source={ImageIcon} tone="primary" />
              </div>
              <BlockStack gap="200" inlineAlign="center">
                <Text as="h2" variant="headingLg">
                  Generating Images...
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  This usually takes 10-15 seconds
                </Text>
              </BlockStack>
              <div className="w-full max-w-md">
                <ProgressBar progress={Math.min(generatingProgress, 100)} size="small" />
              </div>
              <Text as="p" variant="bodySm" tone="subdued">
                Creating {imageCount} images with {selectedTemplate?.name}
              </Text>
            </BlockStack>
          </Card>
        )}

        {/* Results */}
        {currentStep === 'results' && (
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Generated Images
                  </Text>
                  <Button onClick={() => navigate('/generate')}>
                    Generate More
                  </Button>
                </InlineStack>
                
                <InlineGrid columns={{ xs: 2, md: 4 }} gap="400">
                  {generatedImages.map((url, index) => (
                    <div
                      key={index}
                      className={`generation-preview cursor-pointer ${
                        selectedForPublish.has(index) ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      onClick={() => toggleImageSelection(index)}
                    >
                      <img src={url} alt={`Generated ${index + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                      <div className="generation-preview-overlay rounded-lg">
                        <InlineStack gap="100">
                          {selectedForPublish.has(index) && (
                            <Icon source={CheckCircleIcon} tone="success" />
                          )}
                          <Text as="span" variant="bodySm" fontWeight="semibold">
                            {selectedForPublish.has(index) ? 'Selected' : 'Click to select'}
                          </Text>
                        </InlineStack>
                      </div>
                    </div>
                  ))}
                </InlineGrid>

                <Text as="p" variant="bodySm" tone="subdued">
                  Click images to select them for publishing. Selected: {selectedForPublish.size} of {generatedImages.length}
                </Text>
              </BlockStack>
            </Card>

            {/* Prompt Preview */}
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">
                  Prompt Used
                </Text>
                <div className="p-3 bg-surface-subdued rounded-lg font-mono text-sm">
                  {selectedTemplate?.promptBlueprint.sceneDescription}. {selectedProduct?.title} by {selectedProduct?.vendor}. {selectedTemplate?.promptBlueprint.lighting}. {selectedTemplate?.promptBlueprint.cameraStyle}.
                </div>
              </BlockStack>
            </Card>

            {/* Actions */}
            <InlineStack align="end" gap="200">
              <Button variant="plain">
                Download All
              </Button>
              <Button
                variant="primary"
                onClick={handlePublish}
                disabled={selectedForPublish.size === 0}
              >
                Publish {String(selectedForPublish.size)} to Shopify
              </Button>
            </InlineStack>
          </BlockStack>
        )}
      </BlockStack>
    </PageHeader>
  );
}
