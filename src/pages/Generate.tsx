import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useGenerationBatch } from '@/hooks/useGenerationBatch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AddProductModal } from '@/components/app/AddProductModal';
import { Image, CheckCircle, Download, RefreshCw, Maximize2, X, User, List, Palette, Shirt, Upload as UploadIcon, Package, Loader2, Check, Sparkles, Ban, Info, Smartphone, Layers, AlertCircle, Lock } from 'lucide-react';

import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const teamAvatar = (file: string) => getLandingAssetUrl(`team/${file}`);
const avatarSophia = teamAvatar('avatar-sophia.jpg');
const avatarZara = teamAvatar('avatar-zara.jpg');
const avatarKenji = teamAvatar('avatar-kenji.jpg');
const avatarLuna = teamAvatar('avatar-luna.jpg');
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

import { TryOnConfirmModal } from '@/components/app/TryOnConfirmModal';
import { LowCreditsBanner } from '@/components/app/LowCreditsBanner';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { useCredits } from '@/contexts/CreditContext';
import { useGenerationQueue } from '@/hooks/useGenerationQueue';
const MAX_IMAGES_PER_JOB = 4;
const FREE_SCENE_LIMIT = 1;
const PAID_SCENE_LIMIT = 3;
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { QueuePositionIndicator } from '@/components/app/QueuePositionIndicator';
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
import { convertImageToBase64 } from '@/lib/imageUtils';
import { mockProducts, mockTemplates, categoryLabels, mockModels, mockTryOnPoses } from '@/data/mockData';
import type { Product, Template, TemplateCategory, BrandTone, BackgroundStyle, AspectRatio, ImageQuality, GenerationMode, ModelProfile, TryOnPose, ModelGender, ModelBodyType, ModelAgeRange, PoseCategory, GenerationSourceType, ScratchUpload, FramingOption } from '@/types';
import { toast } from 'sonner';
import type { Workflow } from '@/types/workflow';
import type { BrandProfile } from '@/pages/BrandProfiles';
import type { Tables } from '@/integrations/supabase/types';
import { TryOnUploadGuide } from '@/components/app/TryOnUploadGuide';
import { FramingSelector } from '@/components/app/FramingSelector';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { detectDefaultFraming } from '@/lib/framingUtils';
type UserProduct = Tables<'user_products'>;

const FLAT_LAY_AESTHETICS = [
  { id: 'minimal', label: 'Minimal', hint: 'clean, few props, whitespace' },
  { id: 'botanical', label: 'Botanical', hint: 'dried flowers, eucalyptus leaves, greenery accents' },
  { id: 'coffee-books', label: 'Coffee & Books', hint: 'coffee cup, open book pages' },
  { id: 'textured', label: 'Textured', hint: 'linen fabric, kraft paper, washi tape' },
  { id: 'soft-glam', label: 'Soft Glam', hint: 'silk ribbon, dried petals, soft fabric swatches' },
  { id: 'cozy', label: 'Cozy', hint: 'knit blanket, candle, warm tones' },
  { id: 'seasonal', label: 'Seasonal', hint: 'seasonal elements matching current time of year' },
];

type Step = 'source' | 'product' | 'upload' | 'brand-profile' | 'mode' | 'model' | 'pose' | 'template' | 'settings' | 'generating' | 'results';

