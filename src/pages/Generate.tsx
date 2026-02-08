import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Image, CheckCircle, Download, RefreshCw, Maximize2, X, User, List, Palette } from 'lucide-react';

import avatarSophia from '@/assets/team/avatar-sophia.jpg';
import avatarZara from '@/assets/team/avatar-zara.jpg';
import avatarKenji from '@/assets/team/avatar-kenji.jpg';
import avatarLuna from '@/assets/team/avatar-luna.jpg';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/app/PageHeader';
import { TemplatePreviewCard, getTemplateImage } from '@/components/app/TemplatePreviewCard';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { PublishModal } from '@/components/app/PublishModal';
import { GenerateConfirmModal } from '@/components/app/GenerateConfirmModal';
import { TryOnConfirmModal } from '@/components/app/TryOnConfirmModal';
import { LowCreditsBanner } from '@/components/app/LowCreditsBanner';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { useCredits } from '@/contexts/CreditContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGenerateTryOn } from '@/hooks/useGenerateTryOn';
import { useGenerateProduct } from '@/hooks/useGenerateProduct';
import { useGenerateWorkflow } from '@/hooks/useGenerateWorkflow';
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
import { supabase } from '@/integrations/supabase/client';
import { mockProducts, mockTemplates, categoryLabels, mockModels, mockTryOnPoses } from '@/data/mockData';
import type { Product, Template, TemplateCategory, BrandTone, BackgroundStyle, AspectRatio, ImageQuality, GenerationMode, ModelProfile, TryOnPose, ModelGender, ModelBodyType, ModelAgeRange, PoseCategory, GenerationSourceType, ScratchUpload } from '@/types';
import { toast } from 'sonner';
import type { Workflow } from '@/types/workflow';
import type { BrandProfile } from '@/pages/BrandProfiles';

type Step = 'source' | 'product' | 'upload' | 'brand-profile' | 'mode' | 'model' | 'pose' | 'template' | 'settings' | 'generating' | 'results';

