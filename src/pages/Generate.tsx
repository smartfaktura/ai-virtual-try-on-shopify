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
  XIcon,
  PersonIcon,
  ListBulletedIcon,
} from '@shopify/polaris-icons';
import { PageHeader } from '@/components/app/PageHeader';
import { TemplatePreviewCard, getTemplateImage } from '@/components/app/TemplatePreviewCard';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { PublishModal } from '@/components/app/PublishModal';
import { GenerateConfirmModal } from '@/components/app/GenerateConfirmModal';
import { TryOnConfirmModal } from '@/components/app/TryOnConfirmModal';
import { useGenerateTryOn } from '@/hooks/useGenerateTryOn';
import { AspectRatioSelector } from '@/components/app/AspectRatioPreview';
import { RecentProductsList } from '@/components/app/RecentProductsList';
import { NegativesChipSelector } from '@/components/app/NegativesChipSelector';
import { ModelSelectorCard } from '@/components/app/ModelSelectorCard';
import { PoseSelectorCard } from '@/components/app/PoseSelectorCard';
import { GenerationModeToggle } from '@/components/app/GenerationModeToggle';
import { ModelFilterBar } from '@/components/app/ModelFilterBar';
import { PoseCategorySection } from '@/components/app/PoseCategorySection';
import { TryOnPreview } from '@/components/app/TryOnPreview';
import { PopularCombinations, createPopularCombinations } from '@/components/app/PopularCombinations';
import { SourceTypeSelector } from '@/components/app/SourceTypeSelector';
import { UploadSourceCard } from '@/components/app/UploadSourceCard';
import { ProductAssignmentModal } from '@/components/app/ProductAssignmentModal';
import { ProductMultiSelect } from '@/components/app/ProductMultiSelect';
import { useFileUpload } from '@/hooks/useFileUpload';
import { mockProducts, mockTemplates, categoryLabels, mockShop, mockModels, mockTryOnPoses, genderLabels } from '@/data/mockData';
import type { Product, Template, TemplateCategory, BrandTone, BackgroundStyle, AspectRatio, ImageQuality, GenerationMode, ModelProfile, TryOnPose, ModelGender, ModelBodyType, ModelAgeRange, PoseCategory, GenerationSourceType, ScratchUpload } from '@/types';
import { toast } from 'sonner';

type Step = 'source' | 'product' | 'upload' | 'mode' | 'model' | 'pose' | 'template' | 'settings' | 'generating' | 'results';