export default function Generate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('workflow');
  const initialTemplateId = searchParams.get('template');
  const { balance, isEmpty, openBuyModal, deductCredits, calculateCost, setBalanceFromServer, refreshBalance, plan } = useCredits();
  const { enqueue, activeJob, isProcessing: isQueueProcessing, isEnqueuing, reset: resetQueue, cancel: cancelQueue } = useGenerationQueue();
  const { startBatch, batchState, isBatching, resetBatch } = useGenerationBatch();
  const isFreeUser = plan === 'free';
  const { isAdmin } = useIsAdmin();
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);

  const handleGenerateScenePreviews = async () => {
    if (!workflowId) return;
    setIsGeneratingPreviews(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-scene-previews', {
        body: { workflow_id: workflowId, force_regenerate: true },
      });
      if (error) throw error;
      toast.success('Scene previews generated! Refreshing...');
      // Refetch workflow data
      window.location.reload();
    } catch (e) {
      toast.error('Failed to generate scene previews');
      console.error(e);
    } finally {
      setIsGeneratingPreviews(false);
    }
  };

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

  // Fetch real user products from database for try-on workflows
  const { data: userProducts = [], isLoading: isLoadingUserProducts } = useQuery({
    queryKey: ['user-products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserProduct[];
    },
    enabled: !!user?.id,
  });

  // Fetch previous room uploads for interior/exterior staging reuse
  const { data: previousUploads = [] } = useQuery({
    queryKey: ['previous-uploads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: files, error } = await supabase.storage
        .from('product-uploads')
        .list(user.id, { limit: 20, sortBy: { column: 'created_at', order: 'desc' } });
      if (error || !files) return [];
      return files
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f.name))
        .map(f => {
          const { data: urlData } = supabase.storage.from('product-uploads').getPublicUrl(`${user.id}/${f.name}`);
          return { name: f.name, url: urlData.publicUrl, created_at: f.created_at };
        });
    },
    enabled: !!user?.id && activeWorkflow?.name === 'Interior / Exterior Staging',
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

  const [imageCount, setImageCount] = useState<'1' | '2' | '3' | '4'>('1');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [quality, setQuality] = useState<ImageQuality>('standard');
  const [framing, setFraming] = useState<FramingOption | null>(null);

  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedForPublish, setSelectedForPublish] = useState<Set<number>>(new Set());

  // Multi-product queue state
  const [productQueue, setProductQueue] = useState<Product[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [multiProductResults, setMultiProductResults] = useState<Map<string, { images: string[]; labels: string[] }>>(new Map());
  const [multiProductAutoAdvancing, setMultiProductAutoAdvancing] = useState(false);
  const isMultiProductMode = productQueue.length > 1;

  
  const [tryOnConfirmModalOpen, setTryOnConfirmModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [noCreditsModalOpen, setNoCreditsModalOpen] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const queryClient = useQueryClient();


  // Workflow generation config shortcuts
  const workflowConfig = activeWorkflow?.generation_config ?? null;
  const hasWorkflowConfig = !!workflowConfig;
  const variationStrategy = workflowConfig?.variation_strategy;
  const uiConfig = workflowConfig?.ui_config;

  // Selected variation indices for workflow generation
  const [selectedVariationIndices, setSelectedVariationIndices] = useState<Set<number>>(new Set());
  const [workflowVariationLabels, setWorkflowVariationLabels] = useState<string[]>([]);
  const [productAngle, setProductAngle] = useState<'front' | 'front-side' | 'front-back' | 'all'>('front');
  const [sceneFilterCategory, setSceneFilterCategory] = useState<string>('all');
  const [mirrorSettingsPhase, setMirrorSettingsPhase] = useState<'scenes' | 'final'>('scenes');

  // Flat Lay Set detection and state
  const isFlatLay = activeWorkflow?.name === 'Flat Lay Set';
  const [flatLayPhase, setFlatLayPhase] = useState<'surfaces' | 'details'>('surfaces');
  const [stylingNotes, setStylingNotes] = useState('');
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);
  const [selectedFlatLayProductIds, setSelectedFlatLayProductIds] = useState<Set<string>>(new Set());
  const [flatLayPropStyle, setFlatLayPropStyle] = useState<'clean' | 'decorated'>('clean');

  // UGC mood selector
  type UgcMood = 'excited' | 'chill' | 'confident' | 'surprised' | 'focused';
  const UGC_MOODS: Array<{ id: UgcMood; label: string; emoji: string; desc: string; example: string; recommended?: boolean }> = [
    { id: 'excited', emoji: '🤩', label: 'Excited', desc: '"OMG I love this!" energy', example: 'Wide smile, bright eyes', recommended: true },
    { id: 'chill', emoji: '😌', label: 'Chill', desc: 'Everyday casual vibe', example: 'Soft smile, relaxed gaze' },
    { id: 'confident', emoji: '😎', label: 'Confident', desc: '"I know what works" energy', example: 'Subtle smile, direct eye contact' },
    { id: 'surprised', emoji: '😲', label: 'Surprised', desc: '"Wait, this actually works?!"', example: 'Raised eyebrows, open mouth' },
    { id: 'focused', emoji: '🧐', label: 'Focused', desc: 'Tutorial / demo mode', example: 'Concentrated, friendly' },
  ];
  const [ugcMood, setUgcMood] = useState<UgcMood>('excited');

  // Mirror Selfie detection
  const isMirrorSelfie = activeWorkflow?.name === 'Mirror Selfie Set';

  // Selfie / UGC Set detection
  const isSelfieUgc = activeWorkflow?.name === 'Selfie / UGC Set';

  // Interior / Exterior Staging detection and state
  const isInteriorDesign = activeWorkflow?.name === 'Interior / Exterior Staging';
  const [interiorType, setInteriorType] = useState<'interior' | 'exterior'>('interior');
  const [interiorRoomType, setInteriorRoomType] = useState('');
  const [interiorWallColor, setInteriorWallColor] = useState('Keep Original');
  const [interiorFlooring, setInteriorFlooring] = useState('Keep Original');
  const [interiorFurnitureStyle, setInteriorFurnitureStyle] = useState('Match Design Style');
  const [interiorLightingMood, setInteriorLightingMood] = useState('Keep Original');
  const [interiorFurnitureHandling, setInteriorFurnitureHandling] = useState('Keep & Restyle');
  const [interiorRoomSize, setInteriorRoomSize] = useState('Medium');
  const [interiorKeyPieces, setInteriorKeyPieces] = useState<string[]>([]);
  const [interiorDesignNotes, setInteriorDesignNotes] = useState('');
  const [interiorColorPalette, setInteriorColorPalette] = useState('');
  const [interiorTimeOfDay, setInteriorTimeOfDay] = useState('As Photographed');
  const [interiorPurpose, setInteriorPurpose] = useState('');
  const [interiorIsEmptyRoom, setInteriorIsEmptyRoom] = useState(false);
  const [interiorCeilingHeight, setInteriorCeilingHeight] = useState('Standard');
  const [interiorRoomDimensions, setInteriorRoomDimensions] = useState('');
  const [interiorExactCeilingHeight, setInteriorExactCeilingHeight] = useState('');
  const ROOM_FURNITURE_PRESETS: Record<string, string[]> = {
    'Living Room': ['Sofa', 'Sectional', 'Coffee Table', 'TV Console', 'Bookshelf', 'Side Table', 'Kitchen Island', 'Bar Cart', 'Floor Lamp', 'Area Rug'],
    'Bedroom (Master)': ['King Bed', 'Queen Bed', 'Nightstands', 'Dresser', 'Vanity', 'Armchair', 'Floor Mirror'],
    'Bedroom (Guest)': ['Double Bed', 'Single Bed', 'Sofa Bed', 'Nightstand', 'Small Desk', 'Armchair'],
    'Kids Room (Girl)': ['Single Bed', 'Bunk Bed', 'Loft Bed', 'Study Desk', 'Bookshelf', 'Toy Storage', 'Bean Bag', 'Wall Shelves'],
    'Kids Room (Boy)': ['Single Bed', 'Bunk Bed', 'Loft Bed', 'Study Desk', 'Bookshelf', 'Toy Storage', 'Bean Bag', 'Wall Shelves'],
    'Kids Room (Twins/Shared)': ['Twin Beds', 'Bunk Bed', 'Shared Desk', 'Individual Nightstands', 'Toy Storage', 'Bookshelf'],
    'Baby Nursery (Girl)': ['Crib', 'Changing Table', 'Rocking Chair', 'Dresser', 'Wall Shelves', 'Storage Baskets'],
    'Baby Nursery (Boy)': ['Crib', 'Changing Table', 'Rocking Chair', 'Dresser', 'Wall Shelves', 'Storage Baskets'],
    'Kitchen': ['Kitchen Island', 'Bar Stools', 'Dining Nook', 'Open Shelving', 'Pendant Lights'],
    'Dining Room': ['Dining Table (4-seat)', 'Dining Table (6-seat)', 'Sideboard', 'Display Cabinet', 'Chandelier'],
    'Bathroom (Master)': ['Vanity', 'Freestanding Tub', 'Shower', 'Storage Cabinet', 'Mirror', 'Towel Rack'],
    'Bathroom (Guest)': ['Vanity', 'Shower', 'Storage Cabinet', 'Mirror', 'Towel Rack'],
    'Home Office / Work Room': ['Desk', 'Ergonomic Chair', 'Bookshelf', 'Filing Cabinet', 'Monitor Stand', 'Floor Lamp'],
    'Walk-in Closet': ['Shelving Unit', 'Hanging Rails', 'Drawer Unit', 'Island Dresser', 'Mirror', 'Shoe Rack'],
    'Hallway / Entryway': ['Console Table', 'Mirror', 'Coat Hooks', 'Shoe Storage', 'Bench'],
    'Laundry Room': ['Folding Table', 'Storage Shelves', 'Baskets', 'Drying Rack'],
    'Storage Room / Utility': ['Shelving Units', 'Labeled Containers', 'Workbench', 'Pegboard'],
    'Basement / Rec Room': ['Sofa', 'TV Console', 'Game Table', 'Bar Area', 'Bookshelf'],
    // Exterior types
    'Front Facade': ['Lounge Chairs', 'Planters', 'Outdoor Lighting', 'Welcome Mat'],
    'Backyard': ['Lounge Chairs', 'Dining Set', 'Planters', 'Fire Pit', 'Pergola', 'Outdoor Rug'],
    'Garden': ['Garden Bench', 'Planters', 'Water Feature', 'Pathway Lighting'],
    'Pool Area': ['Lounge Chairs', 'Umbrellas', 'Side Tables', 'Planters', 'Outdoor Shower'],
    'Driveway': ['Planters', 'Pathway Lighting', 'Gate', 'Bollards'],
    'Rooftop Terrace': ['Lounge Set', 'Planters', 'Privacy Screen', 'String Lights', 'Outdoor Rug'],
    'Entrance / Porch': ['Rocking Chair', 'Bench', 'Planters', 'Pendant Light', 'Welcome Mat'],
    'Patio / Outdoor Living': ['Dining Set', 'Lounge Set', 'Planters', 'Fire Pit', 'Pergola', 'Outdoor Rug'],
    'Balcony / Terrace': ['Compact Table', 'Chairs', 'Planters', 'String Lights'],
    'Garage': ['Tool Storage', 'Workbench', 'Wall-mounted Racks', 'Floor Mat'],
  };

  const INTERIOR_ROOM_TYPES = [
    'Living Room', 'Bedroom (Master)', 'Bedroom (Guest)',
    'Kids Room (Girl)', 'Kids Room (Boy)', 'Kids Room (Twins/Shared)',
    'Baby Nursery (Girl)', 'Baby Nursery (Boy)',
    'Kitchen', 'Dining Room',
    'Bathroom (Master)', 'Bathroom (Guest)',
    'Home Office / Work Room', 'Walk-in Closet', 'Hallway / Entryway',
    'Laundry Room', 'Storage Room / Utility',
    'Basement / Rec Room',
  ];

  const EXTERIOR_ROOM_TYPES = [
    'Front Facade', 'Backyard', 'Garden', 'Pool Area',
    'Driveway', 'Rooftop Terrace', 'Entrance / Porch',
    'Patio / Outdoor Living', 'Balcony / Terrace', 'Garage',
  ];

  // Auto-set scratch source type for interior design (upload-based)
  useEffect(() => {
    if (isInteriorDesign) {
      setSourceType('scratch');
    }
  }, [isInteriorDesign]);

  // Reset room type and key pieces when switching interior/exterior
  useEffect(() => {
    setInteriorRoomType('');
    setInteriorKeyPieces([]);
    setInteriorColorPalette('');
    setInteriorTimeOfDay('As Photographed');
    setInteriorIsEmptyRoom(false);
    setInteriorCeilingHeight('Standard');
    setInteriorRoomDimensions('');
    setInteriorExactCeilingHeight('');
    setSelectedVariationIndices(new Set());
    setSceneFilterCategory('all');
  }, [interiorType]);

  // Reset key pieces when room type changes (but NOT design notes)
  useEffect(() => {
    setInteriorKeyPieces([]);
  }, [interiorRoomType]);

  // When empty room is toggled on, force "Replace All"
  useEffect(() => {
    if (interiorIsEmptyRoom) {
      setInteriorFurnitureHandling('Replace All');
    }
  }, [interiorIsEmptyRoom]);

  // When workflow is loaded, set generation mode and defaults
  useEffect(() => {
    if (activeWorkflow) {
      if (activeWorkflow.uses_tryon) {
        setGenerationMode('virtual-try-on');
      }
      // Set aspect ratio from workflow config or recommendations
      if (workflowConfig?.fixed_settings?.aspect_ratios?.length) {
        const firstRatio = workflowConfig.fixed_settings.aspect_ratios[0] as AspectRatio;
        if (['1:1', '4:5', '9:16', '16:9'].includes(firstRatio)) {
          setAspectRatio(firstRatio);
        }
      } else if (activeWorkflow.recommended_ratios?.length > 0) {
        const firstRatio = activeWorkflow.recommended_ratios[0] as AspectRatio;
        if (['1:1', '4:5', '9:16', '16:9'].includes(firstRatio)) {
          setAspectRatio(firstRatio);
        }
      }
      // Set quality from workflow config
      if (workflowConfig?.fixed_settings?.quality) {
        setQuality(workflowConfig.fixed_settings.quality as ImageQuality);
      }
      // Start with none selected for scene-type workflows, auto-select all for others
      if (variationStrategy?.variations?.length) {
        if (variationStrategy.type === 'scene') {
          setSelectedVariationIndices(new Set());
        } else {
          setSelectedVariationIndices(new Set(variationStrategy.variations.map((_, i) => i)));
        }
      }
      // Auto-select template from workflow's template_ids (only if no config)
      if (!workflowConfig && activeWorkflow.template_ids?.length > 0) {
        const matchingTemplate = mockTemplates.find(t =>
          activeWorkflow.template_ids.some(tid => t.templateId.includes(tid) || t.name.toLowerCase().includes(tid.replace(/-/g, ' ')))
        );
        if (matchingTemplate) setSelectedTemplate(matchingTemplate);
      }
    }
  }, [activeWorkflow, workflowConfig, variationStrategy]);

  // Scroll to top when step changes
  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

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

  const onModelCategories: PoseCategory[] = ['studio', 'lifestyle', 'editorial', 'streetwear'];
  const posesByCategory = mockTryOnPoses.reduce((acc, pose) => {
    // For Virtual Try-On, only show on-model categories
    if (activeWorkflow?.uses_tryon && !onModelCategories.includes(pose.category)) return acc;
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

  // Map a DB UserProduct to the app's Product type
  const mapUserProductToProduct = (up: UserProduct): Product => ({
    id: up.id,
    title: up.title,
    vendor: 'My Products',
    productType: up.product_type,
    tags: up.tags || [],
    description: up.description,
    images: [{ id: `img-${up.id}`, url: up.image_url }],
    status: 'active',
    createdAt: up.created_at,
    updatedAt: up.updated_at,
  });

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
    // Auto-detect framing
    const detectedFraming = detectDefaultFraming(product.productType, product.tags);
    if (detectedFraming) setFraming(detectedFraming);
    // Go to brand profile step if profiles exist
    if (brandProfiles.length > 0) {
      setCurrentStep('brand-profile');
    } else if (activeWorkflow?.uses_tryon || uiConfig?.show_model_picker) {
      // Go to model step for try-on or selfie/UGC workflows
      setCurrentStep('model');
    } else if (isClothingProduct(product)) {
      setCurrentStep('mode');
    } else if (uiConfig?.skip_template && hasWorkflowConfig) {
      // Workflow config skips template — go straight to settings
      setCurrentStep('settings');
    } else {
      setCurrentStep('template');
    }
  };

  const handleBrandProfileContinue = () => {
    if (isFlatLay) {
      setFlatLayPhase('surfaces');
      setCurrentStep('settings');
    } else if (activeWorkflow?.uses_tryon || uiConfig?.show_model_picker) {
      setCurrentStep('model');
    } else if (uiConfig?.skip_template && hasWorkflowConfig) {
      setCurrentStep('settings');
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
  const handleSelectPose = (pose: TryOnPose) => { setSelectedPose(pose); toast.success(`Scene "${pose.name}" selected!`); };
  const handleCancelGeneration = () => { setCurrentStep('settings'); setGeneratingProgress(0); toast.info('Generation cancelled'); };

  const handleGenerateClick = () => {
    if (!selectedProduct && !(sourceType === 'scratch' && scratchUpload)) {
      toast.error('Please select a product first');
      return;
    }
    const cost = calculateCost({ count: parseInt(imageCount), quality, mode: generationMode, hasModel: !!selectedModel });
    if (balance < cost) { openBuyModal(); return; }
    if (generationMode === 'virtual-try-on' && !isSelfieUgc) {
      if (!selectedModel || !selectedPose) { toast.error('Please select a model and scene first'); return; }
      handleTryOnConfirmGenerate(); return;
    }
    // Workflow-config path: skip template requirement
    if (hasWorkflowConfig) {
      handleWorkflowGenerate();
      return;
    }
    if (!selectedTemplate) { toast.error('Please select a template first'); return; }
    toast.error('Template-based generation is no longer supported. Please use a workflow.');
  };

  const handleWorkflowGenerate = async () => {
    try {
    if (!selectedProduct && !scratchUpload) return;
    let sourceImageUrl = '';
    let productData: { title: string; productType: string; description: string; dimensions?: string } = { title: '', productType: '', description: '' };
    if (sourceType === 'scratch' && scratchUpload?.uploadedUrl) {
      sourceImageUrl = scratchUpload.uploadedUrl;
      productData = scratchUpload.productInfo;
    } else if (selectedProduct) {
      const selectedImageId = Array.from(selectedSourceImages)[0];
      const sourceImage = selectedProduct.images.find(img => img.id === selectedImageId);
      sourceImageUrl = sourceImage?.url || selectedProduct.images[0]?.url || '';
      // Look up original UserProduct to get dimensions
      const originalUp = userProducts.find(up => up.id === selectedProduct.id);
      productData = { title: selectedProduct.title, productType: selectedProduct.productType, description: selectedProduct.description, dimensions: originalUp?.dimensions || undefined };
    }
    if (!sourceImageUrl) { toast.error('No source image available'); return; }
    setCurrentStep('generating');
    setGeneratingProgress(0);

    // Convert product image; also convert model image if workflow uses model picker
    const needsModel = uiConfig?.show_model_picker && selectedModel;
    const [base64Image, base64ModelImage] = await Promise.all([
      convertImageToBase64(sourceImageUrl),
      needsModel ? convertImageToBase64(selectedModel!.previewUrl) : Promise.resolve(undefined),
    ]);

    // Build styling notes for flat lay
    const flatLayStylingNotes = isFlatLay ? [
      ...selectedAesthetics.map(id => FLAT_LAY_AESTHETICS.find(a => a.id === id)?.hint).filter(Boolean),
      stylingNotes,
    ].filter(Boolean).join(', ') : undefined;

    // Build additional products array for flat lay multi-product (convert images to base64)
    const additionalProducts = isFlatLay && selectedFlatLayProductIds.size > 1
      ? await Promise.all(
          (userProducts.length > 0 ? userProducts : [])
            .filter(up => selectedFlatLayProductIds.has(up.id) && up.id !== selectedProduct?.id)
            .map(async up => ({
              title: up.title,
              productType: up.product_type,
              description: up.description,
              imageUrl: await convertImageToBase64(up.image_url),
            }))
        )
      : undefined;

    const payload: Record<string, unknown> = {
      workflow_id: activeWorkflow!.id,
      product: { ...productData, imageUrl: base64Image },
      brand_profile: selectedBrandProfile ? {
        tone: selectedBrandProfile.tone, background_style: selectedBrandProfile.background_style,
        lighting_style: selectedBrandProfile.lighting_style, color_temperature: selectedBrandProfile.color_temperature,
        brand_keywords: selectedBrandProfile.brand_keywords, color_palette: selectedBrandProfile.color_palette,
        target_audience: selectedBrandProfile.target_audience, do_not_rules: selectedBrandProfile.do_not_rules,
        composition_bias: selectedBrandProfile.composition_bias, preferred_scenes: selectedBrandProfile.preferred_scenes,
        photography_reference: selectedBrandProfile.photography_reference,
      } : undefined,
      selected_variations: selectedVariationIndices.size > 0 ? Array.from(selectedVariationIndices) : undefined,
      product_angles: productAngle !== 'front' ? productAngle : undefined,
      quality,
      aspectRatio,
      framing: framing || undefined,
      styling_notes: flatLayStylingNotes || undefined,
      prop_style: isFlatLay ? flatLayPropStyle : undefined,
      additional_products: additionalProducts,
      ugc_mood: isSelfieUgc ? ugcMood : undefined,
      // Interior Design fields
      room_type: isInteriorDesign ? interiorRoomType : undefined,
      wall_color: isInteriorDesign ? interiorWallColor : undefined,
      flooring_preference: isInteriorDesign ? interiorFlooring : undefined,
      interior_type: isInteriorDesign ? interiorType : undefined,
      furniture_style: isInteriorDesign ? interiorFurnitureStyle : undefined,
      lighting_mood: isInteriorDesign ? interiorLightingMood : undefined,
      furniture_handling: isInteriorDesign ? interiorFurnitureHandling : undefined,
      room_size: isInteriorDesign ? interiorRoomSize : undefined,
      key_pieces: isInteriorDesign && interiorKeyPieces.length > 0 ? interiorKeyPieces : undefined,
      design_notes: isInteriorDesign && interiorDesignNotes ? interiorDesignNotes : undefined,
      color_palette_preference: isInteriorDesign && interiorColorPalette ? interiorColorPalette : undefined,
      time_of_day: isInteriorDesign && interiorTimeOfDay !== 'As Photographed' ? interiorTimeOfDay : undefined,
      staging_purpose: isInteriorDesign && interiorPurpose ? interiorPurpose : undefined,
      is_empty_room: isInteriorDesign ? interiorIsEmptyRoom : undefined,
      ceiling_height: isInteriorDesign && interiorCeilingHeight !== 'Standard' ? interiorCeilingHeight : undefined,
      room_dimensions: isInteriorDesign && interiorRoomDimensions ? interiorRoomDimensions : undefined,
      exact_ceiling_height: isInteriorDesign && interiorExactCeilingHeight ? interiorExactCeilingHeight : undefined,
    };

    // Attach model data for selfie/UGC workflows
    if (needsModel && base64ModelImage) {
      payload.model = {
        name: selectedModel!.name,
        gender: selectedModel!.gender,
        ethnicity: selectedModel!.ethnicity,
        bodyType: selectedModel!.bodyType,
        ageRange: selectedModel!.ageRange,
        imageUrl: base64ModelImage,
      };
    }

    // Decide: single job or batch
    if (workflowImageCount <= MAX_IMAGES_PER_JOB) {
      // Single job — existing behavior
      const enqueueResult = await enqueue({
        jobType: 'workflow',
        payload,
        imageCount: workflowImageCount,
        quality,
        additionalProductCount: extraProductCount,
      }, {
        imageCount: workflowImageCount,
        quality,
        hasModel: !!needsModel,
        hasScene: false,
        hasProduct: true,
      });
      if (enqueueResult) {
        setBalanceFromServer(enqueueResult.newBalance);
      } else {
        setCurrentStep('settings');
      }
    } else {
      // Batch mode — split into multiple jobs
      const success = await startBatch({
        payload,
        selectedVariationIndices: Array.from(selectedVariationIndices),
        angleMultiplier,
        quality,
        imageCount: workflowImageCount,
      });
      if (!success) {
        setCurrentStep('settings');
      }
    }
    } catch (err) {
      console.error('Workflow generation failed:', err);
      toast.error('Something went wrong starting the generation. Please try again.');
      setCurrentStep('settings');
    }
  };

  const handleTryOnConfirmGenerate = async () => {
    try {
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

    const [base64ProductImage, base64ModelImage, base64SceneImage] = await Promise.all([
      convertImageToBase64(sourceImageUrl),
      convertImageToBase64(selectedModel.previewUrl),
      selectedPose.previewUrl ? convertImageToBase64(selectedPose.previewUrl) : Promise.resolve(undefined),
    ]);

    const enqueueResult = await enqueue({
      jobType: 'tryon',
      payload: {
        product: { title: productData.title, description: productData.description, productType: productData.productType, imageUrl: base64ProductImage },
        model: { name: selectedModel.name, gender: selectedModel.gender, ethnicity: selectedModel.ethnicity, bodyType: selectedModel.bodyType, ageRange: selectedModel.ageRange, imageUrl: base64ModelImage },
        pose: { name: selectedPose.name, description: selectedPose.promptHint || selectedPose.description, category: selectedPose.category, imageUrl: base64SceneImage },
        aspectRatio, imageCount: parseInt(imageCount),
        framing: framing || undefined,
        workflow_id: activeWorkflow?.id || null,
        product_id: selectedProduct?.id || null,
        brand_profile_id: selectedBrandProfileId || null,
      },
      imageCount: parseInt(imageCount),
      quality,
    }, {
      imageCount: parseInt(imageCount),
      quality,
      hasModel: true,
      hasScene: true,
      hasProduct: true,
    });
    if (enqueueResult) {
      setBalanceFromServer(enqueueResult.newBalance);
    } else {
      setCurrentStep('settings');
    }
    } catch (err) {
      console.error('Try-on generation failed:', err);
      toast.error('Something went wrong starting the generation. Please try again.');
      setCurrentStep('settings');
    }
  };

  // Watch queue job completion to transition to results
  useEffect(() => {
    if (!activeJob) return;
    if (activeJob.status === 'completed' && activeJob.result) {
      const result = activeJob.result as { images?: string[]; variations?: Array<{ label: string }> };
      if (result.images && result.images.length > 0) {
        // If multi-product mode, store results and advance
        if (isMultiProductMode) {
          const currentProduct = productQueue[currentProductIndex];
          setMultiProductResults(prev => {
            const next = new Map(prev);
            next.set(currentProduct.id, { images: result.images!, labels: result.variations?.map(v => v.label) || [] });
            return next;
          });
          refreshBalance();
          resetQueue();
          
          // Check if there are more products
          if (currentProductIndex < productQueue.length - 1) {
            setMultiProductAutoAdvancing(true);
            const nextIdx = currentProductIndex + 1;
            setCurrentProductIndex(nextIdx);
            const nextProduct = productQueue[nextIdx];
            setSelectedProduct(nextProduct);
            if (nextProduct.images.length > 0) setSelectedSourceImages(new Set([nextProduct.images[0].id]));
            // Auto-trigger after a short delay
            setTimeout(() => {
              setMultiProductAutoAdvancing(false);
              handleWorkflowGenerate();
            }, 1500);
          } else {
            // All done — aggregate results
            const allImages: string[] = [];
            const allLabels: string[] = [];
            const finalResults = new Map(multiProductResults);
            finalResults.set(currentProduct.id, { images: result.images!, labels: result.variations?.map(v => v.label) || [] });
            for (const product of productQueue) {
              const r = finalResults.get(product.id);
              if (r) {
                allImages.push(...r.images);
                allLabels.push(...r.labels.map(l => `${product.title} — ${l}`));
              }
            }
            setGeneratedImages(allImages);
            setWorkflowVariationLabels(allLabels);
            setGeneratingProgress(100);
            setCurrentStep('results');
            toast.success(`Generated ${allImages.length} images for ${productQueue.length} products!`);
            queryClient.invalidateQueries({ queryKey: ['library'] });
            queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
          }
        } else {
          setGeneratedImages(result.images);
          setWorkflowVariationLabels(result.variations?.map(v => v.label) || []);
          setGeneratingProgress(100);
          setCurrentStep('results');
          toast.success(`Generated ${result.images.length} images!`);
          refreshBalance();
          queryClient.invalidateQueries({ queryKey: ['library'] });
          queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
          resetQueue();
        }
      }
    }
    if (activeJob.status === 'failed') {
      if (isMultiProductMode) {
        const currentProduct = productQueue[currentProductIndex];
        toast.error(`Failed for "${currentProduct.title}". Credits refunded. Moving to next...`);
        refreshBalance();
        resetQueue();
        
        if (currentProductIndex < productQueue.length - 1) {
          const nextIdx = currentProductIndex + 1;
          setCurrentProductIndex(nextIdx);
          const nextProduct = productQueue[nextIdx];
          setSelectedProduct(nextProduct);
          if (nextProduct.images.length > 0) setSelectedSourceImages(new Set([nextProduct.images[0].id]));
          setTimeout(() => handleWorkflowGenerate(), 1500);
        } else {
          // All done with failures
          const allImages: string[] = [];
          const allLabels: string[] = [];
          for (const product of productQueue) {
            const r = multiProductResults.get(product.id);
            if (r) {
              allImages.push(...r.images);
              allLabels.push(...r.labels.map(l => `${product.title} — ${l}`));
            }
          }
          if (allImages.length > 0) {
            setGeneratedImages(allImages);
            setWorkflowVariationLabels(allLabels);
            setGeneratingProgress(100);
            setCurrentStep('results');
            toast.warning(`Completed with some failures. ${allImages.length} images generated.`);
          } else {
            toast.error('All products failed. Credits refunded.');
            setCurrentStep('settings');
          }
          queryClient.invalidateQueries({ queryKey: ['library'] });
        }
      } else {
        toast.error(activeJob.error_message || 'Generation failed. Credits refunded.');
        setCurrentStep('settings');
        refreshBalance();
        resetQueue();
      }
    }
  }, [activeJob, refreshBalance, resetQueue]);

  // Watch batch completion
  useEffect(() => {
    if (!batchState) return;
    if (batchState.allDone) {
      if (batchState.aggregatedImages.length > 0) {
        if (isMultiProductMode) {
          const currentProduct = productQueue[currentProductIndex];
          setMultiProductResults(prev => {
            const next = new Map(prev);
            next.set(currentProduct.id, { images: batchState.aggregatedImages, labels: batchState.aggregatedLabels });
            return next;
          });
          refreshBalance();
          resetBatch();
          
          if (currentProductIndex < productQueue.length - 1) {
            setMultiProductAutoAdvancing(true);
            const nextIdx = currentProductIndex + 1;
            setCurrentProductIndex(nextIdx);
            const nextProduct = productQueue[nextIdx];
            setSelectedProduct(nextProduct);
            if (nextProduct.images.length > 0) setSelectedSourceImages(new Set([nextProduct.images[0].id]));
            setTimeout(() => {
              setMultiProductAutoAdvancing(false);
              handleWorkflowGenerate();
            }, 1500);
          } else {
            // All done — aggregate
            const allImages: string[] = [];
            const allLabels: string[] = [];
            const finalResults = new Map(multiProductResults);
            finalResults.set(currentProduct.id, { images: batchState.aggregatedImages, labels: batchState.aggregatedLabels });
            for (const product of productQueue) {
              const r = finalResults.get(product.id);
              if (r) {
                allImages.push(...r.images);
                allLabels.push(...r.labels.map(l => `${product.title} — ${l}`));
              }
            }
            setGeneratedImages(allImages);
            setWorkflowVariationLabels(allLabels);
            setGeneratingProgress(100);
            setCurrentStep('results');
            toast.success(`Generated ${allImages.length} images for ${productQueue.length} products!`);
            queryClient.invalidateQueries({ queryKey: ['library'] });
            queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
          }
        } else {
          setGeneratedImages(batchState.aggregatedImages);
          setWorkflowVariationLabels(batchState.aggregatedLabels);
          setGeneratingProgress(100);
          setCurrentStep('results');
          if (batchState.hasPartialFailure) {
            toast.warning(`Generated ${batchState.aggregatedImages.length} images. ${batchState.failedJobs} batch${batchState.failedJobs > 1 ? 'es' : ''} failed — credits refunded for those.`);
          } else {
            toast.success(`Generated ${batchState.aggregatedImages.length} images!`);
          }
          refreshBalance();
          queryClient.invalidateQueries({ queryKey: ['library'] });
          queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
          resetBatch();
        }
      } else {
        // All batches failed
        toast.error('All generation batches failed. Credits have been refunded.');
        setCurrentStep('settings');
        refreshBalance();
        resetBatch();
      }
    }
  }, [batchState, refreshBalance, resetBatch]);

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
  const handleDownloadImage = async (index: number) => {
    const url = generatedImages[index];
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `generated-image-${index + 1}.png`;
      link.click();
      URL.revokeObjectURL(blobUrl);
      toast.success('Image downloaded');
    } catch {
      toast.error('Download failed');
    }
  };
  const handleDownloadAll = async () => {
    for (let idx = 0; idx < generatedImages.length; idx++) {
      await handleDownloadImage(idx);
    }
    toast.success(`${generatedImages.length} images downloaded`);
  };
  const handleRegenerate = (index: number) => toast.info('Regenerating variation... (this would cost 1 credit)');

  const getStepNumber = () => {
    if (isFlatLay) {
      if (currentStep === 'settings' && flatLayPhase === 'surfaces') return 3;
      if (currentStep === 'settings' && flatLayPhase === 'details') return 4;
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, generating: 5, results: 5 };
      return map[currentStep] || 1;
    }
    if (isMirrorSelfie) {
      if (currentStep === 'settings' && mirrorSettingsPhase === 'scenes') {
        return 2;
      }
      if (currentStep === 'settings' && mirrorSettingsPhase === 'final') {
        return 4;
      }
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, model: 3, generating: 5, results: 5 };
      return map[currentStep] || 1;
    }
    if (isSelfieUgc) {
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, mode: 2, model: 3, settings: 4, generating: 5, results: 5 };
      return map[currentStep] || 1;
    }
    if (generationMode === 'virtual-try-on') {
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, mode: 2, model: 3, pose: 4, settings: 5, generating: 6, results: 6 };
      return map[currentStep] || 1;
    }
    if (isInteriorDesign) {
      const map: Record<string, number> = { source: 1, upload: 2, settings: 3, generating: 4, results: 4 };
      return map[currentStep] || 1;
    }
    if (hasWorkflowConfig && uiConfig?.skip_template) {
      if (uiConfig?.show_model_picker) {
        const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, mode: 2, model: 3, settings: 4, generating: 5, results: 5 };
        return map[currentStep] || 1;
      }
      const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, mode: 2, settings: 3, generating: 4, results: 4 };
      return map[currentStep] || 1;
    }
    const map: Record<string, number> = { source: 1, product: 1, upload: 1, 'brand-profile': 2, mode: 2, template: 3, settings: 4, generating: 5, results: 5 };
    return map[currentStep] || 1;
  };

  const getSteps = () => {
    if (isFlatLay) {
      return [
        { name: sourceType === 'scratch' ? 'Source' : 'Product(s)' },
        { name: 'Brand' },
        { name: 'Surfaces' },
        { name: 'Details' },
        { name: 'Results' },
      ];
    }
    if (isMirrorSelfie) {
      return [
        { name: sourceType === 'scratch' ? 'Source' : 'Product' },
        { name: 'Scenes' },
        { name: 'Model' },
        { name: 'Settings' },
        { name: 'Results' },
      ];
    }
    if (isSelfieUgc) {
      return [
        { name: sourceType === 'scratch' ? 'Source' : 'Product' },
        { name: 'Brand' }, { name: 'Model' }, { name: 'Settings' }, { name: 'Results' },
      ];
    }
    if (generationMode === 'virtual-try-on') {
      return [
        { name: sourceType === 'scratch' ? 'Source' : 'Product' },
        { name: 'Brand' },
        { name: 'Model' }, { name: 'Scene' }, { name: 'Settings' }, { name: 'Results' },
      ];
    }
    if (isInteriorDesign) {
      return [{ name: 'Type' }, { name: 'Upload Photo' }, { name: 'Style' }, { name: 'Results' }];
    }
    if (hasWorkflowConfig && uiConfig?.skip_template) {
      if (uiConfig?.show_model_picker) {
        return [{ name: sourceType === 'scratch' ? 'Source' : 'Product' }, { name: 'Brand' }, { name: 'Model' }, { name: 'Settings' }, { name: 'Results' }];
      }
      return [{ name: sourceType === 'scratch' ? 'Source' : 'Product' }, { name: 'Brand' }, { name: 'Settings' }, { name: 'Results' }];
    }
    return [{ name: sourceType === 'scratch' ? 'Source' : 'Product' }, { name: 'Brand' }, { name: 'Template' }, { name: 'Settings' }, { name: 'Results' }];
  };

  const angleMultiplier = productAngle === 'all' ? 3 : productAngle === 'front' ? 1 : 2;
  const workflowImageCount = hasWorkflowConfig ? selectedVariationIndices.size * angleMultiplier : parseInt(imageCount);
  const extraProductCount = isFlatLay && selectedFlatLayProductIds.size > 1 ? selectedFlatLayProductIds.size - 1 : 0;
  const extraProductCredits = extraProductCount * 2 * workflowImageCount;
  const multiProductCount = isMultiProductMode ? productQueue.length : 1;
  const singleProductCreditCost = generationMode === 'virtual-try-on' ? parseInt(imageCount) * (quality === 'high' ? 16 : 8) : (hasWorkflowConfig ? workflowImageCount * (quality === 'high' ? 16 : 8) + extraProductCredits : parseInt(imageCount) * (quality === 'high' ? 16 : 8));
  const creditCost = singleProductCreditCost * multiProductCount;

  const pageTitle = activeWorkflow ? `Create: ${activeWorkflow.name}` : 'Generate Images';

  return (
    <PageHeader title={pageTitle} backAction={{ content: activeWorkflow ? 'Workflows' : 'Dashboard', onAction: () => navigate(activeWorkflow ? '/app/workflows' : '/app') }}>
      <div className="space-y-6 overflow-x-hidden">
        <LowCreditsBanner />

        {/* Workflow Info Banner */}
        {activeWorkflow && (
          <Alert className="hidden sm:block">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{activeWorkflow.name}</p>
                  <p className="text-xs text-muted-foreground">{activeWorkflow.description}</p>
                </div>
                <Badge variant="secondary">{activeWorkflow.uses_tryon ? 'Try-On' : 'Workflow'}</Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-hidden">
              {getSteps().map((step, index) => (
                <div key={step.name} className="flex items-center gap-1 sm:gap-2 min-w-0">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                    getStepNumber() > index + 1 ? 'bg-primary text-primary-foreground'
                    : getStepNumber() === index + 1 ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                    {getStepNumber() > index + 1 ? '✓' : index + 1}
                  </div>
                  <span className={`text-xs hidden md:inline truncate ${getStepNumber() === index + 1 ? 'font-semibold' : 'text-muted-foreground'}`}>
                    {step.name}
                  </span>
                  {index < getSteps().length - 1 && (
                    <div className={`w-3 sm:w-6 md:w-10 h-0.5 flex-shrink ${getStepNumber() > index + 1 ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Source Selection — Interior Design: Type Toggle */}
        {currentStep === 'source' && isInteriorDesign && (
          <Card><CardContent className="p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold">Choose Staging Type</h2>
              <p className="text-sm text-muted-foreground">Are you staging an interior room or an exterior/facade?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'interior' as const, label: 'Interior', desc: 'Rooms & indoor spaces' },
                { id: 'exterior' as const, label: 'Exterior', desc: 'Building facades & outdoor' },
              ]).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setInteriorType(opt.id)}
                  className={cn(
                    'p-4 sm:p-6 rounded-xl border-2 text-left transition-all cursor-pointer',
                    interiorType === opt.id
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/40'
                  )}
                >
                  <p className="text-base sm:text-lg font-semibold">{opt.label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{opt.desc}</p>
                  {interiorType === opt.id && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep('upload')}>Continue</Button>
            </div>
          </CardContent></Card>
        )}

        {/* Source Selection — Non-Interior */}
        {currentStep === 'source' && !isInteriorDesign && (
          <Card><CardContent className="p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold">
                {activeWorkflow?.uses_tryon ? 'Add Your Product' : 'How do you want to start?'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeWorkflow?.uses_tryon
                  ? 'Choose a clothing item from your products or upload a new photo to try on.'
                  : 'Choose whether to use existing products or upload your own image file.'}
              </p>
            </div>
            {activeWorkflow?.uses_tryon ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => { setSourceType('product'); setSelectedProduct(null); setScratchUpload(null); }}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
                    sourceType === 'product'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <div className="space-y-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                      sourceType === 'product' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Shirt className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base sm:text-lg font-semibold">From My Products</p>
                      <p className="text-sm text-muted-foreground">Select a clothing item you've already added to your product library</p>
                    </div>
                    {sourceType === 'product' && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setSourceType('scratch'); setSelectedProduct(null); setScratchUpload(null); }}
                  className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
                    sourceType === 'scratch'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <div className="space-y-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                      sourceType === 'scratch' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <UploadIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base sm:text-lg font-semibold">Upload New Photo</p>
                      <p className="text-sm text-muted-foreground">Upload a clothing photo — model shots, mannequin, or hanger photos work best</p>
                    </div>
                    {sourceType === 'scratch' && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ) : (
              <SourceTypeSelector sourceType={sourceType} onChange={type => { setSourceType(type); setSelectedProduct(null); setScratchUpload(null); }} />
            )}
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(sourceType === 'product' ? 'product' : 'upload')}>Continue</Button>
            </div>
          </CardContent></Card>
        )}

        {/* Upload Step for Interior Design — show room details below upload */}

        {/* Upload Step */}
        {currentStep === 'upload' && (
          <Card><CardContent className="p-5 space-y-5">
            <div className={cn(
              activeWorkflow?.uses_tryon && !scratchUpload
                ? 'grid grid-cols-1 lg:grid-cols-[1fr,220px] gap-4'
                : ''
            )}>
              {/* Left column: Upload area */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold">
                    {isInteriorDesign ? 'Upload Your Photo' : activeWorkflow?.uses_tryon ? 'Upload Your Clothing Photo' : 'Upload Your Image'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isInteriorDesign
                      ? 'Upload a photo of the room or building you want to transform. Empty rooms or plain exteriors work best.'
                      : activeWorkflow?.uses_tryon
                      ? 'Upload a clear photo of the clothing item you want to try on.'
                      : 'Upload a product image from your computer.'}
                  </p>
                </div>

                {/* Contextual upload tips for interior/exterior */}
                {isInteriorDesign && !scratchUpload && (
                  <Alert className="border-primary/20 bg-primary/5">
                    <Info className="w-4 h-4 text-primary" />
                    <AlertDescription className="text-xs space-y-1">
                      {interiorType === 'interior' ? (
                        <ul className="list-disc list-inside text-muted-foreground">
                          <li>Shoot from a corner to capture two walls for best depth</li>
                          <li>Use well-lit, daytime photos — avoid heavy shadows</li>
                          <li>Avoid extreme wide-angle or fisheye lens distortion</li>
                        </ul>
                      ) : (
                        <ul className="list-disc list-inside text-muted-foreground">
                          <li>Shoot straight-on or at a 30° angle for best results</li>
                          <li>Include the full facade — avoid cutting off edges</li>
                          <li>Daytime photos with even lighting work best</li>
                        </ul>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Recent uploads gallery for interior/exterior staging */}
                {isInteriorDesign && previousUploads.length > 0 && !scratchUpload && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Your Recent Uploads</Label>
                    <p className="text-xs text-muted-foreground">Click to reuse a previously uploaded photo</p>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                      {previousUploads.map((upload) => (
                        <button
                          key={upload.name}
                          type="button"
                          onClick={() => {
                            setScratchUpload({
                              file: new File([], upload.name),
                              previewUrl: upload.url,
                              uploadedUrl: upload.url,
                              productInfo: { title: isInteriorDesign ? 'Uploaded Room' : upload.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/^\d+-\w+\s*/, ''), productType: isInteriorDesign ? 'Room' : '', description: '' },
                            });
                          }}
                          className="aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors bg-muted"
                        >
                          <img src={upload.url} alt="Previous upload" className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                    <Separator />
                  </div>
                )}

                <UploadSourceCard scratchUpload={scratchUpload} onUpload={setScratchUpload} onRemove={() => setScratchUpload(null)}
                  onUpdateProductInfo={info => { setScratchUpload(prev => prev ? { ...prev, productInfo: info } : prev); }}
                  isUploading={isUploading}
                  variant={isInteriorDesign ? 'room' : 'product'}
                />

                {/* Interior / Exterior Staging: Room Details right below the upload */}
                {isInteriorDesign && scratchUpload && (
                  <Card><CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-semibold flex items-center gap-2">
                        Room Details
                      </h3>
                      <p className="text-sm text-muted-foreground">Specify the space type and optional preferences</p>
                    </div>
                    <div className="space-y-4">
                      {/* Staging Purpose */}
                      <div className="space-y-2">
                        <Label>Staging Purpose <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'real-estate', label: 'Real Estate Listing' },
                            { id: 'design-portfolio', label: 'Design Portfolio' },
                            { id: 'airbnb', label: 'Airbnb / Rental' },
                            { id: 'personal', label: 'Personal Inspiration' },
                          ].map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setInteriorPurpose(interiorPurpose === p.id ? '' : p.id)}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                                interiorPurpose === p.id
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-card border-border hover:border-primary hover:bg-primary/5'
                              )}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Room / Space Type */}
                      <div className="space-y-2">
                        <Label>{interiorType === 'interior' ? 'Room Type' : 'Exterior Area'} <span className="text-destructive">*</span></Label>
                        <Select value={interiorRoomType} onValueChange={setInteriorRoomType}>
                          <SelectTrigger><SelectValue placeholder="Select room type..." /></SelectTrigger>
                          <SelectContent>
                            {(interiorType === 'interior' ? INTERIOR_ROOM_TYPES : EXTERIOR_ROOM_TYPES).map(rt => (
                              <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Empty Room Toggle */}
                      {interiorType === 'interior' && (
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                          <div>
                            <Label className="text-sm font-medium">Empty Room</Label>
                            <p className="text-xs text-muted-foreground">Room has no furniture — stage from scratch</p>
                          </div>
                          <Switch checked={interiorIsEmptyRoom} onCheckedChange={setInteriorIsEmptyRoom} />
                        </div>
                      )}

                      {/* Furniture Handling (interior only) */}
                      {interiorType === 'interior' && (
                      <div className="space-y-2">
                        <Label>Furniture <span className="text-xs text-muted-foreground">(how to handle existing pieces)</span></Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'Keep & Restyle', label: 'Keep & Restyle', desc: 'Keep pieces, update style' },
                            { value: 'Replace All', label: 'Replace All', desc: 'Fully restage the room' },
                            { value: 'Keep Layout, Swap Style', label: 'Keep Layout', desc: 'Same layout, new pieces' },
                          ].map(opt => {
                            const isDisabledByEmpty = interiorIsEmptyRoom && opt.value !== 'Replace All';
                            return (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={isDisabledByEmpty}
                              onClick={() => {
                                setInteriorFurnitureHandling(opt.value);
                                if (opt.value === 'Keep & Restyle') setInteriorFurnitureStyle('Match Design Style');
                              }}
                              className={cn(
                                'rounded-lg border-2 p-3 text-left transition-colors',
                                isDisabledByEmpty && 'opacity-40 cursor-not-allowed',
                                interiorFurnitureHandling === opt.value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/40'
                              )}
                            >
                              <span className="text-sm font-medium block">{opt.label}</span>
                              <span className="text-xs text-muted-foreground">{opt.desc}</span>
                            </button>
                            );
                          })}
                        </div>
                      </div>
                      )}

                      {/* Room Size + Ceiling Height */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{interiorType === 'interior' ? 'Room Size' : 'Area Size'} <span className="text-xs text-muted-foreground">({interiorType === 'interior' ? 'helps scale furniture' : 'helps scale elements'})</span></Label>
                          <Select value={interiorRoomSize} onValueChange={setInteriorRoomSize}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Small">Small (under 10 sqm / 100 sqft)</SelectItem>
                              <SelectItem value="Medium">Medium (10–20 sqm / 100–200 sqft)</SelectItem>
                              <SelectItem value="Large">Large (20–40 sqm / 200–400 sqft)</SelectItem>
                              <SelectItem value="Very Large">Very Large (40+ sqm / 400+ sqft)</SelectItem>
                            </SelectContent>
                          </Select>
                          {/* Exact Room Dimensions */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Exact Dimensions <span className="text-xs">(optional)</span></Label>
                            <input
                              type="text"
                              placeholder="e.g. 4.5m x 3.2m or 15ft x 10ft"
                              value={interiorRoomDimensions}
                              onChange={e => setInteriorRoomDimensions(e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                          </div>
                        </div>
                        {interiorType === 'interior' && (
                        <div className="space-y-2">
                          <Label>Ceiling Height <span className="text-xs text-muted-foreground">(optional)</span></Label>
                          <Select value={interiorCeilingHeight} onValueChange={setInteriorCeilingHeight}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low (under 2.4m / 8ft)</SelectItem>
                              <SelectItem value="Standard">Standard (2.4–2.7m / 8–9ft)</SelectItem>
                              <SelectItem value="High">High (2.7m+ / 9ft+)</SelectItem>
                              <SelectItem value="Double Height">Double Height (5m+ / 16ft+)</SelectItem>
                            </SelectContent>
                          </Select>
                          {/* Exact Ceiling Height */}
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Exact Height <span className="text-xs">(optional)</span></Label>
                            <input
                              type="text"
                              placeholder="e.g. 2.8m or 9.5ft"
                              value={interiorExactCeilingHeight}
                              onChange={e => setInteriorExactCeilingHeight(e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                          </div>
                        </div>
                        )}
                      </div>

                      {/* Wall Color & Flooring (interior only) */}
                      {interiorType === 'interior' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Wall Color <span className="text-xs text-muted-foreground">(optional)</span></Label>
                            <Select value={interiorWallColor} onValueChange={setInteriorWallColor}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['Keep Original', 'White', 'Warm White', 'Light Gray', 'Beige / Cream', 'Sage Green', 'Navy Blue', 'Terracotta', 'Blush Pink', 'Charcoal', 'Olive Green'].map(c => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Flooring <span className="text-xs text-muted-foreground">(optional)</span></Label>
                            <Select value={interiorFlooring} onValueChange={setInteriorFlooring}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['Keep Original', 'Hardwood Light', 'Hardwood Dark', 'Marble White', 'Marble Dark', 'Ceramic Tiles', 'Carpet', 'Polished Concrete', 'Herringbone Parquet'].map(f => (
                                  <SelectItem key={f} value={f}>{f}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {/* Furniture Style & Lighting Mood */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{interiorType === 'interior' ? 'Furniture Style' : 'Outdoor Style'} <span className="text-xs text-muted-foreground">(optional)</span></Label>
                          <Select value={interiorFurnitureStyle} onValueChange={setInteriorFurnitureStyle} disabled={interiorType === 'interior' && interiorFurnitureHandling === 'Keep & Restyle'}>
                            <SelectTrigger className={interiorType === 'interior' && interiorFurnitureHandling === 'Keep & Restyle' ? 'opacity-50' : ''}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(interiorType === 'interior'
                                ? ['Match Design Style', 'Modern Minimalist', 'Mid-Century Modern', 'Scandinavian', 'Industrial', 'Traditional / Classic', 'Bohemian / Eclectic', 'Art Deco', 'Japandi', 'Coastal / Hampton']
                                : ['Match Design Style', 'Modern', 'Tropical', 'Mediterranean', 'Rustic', 'Contemporary', 'Coastal', 'Desert / Arid', 'Japanese Garden', 'English Garden']
                              ).map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Lighting Mood <span className="text-xs text-muted-foreground">(optional)</span></Label>
                          <Select value={interiorLightingMood} onValueChange={setInteriorLightingMood}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(interiorType === 'interior'
                                ? ['Keep Original', 'Warm & Cozy', 'Bright & Airy', 'Dramatic / Moody', 'Natural Daylight', 'Soft Evening / Golden Hour']
                                : ['Keep Original', 'Golden Hour Glow', 'Bright Daylight', 'Dramatic Twilight', 'Soft Overcast', 'Night / Uplighting']
                              ).map(l => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Key Furniture & Features (optional) */}
                      {interiorRoomType && ROOM_FURNITURE_PRESETS[interiorRoomType] && (
                        <div className="space-y-2">
                          <Label>Key Furniture & Features <span className="text-xs text-muted-foreground">(optional — helps the AI pick the right pieces)</span></Label>
                          <div className="flex flex-wrap gap-2">
                            {ROOM_FURNITURE_PRESETS[interiorRoomType].map(piece => {
                              const isSelected = interiorKeyPieces.includes(piece);
                              return (
                                <button
                                  key={piece}
                                  type="button"
                                  onClick={() => {
                                    setInteriorKeyPieces(prev =>
                                      isSelected ? prev.filter(p => p !== piece) : [...prev, piece]
                                    );
                                  }}
                                  className={cn(
                                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                                    isSelected
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-card border-border hover:border-primary hover:bg-primary/5'
                                  )}
                                >
                                  {piece}
                                </button>
                              );
                            })}
                          </div>
                          {interiorKeyPieces.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Selected: {interiorKeyPieces.join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Color Palette */}
                      <div className="space-y-2">
                        <Label>Color Palette <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <div className="flex flex-wrap gap-2">
                          {['Neutral / Earth Tones', 'Cool & Calming', 'Warm & Inviting', 'Monochrome', 'Bold & Vibrant', 'Pastel Soft'].map(palette => (
                            <button
                              key={palette}
                              type="button"
                              onClick={() => setInteriorColorPalette(interiorColorPalette === palette ? '' : palette)}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                                interiorColorPalette === palette
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-card border-border hover:border-primary hover:bg-primary/5'
                              )}
                            >
                              {palette}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Time of Day / Natural Light */}
                      <div className="space-y-2">
                        <Label>Natural Light / Time of Day <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <Select value={interiorTimeOfDay} onValueChange={setInteriorTimeOfDay}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['As Photographed', 'Morning Light', 'Midday Bright', 'Golden Hour', 'Blue Hour / Twilight', 'Overcast Soft'].map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Design Notes */}
                      <div className="space-y-2">
                        <Label>Design Notes <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <Textarea
                          placeholder="e.g. client prefers warm Japandi feel, no curtains, maximize natural light, shutters only..."
                          value={interiorDesignNotes}
                          onChange={e => setInteriorDesignNotes(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <p className="text-xs text-muted-foreground">Add specific instructions for the AI designer</p>
                      </div>
                    </div>
                  </CardContent></Card>
                )}
              </div>

              {/* Right column: Compact guide (try-on only, before upload) */}
              {activeWorkflow?.uses_tryon && !scratchUpload && (
                <div className="order-first lg:order-last">
                  <TryOnUploadGuide />
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('source')}>Back</Button>
              <Button disabled={!scratchUpload || (!isInteriorDesign && (!scratchUpload.productInfo.title || !scratchUpload.productInfo.productType)) || (isInteriorDesign && !interiorRoomType)}
                onClick={async () => {
                  if (!scratchUpload) return;
                  // Skip upload if reusing a previously uploaded image
                  let finalUrl = scratchUpload.uploadedUrl;
                  if (!finalUrl) {
                    finalUrl = await uploadFile(scratchUpload.file) || undefined;
                  }
                  if (finalUrl) {
                    setScratchUpload({ ...scratchUpload, uploadedUrl: finalUrl });
                    if (activeWorkflow?.uses_tryon) {
                      setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : 'model');
                    } else if (isInteriorDesign) {
                      setCurrentStep('settings');
                    } else if (brandProfiles.length > 0) {
                      setCurrentStep('brand-profile');
                    } else if (uiConfig?.skip_template && hasWorkflowConfig) {
                      setCurrentStep('settings');
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
                <h2 className="text-base font-semibold">
                   {isFlatLay ? 'Select Products for Flat Lay'
                     : isMirrorSelfie ? 'Select Product(s) for Mirror Selfie'
                     : activeWorkflow?.uses_tryon ? 'Select a Clothing Item' : 'Select Product(s)'}
                 </h2>
                 <p className="text-sm text-muted-foreground">
                   {isFlatLay
                     ? 'Select 1–5 products to arrange together in your flat lay composition'
                     : isMirrorSelfie
                     ? 'Choose the product(s) your model will wear or hold in the mirror selfie'
                     : activeWorkflow?.uses_tryon
                     ? 'Choose the clothing item you want to try on a model.'
                     : 'Choose one or multiple products. 2+ products will use bulk generation.'}
                 </p>
              </div>
              <Button variant="link" onClick={() => setCurrentStep('source')}>Change source</Button>
            </div>

            {/* Show real DB products for all workflows */}
            {isLoadingUserProducts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : userProducts.length === 0 ? (
              activeWorkflow?.uses_tryon ? (
                <div className="text-center py-10 space-y-3">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No products in your library yet.</p>
                  <p className="text-xs text-muted-foreground">Add clothing items to your product library, or upload a photo directly.</p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setShowAddProduct(true)}>Add Products</Button>
                    <Button variant="secondary" size="sm" onClick={() => { setSourceType('scratch'); setCurrentStep('upload'); }}>
                      Upload Instead
                    </Button>
                  </div>
                </div>
              ) : (
                <ProductMultiSelect products={mockProducts} selectedIds={selectedProductIds} onSelectionChange={setSelectedProductIds} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              )
            ) : activeWorkflow?.uses_tryon ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {userProducts.map(up => {
                  const isSelected = selectedProductIds.has(up.id);
                  return (
                    <button
                      key={up.id}
                      type="button"
                      onClick={() => setSelectedProductIds(new Set([up.id]))}
                      className={`flex flex-col rounded-lg overflow-hidden border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent hover:border-border'
                      }`}
                    >
                      <img src={up.image_url} alt={up.title} className="w-full aspect-square object-cover rounded-t-md" />
                      <div className="px-1.5 py-1.5 bg-card">
                        <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-2">{up.title}</p>
                        {up.product_type && (
                          <p className="text-[9px] text-muted-foreground truncate mt-0.5">{up.product_type}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
                {/* Add New Product card */}
                <button
                  type="button"
                  onClick={() => setShowAddProduct(true)}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/50 transition-all aspect-square text-muted-foreground"
                >
                  <Package className="w-6 h-6 mb-1 opacity-50" />
                  <span className="text-[10px] font-medium">Add New</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <ProductMultiSelect
                  products={userProducts.map(up => mapUserProductToProduct(up))}
                  selectedIds={selectedProductIds}
                  onSelectionChange={setSelectedProductIds}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowAddProduct(true)}>
                  <Package className="w-3.5 h-3.5" />
                  Add New Product
                </Button>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('source')}>Back</Button>
              <Button disabled={selectedProductIds.size === 0} onClick={() => {
                if (activeWorkflow?.uses_tryon) {
                  const selectedUp = userProducts.find(p => selectedProductIds.has(p.id));
                  if (selectedUp) {
                    const product = mapUserProductToProduct(selectedUp);
                    setSelectedProduct(product);
                    setSelectedSourceImages(new Set([product.images[0].id]));
                    setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : 'model');
                  }
                } else {
                  const mappedProducts = userProducts.length > 0
                    ? userProducts.map(up => mapUserProductToProduct(up))
                    : mockProducts;
                  const selected = mappedProducts.filter(p => selectedProductIds.has(p.id));
                  
                  // Flat Lay: store all selected products and go to brand/surfaces
                  if (isFlatLay) {
                    setSelectedFlatLayProductIds(new Set(selected.map(p => p.id)));
                    setSelectedProduct(selected[0]);
                    if (selected[0].images.length > 0) setSelectedSourceImages(new Set([selected[0].images[0].id]));
                    if (brandProfiles.length > 0) {
                      setCurrentStep('brand-profile');
                    } else {
                      setFlatLayPhase('surfaces');
                      setCurrentStep('settings');
                    }
                    return;
                  }
                  
                  // Mirror Selfie: always go to scenes, even with multiple products
                  if (isMirrorSelfie) {
                    setSelectedProduct(selected[0]);
                    if (selected[0].images.length > 0) setSelectedSourceImages(new Set([selected[0].images[0].id]));
                    setMirrorSettingsPhase('scenes');
                    setCurrentStep('settings');
                    return;
                  }
                  
                  if (selected.length === 1) {
                    const product = selected[0];
                    setSelectedProduct(product);
                    if (product.images.length > 0) setSelectedSourceImages(new Set([product.images[0].id]));
                    const cat = detectProductCategory(product);
                    if (cat) setSelectedCategory(cat);
                    if (brandProfiles.length > 0) {
                       setCurrentStep('brand-profile');
                     } else if (uiConfig?.show_model_picker) {
                       setCurrentStep('model');
                     } else if (isClothingProduct(product)) {
                       setCurrentStep('mode');
                     } else if (uiConfig?.skip_template && hasWorkflowConfig) {
                       setCurrentStep('settings');
                     } else {
                       setCurrentStep('template');
                     }
                  } else {
                    // Multi-product: queue them and start with the first one
                    setProductQueue(selected);
                    setCurrentProductIndex(0);
                    setMultiProductResults(new Map());
                    const product = selected[0];
                    setSelectedProduct(product);
                    if (product.images.length > 0) setSelectedSourceImages(new Set([product.images[0].id]));
                    const cat = detectProductCategory(product);
                    if (cat) setSelectedCategory(cat);
                    if (brandProfiles.length > 0) {
                      setCurrentStep('brand-profile');
                    } else if (uiConfig?.show_model_picker) {
                      setCurrentStep('model');
                    } else if (isClothingProduct(product)) {
                      setCurrentStep('mode');
                    } else if (uiConfig?.skip_template && hasWorkflowConfig) {
                      setCurrentStep('settings');
                    } else {
                      setCurrentStep('template');
                    }
                  }
                }
              }}>
                {selectedProductIds.size === 0 ? 'Select at least 1' : activeWorkflow?.uses_tryon ? 'Continue' : isFlatLay ? `Continue with ${selectedProductIds.size} product${selectedProductIds.size > 1 ? 's' : ''}` : selectedProductIds.size === 1 ? 'Continue with 1 product' : `Continue with ${selectedProductIds.size} products`}
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
                <p className="text-sm">AI will digitally dress your selected model in your clothing. Uses 3 credits per image.</p>
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
            <TryOnPreview product={selectedProduct} scratchUpload={scratchUpload} model={selectedModel} pose={selectedPose} creditCost={creditCost} selectedGender={selectedModel?.gender} />
            <Card><CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold">Select a Model</h2>
                <p className="text-sm text-muted-foreground">
                  {activeWorkflow?.name === 'Mirror Selfie Set'
                    ? 'This model will appear taking a mirror selfie wearing your product'
                    : 'Choose the model who will wear your clothing'}
                </p>
              </div>
              <ModelFilterBar genderFilter={modelGenderFilter} bodyTypeFilter={modelBodyTypeFilter} ageFilter={modelAgeFilter}
                onGenderChange={setModelGenderFilter} onBodyTypeChange={setModelBodyTypeFilter} onAgeChange={setModelAgeFilter} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredModels.map(model => (
                  <ModelSelectorCard key={model.modelId} model={model} isSelected={selectedModel?.modelId === model.modelId} onSelect={() => handleSelectModel(model)} />
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  if (isMirrorSelfie) {
                    setMirrorSettingsPhase('scenes');
                    setCurrentStep('settings');
                  } else {
                    setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : 'product');
                  }
                }}>Back</Button>
                {isMirrorSelfie ? (
                  <Button disabled={!selectedModel} onClick={() => { setMirrorSettingsPhase('final'); setCurrentStep('settings'); }}>Continue to Settings</Button>
                ) : isSelfieUgc || (uiConfig?.show_model_picker && !activeWorkflow?.uses_tryon) ? (
                  <Button disabled={!selectedModel} onClick={() => setCurrentStep('settings')}>Continue to Settings</Button>
                ) : (
                  <Button disabled={!selectedModel} onClick={() => setCurrentStep('pose')}>Continue to Scene</Button>
                )}
              </div>
            </CardContent></Card>
          </div>
        )}

        {/* Pose Selection */}
        {currentStep === 'pose' && selectedModel && (
          <div className="space-y-4">
            <TryOnPreview product={selectedProduct} scratchUpload={scratchUpload} model={selectedModel} pose={selectedPose} creditCost={creditCost} selectedGender={selectedModel?.gender} />
            <Card><CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold">Select a Scene</h2>
                <p className="text-sm text-muted-foreground">Choose the scene and environment for your shoot</p>
              </div>
              {Object.entries(posesByCategory).map(([category, poses]) => (
                <PoseCategorySection key={category} category={category as PoseCategory} poses={poses} selectedPoseId={selectedPose?.poseId || null} onSelectPose={handleSelectPose} selectedGender={selectedModel?.gender} />
              ))}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('model')}>Back</Button>
                <Button disabled={!selectedPose} onClick={() => setCurrentStep('settings')}>Continue to Settings</Button>
              </div>
            </CardContent></Card>
          </div>
        )}

        {/* Template Selection */}
        {/* Template Selection — only for non-workflow or workflows without config */}
        {!hasWorkflowConfig && (currentStep === 'template' || (currentStep === 'settings' && generationMode === 'product-only')) && (selectedProduct || scratchUpload) && (
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
                      <Select value={imageCount} onValueChange={v => setImageCount(v as '1' | '2' | '3' | '4')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 image</SelectItem>
                          {!isFreeUser && <SelectItem value="2">2 images</SelectItem>}
                          {!isFreeUser && <SelectItem value="3">3 images</SelectItem>}
                          {!isFreeUser && <SelectItem value="4">4 images</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Quality</Label>
                      <Select value={quality} onValueChange={v => setQuality(v as ImageQuality)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard — Fast generation, good quality (8 credits/img)</SelectItem>
                          <SelectItem value="high">High (Pro Model) — Best quality, ~60-120s per image (16 credits/img)</SelectItem>
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
                    </div>
                  )}
                </CardContent></Card>

                <div className={cn("p-4 rounded-lg border flex items-center justify-between", balance >= creditCost ? "border-border bg-muted/30" : "border-destructive/30 bg-destructive/5")}>
                  <div>
                    <p className="text-sm font-semibold">Total: {creditCost} credits</p>
                    <p className="text-xs text-muted-foreground">{imageCount} images × {quality === 'high' ? 2 : 1} credit{quality === 'high' ? 's' : ''}</p>
                  </div>
                  {balance >= creditCost ? (
                    <p className="text-sm text-muted-foreground">{balance} credits available</p>
                  ) : (
                    <button onClick={openBuyModal} className="flex items-center gap-1 text-sm text-destructive font-semibold hover:underline">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {balance} credits — need {creditCost}. Top up
                    </button>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep('template')}>Back</Button>
                  <Button
                    onClick={balance >= creditCost ? handleGenerateClick : openBuyModal}
                    className={balance < creditCost ? 'bg-muted text-muted-foreground hover:bg-muted' : ''}
                  >
                    {balance >= creditCost ? `Generate ${imageCount} Images` : 'Buy Credits'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Workflow-Specific Settings */}
        {hasWorkflowConfig && currentStep === 'settings' && (generationMode !== 'virtual-try-on' || isSelfieUgc) && (selectedProduct || scratchUpload) && (
          <div className="space-y-4">
            {/* Product summary — hidden in mirror selfie final phase */}
            {!(isMirrorSelfie && mirrorSettingsPhase === 'final') && !(isFlatLay && flatLayPhase === 'details') && (
            <Card><CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {sourceType === 'scratch' ? 'Uploaded Image' : isFlatLay && selectedFlatLayProductIds.size > 1 ? `Selected Products (${selectedFlatLayProductIds.size})` : isMultiProductMode ? `Selected Products (${productQueue.length})` : 'Selected Product'}
                </span>
                <Button variant="link" size="sm" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'source')}>Change</Button>
              </div>
              {isFlatLay && selectedFlatLayProductIds.size > 1 ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {userProducts.filter(up => selectedFlatLayProductIds.has(up.id)).map(up => (
                    <div key={up.id} className="flex-shrink-0 w-[72px]">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-border mx-auto">
                        <img src={up.image_url || '/placeholder.svg'} alt={up.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center mt-1 truncate">{up.title}</p>
                    </div>
                  ))}
                </div>
              ) : isMultiProductMode ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {productQueue.map(p => (
                    <div key={p.id} className="flex-shrink-0 w-[72px]">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-border mx-auto">
                        <img src={p.images[0]?.url || '/placeholder.svg'} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center mt-1 truncate">{p.title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={sourceType === 'scratch' ? scratchUpload?.previewUrl : selectedProduct?.images[0]?.url || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold">{sourceType === 'scratch' ? scratchUpload?.productInfo.title : selectedProduct?.title}</p>
                    <p className="text-sm text-muted-foreground">{sourceType === 'scratch' ? scratchUpload?.productInfo.productType : `${selectedProduct?.vendor} • ${selectedProduct?.productType}`}</p>
                  </div>
                </div>
              )}
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
            )}

            {/* Variation Strategy Preview — hidden in mirror selfie final phase */}
            {!(isMirrorSelfie && mirrorSettingsPhase === 'final') && !(isFlatLay && flatLayPhase === 'details') && (
            <Card><CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                     <h3 className="text-base font-semibold">
                      {isFlatLay ? 'Select Your Surfaces' : isInteriorDesign ? 'Select Design Style' : variationStrategy?.type === 'scene' ? 'Select Your Scenes' : 'What You\'ll Get'}
                    </h3>
                    {isFlatLay && (
                      <>
                        <Badge variant="secondary" className="text-[10px]"><Layers className="w-3 h-3 mr-1" />Flat Lay</Badge>
                        <Badge variant="outline" className="text-[10px]">{variationStrategy?.variations.length} Surfaces</Badge>
                      </>
                    )}
                    {isInteriorDesign && (
                      <>
                        <Badge variant="secondary" className="text-[10px]">{interiorType === 'interior' ? 'Interior' : 'Exterior'}</Badge>
                        <Badge variant="outline" className="text-[10px]">{variationStrategy?.variations.length} Styles</Badge>
                      </>
                    )}
                    {variationStrategy?.type === 'scene' && !isFlatLay && !isInteriorDesign && activeWorkflow?.name !== 'Mirror Selfie Set' && (
                      <>
                        <Badge variant="secondary" className="text-[10px]"><Ban className="w-3 h-3 mr-1" />No People</Badge>
                        <Badge variant="outline" className="text-[10px]">{variationStrategy.variations.length} Scenes</Badge>
                      </>
                    )}
                    {variationStrategy?.type === 'scene' && activeWorkflow?.name === 'Mirror Selfie Set' && (
                      <>
                        <Badge variant="secondary" className="text-[10px]"><Smartphone className="w-3 h-3 mr-1" />Mirror Selfie</Badge>
                        <Badge variant="outline" className="text-[10px]">{variationStrategy.variations.length} Environments</Badge>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isFlatLay ? 'Choose surfaces for your flat lay — select at least 1' :
                     isInteriorDesign ? 'Choose 1 design style to generate for your room' :
                     variationStrategy?.type === 'scene' ? 'Choose scenes for your product — select at least 1' :
                     variationStrategy?.type === 'seasonal' ? 'Each image captures a different season' :
                     variationStrategy?.type === 'multi-ratio' ? 'Images optimized for different platforms' :
                     variationStrategy?.type === 'layout' ? 'Different layout compositions' :
                     variationStrategy?.type === 'paired' ? 'Before and after comparison' :
                     variationStrategy?.type === 'angle' ? 'Multiple angles and perspectives' :
                     variationStrategy?.type === 'mood' ? 'Different mood and energy styles' :
                     variationStrategy?.type === 'surface' ? 'Different surface and styling options' :
                     'Workflow-specific variations'}
                  </p>
                  {variationStrategy?.type === 'scene' && (
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Products shown are reference examples only. Our VOVV Studio AI team will generate each scene with your selected product.
                    </p>
                  )}
                </div>
                {!isInteriorDesign && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const maxSelect = isFreeUser ? FREE_SCENE_LIMIT : PAID_SCENE_LIMIT;
                    const currentMax = Math.min(maxSelect, variationStrategy?.variations.length || 0);
                    if (selectedVariationIndices.size === currentMax) {
                      setSelectedVariationIndices(new Set());
                    } else {
                      setSelectedVariationIndices(new Set(variationStrategy?.variations.slice(0, currentMax).map((_, i) => i)));
                    }
                  }}
                >
                  {selectedVariationIndices.size > 0 ? 'Deselect All' : isFreeUser ? `Select ${FREE_SCENE_LIMIT}` : `Select ${PAID_SCENE_LIMIT}`}
                </Button>
                )}
              </div>

              {/* Scene category filter tabs */}
              {variationStrategy?.type === 'scene' && (() => {
                // Build category list from scope-filtered variations
                const scopeFilteredVars = isInteriorDesign
                  ? variationStrategy.variations.filter((v: any) => !v.scope || v.scope === interiorType)
                  : variationStrategy.variations;
                const cats = Array.from(new Set(scopeFilteredVars.map(v => v.category).filter(Boolean))) as string[];
                if (cats.length <= 1) return null;
                return (
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSceneFilterCategory('all')}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                        sceneFilterCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >All</button>
                    {cats.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSceneFilterCategory(cat)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                          sceneFilterCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                      >{cat}</button>
                    ))}
                  </div>
                );
              })()}

              {/* Mirror Selfie Tips */}
              {activeWorkflow?.name === 'Mirror Selfie Set' && (
                <Alert className="border-primary/20 bg-primary/5">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <AlertDescription className="space-y-1.5">
                    <p className="font-semibold text-sm">Mirror Selfie Composition</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Your model will appear holding a smartphone, capturing their reflection in a mirror</li>
                      <li>Each environment places your product in a different real-world mirror setting</li>
                      <li>Choose any aspect ratio in the next step — 4:5 portrait recommended for Instagram</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Visual scene cards grid */}
              <div className={cn("grid gap-3", (isMirrorSelfie || isSelfieUgc) ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}>
                {variationStrategy?.variations
                  .map((v, i) => ({ v, i }))
                  .filter(({ v }) => {
                    // Filter by interior/exterior scope for staging workflow
                    if (isInteriorDesign && (v as any).scope) {
                      if ((v as any).scope !== interiorType) return false;
                    }
                    // Filter by category chip
                    if (sceneFilterCategory !== 'all' && v.category && v.category !== sceneFilterCategory) return false;
                    return true;
                  })
                  .map(({ v, i }) => {
                  const isSelected = selectedVariationIndices.has(i);
                  const hasPreview = !!v.preview_url;

                  const cardContent = (
                    <div
                      onClick={() => {
                        setSelectedVariationIndices(prev => {
                          // Interior design: single-select only
                          if (isInteriorDesign) {
                            return prev.has(i) ? new Set() : new Set([i]);
                          }
                          const next = new Set(prev);
                          if (next.has(i)) { next.delete(i); }
                          else {
                            // Free user cap
                            if (isFreeUser && next.size >= FREE_SCENE_LIMIT) {
                              toast.error(`Free plan allows 1 scene per generation. Upgrade to unlock more.`);
                              return prev;
                            }
                            // Paid user cap
                            if (!isFreeUser && next.size >= PAID_SCENE_LIMIT) {
                              toast.error(`Maximum ${PAID_SCENE_LIMIT} scenes per generation.`);
                              return prev;
                            }
                            next.add(i);
                          }
                          return next;
                        });
                      }}
                      className={cn(
                        "relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group border-2",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                          : "border-border hover:border-primary/40 hover:scale-[1.02]"
                      )}
                    >
                      {/* Image or gradient fallback */}
                      <div className={cn("relative", (isMirrorSelfie || isSelfieUgc) ? "aspect-[9/16]" : "aspect-square")}>
                        {hasPreview ? (
                          <img
                            src={getOptimizedUrl(v.preview_url, { quality: 60 })}
                            alt={v.label}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : v.label === 'AI Creative Pick' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-500 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_100%] animate-shimmer" />
                            <Sparkles className="w-8 h-8 text-white drop-shadow-lg relative z-10" />
                            <span className="text-[10px] font-bold text-white/90 mt-1.5 relative z-10 tracking-wide">AI PICKS</span>
                          </div>
                        ) : (
                          <div className={cn(
                            "w-full h-full flex items-center justify-center",
                            i % 8 === 0 ? "bg-gradient-to-br from-gray-100 to-white" :
                            i % 8 === 1 ? "bg-gradient-to-br from-gray-200 to-gray-100" :
                            i % 8 === 2 ? "bg-gradient-to-br from-amber-100 to-orange-50" :
                            i % 8 === 3 ? "bg-gradient-to-br from-pink-50 to-purple-50" :
                            i % 8 === 4 ? "bg-gradient-to-br from-green-100 to-emerald-50" :
                            i % 8 === 5 ? "bg-gradient-to-br from-blue-100 to-sky-50" :
                            i % 8 === 6 ? "bg-gradient-to-br from-yellow-100 to-amber-50" :
                            "bg-gradient-to-br from-gray-700 to-gray-900"
                          )}>
                            <Package className={cn("w-8 h-8", i % 8 === 7 ? "text-gray-400" : "text-muted-foreground/40")} />
                          </div>
                        )}

                        {/* Dark overlay for label readability */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 pt-6">
                          <p className="text-[11px] font-semibold text-white leading-tight">{v.label}</p>
                          {v.category && (
                            <span className="text-[9px] text-white/60 font-medium">{v.category}</span>
                          )}
                        </div>

                        {/* Selection checkmark */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  );

                  return <div key={i}>{cardContent}</div>;
                })}
              </div>

              {/* Info note about showcase products */}
              <div className="flex items-start gap-2 px-1">
                <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {isInteriorDesign
                    ? 'Each style will generate a uniquely staged version of your room while preserving its architecture.'
                    : 'Products shown are for demonstration only — your product will be placed in each selected scene.'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {isInteriorDesign ? (
                    selectedVariationIndices.size === 0 ? (
                      <p className="text-xs text-muted-foreground">Tap a style to select it</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        1 style selected
                      </p>
                    )
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {selectedVariationIndices.size === 0 ? (
                        <span className="text-destructive font-medium">Select at least 1 scene to continue</span>
                      ) : (
                        <>{selectedVariationIndices.size} of {isFreeUser ? FREE_SCENE_LIMIT : PAID_SCENE_LIMIT} scenes selected
                          {workflowImageCount > MAX_IMAGES_PER_JOB && (
                            <span className="ml-1 text-muted-foreground">· Will split into {Math.ceil(selectedVariationIndices.size / Math.max(1, Math.floor(MAX_IMAGES_PER_JOB / angleMultiplier)))} batches</span>
                          )}
                        </>
                      )}
                    </p>
                  )}
                  {!isInteriorDesign && isFreeUser && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
                      <Lock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Free plan: 1 scene per generation.{' '}
                        <button onClick={openBuyModal} className="text-primary font-semibold hover:underline">Upgrade</button>
                        {' '}to unlock up to 3.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent></Card>
            )}

            {/* Mirror Selfie scenes phase: Continue to Model */}
            {isMirrorSelfie && mirrorSettingsPhase === 'scenes' && (
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'product')}>Back</Button>
                <Button disabled={selectedVariationIndices.size === 0} onClick={() => setCurrentStep('model')}>
                  Continue to Model
                </Button>
              </div>
            )}

            {/* Flat Lay surfaces phase: Continue to Details */}
            {isFlatLay && flatLayPhase === 'surfaces' && (
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : 'product')}>Back</Button>
                <Button disabled={selectedVariationIndices.size === 0} onClick={() => setFlatLayPhase('details')}>
                  Continue to Details
                </Button>
              </div>
            )}

            {/* Flat Lay details phase: Aesthetics + Styling Notes + Quality */}
            {isFlatLay && flatLayPhase === 'details' && (
              <>
                {/* Composition Style Toggle */}
                <Card><CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      Composition Style
                    </h3>
                    <p className="text-sm text-muted-foreground">Choose what appears alongside your products</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {([
                      { key: 'clean' as const, label: 'Products Only', desc: 'Clean layout with just your products, no extra items' },
                      { key: 'decorated' as const, label: 'Add Styling Props', desc: 'Include decorative elements (leaves, fabric, abstract shapes) around your products' },
                    ]).map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setFlatLayPropStyle(opt.key);
                          if (opt.key === 'clean') { setSelectedAesthetics([]); setStylingNotes(''); }
                        }}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all',
                          flatLayPropStyle === opt.key
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border hover:border-primary/40'
                        )}
                      >
                        <p className="text-sm font-semibold">{opt.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </CardContent></Card>

                {/* Aesthetic quick-chips — only when decorated */}
                {flatLayPropStyle === 'decorated' && (
                <Card><CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-semibold">Styling & Aesthetics</h3>
                    <p className="text-sm text-muted-foreground">Add decorative props and mood to your flat lay</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Quick Aesthetics</Label>
                    <div className="flex flex-wrap gap-2">
                      {FLAT_LAY_AESTHETICS.map(a => {
                        const isActive = selectedAesthetics.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            onClick={() => setSelectedAesthetics(prev =>
                              isActive ? prev.filter(x => x !== a.id) : [...prev, a.id]
                            )}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                              isActive
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-muted text-muted-foreground hover:border-primary/40'
                            )}
                            title={a.hint}
                          >
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                    {selectedAesthetics.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Props: {selectedAesthetics.map(id => FLAT_LAY_AESTHETICS.find(a => a.id === id)?.hint).filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Styling Notes (optional)</Label>
                    <Textarea
                      placeholder="e.g. eucalyptus leaves, silk ribbon, warm tones..."
                      value={stylingNotes}
                      onChange={e => setStylingNotes(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <p className="text-xs text-muted-foreground">Describe any specific decorative props, colors, or mood (no commercial products)</p>
                  </div>
                </CardContent></Card>
                )}

                <Card><CardContent className="p-5 space-y-4">
                  <h3 className="text-base font-semibold">Generation Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quality</Label>
                      <Select value={quality} onValueChange={v => setQuality(v as ImageQuality)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (8 credits/img)</SelectItem>
                          <SelectItem value="high">High (16 credits/img)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Aspect Ratio</Label>
                      <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                    </div>
                  </div>
                </CardContent></Card>

                {/* Cost summary */}
                <div className={cn("p-4 rounded-lg border flex items-center justify-between", balance >= creditCost ? "border-border bg-muted/30" : "border-destructive/30 bg-destructive/5")}>
                  <div>
                    <p className="text-sm font-semibold">Total: {creditCost} credits</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedVariationIndices.size} surface{selectedVariationIndices.size !== 1 ? 's' : ''}
                      {' '}× {quality === 'high' ? 16 : 8} credits
                      {selectedFlatLayProductIds.size > 1 && ` · ${selectedFlatLayProductIds.size} products in composition`}
                    </p>
                  </div>
                  {balance >= creditCost ? (
                    <p className="text-sm text-muted-foreground">{balance} credits available</p>
                  ) : (
                    <button onClick={openBuyModal} className="flex items-center gap-1 text-sm text-destructive font-semibold hover:underline">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {balance} credits — need {creditCost}. Top up
                    </button>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setFlatLayPhase('surfaces')}>Back to Surfaces</Button>
                  <Button
                    onClick={balance >= creditCost ? handleGenerateClick : openBuyModal}
                    disabled={selectedVariationIndices.size === 0}
                    className={balance < creditCost && selectedVariationIndices.size > 0 ? 'bg-muted text-muted-foreground hover:bg-muted' : ''}
                  >
                    {balance >= creditCost ? `Generate ${selectedVariationIndices.size} Flat Lay Images` : 'Buy Credits'}
                  </Button>
                </div>
              </>
            )}

            {/* UGC Mood / Expression Selector — only for Selfie/UGC workflow */}
            {isSelfieUgc && (
              <Card><CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Creator Mood
                  </h3>
                  <p className="text-sm text-muted-foreground">Set the expression and energy for your UGC content</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {UGC_MOODS.map(mood => (
                    <button
                      key={mood.id}
                      onClick={() => setUgcMood(mood.id)}
                      className={cn(
                        'relative p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-1',
                        ugcMood === mood.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      {mood.recommended && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground rounded-full">
                          Popular
                        </span>
                      )}
                      <span className="text-2xl">{mood.emoji}</span>
                      <p className="text-sm font-semibold">{mood.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight">{mood.desc}</p>
                      <p className="text-[10px] text-muted-foreground/70 italic">{mood.example}</p>
                    </button>
                  ))}
                </div>
              </CardContent></Card>
            )}

            {/* Framing Selector — only for Selfie/UGC workflow */}
            {isSelfieUgc && (
              <Card><CardContent className="p-5">
                <FramingSelector framing={framing} onFramingChange={setFraming} />
              </CardContent></Card>
            )}

            {/* Interior / Exterior room details moved to upload step */}

            {/* Product Angles — hidden for Mirror Selfie Set, Flat Lay, Selfie/UGC, and Interior Design */}
            {variationStrategy?.type === 'scene' && !isMirrorSelfie && !isFlatLay && !isSelfieUgc && !isInteriorDesign && (
              <Card><CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="text-base font-semibold">Product Angles</h3>
                  <p className="text-sm text-muted-foreground">Choose which angles to generate for each scene</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {([
                    { key: 'front' as const, label: 'Front Only', desc: '1 image per scene', multiplier: '×1' },
                    { key: 'front-side' as const, label: 'Front + Side', desc: '2 images per scene', multiplier: '×2' },
                    { key: 'front-back' as const, label: 'Front + Back', desc: '2 images per scene', multiplier: '×2' },
                    { key: 'all' as const, label: 'All Angles', desc: '3 images per scene', multiplier: '×3' },
                  ]).map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setProductAngle(opt.key)}
                      className={cn(
                        'p-3 rounded-xl border-2 text-left transition-all',
                        productAngle === opt.key
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      <Badge variant="secondary" className="mt-1.5 text-[10px]">{opt.multiplier}</Badge>
                    </button>
                  ))}
                </div>
              </CardContent></Card>
            )}

            {/* Quality & Settings — hidden during mirror selfie scenes phase and flat lay (handled above) */}
            {!(isMirrorSelfie && mirrorSettingsPhase === 'scenes') && !isFlatLay && (
              <>
                <Card><CardContent className="p-5 space-y-4">
                  <h3 className="text-base font-semibold">Generation Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Quality</Label>
                      <Select value={quality} onValueChange={v => setQuality(v as ImageQuality)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (8 credits/img)</SelectItem>
                          <SelectItem value="high">High (16 credits/img)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Aspect Ratio</Label>
                      {isInteriorDesign ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Original</Badge>
                          <span className="text-xs text-muted-foreground">Matches uploaded photo</span>
                        </div>
                      ) : uiConfig?.lock_aspect_ratio ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{workflowConfig?.fixed_settings?.aspect_ratios?.[0] || aspectRatio}</Badge>
                          <span className="text-xs text-muted-foreground">Locked by workflow</span>
                        </div>
                      ) : variationStrategy?.type === 'multi-ratio' ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Multiple</Badge>
                          <span className="text-xs text-muted-foreground">Each variation uses its own ratio</span>
                        </div>
                      ) : (
                        <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                      )}
                    </div>
                  </div>
                </CardContent></Card>

                {/* Cost summary */}
                <div className={cn("p-4 rounded-lg border flex items-center justify-between", balance >= creditCost ? "border-border bg-muted/30" : "border-destructive/30 bg-destructive/5")}>
                  <div>
                    <p className="text-sm font-semibold">Total: {creditCost} credits</p>
                     <p className="text-xs text-muted-foreground">
                      {isMultiProductMode ? `${productQueue.length} products × ` : ''}
                      {selectedVariationIndices.size} {isInteriorDesign ? 'style' : 'scene'}{selectedVariationIndices.size !== 1 ? 's' : ''}
                      {angleMultiplier > 1 ? ` × ${angleMultiplier} angle${angleMultiplier > 1 ? 's' : ''}` : ''}
                      {' '}× {quality === 'high' ? 16 : 8} credits
                    </p>
                  </div>
                  {balance >= creditCost ? (
                    <p className="text-sm text-muted-foreground">{balance} credits available</p>
                  ) : (
                    <button onClick={openBuyModal} className="flex items-center gap-1 text-sm text-destructive font-semibold hover:underline">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {balance} credits — need {creditCost}. Top up
                    </button>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    if (isMirrorSelfie) {
                      setCurrentStep('model');
                    } else if (isInteriorDesign) {
                      setCurrentStep('upload');
                    } else {
                      setCurrentStep(brandProfiles.length > 0 ? 'brand-profile' : (sourceType === 'scratch' ? 'upload' : 'product'));
                    }
                  }}>Back</Button>
                  <Button
                    onClick={balance >= creditCost ? handleGenerateClick : openBuyModal}
                    disabled={selectedVariationIndices.size === 0}
                    className={balance < creditCost && selectedVariationIndices.size > 0 ? 'bg-muted text-muted-foreground hover:bg-muted' : ''}
                  >
                    {balance >= creditCost ? (isInteriorDesign ? 'Generate 1 Image' : `Generate ${workflowImageCount * multiProductCount} ${activeWorkflow?.name} Images`) : 'Buy Credits'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {currentStep === 'settings' && generationMode === 'virtual-try-on' && selectedModel && selectedPose && (
          <div className="space-y-4">
            <TryOnPreview product={selectedProduct} scratchUpload={scratchUpload} model={selectedModel} pose={selectedPose} creditCost={creditCost} selectedGender={selectedModel?.gender} />
            <Card><CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Selected Model & Scene</span>
                <Button variant="link" size="sm" onClick={() => setCurrentStep('model')}>Change</Button>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20"><img src={selectedModel.previewUrl} alt="" className="w-full h-full object-cover" /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Model</p>
                    <p className="text-sm font-medium">{selectedModel.name}</p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-primary/20"><img src={selectedModel?.gender === 'male' && selectedPose.previewUrlMale ? selectedPose.previewUrlMale : selectedPose.previewUrl} alt="" className="w-full h-full object-cover" /></div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Scene</p>
                    <p className="text-sm font-medium">{selectedPose.name}</p>
                  </div>
                </div>
              </div>
            </CardContent></Card>

            <Card><CardContent className="p-5 space-y-4">
              <h3 className="text-base font-semibold">Generation Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Images</Label>
                  <Select value={imageCount} onValueChange={v => setImageCount(v as '1' | '2' | '3' | '4')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 image</SelectItem>
                      {!isFreeUser && <SelectItem value="2">2 images</SelectItem>}
                      {!isFreeUser && <SelectItem value="3">3 images</SelectItem>}
                      {!isFreeUser && <SelectItem value="4">4 images</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quality</Label>
                  <Select value={quality} onValueChange={v => setQuality(v as ImageQuality)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard — Fast generation, good quality (8 credits/img)</SelectItem>
                      <SelectItem value="high">High (Pro Model) — Best quality, ~60-120s per image (16 credits/img)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <FramingSelector framing={framing} onFramingChange={setFraming} />
              <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
            </CardContent></Card>

            <div className={cn("p-4 rounded-lg border flex items-center justify-between", balance >= creditCost ? "border-border bg-muted/30" : "border-destructive/30 bg-destructive/5")}>
              <div>
                <p className="text-sm font-semibold">Virtual Try-On: {creditCost} credits</p>
                <p className="text-xs text-muted-foreground">{parseInt(imageCount)} image{parseInt(imageCount) > 1 ? 's' : ''} × {quality === 'high' ? 16 : 8} credits each</p>
              </div>
              {balance >= creditCost ? (
                <p className="text-sm text-muted-foreground">{balance} credits available</p>
              ) : (
                <button onClick={openBuyModal} className="flex items-center gap-1 text-sm text-destructive font-semibold hover:underline">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {balance} credits — need {creditCost}. Top up
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('pose')}>Back</Button>
              <Button
                onClick={balance >= creditCost ? handleGenerateClick : openBuyModal}
                className={balance < creditCost ? 'bg-muted text-muted-foreground hover:bg-muted' : ''}
              >
                {balance >= creditCost ? `Generate ${imageCount} Try-On Images` : 'Buy Credits'}
              </Button>
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
              <h2 className="text-lg font-semibold">
                {generationMode === 'virtual-try-on' ? 'Creating Virtual Try-On...' :
                 hasWorkflowConfig ? `Creating ${activeWorkflow?.name}...` : 'Creating Your Images...'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {generationMode === 'virtual-try-on' ? `Dressing ${selectedModel?.name} in "${selectedProduct?.title}"` :
                 isFlatLay && selectedFlatLayProductIds.size > 1 ? `Arranging ${selectedFlatLayProductIds.size} products on ${selectedVariationIndices.size} surface${selectedVariationIndices.size !== 1 ? 's' : ''}` :
                 isInteriorDesign ? `Staging your ${interiorRoomType || 'room'} in ${variationStrategy?.variations.find((_, i) => selectedVariationIndices.has(i))?.label || 'selected'} style` :
                 hasWorkflowConfig ? `Generating ${selectedVariationIndices.size} variation${selectedVariationIndices.size !== 1 ? 's' : ''} of "${selectedProduct?.title || scratchUpload?.productInfo.title}"` :
                 `Creating ${imageCount} images of "${selectedProduct?.title}"`}
              </p>
            </div>

            {/* Multi-product progress banner */}
            {isMultiProductMode && (
              <div className="w-full max-w-md space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Product {currentProductIndex + 1} of {productQueue.length}: {productQueue[currentProductIndex]?.title}
                  </span>
                  <span className="text-muted-foreground">{multiProductResults.size} completed</span>
                </div>
                <Progress value={(currentProductIndex / productQueue.length) * 100} className="h-2" />
                <div className="flex flex-wrap gap-1">
                  {productQueue.map((p, idx) => (
                    <Badge
                      key={p.id}
                      variant={idx < currentProductIndex ? 'default' : idx === currentProductIndex ? 'secondary' : 'outline'}
                      className="text-[10px]"
                    >
                      {idx < currentProductIndex ? 'Done' : idx === currentProductIndex ? '...' : '—'} {p.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Batch progress - enhanced */}
            {batchState && batchState.totalJobs > 1 && (
              <div className="w-full max-w-md space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {batchState.allDone
                      ? `All ${batchState.totalJobs} batches complete`
                      : `Image ${Math.min(batchState.completedJobs + batchState.failedJobs + 1, batchState.totalJobs)} of ${batchState.totalJobs} generating...`}
                  </span>
                  <span className="text-muted-foreground">{batchState.readyImages} images ready</span>
                </div>
                <Progress value={(batchState.completedJobs + batchState.failedJobs) / batchState.totalJobs * 100} className="h-2" />
                {batchState.failedJobs > 0 && (
                  <p className="text-xs text-amber-600">{batchState.failedJobs} batch{batchState.failedJobs > 1 ? 'es' : ''} failed — credits refunded</p>
                )}
                {/* Show active job indicator within batch */}
                {activeJob && (
                  <QueuePositionIndicator job={activeJob} onCancel={activeJob.status === 'queued' ? cancelQueue : undefined} />
                )}
              </div>
            )}

            {/* Single job progress */}
            {(!batchState || batchState.totalJobs <= 1) && (
              <div className="w-full max-w-md">
                {activeJob ? (
                  <QueuePositionIndicator job={activeJob} onCancel={activeJob.status === 'queued' ? cancelQueue : undefined} />
                ) : (
                  <Progress value={0} className="h-2 animate-pulse" />
                )}
              </div>
            )}

            <Button variant="link" onClick={handleCancelGeneration}><X className="w-4 h-4 mr-1" /> Cancel</Button>
          </CardContent></Card>
        )}

        {/* Results */}
        {currentStep === 'results' && (selectedProduct || scratchUpload) && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    {activeWorkflow?.name || (isInteriorDesign ? 'Interior Staging' : sourceType === 'scratch' ? 'Image Generation' : 'Generation Summary')}
                  </h3>
                  {activeWorkflow && (
                    <Badge variant="secondary" className="text-[10px]">Workflow</Badge>
                  )}
                </div>

                {/* Reference thumbnails row */}
                <div className="flex gap-4 overflow-x-auto pb-1">
                  {isFlatLay && selectedFlatLayProductIds.size > 1 ? (
                    userProducts.filter(up => selectedFlatLayProductIds.has(up.id)).map(up => (
                      <div key={up.id} className="flex-shrink-0 text-center">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30">
                          <img src={up.image_url || '/placeholder.svg'} alt={up.title} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[56px] truncate">Product</p>
                        <p className="text-[10px] font-medium mt-0.5 max-w-[56px] truncate">{up.title}</p>
                      </div>
                    ))
                  ) : (selectedProduct || scratchUpload) && (
                    <div className="flex-shrink-0 text-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30">
                        <img src={sourceType === 'scratch' ? scratchUpload?.previewUrl : selectedProduct?.images[0]?.url || '/placeholder.svg'} alt="Product" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[56px] truncate">Product</p>
                      <p className="text-[10px] font-medium mt-0.5 max-w-[56px] truncate">{sourceType === 'scratch' ? scratchUpload?.productInfo.title : selectedProduct?.title}</p>
                    </div>
                  )}
                  {selectedModel && (
                    <div className="flex-shrink-0 text-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30">
                        <img src={selectedModel.previewUrl} alt={selectedModel.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[56px] truncate">Model</p>
                      <p className="text-[10px] font-medium mt-0.5 max-w-[56px] truncate">{selectedModel.name}</p>
                    </div>
                  )}
                  {selectedPose && (
                    <div className="flex-shrink-0 text-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30">
                        <img src={selectedPose.previewUrl} alt={selectedPose.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[56px] truncate">Scene</p>
                      <p className="text-[10px] font-medium mt-0.5 max-w-[56px] truncate">{selectedPose.name}</p>
                    </div>
                  )}
                  {variationStrategy?.type === 'scene' && selectedVariationIndices.size > 0 && variationStrategy.variations
                    .filter((_, i) => selectedVariationIndices.has(i))
                    .map((v, idx) => (
                      <div key={`scene-${idx}`} className="flex-shrink-0 text-center">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/30">
                          {v.preview_url ? (
                            <img src={v.preview_url} alt={v.label} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">Scene</div>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 max-w-[56px] truncate">Scene</p>
                        <p className="text-[10px] font-medium mt-0.5 max-w-[56px] truncate">{v.label}</p>
                      </div>
                    ))
                  }
                </div>

                {/* Settings chips */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px] font-normal">Aspect: {aspectRatio}</Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">Quality: {quality === 'high' ? 'High' : 'Standard'}</Badge>
                  {framing && <Badge variant="outline" className="text-[10px] font-normal">Framing: {framing.replace(/_/g, ' ')}</Badge>}
                  {selectedBrandProfile && (
                    <Badge variant="outline" className="text-[10px] font-normal">Brand: {selectedBrandProfile.name}</Badge>
                  )}
                </div>

                {/* Variation labels */}
                {workflowVariationLabels.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Variations</p>
                    <div className="flex flex-wrap gap-1">
                      {workflowVariationLabels.map((label, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] font-normal">{label}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card><CardContent className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Generated Images</h2>
                  <p className="text-xs text-muted-foreground">Click images to select them</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0" onClick={() => {
                    setSelectedForPublish(new Set(generatedImages.map((_, i) => i)));
                  }}>Select All</Button>
                  <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0" onClick={handleDownloadAll}>
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Download All
                  </Button>
                  <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0" onClick={() => setCurrentStep('settings')}>Adjust</Button>
                  {isInteriorDesign && (
                    <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0" onClick={() => {
                      setGeneratedImages([]);
                      setSelectedForPublish(new Set());
                      setSelectedVariationIndices(new Set());
                      setCurrentStep('settings');
                    }}>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Another Style
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0" onClick={() => { setCurrentStep('source'); setSelectedProduct(null); setScratchUpload(null); setSelectedTemplate(null); setGeneratedImages([]); setSelectedForPublish(new Set()); setProductQueue([]); setCurrentProductIndex(0); setMultiProductResults(new Map()); }}>Start Over</Button>
                </div>
              </div>

              <div className={`grid gap-4 ${
                generatedImages.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                generatedImages.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
                generatedImages.length <= 4 ? 'grid-cols-2 md:grid-cols-3' :
                'grid-cols-2 md:grid-cols-4'
              }`}>
                {generatedImages.map((url, index) => (
                  <div key={index} className={`generation-preview relative group cursor-pointer rounded-lg overflow-hidden ${selectedForPublish.has(index) ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                    <img src={url} alt={`Generated ${index + 1}`} className="w-full object-contain bg-muted/10 rounded" onClick={() => toggleImageSelection(index)} />
                    {/* Variation label overlay */}
                    {workflowVariationLabels[index] && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                        <p className="text-white text-xs font-medium">{workflowVariationLabels[index]}</p>
                      </div>
                    )}
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

            </CardContent></Card>


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

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-primary" /> Saved to your library</p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button variant="outline" className="rounded-xl min-h-[44px] flex-1 sm:flex-none" onClick={() => {
                  if (selectedForPublish.size === 0) { toast.error('Select images to download'); return; }
                  selectedForPublish.forEach(idx => handleDownloadImage(idx));
                }}><Download className="w-4 h-4 mr-2" /> Download Selected ({selectedForPublish.size})</Button>
                <Button className="rounded-xl min-h-[44px] flex-1 sm:flex-none" onClick={() => navigate('/app/library')}>View in Library</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TryOnConfirmModal open={tryOnConfirmModalOpen} onClose={() => setTryOnConfirmModalOpen(false)} onConfirm={handleTryOnConfirmGenerate}
        product={selectedProduct} model={selectedModel} pose={selectedPose}
        imageCount={parseInt(imageCount)} aspectRatio={aspectRatio} creditsRemaining={balance} isLoading={isEnqueuing} onBuyCredits={openBuyModal}
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
      <AddProductModal
        open={showAddProduct}
        onOpenChange={setShowAddProduct}
        onProductAdded={() => queryClient.invalidateQueries({ queryKey: ['user-products'] })}
      />
    </PageHeader>
  );
}