export default function Generate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('workflow');
  const initialTemplateId = searchParams.get('template');
  const { balance, isEmpty, openBuyModal, deductCredits, calculateCost } = useCredits();

  // Workflow & Brand Profile from DB
  const { data: activeWorkflow } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: async () => {
      if (!workflowId) return null;
      const { data, error } = await supabase.from('workflows').select('*').eq('id', workflowId).single();
      if (error) return null;
      return data as unknown as Workflow;
    },
    enabled: !!workflowId,
  });

  const { data: brandProfiles = [] } = useQuery({
    queryKey: ['brand-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brand_profiles').select('*').order('name');
      if (error) return [];
      return data as BrandProfile[];
    },
    enabled: !!user,
  });

  const [currentStep, setCurrentStep] = useState<Step>('source');
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  const [sourceType, setSourceType] = useState<GenerationSourceType>('product');
  const [scratchUpload, setScratchUpload] = useState<ScratchUpload | null>(null);
  const [assignToProduct, setAssignToProduct] = useState<Product | null>(null);
  const [productAssignmentModalOpen, setProductAssignmentModalOpen] = useState(false);

  const { upload: uploadFile, isUploading } = useFileUpload();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSourceImages, setSelectedSourceImages] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    initialTemplateId ? mockTemplates.find(t => t.templateId === initialTemplateId) || null : null
  );
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  const [selectedBrandProfileId, setSelectedBrandProfileId] = useState<string>('');
  const selectedBrandProfile = brandProfiles.find(bp => bp.id === selectedBrandProfileId) || null;

  const [generationMode, setGenerationMode] = useState<GenerationMode>('product-only');
  const [selectedModel, setSelectedModel] = useState<ModelProfile | null>(null);
  const [selectedPose, setSelectedPose] = useState<TryOnPose | null>(null);
  const [modelGenderFilter, setModelGenderFilter] = useState<ModelGender | 'all'>('all');
  const [modelBodyTypeFilter, setModelBodyTypeFilter] = useState<ModelBodyType | 'all'>('all');
  const [modelAgeFilter, setModelAgeFilter] = useState<ModelAgeRange | 'all'>('all');

  const [brandKitOpen, setBrandKitOpen] = useState(true);
  const [brandTone, setBrandTone] = useState<BrandTone>('clean');
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('studio');
  const [negatives, setNegatives] = useState<string[]>(['text overlays', 'busy backgrounds']);
  const [consistencyEnabled, setConsistencyEnabled] = useState(true);

  const [imageCount, setImageCount] = useState<'1' | '4' | '8'>('4');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [quality, setQuality] = useState<ImageQuality>('standard');
  const [preserveAccuracy, setPreserveAccuracy] = useState(true);

  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedForPublish, setSelectedForPublish] = useState<Set<number>>(new Set());

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [tryOnConfirmModalOpen, setTryOnConfirmModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [noCreditsModalOpen, setNoCreditsModalOpen] = useState(false);

  const { generate: generateTryOn, isLoading: isTryOnGenerating, progress: tryOnProgress } = useGenerateTryOn();
  const { generate: generateProduct, isLoading: isProductGenerating, progress: productProgress } = useGenerateProduct();

  // When workflow is loaded, set generation mode and defaults
  useEffect(() => {
    if (activeWorkflow) {
      if (activeWorkflow.uses_tryon) {
        setGenerationMode('virtual-try-on');
      }
      // Set aspect ratio from workflow recommendations
      if (activeWorkflow.recommended_ratios?.length > 0) {
        const firstRatio = activeWorkflow.recommended_ratios[0] as AspectRatio;
        if (['1:1', '4:5', '16:9'].includes(firstRatio)) {
          setAspectRatio(firstRatio);
        }
      }
      // Auto-select template from workflow's template_ids
      if (activeWorkflow.template_ids?.length > 0) {
        const matchingTemplate = mockTemplates.find(t =>
          activeWorkflow.template_ids.some(tid => t.templateId.includes(tid) || t.name.toLowerCase().includes(tid.replace(/-/g, ' ')))
        );
        if (matchingTemplate) setSelectedTemplate(matchingTemplate);
      }
    }
  }, [activeWorkflow]);

  // Apply brand profile settings when selected
  useEffect(() => {
    if (selectedBrandProfile) {
      setBrandTone(selectedBrandProfile.tone as BrandTone);
      setBackgroundStyle(selectedBrandProfile.background_style as BackgroundStyle);
      if (selectedBrandProfile.do_not_rules?.length > 0) {
        setNegatives(selectedBrandProfile.do_not_rules);
      }
    }
  }, [selectedBrandProfile]);

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

  const filteredModels = mockModels.filter(m => {
    if (modelGenderFilter !== 'all' && m.gender !== modelGenderFilter) return false;
    if (modelBodyTypeFilter !== 'all' && m.bodyType !== modelBodyTypeFilter) return false;
    if (modelAgeFilter !== 'all' && m.ageRange !== modelAgeFilter) return false;
    return true;
  });

  const posesByCategory = mockTryOnPoses.reduce((acc, pose) => {
    if (!acc[pose.category]) acc[pose.category] = [];
    acc[pose.category].push(pose);
    return acc;
  }, {} as Record<PoseCategory, TryOnPose[]>);

  const popularCombinations = createPopularCombinations(mockModels, mockTryOnPoses);

  const isClothingProduct = (product: Product | null) => {
    if (!product) return false;
    const productType = product.productType.toLowerCase();
    const clothingKeywords = ['sweater', 'shirt', 'apparel', 'dress', 'jacket', 'pants', 'jeans', 'coat', 'blouse', 'skirt', 'suit', 'hoodie', 't-shirt', 'clothing', 'legging', 'bra', 'sports bra', 'tank', 'jogger', 'shorts', 'top', 'long sleeve', 'crop', 'bodysuit', 'romper', 'jumpsuit', 'sweatshirt', 'pullover', 'cardigan', 'vest', 'active', 'athletic', 'yoga', 'workout'];
    return clothingKeywords.some(kw => productType.includes(kw)) ||
      product.tags.some(tag => clothingKeywords.some(kw => tag.toLowerCase().includes(kw)));
  };

  const detectProductCategory = (product: Product | null): TemplateCategory | null => {
    if (!product) return null;
    const type = product.productType.toLowerCase();
    const tags = product.tags.map(t => t.toLowerCase()).join(' ');
    const combined = `${type} ${tags}`;
    const cosmeticsKeywords = ['serum', 'moisturizer', 'lipstick', 'foundation', 'mascara', 'skincare', 'beauty', 'makeup', 'cream', 'treatment', 'powder', 'lip'];
    if (cosmeticsKeywords.some(kw => combined.includes(kw))) return 'cosmetics';
    const foodKeywords = ['cereal', 'granola', 'chocolate', 'coffee', 'tea', 'honey', 'snack', 'beverage', 'juice', 'food', 'organic'];
    if (foodKeywords.some(kw => combined.includes(kw))) return 'food';
    const homeKeywords = ['candle', 'vase', 'planter', 'pillow', 'lamp', 'decor', 'home', 'interior', 'carafe', 'ceramic'];
    if (homeKeywords.some(kw => combined.includes(kw))) return 'home';
    const supplementKeywords = ['vitamin', 'supplement', 'capsule', 'protein', 'collagen', 'omega', 'wellness', 'greens', 'superfood'];
    if (supplementKeywords.some(kw => combined.includes(kw))) return 'supplements';
    if (isClothingProduct(product)) return 'clothing';
    return null;
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductPickerOpen(false);
    if (product.images.length > 0) {
      setSelectedSourceImages(new Set([product.images[0].id]));
    } else {
      setSelectedSourceImages(new Set());
    }
    const detectedCategory = detectProductCategory(product);
    if (detectedCategory) setSelectedCategory(detectedCategory);
    // Go to brand profile step if profiles exist
    if (brandProfiles.length > 0) {
      setCurrentStep('brand-profile');
    } else if (activeWorkflow?.uses_tryon || isClothingProduct(product)) {
      setCurrentStep('mode');
    } else {
      setCurrentStep('template');
    }
  };

  const handleBrandProfileContinue = () => {
    if (activeWorkflow?.uses_tryon) {
      setCurrentStep('model');
    } else if (isClothingProduct(selectedProduct)) {
      setCurrentStep('mode');
    } else {
      setCurrentStep('template');
    }
  };

  const toggleSourceImage = (imageId: string) => {
    setSelectedSourceImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) { if (newSet.size > 1) newSet.delete(imageId); }
      else newSet.add(imageId);
      return newSet;
    });
  };

  const selectAllSourceImages = () => {
    if (selectedProduct) setSelectedSourceImages(new Set(selectedProduct.images.map(img => img.id)));
  };
  const clearSourceImages = () => {
    if (selectedProduct?.images.length) setSelectedSourceImages(new Set([selectedProduct.images[0].id]));
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setAspectRatio(template.defaults.aspectRatio);
    setQuality(template.defaults.quality);
    toast.success(`"${template.name}" selected! Click Continue when ready.`);
  };

  const handleSelectModel = (model: ModelProfile) => { setSelectedModel(model); toast.success(`Model "${model.name}" selected!`); };
  const handleSelectPose = (pose: TryOnPose) => { setSelectedPose(pose); toast.success(`Pose "${pose.name}" selected!`); };
  const handleCancelGeneration = () => { setCurrentStep('settings'); setGeneratingProgress(0); toast.info('Generation cancelled'); };

  const handleGenerateClick = () => {
    if (!selectedProduct) return;
    const cost = calculateCost({ count: parseInt(imageCount), quality, mode: generationMode });
    if (balance < cost) { setNoCreditsModalOpen(true); return; }
    if (generationMode === 'virtual-try-on') {
      if (!selectedModel || !selectedPose) { toast.error('Please select a model and pose first'); return; }
      setTryOnConfirmModalOpen(true); return;
    }
    if (!selectedTemplate) { toast.error('Please select a template first'); return; }
    setConfirmModalOpen(true);
  };

  const handleConfirmGenerate = async () => {
    if (!selectedProduct || !selectedTemplate) return;
    let sourceImageUrl = '';
    if (sourceType === 'scratch' && scratchUpload?.uploadedUrl) sourceImageUrl = scratchUpload.uploadedUrl;
    else if (selectedProduct) {
      const selectedImageId = Array.from(selectedSourceImages)[0];
      const sourceImage = selectedProduct.images.find(img => img.id === selectedImageId);
      sourceImageUrl = sourceImage?.url || selectedProduct.images[0]?.url || '';
    }
    if (!sourceImageUrl) { toast.error('No source image available'); return; }
    setConfirmModalOpen(false);
    setCurrentStep('generating');
    setGeneratingProgress(0);
    const result = await generateProduct({
      product: selectedProduct, template: selectedTemplate,
      brandSettings: { tone: brandTone, backgroundStyle },
      aspectRatio, imageCount: parseInt(imageCount), sourceImageUrl,
    });
    if (result && result.images.length > 0) {
      setGeneratedImages(result.images);
      setGeneratingProgress(100);
      setCurrentStep('results');
      toast.success(`Generated ${result.generatedCount} images! Used ${result.generatedCount * 3} credits.`);
    } else setCurrentStep('settings');
  };

  const handleTryOnConfirmGenerate = async () => {
    if (!selectedModel || !selectedPose) return;
    let sourceImageUrl = '';
    let productData: { title: string; productType: string; description: string } | null = null;
    if (sourceType === 'scratch' && scratchUpload?.uploadedUrl) {
      sourceImageUrl = scratchUpload.uploadedUrl;
      productData = { title: scratchUpload.productInfo.title, productType: scratchUpload.productInfo.productType, description: scratchUpload.productInfo.description };
    } else if (selectedProduct) {
      const selectedImageId = Array.from(selectedSourceImages)[0];
      const sourceImage = selectedProduct.images.find(img => img.id === selectedImageId);
      sourceImageUrl = sourceImage?.url || selectedProduct.images[0]?.url || '';
      productData = { title: selectedProduct.title, productType: selectedProduct.productType, description: selectedProduct.description };
    }
    if (!sourceImageUrl || !productData) { toast.error('No source image available'); return; }
    setTryOnConfirmModalOpen(false);
    setCurrentStep('generating');
    setGeneratingProgress(0);
    const pseudoProduct: Product = selectedProduct || {
      id: 'scratch-' + Date.now(), title: productData.title, vendor: 'Custom Upload',
      productType: productData.productType, tags: [], description: productData.description,
      images: [{ id: 'scratch-img', url: sourceImageUrl }], status: 'active',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    const result = await generateTryOn({
      product: pseudoProduct, model: selectedModel, pose: selectedPose,
      aspectRatio, imageCount: parseInt(imageCount), sourceImageUrl,
      modelImageUrl: selectedModel.previewUrl,
    });
    if (result && result.images.length > 0) {
      setGeneratedImages(result.images);
      setGeneratingProgress(100);
      setCurrentStep('results');
      toast.success(`Generated ${result.generatedCount} images! Used ${result.generatedCount * 3} credits.`);
    } else setCurrentStep('settings');
  };

  const handlePublishClick = () => {
    if (selectedForPublish.size === 0) { toast.error('Please select at least one image to download'); return; }
    selectedForPublish.forEach(idx => handleDownloadImage(idx));
    toast.success(`${selectedForPublish.size} image(s) downloaded!`);
    navigate('/app/library');
  };
  const handlePublish = (mode: 'add' | 'replace') => {
    toast.success(`${selectedForPublish.size} image(s) downloaded!`);
    setPublishModalOpen(false);
    navigate('/app/library');
  };
  const toggleImageSelection = (index: number) => {
    setSelectedForPublish(prev => { const s = new Set(prev); s.has(index) ? s.delete(index) : s.add(index); return s; });
  };
  const handleImageClick = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const handleDownloadImage = (index: number) => {
    const url = generatedImages[index];
    const link = document.createElement('a');
    link.href = url; link.download = `generated-image-${index + 1}.jpg`; link.click();
    toast.success('Image downloaded');
  };
  const handleDownloadAll = () => { generatedImages.forEach((_, idx) => handleDownloadImage(idx)); toast.success(`${generatedImages.length} images downloaded`); };
  const handleRegenerate = (index: number) => toast.info('Regenerating variation... (this would cost 1 credit)');

  const getStepNumber = () => {
    if (generationMode === 'virtual-try-on') {
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, mode: 2, model: 3, pose: 4, settings: 5, generating: 6, results: 6 };
      return map[currentStep] || 1;
    }
    const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, mode: 2, template: 3, settings: 4, generating: 5, results: 5 };
    return map[currentStep] || 1;
  };

  const getSteps = () => {
    if (generationMode === 'virtual-try-on') {
      return [
        { name: sourceType === 'scratch' ? 'Source' : 'Product' },
        { name: 'Brand' },
        { name: 'Model' }, { name: 'Pose' }, { name: 'Settings' }, { name: 'Results' },
      ];
    }
    return [{ name: sourceType === 'scratch' ? 'Source' : 'Product' }, { name: 'Brand' }, { name: 'Template' }, { name: 'Settings' }, { name: 'Results' }];
  };

  const creditCost = generationMode === 'virtual-try-on' ? parseInt(imageCount) * 8 : parseInt(imageCount) * (quality === 'high' ? 10 : 4);

  const pageTitle = activeWorkflow ? `Create: ${activeWorkflow.name}` : 'Generate Images';

  return (
    <PageHeader title={pageTitle} backAction={{ content: activeWorkflow ? 'Workflows' : 'Dashboard', onAction: () => navigate(activeWorkflow ? '/app/workflows' : '/app') }}>
      <div className="space-y-6">
        <LowCreditsBanner />

        {/* Workflow Info Banner */}
        {activeWorkflow && (
          <Alert>
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{activeWorkflow.name}</p>
                  <p className="text-xs text-muted-foreground">{activeWorkflow.description}</p>
                </div>
                <Badge variant="secondary">{activeWorkflow.default_image_count} images</Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 overflow-x-auto">
              {getSteps().map((step, index) => (
                <div key={step.name} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    getStepNumber() > index + 1 ? 'bg-primary text-primary-foreground'
                    : getStepNumber() === index + 1 ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                    {getStepNumber() > index + 1 ? '✓' : index + 1}
                  </div>
                  <span className={`text-xs hidden md:inline ${getStepNumber() === index + 1 ? 'font-semibold' : 'text-muted-foreground'}`}>
                    {step.name}
                  </span>
                  {index < getSteps().length - 1 && (
                    <div className={`w-8 md:w-12 h-0.5 flex-shrink-0 ${getStepNumber() > index + 1 ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Source Selection */}
        {currentStep === 'source' && (
          <Card><CardContent className="p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold">How do you want to start?</h2>
              <p className="text-sm text-muted-foreground">Choose whether to use existing products or upload your own image file.</p>
            </div>
            <SourceTypeSelector sourceType={sourceType} onChange={type => { setSourceType(type); setSelectedProduct(null); setScratchUpload(null); }} />
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(sourceType === 'product' ? 'product' : 'upload')}>Continue</Button>
            </div>
          </CardContent></Card>
        )}

        {/* Upload Step */}
        {currentStep === 'upload' && (
          <Card><CardContent className="p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold">Upload Your Image</h2>
              <p className="text-sm text-muted-foreground">Upload a product image from your computer.</p>
            </div>
            <UploadSourceCard scratchUpload={scratchUpload} onUpload={setScratchUpload} onRemove={() => setScratchUpload(null)}
              onUpdateProductInfo={info => { if (scratchUpload) setScratchUpload({ ...scratchUpload, productInfo: info }); }}
              isUploading={isUploading}
            />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('source')}>Back</Button>
              <Button disabled={!scratchUpload || !scratchUpload.productInfo.title || !scratchUpload.productInfo.productType}
                onClick={async () => {
                  if (!scratchUpload) return;
                  const uploadedUrl = await uploadFile(scratchUpload.file);
                  if (uploadedUrl) {
                    setScratchUpload({ ...scratchUpload, uploadedUrl });
                    if (brandProfiles.length > 0) {
                      setCurrentStep('brand-profile');
                    } else {
                      const isClothing = ['leggings', 'hoodie', 't-shirt', 'sports bra', 'jacket', 'tank top', 'joggers'].some(kw => scratchUpload.productInfo.productType.toLowerCase().includes(kw));
                      setCurrentStep(isClothing ? 'mode' : 'template');
                    }
                  }
                }}
              >{isUploading ? 'Uploading...' : 'Continue'}</Button>
            </div>
          </CardContent></Card>
        )}

        {/* Product Selection */}
        {currentStep === 'product' && (
          <Card><CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Select Product(s)</h2>
                <p className="text-sm text-muted-foreground">Choose one or multiple products. 2+ products will use bulk generation.</p>
              </div>
              <Button variant="link" onClick={() => setCurrentStep('source')}>Change source</Button>
            </div>
            <ProductMultiSelect products={mockProducts} selectedIds={selectedProductIds} onSelectionChange={setSelectedProductIds} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('source')}>Back</Button>
              <Button disabled={selectedProductIds.size === 0} onClick={() => {
                const selected = mockProducts.filter(p => selectedProductIds.has(p.id));
                if (selected.length === 1) {
                  const product = selected[0];
                  setSelectedProduct(product);
                  if (product.images.length > 0) setSelectedSourceImages(new Set([product.images[0].id]));
                  const cat = detectProductCategory(product);
                  if (cat) setSelectedCategory(cat);
                  if (brandProfiles.length > 0) {
                    setCurrentStep('brand-profile');
                  } else if (isClothingProduct(product)) {
                    setCurrentStep('mode');
                  } else {
                    setCurrentStep('template');
                  }
                } else navigate('/app/generate/bulk', { state: { selectedProducts: selected } });
              }}>
                {selectedProductIds.size === 0 ? 'Select at least 1' : selectedProductIds.size === 1 ? 'Continue with 1 product' : `Continue with ${selectedProductIds.size} products`}
              </Button>
            </div>
          </CardContent></Card>
        )}

        {/* Brand Profile Selection - NEW STEP */}
        {currentStep === 'brand-profile' && (
          <Card><CardContent className="p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Select Brand Profile
              </h2>
              <p className="text-sm text-muted-foreground">Apply your brand's visual identity to this generation.</p>
            </div>

            {brandProfiles.length > 0 ? (
              <div className="space-y-3">
                {brandProfiles.map(bp => (
                  <div
                    key={bp.id}
                    onClick={() => setSelectedBrandProfileId(bp.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedBrandProfileId === bp.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{bp.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {bp.tone} · {bp.lighting_style} · {bp.background_style}
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">{bp.tone}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Palette className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No brand profiles yet.</p>
                <Button variant="link" onClick={() => navigate('/app/brand-profiles')}>Create one</Button>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'product')}>Back</Button>
              <div className="flex gap-2">
                {!selectedBrandProfileId && (
                  <Button variant="ghost" onClick={handleBrandProfileContinue}>Skip</Button>
                )}
                <Button onClick={handleBrandProfileContinue} disabled={false}>
                  {selectedBrandProfileId ? 'Continue' : 'Continue without profile'}
                </Button>
              </div>
            </div>
          </CardContent></Card>
        )}

        {/* Mode Selection */}
        {currentStep === 'mode' && (selectedProduct || scratchUpload) && (
          <Card><CardContent className="p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold">Choose Generation Mode</h2>
              <p className="text-sm text-muted-foreground">How would you like to showcase your {selectedProduct?.title || scratchUpload?.productInfo.title}?</p>
            </div>
            <div className="flex justify-center">
              <GenerationModeToggle mode={generationMode} onChange={setGenerationMode} />
            </div>
            {generationMode === 'virtual-try-on' && (
              <Alert><AlertDescription>
                <p className="font-semibold">✨ Virtual Try-On Mode</p>
                <p className="text-sm">AI will digitally dress your selected model in your garment. Uses 3 credits per image.</p>
              </AlertDescription></Alert>
            )}
            {generationMode === 'product-only' && (
              <Alert><AlertDescription>Standard product photography — flat lay, studio, or lifestyle shots.</AlertDescription></Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : (sourceType === 'scratch' ? 'upload' : 'product'))}>Back</Button>
              <Button onClick={() => setCurrentStep(generationMode === 'virtual-try-on' ? 'model' : 'template')}>Continue</Button>
            </div>
          </CardContent></Card>
        )}

        {/* Model Selection */}
        {currentStep === 'model' && (selectedProduct || scratchUpload) && (
          <div className="space-y-4">
            <TryOnPreview product={selectedProduct} scratchUpload={scratchUpload} model={selectedModel} pose={selectedPose} creditCost={creditCost} />
            {!selectedModel && popularCombinations.length > 0 && (
              <Card><CardContent className="p-5">
                <PopularCombinations combinations={popularCombinations} onSelect={(model, pose) => { setSelectedModel(model); setSelectedPose(pose); setCurrentStep('settings'); }} />
              </CardContent></Card>
            )}
            <Card><CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold">Select a Model</h2>
                <p className="text-sm text-muted-foreground">Choose the model who will wear your garment</p>
              </div>
              <ModelFilterBar genderFilter={modelGenderFilter} bodyTypeFilter={modelBodyTypeFilter} ageFilter={modelAgeFilter}
                onGenderChange={setModelGenderFilter} onBodyTypeChange={setModelBodyTypeFilter} onAgeChange={setModelAgeFilter} />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {filteredModels.map(model => (
                  <ModelSelectorCard key={model.modelId} model={model} isSelected={selectedModel?.modelId === model.modelId} onSelect={() => handleSelectModel(model)} />
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(activeWorkflow?.uses_tryon ? 'brand-profile' : 'mode')}>Back</Button>
                <Button disabled={!selectedModel} onClick={() => setCurrentStep('pose')}>Continue to Pose</Button>
              </div>
            </CardContent></Card>
          </div>
        )}

        {/* Pose Selection */}
        {currentStep === 'pose' && selectedModel && (
          <div className="space-y-4">
            <TryOnPreview product={selectedProduct} scratchUpload={scratchUpload} model={selectedModel} pose={selectedPose} creditCost={creditCost} />
            <Card><CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold">Select a Pose</h2>
                <p className="text-sm text-muted-foreground">Choose how your model will be positioned</p>
              </div>
              {Object.entries(posesByCategory).map(([category, poses]) => (
                <PoseCategorySection key={category} category={category as PoseCategory} poses={poses} selectedPoseId={selectedPose?.poseId || null} onSelectPose={handleSelectPose} />
              ))}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('model')}>Back</Button>
                <Button disabled={!selectedPose} onClick={() => setCurrentStep('settings')}>Continue to Settings</Button>
              </div>
            </CardContent></Card>
          </div>
        )}

        {/* Template Selection */}
        {(currentStep === 'template' || (currentStep === 'settings' && generationMode === 'product-only')) && (selectedProduct || scratchUpload) && (
          <>
            {/* Selected Product Card */}
            <Card><CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{sourceType === 'scratch' ? 'Uploaded Image' : 'Selected Product'}</span>
                <Button variant="link" size="sm" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'source')}>Change</Button>
              </div>
              {sourceType === 'scratch' && scratchUpload ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={scratchUpload.previewUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold">{scratchUpload.productInfo.title}</p>
                    <p className="text-sm text-muted-foreground">Custom Upload • {scratchUpload.productInfo.productType}</p>
                  </div>
                </div>
              ) : selectedProduct && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                      <img src={selectedProduct.images[0]?.url || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold">{selectedProduct.title}</p>
                      <p className="text-sm text-muted-foreground">{selectedProduct.vendor} • {selectedProduct.productType}</p>
                      <div className="flex gap-1 mt-1">{selectedProduct.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}</div>
                    </div>
                  </div>
                  {selectedProduct.images.length > 1 && (
                    <div className="space-y-2">
                      <Separator />
                      <p className="text-sm font-medium">Source images for generation</p>
                      <div className="flex flex-wrap gap-3">
                        {selectedProduct.images.map(img => {
                          const isSelected = selectedSourceImages.has(img.id);
                          return (
                            <div key={img.id} onClick={() => toggleSourceImage(img.id)}
                              className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'ring-1 ring-border hover:ring-primary'}`}>
                              <img src={img.url} alt="" className="w-16 h-16 object-cover" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Show active brand profile if selected */}
              {selectedBrandProfile && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{selectedBrandProfile.name}</span>
                      <Badge variant="secondary" className="text-[10px] capitalize">{selectedBrandProfile.tone}</Badge>
                    </div>
                    <Button variant="link" size="sm" onClick={() => setCurrentStep('brand-profile')}>Change</Button>
                  </div>
                </div>
              )}
            </CardContent></Card>

            {/* Template Grid */}
            {currentStep === 'template' && (
              <div className={selectedTemplate ? 'pb-24' : ''}>
                <div className="space-y-4">
                  <Alert><AlertDescription>Templates define the photography style. Each template produces a different look.</AlertDescription></Alert>

                  {/* Top Picks */}
                  {(() => {
                    const productType = (selectedProduct?.productType || scratchUpload?.productInfo.productType || '').toLowerCase();
                    let productCategory: TemplateCategory = 'universal';
                    if (['sweater', 'shirt', 'apparel', 'hoodie', 'leggings', 'tank', 'jogger'].some(kw => productType.includes(kw))) productCategory = 'clothing';
                    else if (['serum', 'cream', 'beauty'].some(kw => productType.includes(kw))) productCategory = 'cosmetics';
                    else if (['food', 'cereal'].some(kw => productType.includes(kw))) productCategory = 'food';
                    else if (['decor', 'home'].some(kw => productType.includes(kw))) productCategory = 'home';
                    else if (['supplement', 'vitamin'].some(kw => productType.includes(kw))) productCategory = 'supplements';

                    const topPicks = mockTemplates.filter(t => t.enabled && t.category === productCategory).slice(0, 3);
                    if (topPicks.length < 3) topPicks.push(...mockTemplates.filter(t => t.enabled && t.category === 'universal').slice(0, 3 - topPicks.length));
                    const topPickIds = topPicks.map(t => t.templateId);

                    return (
                      <>
                        <Card><CardContent className="p-5 space-y-4">
                          <div>
                            <h2 className="text-base font-semibold">Top Picks for {categoryLabels[productCategory]}</h2>
                            <p className="text-sm text-muted-foreground">Best templates for {productType || 'your'} products</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {topPicks.map(t => (
                              <TemplatePreviewCard key={t.templateId} template={{ ...t, recommended: false }} isSelected={selectedTemplate?.templateId === t.templateId} onSelect={() => handleSelectTemplate(t)} showCredits={false} />
                            ))}
                          </div>
                        </CardContent></Card>

                        <Card><CardContent className="p-5 space-y-4">
                          <div>
                            <h2 className="text-base font-semibold">Browse All Templates</h2>
                            <p className="text-sm text-muted-foreground">Explore all available photography styles</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                              <Button key={cat.id} variant={selectedCategory === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat.id)}>
                                {cat.label}
                              </Button>
                            ))}
                          </div>
                          {(() => {
                            const browse = mockTemplates.filter(t => t.enabled && (selectedCategory === 'all' || t.category === selectedCategory) && !topPickIds.includes(t.templateId));
                            return browse.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {browse.map(t => <TemplatePreviewCard key={t.templateId} template={{ ...t, recommended: false }} isSelected={selectedTemplate?.templateId === t.templateId} onSelect={() => handleSelectTemplate(t)} showCredits={false} />)}
                              </div>
                            ) : (
                              <p className="py-8 text-center text-sm text-muted-foreground">
                                {selectedCategory === 'all' ? 'All templates shown above.' : `No additional ${categoryLabels[selectedCategory as TemplateCategory]} templates.`}
                              </p>
                            );
                          })()}
                        </CardContent></Card>
                      </>
                    );
                  })()}
                </div>

                {selectedTemplate && (
                  <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-30 lg:left-60">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={getTemplateImage(selectedTemplate.templateId)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-semibold">{selectedTemplate.name}</p>
                          <p className="text-xs text-muted-foreground">{creditCost} credits</p>
                        </div>
                      </div>
                      <Button onClick={() => setCurrentStep('settings')}>Continue to Settings</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            {currentStep === 'settings' && generationMode === 'product-only' && (
              <div className="space-y-4">
                <Card><CardContent className="p-5 space-y-4">
                  <h3 className="text-base font-semibold">Generation Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Number of Images</Label>
                      <Select value={imageCount} onValueChange={v => setImageCount(v as '1' | '4' | '8')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 image</SelectItem>
                          <SelectItem value="4">4 images (recommended)</SelectItem>
                          <SelectItem value="8">8 images</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Quality</Label>
                      <Select value={quality} onValueChange={v => setQuality(v as ImageQuality)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (1 credit/img)</SelectItem>
                          <SelectItem value="high">High (2 credits/img)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                </CardContent></Card>

                <Card><CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setBrandKitOpen(!brandKitOpen)}>
                    <h3 className="text-base font-semibold">
                      {selectedBrandProfile ? `Brand Settings — ${selectedBrandProfile.name}` : 'Brand Settings'}
                    </h3>
                    <span className="text-xs text-muted-foreground">{brandKitOpen ? '▲' : '▼'}</span>
                  </div>
                  {brandKitOpen && (
                    <div className="space-y-4">
                      {selectedBrandProfile && (
                        <Alert>
                          <AlertDescription className="text-xs">
                            Settings pre-filled from your brand profile "{selectedBrandProfile.name}". You can still adjust them below.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Brand Tone</Label>
                          <Select value={brandTone} onValueChange={v => setBrandTone(v as BrandTone)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="clean">Clean</SelectItem>
                              <SelectItem value="luxury">Luxury</SelectItem>
                              <SelectItem value="playful">Playful</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Background</Label>
                          <Select value={backgroundStyle} onValueChange={v => setBackgroundStyle(v as BackgroundStyle)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="studio">Studio</SelectItem>
                              <SelectItem value="lifestyle">Lifestyle</SelectItem>
                              <SelectItem value="gradient">Gradient</SelectItem>
                              <SelectItem value="pattern">Pattern</SelectItem>
                              <SelectItem value="contextual">Contextual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <NegativesChipSelector value={negatives} onChange={setNegatives} />
                      <div className="flex items-center space-x-2">
                        <Checkbox id="preserve" checked={preserveAccuracy} onCheckedChange={v => setPreserveAccuracy(!!v)} />
                        <Label htmlFor="preserve">Keep product looking exactly as-is</Label>
                      </div>
                    </div>
                  )}
                </CardContent></Card>

                <div className="p-4 rounded-lg border border-border bg-muted/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Total: {creditCost} credits</p>
                    <p className="text-xs text-muted-foreground">{imageCount} images × {quality === 'high' ? 2 : 1} credit{quality === 'high' ? 's' : ''}</p>
                  </div>
                  <p className="text-sm">{balance} credits available</p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep('template')}>Back</Button>
                  <Button onClick={handleGenerateClick}>Generate {imageCount} Images</Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Settings for Virtual Try-On */}
        {currentStep === 'settings' && generationMode === 'virtual-try-on' && selectedModel && selectedPose && (
          <div className="space-y-4">
            <TryOnPreview product={selectedProduct} scratchUpload={scratchUpload} model={selectedModel} pose={selectedPose} creditCost={creditCost} />
            <Card><CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Selected Model & Pose</span>
                <Button variant="link" size="sm" onClick={() => setCurrentStep('model')}>Change</Button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden"><img src={selectedModel.previewUrl} alt="" className="w-full h-full object-cover" /></div>
                <div>
                  <p className="text-sm font-medium">{selectedModel.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedPose.name}</p>
                </div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-4">
              <h3 className="text-base font-semibold">Generation Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Images</Label>
                  <Select value={imageCount} onValueChange={v => setImageCount(v as '1' | '4' | '8')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 image</SelectItem>
                      <SelectItem value="4">4 images (recommended)</SelectItem>
                      <SelectItem value="8">8 images</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Quality</Label><p className="text-sm text-muted-foreground mt-1">Virtual Try-On uses High quality by default</p></div>
              </div>
              <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
              <div className="flex items-center space-x-2">
                <Checkbox id="preserveTryOn" checked={preserveAccuracy} onCheckedChange={v => setPreserveAccuracy(!!v)} />
                <Label htmlFor="preserveTryOn">Keep product looking exactly as-is</Label>
              </div>
            </CardContent></Card>

            <Alert><AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Virtual Try-On uses {creditCost} credits</p>
                  <p className="text-xs text-muted-foreground">{parseInt(imageCount)} images × 3 credits each</p>
                </div>
                <p className="font-semibold">{balance} credits available</p>
              </div>
            </AlertDescription></Alert>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('pose')}>Back</Button>
              <Button onClick={handleGenerateClick}>Generate {imageCount} Try-On Images</Button>
            </div>
          </div>
        )}

        {/* Generating */}
        {currentStep === 'generating' && (
          <Card><CardContent className="p-10 flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-subtle">
              {generationMode === 'virtual-try-on' ? <User className="w-7 h-7 text-primary" /> : <Image className="w-7 h-7 text-primary" />}
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">{generationMode === 'virtual-try-on' ? 'Creating Virtual Try-On...' : 'Creating Your Images...'}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {generationMode === 'virtual-try-on' ? `Dressing ${selectedModel?.name} in "${selectedProduct?.title}"` : `Creating ${imageCount} images of "${selectedProduct?.title}"`}
              </p>
            </div>
            <div className="w-full max-w-md">
              <Progress value={Math.min(generationMode === 'virtual-try-on' ? tryOnProgress : productProgress, 100)} className="h-2" />
            </div>
            {/* Team member working message */}
            <div className="flex items-center gap-2.5">
              <img
                src={generationMode === 'virtual-try-on' ? avatarZara : avatarSophia}
                alt={generationMode === 'virtual-try-on' ? 'Zara' : 'Sophia'}
                className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
              />
              <p className="text-sm text-muted-foreground italic">
                {generationMode === 'virtual-try-on'
                  ? 'Zara is styling the look...'
                  : 'Sophia is setting up the lighting...'}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">{generationMode === 'virtual-try-on' ? '20-30 seconds' : '10-15 seconds'}</p>
            <Button variant="link" onClick={handleCancelGeneration}><X className="w-4 h-4 mr-1" /> Cancel</Button>
          </CardContent></Card>
        )}

        {/* Results */}
        {currentStep === 'results' && (selectedProduct || scratchUpload) && (
          <div className="space-y-4">
            <Card><CardContent className="p-5 space-y-3">
              <Badge variant="secondary">{sourceType === 'scratch' ? 'Generated from uploaded image' : 'Publishing to'}</Badge>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                  <img src={sourceType === 'scratch' ? scratchUpload?.previewUrl : selectedProduct?.images[0]?.url || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">{sourceType === 'scratch' ? scratchUpload?.productInfo.title : selectedProduct?.title}</p>
                  <p className="text-sm text-muted-foreground">{sourceType === 'scratch' ? scratchUpload?.productInfo.productType : selectedProduct?.vendor}</p>
                </div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-semibold">Generated Images</h2>
                  <p className="text-xs text-muted-foreground">👆 Click images to select them</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep('settings')}>← Adjust</Button>
                  <Button variant="outline" size="sm" onClick={() => { setCurrentStep('source'); setSelectedProduct(null); setScratchUpload(null); setSelectedTemplate(null); setGeneratedImages([]); setSelectedForPublish(new Set()); }}>Start Over</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {generatedImages.map((url, index) => (
                  <div key={index} className={`generation-preview relative group cursor-pointer rounded-lg overflow-hidden ${selectedForPublish.has(index) ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                    <img src={url} alt={`Generated ${index + 1}`} className="w-full aspect-square object-cover" onClick={() => toggleImageSelection(index)} />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2" onClick={() => toggleImageSelection(index)}>
                      <button onClick={e => { e.stopPropagation(); handleImageClick(index); }} className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white" title="View full size">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDownloadImage(index); }} className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleRegenerate(index); }} className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white" title="Regenerate">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`absolute top-2 right-2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${selectedForPublish.has(index) ? 'bg-primary border-primary scale-110' : 'border-white bg-black/50'}`} onClick={() => toggleImageSelection(index)}>
                      {selectedForPublish.has(index) ? <CheckCircle className="w-4 h-4 text-primary-foreground" /> : <span className="text-white text-xs font-bold">{index + 1}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {selectedForPublish.size === 0 && (
                <Alert><AlertDescription>👆 Click on images above to select them for publishing.</AlertDescription></Alert>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Selected: {selectedForPublish.size} of {generatedImages.length}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedForPublish(new Set(generatedImages.map((_, i) => i)))}>Select All</Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedForPublish(new Set())}>Clear</Button>
                </div>
              </div>
            </CardContent></Card>

            {(selectedTemplate || generationMode === 'virtual-try-on') && (
              <Card><CardContent className="p-5 space-y-2">
                <h3 className="text-sm font-semibold">Generation Summary</h3>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                  {generationMode === 'virtual-try-on'
                    ? `Virtual Try-On: ${selectedModel?.name} wearing ${scratchUpload?.productInfo.title || selectedProduct?.title} in ${selectedPose?.name} pose`
                    : `${selectedTemplate?.promptBlueprint.sceneDescription}. ${scratchUpload?.productInfo.title || selectedProduct?.title}. ${selectedTemplate?.promptBlueprint.lighting}.`
                  }
                </div>
              </CardContent></Card>
            )}

            {/* Crafted by team */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="flex items-center">
                {[avatarSophia, avatarZara, avatarKenji, avatarLuna].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Team member"
                    className="w-7 h-7 rounded-full border-2 border-background object-cover"
                    style={{ marginLeft: i === 0 ? 0 : '-0.4rem' }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Crafted by your studio team</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleDownloadAll}><Download className="w-4 h-4 mr-2" /> Download All</Button>
              {sourceType === 'scratch' ? (
                <Button onClick={() => setProductAssignmentModalOpen(true)} disabled={selectedForPublish.size === 0}>
                  Assign {selectedForPublish.size} to Product
                </Button>
              ) : (
                <Button onClick={handlePublishClick} disabled={selectedForPublish.size === 0}>
                  Publish {selectedForPublish.size} to "{selectedProduct?.title}"
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <GenerateConfirmModal open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={handleConfirmGenerate}
        product={selectedProduct} template={selectedTemplate} sourceImageIds={selectedSourceImages}
        imageCount={parseInt(imageCount)} aspectRatio={aspectRatio} quality={quality} creditsRemaining={balance} onBuyCredits={openBuyModal} />
      <TryOnConfirmModal open={tryOnConfirmModalOpen} onClose={() => setTryOnConfirmModalOpen(false)} onConfirm={handleTryOnConfirmGenerate}
        product={selectedProduct} model={selectedModel} pose={selectedPose}
        imageCount={parseInt(imageCount)} aspectRatio={aspectRatio} creditsRemaining={balance} isLoading={isTryOnGenerating} onBuyCredits={openBuyModal}
        sourceImageUrl={selectedProduct && selectedSourceImages.size > 0 ? selectedProduct.images.find(img => selectedSourceImages.has(img.id))?.url : undefined} />
      <PublishModal open={publishModalOpen} onClose={() => setPublishModalOpen(false)} onPublish={handlePublish}
        selectedImages={Array.from(selectedForPublish).map(i => generatedImages[i])} product={selectedProduct} existingImages={selectedProduct?.images || []} />
      <ProductAssignmentModal open={productAssignmentModalOpen} onClose={() => setProductAssignmentModalOpen(false)}
        products={mockProducts} selectedProduct={assignToProduct} onSelectProduct={setAssignToProduct}
        onPublish={(product, mode) => { toast.success(`${selectedForPublish.size} image(s) ${mode === 'add' ? 'added to' : 'replaced on'} "${product.title}"!`); setProductAssignmentModalOpen(false); navigate('/app/library'); }}
        selectedImageCount={selectedForPublish.size} />
      <ImageLightbox images={generatedImages} currentIndex={lightboxIndex} open={lightboxOpen} onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex} onSelect={toggleImageSelection} onDownload={handleDownloadImage}
        onRegenerate={handleRegenerate} selectedIndices={selectedForPublish} productName={selectedProduct?.title || scratchUpload?.productInfo.title} />
      <NoCreditsModal open={noCreditsModalOpen} onClose={() => setNoCreditsModalOpen(false)} />
    </PageHeader>
  );
}
