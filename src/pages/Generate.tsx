import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BlockStack,
  InlineStack,
  Card,
  Text,
  Button,
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
  ArrowDownIcon,
  RefreshIcon,
  MaximizeIcon,
} from '@shopify/polaris-icons';
import { PageHeader } from '@/components/app/PageHeader';
import { TemplatePreviewCard } from '@/components/app/TemplatePreviewCard';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { PublishModal } from '@/components/app/PublishModal';
import { GenerateConfirmModal } from '@/components/app/GenerateConfirmModal';
import { AspectRatioSelector } from '@/components/app/AspectRatioPreview';
import { RecentProductsList } from '@/components/app/RecentProductsList';
import { mockProducts, mockTemplates, categoryLabels, mockShop } from '@/data/mockData';
import type { Product, Template, TemplateCategory, BrandTone, BackgroundStyle, AspectRatio, ImageQuality } from '@/types';
import { toast } from 'sonner';

type Step = 'product' | 'template' | 'settings' | 'generating' | 'results';

export default function Generate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTemplateId = searchParams.get('template');
  
  const [currentStep, setCurrentStep] = useState<Step>('product');
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selections
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSourceImages, setSelectedSourceImages] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    initialTemplateId ? mockTemplates.find(t => t.templateId === initialTemplateId) || null : null
  );
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  
  // Brand settings - expanded by default on first use
  const [brandKitOpen, setBrandKitOpen] = useState(true);
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
  
  // Modals
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
    // Auto-select first image as source by default
    if (product.images.length > 0) {
      setSelectedSourceImages(new Set([product.images[0].id]));
    } else {
      setSelectedSourceImages(new Set());
    }
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

  const toggleSourceImage = (imageId: string) => {
    setSelectedSourceImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        // Don't allow deselecting if it's the only one
        if (newSet.size > 1) {
          newSet.delete(imageId);
        }
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const selectAllSourceImages = () => {
    if (selectedProduct) {
      setSelectedSourceImages(new Set(selectedProduct.images.map(img => img.id)));
    }
  };

  const clearSourceImages = () => {
    if (selectedProduct && selectedProduct.images.length > 0) {
      // Keep at least the first image selected
      setSelectedSourceImages(new Set([selectedProduct.images[0].id]));
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setAspectRatio(template.defaults.aspectRatio);
    setQuality(template.defaults.quality);
  };

  const handleGenerateClick = () => {
    if (!selectedProduct || !selectedTemplate) return;
    setConfirmModalOpen(true);
  };

  const handleConfirmGenerate = async () => {
    setConfirmModalOpen(false);
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
      
      // Category-appropriate mock generated images
      const categoryMockImages: Record<string, string[]> = {
        clothing: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1485968579169-a6b47d3e24ed?w=800&h=800&fit=crop',
        ],
        cosmetics: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1570194065650-d99fb4b38b8f?w=800&h=800&fit=crop',
        ],
        food: [
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1484723091917-5b05f5e5e8f7?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1517686748843-bb360cfc62b3?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=800&fit=crop',
        ],
        home: [
          'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop',
        ],
        supplements: [
          'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1556227703-3c1e5c29e0a9?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1576017194062-c3bb7ae8ec64?w=800&h=800&fit=crop',
        ],
        universal: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1491553895911-0055uj06d9e4?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&h=800&fit=crop',
        ],
      };
      
      // Use template category to get matching mock images
      const category = selectedTemplate?.category || 'universal';
      const mockGeneratedUrls = (categoryMockImages[category] || categoryMockImages.universal).slice(0, parseInt(imageCount));
      
      setGeneratedImages(mockGeneratedUrls);
      setCurrentStep('results');
      toast.success('Images generated successfully!');
    }, 4000);
  };

  const handlePublishClick = () => {
    if (selectedForPublish.size === 0) {
      toast.error('Please select at least one image to publish');
      return;
    }
    setPublishModalOpen(true);
  };

  const handlePublish = (mode: 'add' | 'replace', variantId?: string) => {
    const count = selectedForPublish.size;
    toast.success(`${count} image${count !== 1 ? 's' : ''} ${mode === 'add' ? 'added to' : 'replaced on'} Shopify!`);
    setPublishModalOpen(false);
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

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleDownloadImage = (index: number) => {
    const url = generatedImages[index];
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-image-${index + 1}.jpg`;
    link.click();
    toast.success('Image downloaded');
  };

  const handleDownloadAll = () => {
    generatedImages.forEach((_, idx) => handleDownloadImage(idx));
    toast.success(`${generatedImages.length} images downloaded`);
  };

  const handleRegenerate = (index: number) => {
    toast.info('Regenerating variation... (this would cost 1 credit)');
    // In a real app, this would call the API with the same seed + variation
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'product': return 1;
      case 'template': return 2;
      case 'settings': return 3;
      case 'generating': return 4;
      case 'results': return 4;
      default: return 1;
    }
  };

  const creditCost = parseInt(imageCount) * (quality === 'high' ? 2 : 1);

  return (
    <PageHeader
      title="Generate Images"
      backAction={{ content: 'Dashboard', onAction: () => navigate('/') }}
    >
      <BlockStack gap="600">
        {/* Progress indicator */}
        <Card>
          <InlineStack gap="400" align="center" wrap={false}>
            {['Product', 'Template', 'Settings', 'Results'].map((step, index) => (
              <InlineStack key={step} gap="200" blockAlign="center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    getStepNumber() > index + 1
                      ? 'bg-shopify-green text-white'
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
                  <span className="hidden sm:inline">{step}</span>
                  <span className="sm:hidden">{index + 1}</span>
                </Text>
                {index < 3 && (
                  <div className={`w-8 sm:w-12 h-0.5 ${getStepNumber() > index + 1 ? 'bg-shopify-green' : 'bg-muted'}`} />
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
                Choose the product you want to generate images for. The AI will use your product details to create the perfect shots.
              </Text>
              
              {/* Recent products */}
              <RecentProductsList
                products={mockProducts}
                onSelect={handleSelectProduct}
                maxItems={3}
              />
              
              <Divider />
              
              <Button
                variant="secondary"
                size="large"
                onClick={() => setProductPickerOpen(true)}
              >
                Browse All Products
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
                  <BlockStack gap="300">
                    <Divider />
                    <BlockStack gap="200">
                      <Text as="h4" variant="headingSm">
                        Source images for generation
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Select which image(s) to use as reference for AI generation:
                      </Text>
                    </BlockStack>
                    
                    <div className="flex flex-wrap gap-3">
                      {selectedProduct.images.map(img => {
                        const isSelected = selectedSourceImages.has(img.id);
                        return (
                          <div
                            key={img.id}
                            onClick={() => toggleSourceImage(img.id)}
                            className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                              isSelected 
                                ? 'ring-2 ring-shopify-green ring-offset-2' 
                                : 'ring-1 ring-border hover:ring-primary'
                            }`}
                          >
                            <img 
                              src={img.url} 
                              alt={img.altText || ''} 
                              className="w-16 h-16 object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-shopify-green/20 flex items-center justify-center">
                                <div className="w-6 h-6 bg-shopify-green rounded-full flex items-center justify-center">
                                  <Icon source={CheckCircleIcon} tone="base" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="p" variant="bodySm" tone="subdued">
                        {selectedSourceImages.size} of {selectedProduct.images.length} selected
                      </Text>
                      {selectedProduct.images.length > 1 && (
                        <InlineStack gap="200">
                          <Button variant="plain" size="micro" onClick={selectAllSourceImages}>
                            Select All
                          </Button>
                          <Button variant="plain" size="micro" onClick={clearSourceImages}>
                            Clear
                          </Button>
                        </InlineStack>
                      )}
                    </InlineStack>
                  </BlockStack>
                )}
                {selectedProduct.images.length === 0 && (
                  <Banner tone="warning">
                    <Text as="p" variant="bodySm">
                      This product has no images. Please add product images in Shopify first.
                    </Text>
                  </Banner>
                )}
              </BlockStack>
            </Card>

            {/* Template Selection */}
            {currentStep === 'template' && (
              <BlockStack gap="400">
                {/* Educational Banner */}
                <Banner tone="info">
                  <Text as="p" variant="bodySm">
                    Templates define the photography style for your images. Each template produces a different look — preview images show example results.
                  </Text>
                </Banner>

                {/* Recommended Templates for this product */}
                {(() => {
                  const recommendedCategory = selectedCategory !== 'all' ? selectedCategory : 'universal';
                  const recommendedTemplates = mockTemplates
                    .filter(t => t.enabled && (t.category === recommendedCategory || t.category === 'universal'))
                    .slice(0, 3);
                  
                  return recommendedTemplates.length > 0 ? (
                    <Card>
                      <BlockStack gap="400">
                        <BlockStack gap="100">
                          <InlineStack gap="200" blockAlign="center">
                            <Text as="h2" variant="headingMd">
                              Recommended for "{selectedProduct.title}"
                            </Text>
                            <Badge tone="success">Best match</Badge>
                          </InlineStack>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Based on your product type ({categoryLabels[recommendedCategory] || 'General'}), these templates work best:
                          </Text>
                        </BlockStack>
                        
                        <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
                          {recommendedTemplates.map(template => (
                            <TemplatePreviewCard
                              key={template.templateId}
                              template={{ ...template, recommended: true }}
                              isSelected={selectedTemplate?.templateId === template.templateId}
                              onSelect={() => handleSelectTemplate(template)}
                              showCredits
                            />
                          ))}
                        </InlineGrid>
                      </BlockStack>
                    </Card>
                  ) : null;
                })()}

                {/* All Templates */}
                <Card>
                  <BlockStack gap="400">
                    <BlockStack gap="200">
                      <Text as="h2" variant="headingMd">
                        All Templates
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Browse all available photography styles
                      </Text>
                    </BlockStack>
                    
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

                    {/* Template grid with preview images */}
                    <InlineGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="400">
                      {filteredTemplates.map(template => (
                        <TemplatePreviewCard
                          key={template.templateId}
                          template={template}
                          isSelected={selectedTemplate?.templateId === template.templateId}
                          onSelect={() => handleSelectTemplate(template)}
                          showCredits
                        />
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
              </BlockStack>
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

                {/* Brand Kit - Expanded by default */}
                <Card>
                  <BlockStack gap="400">
                    <div
                      className="cursor-pointer"
                      onClick={() => setBrandKitOpen(!brandKitOpen)}
                    >
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <InlineStack gap="200" blockAlign="center">
                            <Text as="h3" variant="headingMd">
                              Brand Kit
                            </Text>
                            <Badge tone="info">Recommended</Badge>
                          </InlineStack>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Customize the look to match your brand identity
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
                    <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                      <Select
                        label="Number of Images"
                        options={[
                          { label: '1 image (saves credits)', value: '1' },
                          { label: '4 images (recommended)', value: '4' },
                          { label: '8 images (maximum variety)', value: '8' },
                        ]}
                        value={imageCount}
                        onChange={(v) => setImageCount(v as '1' | '4' | '8')}
                      />
                      <Select
                        label="Output Quality"
                        options={[
                          { label: 'Standard (1 credit/image)', value: 'standard' },
                          { label: 'High (2 credits/image) - More detail', value: 'high' },
                        ]}
                        value={quality}
                        onChange={(v) => setQuality(v as ImageQuality)}
                      />
                    </InlineGrid>
                    
                    {/* Visual Aspect Ratio Selector */}
                    <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                    
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
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="p">
                      This generation will use <strong>{creditCost} credits</strong>
                      {' '}({parseInt(imageCount)} images × {quality === 'high' ? 2 : 1} credit{quality === 'high' ? 's' : ''} each)
                    </Text>
                    <Text as="p" fontWeight="semibold">
                      {mockShop.creditsBalance} credits available
                    </Text>
                  </InlineStack>
                </Banner>

                {/* Generate Button */}
                <InlineStack align="end" gap="200">
                  <Button onClick={() => setCurrentStep('template')}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={handleGenerateClick}>
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
        {currentStep === 'results' && selectedProduct && (
          <BlockStack gap="400">
            {/* Product Context Card - Critical for knowing where images will be published */}
            <Card>
              <BlockStack gap="300">
                <InlineStack gap="200" blockAlign="center">
                  <Badge tone="success">Publishing to</Badge>
                </InlineStack>
                <InlineStack gap="400" blockAlign="center">
                  <Thumbnail
                    source={selectedProduct.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
                    alt={selectedProduct.title}
                    size="large"
                  />
                  <BlockStack gap="100">
                    <Text as="p" variant="headingMd" fontWeight="bold">
                      {selectedProduct.title}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {selectedProduct.vendor}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Currently has {selectedProduct.images.length} image{selectedProduct.images.length !== 1 ? 's' : ''}
                    </Text>
                  </BlockStack>
                </InlineStack>
                {selectedProduct.images.length > 0 && (
                  <>
                    <Divider />
                    <BlockStack gap="200">
                      <Text as="p" variant="bodySm" fontWeight="semibold">
                        Existing product images (for reference)
                      </Text>
                      <InlineStack gap="200">
                        {selectedProduct.images.map(img => (
                          <div key={img.id} className="w-12 h-12 rounded-md overflow-hidden border border-border">
                            <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </InlineStack>
                    </BlockStack>
                  </>
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd">
                      Generated Images
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Click an image to view full size. Select images to publish to Shopify.
                    </Text>
                  </BlockStack>
                  <Button onClick={() => {
                    setCurrentStep('product');
                    setSelectedProduct(null);
                    setSelectedTemplate(null);
                    setGeneratedImages([]);
                    setSelectedForPublish(new Set());
                  }}>
                    Generate More
                  </Button>
                </InlineStack>
                
                <InlineGrid columns={{ xs: 2, md: 4 }} gap="400">
                  {generatedImages.map((url, index) => (
                    <div
                      key={index}
                      className={`generation-preview relative group cursor-pointer rounded-lg overflow-hidden ${
                        selectedForPublish.has(index) ? 'ring-2 ring-shopify-green ring-offset-2' : ''
                      }`}
                    >
                      <img 
                        src={url} 
                        alt={`Generated ${index + 1}`} 
                        className="w-full aspect-square object-cover"
                        onClick={() => toggleImageSelection(index)}
                      />
                      
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(index);
                          }}
                          className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                          title="View full size"
                        >
                          <Icon source={MaximizeIcon} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadImage(index);
                          }}
                          className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                          title="Download"
                        >
                          <Icon source={ArrowDownIcon} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegenerate(index);
                          }}
                          className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                          title="Regenerate variation"
                        >
                          <Icon source={RefreshIcon} />
                        </button>
                      </div>
                      
                      {/* Selection indicator */}
                      <div 
                        className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedForPublish.has(index) 
                            ? 'bg-shopify-green border-shopify-green' 
                            : 'border-white bg-black/30'
                        }`}
                        onClick={() => toggleImageSelection(index)}
                      >
                        {selectedForPublish.has(index) && (
                          <Icon source={CheckCircleIcon} tone="base" />
                        )}
                      </div>
                    </div>
                  ))}
                </InlineGrid>

                <InlineStack align="space-between" blockAlign="center">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Selected: {selectedForPublish.size} of {generatedImages.length} images
                  </Text>
                  <InlineStack gap="200">
                    <Button onClick={() => setSelectedForPublish(new Set(generatedImages.map((_, i) => i)))}>
                      Select All
                    </Button>
                    <Button onClick={() => setSelectedForPublish(new Set())}>
                      Clear Selection
                    </Button>
                  </InlineStack>
                </InlineStack>
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
              <Button onClick={handleDownloadAll} icon={ArrowDownIcon}>
                Download All
              </Button>
              <Button
                variant="primary"
                onClick={handlePublishClick}
                disabled={selectedForPublish.size === 0}
                size="large"
              >
                {`Publish ${selectedForPublish.size} to "${selectedProduct?.title}"`}
              </Button>
            </InlineStack>
          </BlockStack>
        )}
      </BlockStack>

      {/* Modals */}
      <GenerateConfirmModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmGenerate}
        product={selectedProduct}
        template={selectedTemplate}
        sourceImageIds={selectedSourceImages}
        imageCount={parseInt(imageCount)}
        aspectRatio={aspectRatio}
        quality={quality}
        creditsRemaining={mockShop.creditsBalance}
      />

      <PublishModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPublish={handlePublish}
        selectedImages={Array.from(selectedForPublish).map(i => generatedImages[i])}
        product={selectedProduct}
        existingImages={selectedProduct?.images || []}
      />

      <ImageLightbox
        images={generatedImages}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
        onSelect={toggleImageSelection}
        onDownload={handleDownloadImage}
        onRegenerate={handleRegenerate}
        selectedIndices={selectedForPublish}
        productName={selectedProduct?.title}
      />
    </PageHeader>
  );
}
