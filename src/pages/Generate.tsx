import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useGenerationBatch } from '@/hooks/useGenerationBatch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AddProductModal } from '@/components/app/AddProductModal';
import { Image, CheckCircle, Download, RefreshCw, Maximize2, X, User, List, Palette, Shirt, Upload as UploadIcon, Package, Loader2, Check, Sparkles, Ban, Info, Smartphone, Layers, AlertCircle } from 'lucide-react';

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
const FREE_SCENE_LIMIT = 3;
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

  
  const [tryOnConfirmModalOpen, setTryOnConfirmModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [noCreditsModalOpen, setNoCreditsModalOpen] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const queryClient = useQueryClient();


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