export default function Generate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTemplateId = searchParams.get('template');
  
  const [currentStep, setCurrentStep] = useState<Step>('source');
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  
  // Source type for generation
  const [sourceType, setSourceType] = useState<GenerationSourceType>('product');
  const [scratchUpload, setScratchUpload] = useState<ScratchUpload | null>(null);
  const [assignToProduct, setAssignToProduct] = useState<Product | null>(null);
  const [productAssignmentModalOpen, setProductAssignmentModalOpen] = useState(false);
  
  // File upload hook
  const { upload: uploadFile, isUploading } = useFileUpload();
  
  // Selections
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSourceImages, setSelectedSourceImages] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    initialTemplateId ? mockTemplates.find(t => t.templateId === initialTemplateId) || null : null
  );
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  
  // Virtual Try-On state
  const [generationMode, setGenerationMode] = useState<GenerationMode>('product-only');
  const [selectedModel, setSelectedModel] = useState<ModelProfile | null>(null);
  const [selectedPose, setSelectedPose] = useState<TryOnPose | null>(null);
  const [modelGenderFilter, setModelGenderFilter] = useState<ModelGender | 'all'>('all');
  const [modelBodyTypeFilter, setModelBodyTypeFilter] = useState<ModelBodyType | 'all'>('all');
  const [modelAgeFilter, setModelAgeFilter] = useState<ModelAgeRange | 'all'>('all');
  
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
  const [tryOnConfirmModalOpen, setTryOnConfirmModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Virtual Try-On generation hook
  const { generate: generateTryOn, isLoading: isTryOnGenerating, progress: tryOnProgress } = useGenerateTryOn();

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

  // Filter models by gender, body type, and age
  const filteredModels = mockModels.filter(m => {
    if (modelGenderFilter !== 'all' && m.gender !== modelGenderFilter) return false;
    if (modelBodyTypeFilter !== 'all' && m.bodyType !== modelBodyTypeFilter) return false;
    if (modelAgeFilter !== 'all' && m.ageRange !== modelAgeFilter) return false;
    return true;
  });

  // Group poses by category
  const posesByCategory = mockTryOnPoses.reduce((acc, pose) => {
    if (!acc[pose.category]) acc[pose.category] = [];
    acc[pose.category].push(pose);
    return acc;
  }, {} as Record<PoseCategory, TryOnPose[]>);

  // Create popular combinations
  const popularCombinations = createPopularCombinations(mockModels, mockTryOnPoses);

  // Check if product is clothing-related
  const isClothingProduct = (product: Product | null) => {
    if (!product) return false;
    const productType = product.productType.toLowerCase();
    // Expanded keywords to include all athleisure and athletic clothing
    const clothingKeywords = [
      'sweater', 'shirt', 'apparel', 'dress', 'jacket', 'pants', 'jeans', 'coat', 
      'blouse', 'skirt', 'suit', 'hoodie', 't-shirt', 'clothing',
      // Athletic/athleisure additions
      'legging', 'bra', 'sports bra', 'tank', 'jogger', 'shorts', 'top', 
      'long sleeve', 'crop', 'bodysuit', 'romper', 'jumpsuit', 'sweatshirt',
      'pullover', 'cardigan', 'vest', 'active', 'athletic', 'yoga', 'workout'
    ];
    return clothingKeywords.some(kw => productType.includes(kw)) || 
           product.tags.some(tag => clothingKeywords.some(kw => tag.toLowerCase().includes(kw)));
  };

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
    
    // If clothing product, show mode selection first
    if (isClothingProduct(product)) {
      setCurrentStep('mode');
    } else {
      setCurrentStep('template');
    }
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
    toast.success(`"${template.name}" selected! Click Continue when ready.`);
  };

  const handleSelectModel = (model: ModelProfile) => {
    setSelectedModel(model);
    toast.success(`Model "${model.name}" selected!`);
  };

  const handleSelectPose = (pose: TryOnPose) => {
    setSelectedPose(pose);
    toast.success(`Pose "${pose.name}" selected!`);
  };

  const handleCancelGeneration = () => {
    setCurrentStep('settings');
    setGeneratingProgress(0);
    toast.info('Generation cancelled');
  };

  const handleGenerateClick = () => {
    if (!selectedProduct) return;
    
    // Virtual Try-On mode
    if (generationMode === 'virtual-try-on') {
      if (!selectedModel || !selectedPose) {
        toast.error('Please select a model and pose first');
        return;
      }
      setTryOnConfirmModalOpen(true);
      return;
    }
    
    // Product-only mode
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }
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

  // Virtual Try-On generation with real AI
  const handleTryOnConfirmGenerate = async () => {
    if (!selectedModel || !selectedPose) return;
    
    // Get the source image URL - from product or scratch upload
    let sourceImageUrl = '';
    let productData: { title: string; productType: string; description: string } | null = null;
    
    if (sourceType === 'scratch' && scratchUpload?.uploadedUrl) {
      sourceImageUrl = scratchUpload.uploadedUrl;
      productData = {
        title: scratchUpload.productInfo.title,
        productType: scratchUpload.productInfo.productType,
        description: scratchUpload.productInfo.description,
      };
    } else if (selectedProduct) {
      const selectedImageId = Array.from(selectedSourceImages)[0];
      const sourceImage = selectedProduct.images.find(img => img.id === selectedImageId);
      sourceImageUrl = sourceImage?.url || selectedProduct.images[0]?.url || '';
      productData = {
        title: selectedProduct.title,
        productType: selectedProduct.productType,
        description: selectedProduct.description,
      };
    }
    
    if (!sourceImageUrl || !productData) {
      toast.error('No source image available');
      return;
    }
    
    setTryOnConfirmModalOpen(false);
    setCurrentStep('generating');
    setGeneratingProgress(0);
    
    // Create a pseudo-product for the generation
    const pseudoProduct: Product = selectedProduct || {
      id: 'scratch-' + Date.now(),
      title: productData.title,
      vendor: 'Custom Upload',
      productType: productData.productType,
      tags: [],
      description: productData.description,
      images: [{ id: 'scratch-img', url: sourceImageUrl }],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await generateTryOn({
      product: pseudoProduct,
      model: selectedModel,
      pose: selectedPose,
      aspectRatio,
      imageCount: parseInt(imageCount),
      sourceImageUrl,
      modelImageUrl: selectedModel.previewUrl,
    });
    
    if (result && result.images.length > 0) {
      setGeneratedImages(result.images);
      setGeneratingProgress(100);
      setCurrentStep('results');
      
      // Mock credit deduction
      const creditCost = result.generatedCount * 3;
      toast.success(`Generated ${result.generatedCount} images! Used ${creditCost} credits.`);
    } else {
      // Generation failed, go back to settings
      setCurrentStep('settings');
    }
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
    if (generationMode === 'virtual-try-on') {
      switch (currentStep) {
        case 'source': return 1;
        case 'product': return 1;
        case 'upload': return 1;
        case 'mode': return 1;
        case 'model': return 2;
        case 'pose': return 3;
        case 'settings': return 4;
        case 'generating': return 5;
        case 'results': return 5;
        default: return 1;
      }
    } else {
      switch (currentStep) {
        case 'source': return 1;
        case 'product': return 1;
        case 'upload': return 1;
        case 'mode': return 1;
        case 'template': return 2;
        case 'settings': return 3;
        case 'generating': return 4;
        case 'results': return 4;
        default: return 1;
      }
    }
  };

  const getSteps = () => {
    if (generationMode === 'virtual-try-on') {
      return [
        { name: sourceType === 'scratch' ? 'Source' : 'Product', desc: sourceType === 'scratch' ? 'Upload your image' : 'Pick what you\'re selling' },
        { name: 'Model', desc: 'Choose a model' },
        { name: 'Pose', desc: 'Pick the style' },
        { name: 'Settings', desc: 'Adjust details' },
        { name: 'Results', desc: 'Review & publish' },
      ];
    }
    return [
      { name: sourceType === 'scratch' ? 'Source' : 'Product', desc: sourceType === 'scratch' ? 'Upload your image' : 'Pick what you\'re selling' },
      { name: 'Template', desc: 'Choose a style' },
      { name: 'Settings', desc: 'Adjust details' },
      { name: 'Results', desc: 'Review & publish' },
    ];
  };

  // Virtual Try-On credit cost is higher
  const creditCost = generationMode === 'virtual-try-on' 
    ? parseInt(imageCount) * 3 
    : parseInt(imageCount) * (quality === 'high' ? 2 : 1);

  return (
    <PageHeader
      title="Generate Images"
      backAction={{ content: 'Dashboard', onAction: () => navigate('/') }}
    >
      <BlockStack gap="600">
        {/* Progress indicator with step descriptions - Mobile optimized */}
        <Card>
          <BlockStack gap="200">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <InlineStack gap="200" align="center" wrap={false}>
                {getSteps().map((step, index) => (
                  <InlineStack key={step.name} gap="100" blockAlign="center">
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                        getStepNumber() > index + 1
                          ? 'bg-primary text-primary-foreground'
                          : getStepNumber() === index + 1
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {getStepNumber() > index + 1 ? '✓' : index + 1}
                    </div>
                    <BlockStack gap="0">
                      <Text
                        as="span"
                        variant="bodySm"
                        fontWeight={getStepNumber() === index + 1 ? 'semibold' : 'regular'}
                        tone={getStepNumber() >= index + 1 ? undefined : 'subdued'}
                      >
                        <span className="hidden md:inline">{step.name}</span>
                      </Text>
                    </BlockStack>
                    {index < getSteps().length - 1 && (
                      <div className={`w-4 sm:w-8 md:w-12 h-0.5 flex-shrink-0 ${getStepNumber() > index + 1 ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </InlineStack>
                ))}
              </InlineStack>
            </div>
            <Text as="p" variant="bodySm" tone="subdued" alignment="center">
              <span className="text-xs sm:text-sm">{generationMode === 'virtual-try-on' ? 'About 3-4 minutes total' : 'About 2-3 minutes total'}</span>
            </Text>
          </BlockStack>
        </Card>

        {/* Step 0: Source Type Selection */}
        {currentStep === 'source' && (
          <Card>
            <BlockStack gap="500">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  How do you want to start?
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Choose whether to use existing Shopify products or upload your own image file.
                </Text>
              </BlockStack>

              <SourceTypeSelector
                sourceType={sourceType}
                onChange={(type) => {
                  setSourceType(type);
                  // Reset relevant state when switching
                  if (type === 'scratch') {
                    setSelectedProduct(null);
                    setScratchUpload(null);
                  } else {
                    setScratchUpload(null);
                  }
                }}
              />

              <InlineStack align="end">
                <Button
                  variant="primary"
                  onClick={() => {
                    if (sourceType === 'product') {
                      setCurrentStep('product');
                    } else {
                      setCurrentStep('upload');
                    }
                  }}
                >
                  Continue
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        )}

        {/* Step 1a: Upload Image (From Scratch) */}
        {currentStep === 'upload' && (
          <Card>
            <BlockStack gap="500">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Upload Your Image
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Upload a product image from your computer. Add details to help the AI generate better results.
                </Text>
              </BlockStack>

              <UploadSourceCard
                scratchUpload={scratchUpload}
                onUpload={setScratchUpload}
                onRemove={() => setScratchUpload(null)}
                onUpdateProductInfo={(info) => {
                  if (scratchUpload) {
                    setScratchUpload({ ...scratchUpload, productInfo: info });
                  }
                }}
                isUploading={isUploading}
              />

              <InlineStack align="space-between">
                <Button onClick={() => setCurrentStep('source')}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  disabled={!scratchUpload || !scratchUpload.productInfo.title || !scratchUpload.productInfo.productType}
                  onClick={async () => {
                    if (!scratchUpload) return;
                    
                    // Upload the file to storage
                    const uploadedUrl = await uploadFile(scratchUpload.file);
                    if (uploadedUrl) {
                      setScratchUpload({ ...scratchUpload, uploadedUrl });
                      // Determine if it's a clothing product for mode selection
                      const productType = scratchUpload.productInfo.productType.toLowerCase();
                      const clothingKeywords = ['leggings', 'hoodie', 't-shirt', 'sports bra', 'jacket', 'tank top', 'joggers', 'shorts', 'dress', 'sweater'];
                      const isClothing = clothingKeywords.some(kw => productType.includes(kw));
                      
                      if (isClothing) {
                        setCurrentStep('mode');
                      } else {
                        setCurrentStep('template');
                      }
                    }
                  }}
                >
                  {isUploading ? 'Uploading...' : 'Continue'}
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        )}

        {/* Step 1b: Product Selection (From Product) */}
        {currentStep === 'product' && (
          <Card>
            <BlockStack gap="500">
              <InlineStack align="space-between">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd">
                    Select Product(s)
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Choose one or multiple products. Selecting 2+ will use bulk generation with shared settings.
                  </Text>
                </BlockStack>
                <Button variant="plain" onClick={() => setCurrentStep('source')}>
                  Change source
                </Button>
              </InlineStack>
              
              <ProductMultiSelect
                products={mockProducts}
                selectedIds={selectedProductIds}
                onSelectionChange={setSelectedProductIds}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <InlineStack align="space-between">
                <Button onClick={() => setCurrentStep('source')}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  disabled={selectedProductIds.size === 0}
                  onClick={() => {
                    const selectedProducts = mockProducts.filter(p => selectedProductIds.has(p.id));
                    
                    if (selectedProducts.length === 1) {
                      // Single product - continue with single flow
                      const product = selectedProducts[0];
                      setSelectedProduct(product);
                      // Auto-select first image as source
                      if (product.images.length > 0) {
                        setSelectedSourceImages(new Set([product.images[0].id]));
                      }
                      // Auto-recommend category
                      const productType = product.productType.toLowerCase();
                      if (productType.includes('sweater') || productType.includes('shirt') || productType.includes('apparel')) {
                        setSelectedCategory('clothing');
                      } else if (productType.includes('serum') || productType.includes('cream') || productType.includes('beauty')) {
                        setSelectedCategory('cosmetics');
                      }
                      
                      if (isClothingProduct(product)) {
                        setCurrentStep('mode');
                      } else {
                        setCurrentStep('template');
                      }
                    } else {
                      // Multiple products - go to bulk flow
                      navigate('/generate/bulk', { 
                        state: { selectedProducts } 
                      });
                    }
                  }}
                >
                  {selectedProductIds.size === 0 
                    ? 'Select at least 1 product' 
                    : selectedProductIds.size === 1 
                      ? 'Continue with 1 product' 
                      : `Continue with ${selectedProductIds.size} products`}
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        )}

        {/* Mode Selection - Works for both product and scratch uploads */}
        {currentStep === 'mode' && (selectedProduct || scratchUpload) && (
          <Card>
            <BlockStack gap="500">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Choose Generation Mode
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  How would you like to showcase your {selectedProduct?.title || scratchUpload?.productInfo.title}?
                </Text>
              </BlockStack>

              <InlineStack align="center">
                <GenerationModeToggle mode={generationMode} onChange={setGenerationMode} />
              </InlineStack>

              {generationMode === 'virtual-try-on' && (
                <Banner tone="info">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" fontWeight="semibold">
                      ✨ Virtual Try-On Mode
                    </Text>
                    <Text as="p" variant="bodySm">
                      AI will digitally dress your selected model in your garment — creating realistic "model wearing product" images without a photoshoot.
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Uses 3 credits per image (vs 1-2 for standard shots)
                    </Text>
                  </BlockStack>
                </Banner>
              )}

              {generationMode === 'product-only' && (
                <Banner tone="info">
                  <Text as="p" variant="bodySm">
                    Standard product photography — flat lay, studio, or lifestyle shots focusing on the garment itself.
                  </Text>
                </Banner>
              )}

              <InlineStack align="end">
                <Button onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'product')}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (generationMode === 'virtual-try-on') {
                      setCurrentStep('model');
                    } else {
                      setCurrentStep('template');
                    }
                  }}
                >
                  Continue
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        )}

        {/* Model Selection Step - Virtual Try-On only */}
        {currentStep === 'model' && (selectedProduct || scratchUpload) && (
          <BlockStack gap="400">
            {/* Live Preview */}
            <TryOnPreview
              product={selectedProduct}
              scratchUpload={scratchUpload}
              model={selectedModel}
              pose={selectedPose}
              creditCost={creditCost}
            />

            {/* Popular Combinations Quick Start */}
            {!selectedModel && popularCombinations.length > 0 && (
              <Card>
                <PopularCombinations
                  combinations={popularCombinations}
                  onSelect={(model, pose) => {
                    setSelectedModel(model);
                    setSelectedPose(pose);
                    setCurrentStep('settings');
                  }}
                />
              </Card>
            )}

            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Select a Model
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Choose who will wear your {selectedProduct?.title || scratchUpload?.productInfo.title}. We offer diverse representation across genders, body types, and ethnicities.
                  </Text>
                </BlockStack>

                {/* Enhanced Filter Bar */}
                <ModelFilterBar
                  genderFilter={modelGenderFilter}
                  bodyTypeFilter={modelBodyTypeFilter}
                  ageFilter={modelAgeFilter}
                  onGenderChange={setModelGenderFilter}
                  onBodyTypeChange={setModelBodyTypeFilter}
                  onAgeChange={setModelAgeFilter}
                />

                {/* Model Grid */}
                {filteredModels.length > 0 ? (
                  <InlineGrid columns={{ xs: 2, sm: 3, md: 4 }} gap="400">
                    {filteredModels.map(model => (
                      <ModelSelectorCard
                        key={model.modelId}
                        model={model}
                        isSelected={selectedModel?.modelId === model.modelId}
                        onSelect={() => handleSelectModel(model)}
                      />
                    ))}
                  </InlineGrid>
                ) : (
                  <Banner tone="warning">
                    <Text as="p" variant="bodySm">
                      No models match your filters. Try adjusting the filters above.
                    </Text>
                  </Banner>
                )}

                <InlineStack align="space-between">
                  <Button onClick={() => setCurrentStep('mode')}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!selectedModel}
                    onClick={() => setCurrentStep('pose')}
                  >
                    Continue to Pose Selection
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        )}

        {/* Pose Selection Step - Virtual Try-On only */}
        {currentStep === 'pose' && (selectedProduct || scratchUpload) && selectedModel && (
          <BlockStack gap="400">
            {/* Live Preview */}
            <TryOnPreview
              product={selectedProduct}
              scratchUpload={scratchUpload}
              model={selectedModel}
              pose={selectedPose}
              creditCost={creditCost}
            />

            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Choose a Pose & Scene
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Select the photography style and setting for your virtual try-on shots with {selectedModel.name}.
                  </Text>
                </BlockStack>

                {/* Poses by Category */}
                <BlockStack gap="600">
                  {(['studio', 'lifestyle', 'editorial', 'streetwear'] as PoseCategory[]).map(category => (
                    <PoseCategorySection
                      key={category}
                      category={category}
                      poses={posesByCategory[category] || []}
                      selectedPoseId={selectedPose?.poseId || null}
                      onSelectPose={handleSelectPose}
                    />
                  ))}
                </BlockStack>

                <InlineStack align="space-between">
                  <Button onClick={() => setCurrentStep('model')}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!selectedPose}
                    onClick={() => setCurrentStep('settings')}
                  >
                    Continue to Settings
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        )}

        {/* Step 2: Template Selection (Product-Only mode) */}
        {(currentStep === 'template' || (currentStep === 'settings' && generationMode === 'product-only')) && (selectedProduct || scratchUpload) && (
          <>
            {/* Selected Product/Upload Card */}
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingSm" tone="subdued">
                    {sourceType === 'scratch' ? 'Uploaded Image' : 'Selected Product'}
                  </Text>
                  <Button variant="plain" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'source')}>
                    Change
                  </Button>
                </InlineStack>
                {sourceType === 'scratch' && scratchUpload ? (
                  <InlineStack gap="400" blockAlign="center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                      <img src={scratchUpload.previewUrl} alt={scratchUpload.productInfo.title} className="w-full h-full object-cover" />
                    </div>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodyLg" fontWeight="semibold">
                        {scratchUpload.productInfo.title}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Custom Upload • {scratchUpload.productInfo.productType}
                      </Text>
                      {scratchUpload.productInfo.description && (
                        <Text as="p" variant="bodySm" tone="subdued">
                          {scratchUpload.productInfo.description.slice(0, 80)}...
                        </Text>
                      )}
                    </BlockStack>
                  </InlineStack>
                ) : selectedProduct && (
                  <>
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
                                    ? 'ring-2 ring-primary ring-offset-2' 
                                    : 'ring-1 ring-border hover:ring-primary'
                                }`}
                              >
                                <img 
                                  src={img.url} 
                                  alt={img.altText || ''} 
                                  className="w-16 h-16 object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
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
                  </>
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

                {/* Top Picks - FIXED based on product type, not the category filter */}
                {(() => {
                  // Determine product's category from its type
                  const productType = (selectedProduct?.productType || scratchUpload?.productInfo.productType || '').toLowerCase();
                  let productCategory: TemplateCategory = 'universal';
                  if (productType.includes('sweater') || productType.includes('shirt') || productType.includes('apparel') || productType.includes('hoodie') || productType.includes('leggings') || productType.includes('tank') || productType.includes('jogger')) {
                    productCategory = 'clothing';
                  } else if (productType.includes('serum') || productType.includes('cream') || productType.includes('beauty')) {
                    productCategory = 'cosmetics';
                  } else if (productType.includes('food') || productType.includes('cereal')) {
                    productCategory = 'food';
                  } else if (productType.includes('decor') || productType.includes('home')) {
                    productCategory = 'home';
                  } else if (productType.includes('supplement') || productType.includes('vitamin')) {
                    productCategory = 'supplements';
                  }
                  
                  const topPicks = mockTemplates
                    .filter(t => t.enabled && t.category === productCategory)
                    .slice(0, 3);
                  
                  // If not enough in category, add universal templates
                  if (topPicks.length < 3) {
                    const universalTemplates = mockTemplates
                      .filter(t => t.enabled && t.category === 'universal')
                      .slice(0, 3 - topPicks.length);
                    topPicks.push(...universalTemplates);
                  }

                  const topPickIds = topPicks.map(t => t.templateId);
                  const displayTitle = selectedProduct?.productType || scratchUpload?.productInfo.productType || 'your product';
                  
                  return (
                    <>
                      {/* Top Picks Card */}
                      <Card>
                        <BlockStack gap="400">
                          <BlockStack gap="100">
                            <Text as="h2" variant="headingMd">
                              Top Picks for {categoryLabels[productCategory]}
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              Best templates for {displayTitle.toLowerCase()} products
                            </Text>
                          </BlockStack>
                          
                          <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
                            {topPicks.map(template => (
                              <TemplatePreviewCard
                                key={template.templateId}
                                template={{ ...template, recommended: false }}
                                isSelected={selectedTemplate?.templateId === template.templateId}
                                onSelect={() => handleSelectTemplate(template)}
                                showCredits={false}
                              />
                            ))}
                          </InlineGrid>
                          
                          {selectedTemplate && (
                            <InlineStack align="end">
                              <Button
                                variant="primary"
                                onClick={() => setCurrentStep('settings')}
                              >
                                Continue with "{selectedTemplate.name}"
                              </Button>
                            </InlineStack>
                          )}
                        </BlockStack>
                      </Card>

                      {/* Browse More Styles - independent category browsing */}
                      <Card>
                        <BlockStack gap="400">
                          <BlockStack gap="200">
                            <Text as="h2" variant="headingMd">
                              Browse All Templates
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              Explore all available photography styles
                            </Text>
                          </BlockStack>
                          
                          {/* Category tabs */}
                          <InlineStack gap="200" wrap>
                            {categories.map(cat => (
                              <Button
                                key={cat.id}
                                pressed={selectedCategory === cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                size="slim"
                              >
                                {cat.label}
                              </Button>
                            ))}
                          </InlineStack>

                          {/* Template grid - show based on selected category, exclude top picks */}
                          {(() => {
                            const browseTemplates = mockTemplates.filter(t => {
                              if (!t.enabled) return false;
                              // Filter by selected category
                              if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
                              // Exclude templates already shown in Top Picks
                              if (topPickIds.includes(t.templateId)) return false;
                              return true;
                            });
                            
                            return browseTemplates.length > 0 ? (
                              <InlineGrid columns={{ xs: 2, sm: 3, md: 4, lg: 5 }} gap="300">
                                {browseTemplates.map(template => (
                                  <TemplatePreviewCard
                                    key={template.templateId}
                                    template={{ ...template, recommended: false }}
                                    isSelected={selectedTemplate?.templateId === template.templateId}
                                    onSelect={() => handleSelectTemplate(template)}
                                    showCredits={false}
                                  />
                                ))}
                              </InlineGrid>
                            ) : (
                              <div className="py-8 text-center">
                                <Text as="p" variant="bodySm" tone="subdued">
                                  {selectedCategory === 'all' 
                                    ? 'All templates are shown in Top Picks above.' 
                                    : `No additional ${categoryLabels[selectedCategory as TemplateCategory]} templates available.`}
                                </Text>
                              </div>
                            );
                          })()}
                        </BlockStack>
                      </Card>
                    </>
                  );
                })()}
              </BlockStack>
            )}

            {/* Settings Step - Product Only Mode */}
            {currentStep === 'settings' && selectedTemplate && generationMode === 'product-only' && (
              <BlockStack gap="400">
                {/* Selected Template */}
                <Card>
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <Text as="h3" variant="headingSm" tone="subdued">
                        Selected Template
                      </Text>
                      <Button variant="plain" onClick={() => setCurrentStep('template')}>
                        Change
                      </Button>
                    </InlineStack>
                    <InlineStack gap="400" blockAlign="center">
                      {(() => {
                        const templateImage = getTemplateImage(selectedTemplate.templateId);
                        return templateImage ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                            <img
                              src={templateImage}
                              alt={selectedTemplate.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon source={ImageIcon} tone="subdued" />
                          </div>
                        );
                      })()}
                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          {selectedTemplate.name}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {selectedTemplate.description.length > 80 
                            ? `${selectedTemplate.description.slice(0, 80)}...` 
                            : selectedTemplate.description}
                        </Text>
                        <InlineStack gap="200">
                          <Badge>{categoryLabels[selectedTemplate.category]}</Badge>
                          <Badge tone="attention">{`~${selectedTemplate.defaults.quality === 'high' ? 2 : 1} cr/img`}</Badge>
                        </InlineStack>
                      </BlockStack>
                    </InlineStack>
                  </BlockStack>
                </Card>

                {/* Brand Customization - Expanded by default */}
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
                              Make It Match Your Brand
                            </Text>
                            <Badge tone="info">Recommended</Badge>
                          </InlineStack>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Choose colors and styles that feel like your store
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
                        <NegativesChipSelector
                          value={negatives}
                          onChange={setNegatives}
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
                      label="Keep my product looking exactly like it does"
                      checked={preserveAccuracy}
                      onChange={setPreserveAccuracy}
                      helpText="When on, the AI won't change your product's colors, shape, or key details"
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

        {/* Settings Step - Virtual Try-On Mode */}
        {currentStep === 'settings' && generationMode === 'virtual-try-on' && selectedModel && selectedPose && (selectedProduct || scratchUpload) && (
          <BlockStack gap="400">
            {/* Summary Card */}
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingSm" tone="subdued">
                  Virtual Try-On Summary
                </Text>
                <InlineStack gap="600" wrap>
                  {/* Product */}
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" tone="subdued">Product</Text>
                    <InlineStack gap="200" blockAlign="center">
                      {sourceType === 'scratch' && scratchUpload ? (
                        <>
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-border">
                            <img src={scratchUpload.previewUrl} alt={scratchUpload.productInfo.title} className="w-full h-full object-cover" />
                          </div>
                          <Text as="p" variant="bodySm" fontWeight="semibold">{scratchUpload.productInfo.title}</Text>
                        </>
                      ) : selectedProduct && (
                        <>
                          <Thumbnail
                            source={selectedProduct.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
                            alt={selectedProduct.title}
                            size="small"
                          />
                          <Text as="p" variant="bodySm" fontWeight="semibold">{selectedProduct.title}</Text>
                        </>
                      )}
                    </InlineStack>
                    <Button variant="plain" size="micro" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'product')}>Change</Button>
                  </BlockStack>

                  {/* Model */}
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" tone="subdued">Model</Text>
                    <InlineStack gap="200" blockAlign="center">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img src={selectedModel.previewUrl} alt={selectedModel.name} className="w-full h-full object-cover" />
                      </div>
                      <Text as="p" variant="bodySm" fontWeight="semibold">{selectedModel.name}</Text>
                    </InlineStack>
                    <Button variant="plain" size="micro" onClick={() => setCurrentStep('model')}>Change</Button>
                  </BlockStack>

                  {/* Pose */}
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" tone="subdued">Pose</Text>
                    <InlineStack gap="200" blockAlign="center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden">
                        <img src={selectedPose.previewUrl} alt={selectedPose.name} className="w-full h-full object-cover" />
                      </div>
                      <Text as="p" variant="bodySm" fontWeight="semibold">{selectedPose.name}</Text>
                    </InlineStack>
                    <Button variant="plain" size="micro" onClick={() => setCurrentStep('pose')}>Change</Button>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Source Image Selection for Virtual Try-On - Only show for product source */}
            {sourceType === 'product' && selectedProduct && selectedProduct.images.length > 0 && (
              <Card>
                <BlockStack gap="300">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      Source Reference Image
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Select the product photo that shows your garment best. The AI will use this as reference to dress the model.
                    </Text>
                  </BlockStack>
                  
                  <div className="flex flex-wrap gap-3">
                    {selectedProduct.images.map(img => {
                      const isSelected = selectedSourceImages.has(img.id);
                      return (
                        <div
                          key={img.id}
                          onClick={() => {
                            // For Virtual Try-On, only allow single selection
                            setSelectedSourceImages(new Set([img.id]));
                          }}
                          className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                            isSelected 
                              ? 'ring-2 ring-primary ring-offset-2' 
                              : 'ring-1 ring-border hover:ring-primary'
                          }`}
                        >
                          <img 
                            src={img.url} 
                            alt={img.altText || ''} 
                            className="w-20 h-20 object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {selectedProduct.images.length > 1 && (
                    <Text as="p" variant="bodySm" tone="subdued">
                      Tip: Choose a clear, front-facing photo with good lighting for best results
                    </Text>
                  )}
                </BlockStack>
              </Card>
            )}

            {/* Source Image Preview for Scratch Upload */}
            {sourceType === 'scratch' && scratchUpload && (
              <Card>
                <BlockStack gap="300">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      Source Reference Image
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Your uploaded image will be used as reference to dress the model.
                    </Text>
                  </BlockStack>
                  
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden ring-2 ring-primary ring-offset-2">
                    <img 
                      src={scratchUpload.previewUrl} 
                      alt={scratchUpload.productInfo.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </BlockStack>
              </Card>
            )}

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
                  <div>
                    <Text as="p" variant="bodySm" fontWeight="semibold">Output Quality</Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Virtual Try-On uses High quality by default
                    </Text>
                  </div>
                </InlineGrid>
                
                {/* Visual Aspect Ratio Selector */}
                <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                
                <Checkbox
                  label="Keep my product looking exactly like it does"
                  checked={preserveAccuracy}
                  onChange={setPreserveAccuracy}
                  helpText="When on, the AI won't change your garment's colors, patterns, or details"
                />
              </BlockStack>
            </Card>

            {/* Credits Notice */}
            <Banner tone="warning">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="p" fontWeight="semibold">
                    Virtual Try-On uses <strong>{creditCost} credits</strong>
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {parseInt(imageCount)} images × 3 credits each (premium AI processing)
                  </Text>
                </BlockStack>
                <Text as="p" fontWeight="semibold">
                  {mockShop.creditsBalance} credits available
                </Text>
              </InlineStack>
            </Banner>

            {/* Generate Button */}
            <InlineStack align="end" gap="200">
              <Button onClick={() => setCurrentStep('pose')}>
                Back
              </Button>
              <Button variant="primary" onClick={handleGenerateClick}>
                Generate {imageCount} Try-On Images
              </Button>
            </InlineStack>
          </BlockStack>
        )}

        {/* Generating State */}
        {currentStep === 'generating' && (
          <Card>
            <BlockStack gap="600" inlineAlign="center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-subtle">
                <Icon source={generationMode === 'virtual-try-on' ? PersonIcon : ImageIcon} tone="primary" />
              </div>
              <BlockStack gap="200" inlineAlign="center">
                <Text as="h2" variant="headingLg">
                  {generationMode === 'virtual-try-on' ? 'Creating Virtual Try-On...' : 'Creating Your Images...'}
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  {generationMode === 'virtual-try-on' 
                    ? `Dressing ${selectedModel?.name} in "${selectedProduct?.title}" with ${selectedPose?.name} pose`
                    : `Creating ${imageCount} images of "${selectedProduct?.title}" with ${selectedTemplate?.name}`
                  }
                </Text>
              </BlockStack>
              <div className="w-full max-w-md">
                <ProgressBar 
                  progress={Math.min(generationMode === 'virtual-try-on' ? tryOnProgress : generatingProgress, 100)} 
                  size="small" 
                />
              </div>
              <Text as="p" variant="bodySm" tone="subdued">
                {generationMode === 'virtual-try-on' ? 'This usually takes 20-30 seconds' : 'This usually takes 10-15 seconds'}
              </Text>
              <Button 
                variant="plain" 
                onClick={handleCancelGeneration}
                icon={XIcon}
              >
                Cancel and go back
              </Button>
            </BlockStack>
          </Card>
        )}

        {/* Results */}
        {currentStep === 'results' && (selectedProduct || scratchUpload) && (
          <BlockStack gap="400">
            {/* Product Context Card - Different for scratch vs product */}
            {sourceType === 'scratch' && scratchUpload ? (
              <Card>
                <BlockStack gap="300">
                  <InlineStack gap="200" blockAlign="center">
                    <Badge tone="info">Generated from uploaded image</Badge>
                  </InlineStack>
                  <InlineStack gap="400" blockAlign="center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                      <img src={scratchUpload.previewUrl} alt={scratchUpload.productInfo.title} className="w-full h-full object-cover" />
                    </div>
                    <BlockStack gap="100">
                      <Text as="p" variant="headingMd" fontWeight="bold">
                        {scratchUpload.productInfo.title}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {scratchUpload.productInfo.productType}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                  <Divider />
                  <Banner tone="info">
                    <BlockStack gap="200">
                      <Text as="p" variant="bodySm" fontWeight="semibold">
                        Assign to a Shopify Product
                      </Text>
                      <Text as="p" variant="bodySm">
                        Select images below and publish them to any product in your store.
                      </Text>
                    </BlockStack>
                  </Banner>
                </BlockStack>
              </Card>
            ) : selectedProduct && (
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
            )}

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd">
                      Generated Images
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      👆 Click images to select them for publishing
                    </Text>
                  </BlockStack>
                  <InlineStack gap="200">
                    <Button onClick={() => setCurrentStep('settings')}>
                      ← Adjust Settings
                    </Button>
                    <Button onClick={() => {
                      setCurrentStep('source');
                      setSelectedProduct(null);
                      setScratchUpload(null);
                      setSelectedTemplate(null);
                      setGeneratedImages([]);
                      setSelectedForPublish(new Set());
                    }}>
                      Start Over
                    </Button>
                  </InlineStack>
                </InlineStack>
                
                <InlineGrid columns={{ xs: 2, md: 4 }} gap="400">
                  {generatedImages.map((url, index) => (
                    <div
                      key={index}
                      className={`generation-preview relative group cursor-pointer rounded-lg overflow-hidden ${
                        selectedForPublish.has(index) ? 'ring-2 ring-primary ring-offset-2' : ''
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
                      
                      {/* Selection indicator - more visible */}
                      <div 
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedForPublish.has(index) 
                            ? 'bg-primary border-primary scale-110' 
                            : 'border-white bg-black/50 hover:bg-black/70'
                        }`}
                        onClick={() => toggleImageSelection(index)}
                      >
                        {selectedForPublish.has(index) ? (
                          <Icon source={CheckCircleIcon} tone="base" />
                        ) : (
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </InlineGrid>

                {/* Selection helper banner */}
                {selectedForPublish.size === 0 && (
                  <Banner tone="info">
                    <Text as="p" variant="bodySm">
                      👆 Click on images above to select them for publishing. You can select multiple images.
                    </Text>
                  </Banner>
                )}
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
            {(selectedTemplate || generationMode === 'virtual-try-on') && (
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Generation Summary
                  </Text>
                  <div className="p-3 bg-surface-subdued rounded-lg font-mono text-sm">
                    {generationMode === 'virtual-try-on' ? (
                      <>Virtual Try-On: {selectedModel?.name} wearing {scratchUpload?.productInfo.title || selectedProduct?.title} in {selectedPose?.name} pose</>
                    ) : (
                      <>{selectedTemplate?.promptBlueprint.sceneDescription}. {scratchUpload?.productInfo.title || selectedProduct?.title}. {selectedTemplate?.promptBlueprint.lighting}.</>
                    )}
                  </div>
                </BlockStack>
              </Card>
            )}

            {/* Actions */}
            <InlineStack align="end" gap="200">
              <Button onClick={handleDownloadAll} icon={ArrowDownIcon}>
                Download All
              </Button>
              {sourceType === 'scratch' ? (
                <Button
                  variant="primary"
                  onClick={() => setProductAssignmentModalOpen(true)}
                  disabled={selectedForPublish.size === 0}
                  size="large"
                >
                  {`Assign ${selectedForPublish.size} to Product`}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handlePublishClick}
                  disabled={selectedForPublish.size === 0}
                  size="large"
                >
                  {`Publish ${selectedForPublish.size} to "${selectedProduct?.title}"`}
                </Button>
              )}
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

      <TryOnConfirmModal
        open={tryOnConfirmModalOpen}
        onClose={() => setTryOnConfirmModalOpen(false)}
        onConfirm={handleTryOnConfirmGenerate}
        product={selectedProduct}
        model={selectedModel}
        pose={selectedPose}
        imageCount={parseInt(imageCount)}
        aspectRatio={aspectRatio}
        creditsRemaining={mockShop.creditsBalance}
        isLoading={isTryOnGenerating}
        sourceImageUrl={
          selectedProduct && selectedSourceImages.size > 0
            ? selectedProduct.images.find(img => selectedSourceImages.has(img.id))?.url
            : undefined
        }
      />

      <PublishModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPublish={handlePublish}
        selectedImages={Array.from(selectedForPublish).map(i => generatedImages[i])}
        product={selectedProduct}
        existingImages={selectedProduct?.images || []}
      />

      <ProductAssignmentModal
        open={productAssignmentModalOpen}
        onClose={() => setProductAssignmentModalOpen(false)}
        products={mockProducts}
        selectedProduct={assignToProduct}
        onSelectProduct={setAssignToProduct}
        onPublish={(product, mode) => {
          const count = selectedForPublish.size;
          toast.success(`${count} image${count !== 1 ? 's' : ''} ${mode === 'add' ? 'added to' : 'replaced on'} "${product.title}"!`);
          setProductAssignmentModalOpen(false);
          navigate('/jobs');
        }}
        selectedImageCount={selectedForPublish.size}
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
        productName={selectedProduct?.title || scratchUpload?.productInfo.title}
      />
    </PageHeader>
  );
}
