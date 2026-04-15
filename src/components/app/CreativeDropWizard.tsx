import { useState, useMemo, useCallback } from 'react';
import { useCredits } from '@/contexts/CreditContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FramingMultiSelector } from '@/components/app/FramingSelector';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  ArrowLeft, ArrowRight, Check, CalendarIcon,
  Sparkles, Search, Loader2,
  Zap, CreditCard, Clock, RocketIcon, Repeat, Plus, Trash2, ChevronDown, Package, Info,
  LayoutGrid, List, Shuffle, Leaf, Sun, Snowflake, Heart, ShoppingBag, GraduationCap, TreePine,
  Settings2, Wallet, Users, Calculator, Smartphone, Layers,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/brandedToast';
import { cn } from '@/lib/utils';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { calculateDropCredits, type WorkflowCostConfig } from '@/lib/dropCreditCalculator';
import type { Workflow } from '@/types/workflow';
import { useNavigate } from 'react-router-dom';
import { mockModels, mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { useHiddenScenes } from '@/hooks/useHiddenScenes';
import { useSceneSortOrder } from '@/hooks/useSceneSortOrder';
import { useModelSortOrder } from '@/hooks/useModelSortOrder';

const opt = (url: string) => getOptimizedUrl(url, { width: 200, quality: 60 });

const WORKFLOW_FALLBACK_IMAGES: Record<string, string> = {
  'Virtual Try-On Set': opt(getLandingAssetUrl('workflows/workflow-tryon-result.png')),
  'Product Listing Set': opt(getLandingAssetUrl('workflows/workflow-product-listing.jpg')),
  'Selfie / UGC Set': opt(getLandingAssetUrl('workflows/ugc-result-1.jpg')),
  'Flat Lay Set': opt(getLandingAssetUrl('workflows/workflow-flat-lay.jpg')),
  'Mirror Selfie Set': opt('https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/7a203c7e-0367-4fc3-8eb2-2e4d181fa158_mirror_selfie_v2.png'),
  'Picture Perspectives': '/images/perspectives/front.png',
};

const HIDDEN_WORKFLOW_NAMES = new Set([
  'Interior / Exterior Staging',
  'Image Upscaling',
]);

const SEASONAL_PRESETS = [
  { id: 'none', label: 'None', icon: null, instructions: '' },
  { id: 'spring', label: 'Spring', icon: Leaf, instructions: 'Fresh spring vibes — soft pastels, blooming flowers, light fabrics, airy outdoor settings with natural greenery and gentle morning light.' },
  { id: 'summer', label: 'Summer', icon: Sun, instructions: 'Bright summer energy — vivid colors, golden-hour warmth, beach and poolside vibes, sun-drenched textures, relaxed outdoor lifestyle.' },
  { id: 'autumn', label: 'Autumn', icon: Leaf, instructions: 'Warm autumn tones — cozy layering, golden-hour lighting, fallen leaves and earth-toned props, rich amber and burgundy palette, textured knits.' },
  { id: 'winter', label: 'Winter', icon: Snowflake, instructions: 'Winter elegance — cool blue and silver tones, cozy indoor settings, soft lighting, luxurious textures, frost-inspired minimalism.' },
  { id: 'holiday', label: 'Holiday', icon: TreePine, instructions: 'Festive holiday spirit — warm golds and deep reds, twinkling lights, gift-wrapped props, cozy fireside settings, celebration and joy.' },
  { id: 'valentines', label: "Valentine's", icon: Heart, instructions: 'Romantic Valentine\'s mood — soft pinks and reds, intimate settings, floral accents, candlelight warmth, elegant and tender styling.' },
  { id: 'back-to-school', label: 'Back to School', icon: GraduationCap, instructions: 'Back-to-school energy — crisp clean looks, campus settings, structured styling, fresh notebooks and backpacks, confident and youthful.' },
  { id: 'black-friday', label: 'Black Friday', icon: ShoppingBag, instructions: 'Bold Black Friday impact — high-contrast dramatic lighting, premium product focus, sleek dark backgrounds, urgency and exclusivity feel.' },
] as const;

export interface CreativeDropWizardInitialData {
  name: string;
  theme: string;
  themeNotes: string;
  brandProfileId: string;
  selectedProductIds: string[];
  selectedWorkflowIds: string[];
  selectedModelIds: string[];
  workflowFormats: Record<string, string | string[]>;
  deliveryMode: 'now' | 'scheduled';
  frequency: string;
  imagesPerDrop: number;
  includeFreestyle: boolean;
  freestylePrompts: string[];
  workflowSceneSelections?: Record<string, string[]>;
  workflowModelSelections?: Record<string, string[]>;
  workflowPoseSelections?: Record<string, string[]>;
  workflowCustomSettings?: Record<string, Record<string, string>>;
  imagesPerWorkflow?: Record<string, number>;
  workflowProductIds?: Record<string, string[]>;
}

interface CreativeDropWizardProps {
  onClose: () => void;
  onLaunched?: () => void;
  initialData?: CreativeDropWizardInitialData;
  editingScheduleId?: string;
}

const IMAGE_PRESETS = [10, 25, 50, 100];
const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', w: 1, h: 1 },
  { id: '4:5', label: '4:5', w: 4, h: 5 },
  { id: '9:16', label: '9:16', w: 9, h: 16 },
  { id: '16:9', label: '16:9', w: 16, h: 9 },
];

// Full scene list is built inside the component using hooks

// Models are built inside the component using hooks + sort order

interface UserProduct {
  id: string;
  title: string;
  image_url: string;
  product_type: string;
}

const STEP_LABELS = ['Details', 'Products', 'Workflow', 'Launch'];
const TOTAL_STEPS = 4;

export function CreativeDropWizard({ onClose, onLaunched, initialData, editingScheduleId }: CreativeDropWizardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const creditCtx = useCredits();
  
  const [step, setStep] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);

  const markDirty = useCallback(() => { if (!isDirty) setIsDirty(true); }, [isDirty]);

  // Step 0: Details
  const [name, setName] = useState(initialData?.name || '');
  const [theme, setTheme] = useState(initialData?.theme || 'custom');
  const [themeNotes, setThemeNotes] = useState(initialData?.themeNotes || '');
  const [brandProfileId, setBrandProfileId] = useState(initialData?.brandProfileId || '');
  const [seasonalPreset, setSeasonalPreset] = useState('none');
  const [dropGoal, setDropGoal] = useState<string>('');

  const DROP_GOALS = [
    { id: 'product-launch', label: 'Product Launch', icon: RocketIcon },
    { id: 'social-content', label: 'Social Content', icon: Users },
    { id: 'seasonal-campaign', label: 'Seasonal Campaign', icon: Sun },
    { id: 'brand-awareness', label: 'Brand Awareness', icon: Sparkles },
  ];

  const namePlaceholder = useMemo(() => {
    const options = ['Summer Vibes 2026', 'Black Friday Launch', 'New Arrivals — March', 'Holiday Collection', 'Spring Refresh Campaign'];
    return options[Math.floor(Math.random() * options.length)];
  }, []);

  // Step 1: Products
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(initialData?.selectedProductIds || [])
  );
  const [productSearch, setProductSearch] = useState('');
  const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');

  // Step 2: Single workflow + flat config
  const initWfId = initialData?.selectedWorkflowIds?.[0] || null;
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(initWfId);

  // Flat config state (for the single selected workflow)
  // sceneSelections removed — scene selection is now purely through poseSelections (Scene Library)
  const [modelSelections, setModelSelections] = useState<string[]>(() => {
    if (initWfId && initialData?.workflowModelSelections?.[initWfId]) {
      return initialData.workflowModelSelections[initWfId];
    }
    return [];
  });
  const [poseSelections, setPoseSelections] = useState<string[]>(() => {
    if (initWfId && initialData?.workflowPoseSelections?.[initWfId]) {
      return initialData.workflowPoseSelections[initWfId];
    }
    return [];
  });
  const [customSettings, setCustomSettings] = useState<Record<string, string>>(() => {
    if (initWfId && initialData?.workflowCustomSettings?.[initWfId]) {
      return initialData.workflowCustomSettings[initWfId];
    }
    return {};
  });
  const [imageCount, setImageCount] = useState<number>(() => {
    if (initWfId && initialData?.imagesPerWorkflow?.[initWfId]) {
      return initialData.imagesPerWorkflow[initWfId];
    }
    return 25;
  });
  const [formats, setFormats] = useState<string[]>(() => {
    if (initWfId && initialData?.workflowFormats?.[initWfId]) {
      const v = initialData.workflowFormats[initWfId];
      return Array.isArray(v) ? v : [v];
    }
    return [];
  });
  const [isRandomModelsFlag, setIsRandomModelsFlag] = useState(false);
  const [isRandomScenesFlag, setIsRandomScenesFlag] = useState(false);
  const [customImageCountStr, setCustomImageCountStr] = useState('');
  const [campaignMode, setCampaignMode] = useState<'curated' | 'mix'>('curated');
  const [selectedFramings, setSelectedFramings] = useState<Set<string>>(new Set(['auto']));
  const [selectedVariationIndices, setSelectedVariationIndices] = useState<Set<number>>(new Set());
  const [flatLayPropStyle, setFlatLayPropStyle] = useState<'clean' | 'decorated'>('clean');
  const [stylingNotes, setStylingNotes] = useState('');
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>([]);
  const [productAngle, setProductAngle] = useState<'front' | 'front-side' | 'front-back' | 'all'>('front');
  // Freestyle
  const [includeFreestyle, setIncludeFreestyle] = useState(initialData?.includeFreestyle || false);
  const [freestylePrompts, setFreestylePrompts] = useState<string[]>(
    initialData?.freestylePrompts?.length ? initialData.freestylePrompts : ['']
  );

  // Step 3: Schedule / Launch
  const [deliveryMode, setDeliveryMode] = useState<'now' | 'scheduled'>(initialData?.deliveryMode || 'now');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [frequency, setFrequency] = useState(initialData?.frequency || 'monthly');

  // Queries
  const { data: profile } = useQuery({
    queryKey: ['profile-renewal'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits_renewed_at, plan, credits_balance')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: brandProfiles = [], isLoading: brandProfilesLoading } = useQuery({
    queryKey: ['brand-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brand_profiles').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['user-products-wizard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_products').select('id, title, image_url, product_type').order('title');
      if (error) throw error;
      return data as UserProduct[];
    },
  });

  const { data: rawWorkflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ['workflows-full'],
    queryFn: async () => {
      const { data, error } = await supabase.from('workflows').select('*').order('sort_order');
      if (error) throw error;
      return data as unknown as Workflow[];
    },
  });

  const workflows = rawWorkflows.filter(w => !HIDDEN_WORKFLOW_NAMES.has(w.name));

  const { data: customModels = [] } = useQuery({
    queryKey: ['custom-models'],
    queryFn: async () => {
      const { data, error } = await supabase.from('custom_models').select('*').eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Full scene list (all categories + custom scenes)
  const { asPoses: customScenePoses } = useCustomScenes();
  const { filterVisible } = useHiddenScenes();
  const { sortScenes, applyCategoryOverrides, deriveCategoryOrder } = useSceneSortOrder();
  const { sortModels: sortModelsByOrder, applyOverrides, applyNameOverrides, filterHidden } = useModelSortOrder();

  const allModelsSorted = sortModelsByOrder(filterHidden(applyNameOverrides(applyOverrides(mockModels))));
  const allModels = [
    ...allModelsSorted.map(m => ({
      id: m.modelId,
      name: m.name,
      image_url: m.previewUrl,
    })),
    ...(customModels || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      image_url: m.image_url,
    })),
  ];

  // Selected workflow object
  const selectedWorkflow = useMemo(
    () => workflows.find(w => w.id === selectedWorkflowId) || null,
    [workflows, selectedWorkflowId]
  );

  // Workflow type detection
  const isFlatLay = selectedWorkflow?.name?.toLowerCase().includes('flat lay') ?? false;
  const isMirrorSelfie = selectedWorkflow?.name === 'Mirror Selfie Set';
  const isSelfieUgc = !isMirrorSelfie && (selectedWorkflow?.name?.toLowerCase().includes('selfie') || selectedWorkflow?.name?.toLowerCase().includes('ugc')) || false;
  const isPerspectives = selectedWorkflow?.name?.toLowerCase().includes('perspectives') ?? false;
  const isProductListing = selectedWorkflow?.name?.toLowerCase().includes('product listing') ?? false;
  const hasVariations = !!((selectedWorkflow?.generation_config as any)?.variation_strategy?.variations?.length);
  const useVariationsAsScenes = hasVariations && !selectedWorkflow?.uses_tryon;

  const ON_MODEL_CATEGORIES = ['studio', 'lifestyle', 'editorial', 'streetwear'];

  const allScenePoses = useMemo(() => {
    const raw = applyCategoryOverrides([...filterVisible(mockTryOnPoses), ...customScenePoses]);
    const sorted = sortScenes(raw);
    if (!selectedWorkflow) return sorted;
    if (selectedWorkflow.uses_tryon) {
      return sorted.filter(p => ON_MODEL_CATEGORIES.includes(p.category));
    }
    const needsModelsForWf = selectedWorkflow.generation_config?.ui_config?.show_model_picker;
    if (!needsModelsForWf) {
      return sorted.filter(p => !ON_MODEL_CATEGORIES.includes(p.category));
    }
    return sorted;
  }, [customScenePoses, filterVisible, sortScenes, applyCategoryOverrides, selectedWorkflow]);

  const sceneCategories = useMemo(() => {
    const order = deriveCategoryOrder(allScenePoses);
    return order.length > 0 ? order : Object.keys(poseCategoryLabels);
  }, [allScenePoses, deriveCategoryOrder]);


  const progressPercent = TOTAL_STEPS > 1 ? Math.round((step / (TOTAL_STEPS - 1)) * 100) : 0;

  // Image count: matrix-based for Curated, user-chosen for Mix
  const computedImageCount = useMemo(() => {
    if (campaignMode === 'mix') return imageCount;
    if (!selectedWorkflow) return imageCount;
    const genConfig = selectedWorkflow.generation_config as any;
    const needsModels = selectedWorkflow.uses_tryon || genConfig?.ui_config?.show_model_picker;
    // For workflows with variations (non-try-on), use variation indices as scene count
    const effectiveScenes = useVariationsAsScenes
      ? Math.max(selectedVariationIndices.size, 1)
      : Math.max(poseSelections.length, 1);
    const modelCount = needsModels ? Math.max(modelSelections.length, 1) : 1;
    const formatCount = Math.max(formats.length, 1);
    const framingCount = selectedFramings.has('auto') ? 1 : Math.max(selectedFramings.size, 1);
    // Product listing angle multiplier
    const angleMultiplier = isProductListing ? (productAngle === 'all' ? 3 : productAngle === 'front' ? 1 : 2) : 1;
    return effectiveScenes * modelCount * formatCount * framingCount * angleMultiplier;
  }, [campaignMode, imageCount, selectedWorkflow, poseSelections.length, modelSelections.length, formats.length, selectedFramings, selectedVariationIndices.size, useVariationsAsScenes, isProductListing, productAngle]);

  // Credit calculation
  const workflowConfigs: WorkflowCostConfig[] = selectedWorkflow ? [{
    workflowId: selectedWorkflow.id,
    workflowName: selectedWorkflow.name,
    hasModel: selectedWorkflow.uses_tryon || modelSelections.length > 0,
    hasCustomScene: false,
    formatCount: 1, // already included in computedImageCount
    imageCountOverride: computedImageCount,
    productCount: selectedProductIds.size,
  }] : [];

  const effectiveFrequency = deliveryMode === 'now' ? 'one-time' : frequency;
  const costEstimate = calculateDropCredits(workflowConfigs, 25, effectiveFrequency, selectedProductIds.size);
  const insufficientCredits = profile?.credits_balance != null && costEstimate.totalCredits > profile.credits_balance;

  const handleSeasonalPreset = (presetId: string) => {
    setSeasonalPreset(presetId);
    setTheme(presetId === 'none' ? 'custom' : presetId);
    const preset = SEASONAL_PRESETS.find(p => p.id === presetId);
    if (preset && preset.instructions) {
      setThemeNotes(preset.instructions);
      if (!name.trim()) {
        const monthName = new Date().toLocaleString('default', { month: 'long' });
        setName(`${preset.label} Drop — ${monthName} ${new Date().getFullYear()}`);
      }
    }
  };

  // When selecting a different workflow, reset config
  const handleSelectWorkflow = (wfId: string) => {
    if (selectedWorkflowId === wfId) {
      // Deselect
      setSelectedWorkflowId(null);
      return;
    }
    setSelectedWorkflowId(wfId);
    // Reset config for new workflow
    // sceneSelections removed
    setModelSelections([]);
    setPoseSelections([]);
    setCustomSettings({});
    setImageCount(25);
    setFormats([]);
    setIsRandomModelsFlag(false);
    setIsRandomScenesFlag(false);
    setCustomImageCountStr('');
    setSelectedFramings(new Set(['auto']));
    setSelectedVariationIndices(new Set());
    setFlatLayPropStyle('clean');
    setStylingNotes('');
    setSelectedAesthetics([]);
    setProductAngle('front');
    markDirty();
  };

  // Validation
  const canNext = (): boolean => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return selectedProductIds.size > 0;
    if (step === 2) {
      if (!selectedWorkflowId || !selectedWorkflow) return false;
      const genConfig = selectedWorkflow.generation_config as any;
      const uiConfig = genConfig?.ui_config;
      const needsModels = selectedWorkflow.uses_tryon || uiConfig?.show_model_picker;
      if (campaignMode === 'curated' && needsModels && modelSelections.length === 0) return false;
      if (formats.length === 0) return false;
      return true;
    }
    if (step === 3) return deliveryMode === 'now' || !!startDate;
    return false;
  };

  const getValidationHint = (): string | null => {
    if (!attempted) return null;
    if (step === 0 && !name.trim()) return 'Give your drop a name to continue';
    if (step === 1 && selectedProductIds.size === 0) return 'Select at least one product';
    if (step === 2) {
      if (!selectedWorkflowId) return 'Select a workflow';
      if (selectedWorkflow) {
        const genConfig = selectedWorkflow.generation_config as any;
        const uiConfig = genConfig?.ui_config;
        const needsModels = selectedWorkflow.uses_tryon || uiConfig?.show_model_picker;
        if (campaignMode === 'curated' && needsModels && modelSelections.length === 0) {
          return 'Select at least one model';
        }
        if (formats.length === 0) return 'Select at least one aspect ratio';
      }
    }
    if (step === 3 && deliveryMode === 'scheduled' && !startDate) return 'Pick a start date';
    return null;
  };

  const handleNext = () => {
    if (!canNext()) {
      setAttempted(true);
      return;
    }
    setAttempted(false);
    markDirty();
    setStep(s => s + 1);
    document.getElementById('app-main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setAttempted(false);
    setStep(s => s - 1);
    document.getElementById('app-main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!selectedWorkflowId) throw new Error('No workflow selected');

      const effectiveStartDate = deliveryMode === 'now' ? new Date() : startDate!;
      let nextRun: Date | null = null;
      if (deliveryMode === 'scheduled') {
        nextRun = new Date(effectiveStartDate);
      }

      const settingsFieldMap: Record<string, string> = {
        'Mood': 'ugc_mood',
        'Prop Style': 'prop_style',
        'Styling': 'styling_notes',
      };

      const saveGenConfig = selectedWorkflow?.generation_config as any;
      const saveVariations: { label: string }[] = saveGenConfig?.variation_strategy?.variations || [];

      // Build selected labels from variation indices
      const selectedLabels: string[] = Array.from(selectedVariationIndices).map(i => saveVariations[i]?.label).filter(Boolean);
      const selectedVarIndicesArr: number[] = Array.from(selectedVariationIndices);

      const resolvedModels = modelSelections.map(mId => {
        const m = allModels.find(am => am.id === mId);
        if (!m) return null;
        // Try to find demographics from mockModels
        const mockModel = mockModels.find(mm => mm.modelId === mId);
        return {
          id: m.id, name: m.name, image_url: m.image_url,
          gender: mockModel?.gender || (m as any).gender || 'female',
          ethnicity: mockModel?.ethnicity || (m as any).ethnicity || '',
          bodyType: mockModel?.bodyType || (m as any).body_type || 'slim',
          ageRange: mockModel?.ageRange || (m as any).age_range || '25-34',
        };
      }).filter(Boolean);

      // Resolve full pose objects for try-on workflows
      const resolvedPoses = poseSelections.map(pid => {
        const p = allScenePoses.find(sp => sp.poseId === pid);
        return p ? { poseId: p.poseId, name: p.name, description: p.description || p.promptHint || '', category: p.category, imageUrl: p.previewUrl } : null;
      }).filter(Boolean);

      const mappedSettings: Record<string, string> = {};
      for (const [key, value] of Object.entries(customSettings)) {
        const mappedKey = settingsFieldMap[key] || key;
        mappedSettings[mappedKey] = value;
      }

      const sceneConfig: Record<string, any> = {
        [selectedWorkflowId]: {
          aspect_ratios: formats,
          aspect_ratio: formats[0],
          selected_scenes: isRandomScenesFlag ? ['__random__'] : selectedLabels,
          selected_variation_indices: isRandomScenesFlag ? [] : selectedVarIndicesArr,
          pose_ids: poseSelections,
          poses: resolvedPoses,
          model_ids: isRandomModelsFlag ? ['__random__'] : modelSelections,
          models: isRandomModelsFlag ? [{ id: '__random__', name: 'Random / Diverse' }] : resolvedModels,
          custom_settings: customSettings,
          mapped_settings: mappedSettings,
          random_models: isRandomModelsFlag,
          random_scenes: isRandomScenesFlag,
          image_count: computedImageCount,
          selected_framings: Array.from(selectedFramings),
          flat_lay_prop_style: flatLayPropStyle,
          selected_aesthetics: selectedAesthetics,
          styling_notes: stylingNotes,
          product_angle: productAngle,
        },
      };

      const cleanPrompts = freestylePrompts.filter(p => p.trim().length > 0);

      const payload = {
        name,
        theme,
        theme_notes: themeNotes,
        frequency: deliveryMode === 'now' || frequency === 'none' ? 'one-time' : frequency,
        products_scope: 'selected',
        selected_product_ids: Array.from(selectedProductIds),
        workflow_ids: [selectedWorkflowId],
        model_ids: isRandomModelsFlag ? ['__random__'] : modelSelections,
        brand_profile_id: brandProfileId || null,
        images_per_drop: computedImageCount,
        estimated_credits: costEstimate.totalCredits,
        active: true,
        start_date: effectiveStartDate.toISOString(),
        next_run_at: nextRun ? nextRun.toISOString() : null,
        scene_config: sceneConfig,
        include_freestyle: includeFreestyle,
        freestyle_prompts: cleanPrompts,
      };

      let scheduleId = editingScheduleId;

      if (editingScheduleId) {
        const { error } = await supabase.from('creative_schedules').update(payload).eq('id', editingScheduleId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('creative_schedules').insert({ ...payload, user_id: user.id }).select('id').single();
        if (error) throw error;
        scheduleId = data.id;
      }

      return { scheduleId: scheduleId!, isNow: deliveryMode === 'now' };
    },
    onSuccess: async ({ scheduleId, isNow }) => {
      if (isNow && !editingScheduleId) {
        try {
          const res = await supabase.functions.invoke('trigger-creative-drop', {
            body: { schedule_id: scheduleId },
          });
          const errorMsg = res.data?.error || res.error?.message;
          if (errorMsg) {
            console.error('Trigger error:', errorMsg);
            toast.error(`Generation failed: ${errorMsg}`);
            onClose();
            return;
          }
          // Switch to Drops tab FIRST, then wait for data, then close
          onLaunched?.();
          await queryClient.invalidateQueries({ queryKey: ['creative-drops'] });
          await queryClient.invalidateQueries({ queryKey: ['creative-schedules'] });
          creditCtx.refreshBalance();
          onClose();
        } catch (e) {
          console.error('Trigger error:', e);
          toast.error('Failed to trigger generation');
          onClose();
        }
      } else {
        await queryClient.invalidateQueries({ queryKey: ['creative-schedules'] });
        await queryClient.invalidateQueries({ queryKey: ['creative-drops'] });
        toast.success(editingScheduleId ? 'Drop updated!' : 'Drop saved — it will run on the scheduled date');
        onClose();
      }
    },
    onError: (error: Error) => toast.error(
      editingScheduleId
        ? `Failed to update drop: ${error.message}`
        : `Failed to create drop: ${error.message}`
    ),
  });

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const validationHint = getValidationHint();
  const activePreset = SEASONAL_PRESETS.find(p => p.id === seasonalPreset && p.id !== 'none');
  const isLastStep = step === 3;

  return (
    <div className="space-y-0 touch-auto">
      {/* ── Progress Header ── */}
      <div className="pb-5">
        <div className="flex items-center justify-end mb-1.5">
          <span className="text-xs text-muted-foreground font-mono sm:hidden">
            {step + 1}/{TOTAL_STEPS}
          </span>
        </div>

        {/* Step breadcrumb stepper */}
        <div className="hidden sm:flex items-center gap-1 mb-3 overflow-x-auto pb-1">
          {STEP_LABELS.map((label, i) => {
            const isCompleted = i < step;
            const isCurrent = i === step;
            return (
              <div key={i} className="flex items-center gap-1 flex-shrink-0">
                {i > 0 && <div className={cn('w-4 h-px', isCompleted ? 'bg-primary' : 'bg-border')} />}
                <div
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-colors',
                    isCurrent && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-primary/10 text-primary',
                    !isCurrent && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  {isCompleted && <Check className="w-3 h-3" />}
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile: progress bar */}
        <div className="sm:hidden">
          <Progress value={progressPercent} className="h-1.5 mb-3" />
        </div>
      </div>

      <Separator />

      {/* ── Content ── */}
      <div className="pt-6 pb-4">
        <div className="min-h-[380px]">

          {/* ─── Step 0: Details ─── */}
          {step === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight">Name Your Drop</h3>
                  <p className="text-xs text-muted-foreground">Set up the basics — you'll pick products and workflows next.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="section-label">Drop Name</p>
                  <span className={cn(
                    'text-[10px] tabular-nums',
                    name.length >= 60 ? 'text-destructive' : name.length >= 50 ? 'text-destructive/60' : 'text-muted-foreground/50'
                  )}>{name.length}/60</span>
                </div>
                <Input
                  placeholder={namePlaceholder}
                  value={name}
                  maxLength={60}
                  onChange={e => { setName(e.target.value); markDirty(); }}
                  className={cn('h-12 rounded-xl text-sm max-w-md', attempted && !name.trim() && 'border-destructive')}
                />
                {attempted && !name.trim() && (
                  <p className="text-xs text-destructive">Give your drop a name to continue</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="section-label">Drop Goal <span className="text-muted-foreground font-normal">(optional)</span></p>
                <div className="flex flex-wrap gap-2">
                  {DROP_GOALS.map(goal => {
                    const Icon = goal.icon;
                    const isActive = dropGoal === goal.id;
                    return (
                      <button
                        key={goal.id}
                        onClick={() => { setDropGoal(isActive ? '' : goal.id); markDirty(); }}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-all',
                          isActive
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/30 text-muted-foreground bg-card'
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {goal.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="section-label">Campaign Theme</p>
                <p className="text-xs text-muted-foreground">Auto-fill style directions for a seasonal campaign</p>
                <div className="flex flex-wrap gap-2">
                  {SEASONAL_PRESETS.map(preset => {
                    const Icon = preset.icon;
                    const isActive = seasonalPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSeasonalPreset(preset.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-all',
                          isActive
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/30 text-muted-foreground bg-card'
                        )}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                {seasonalPreset !== 'none' && (() => {
                  const ap = SEASONAL_PRESETS.find(p => p.id === seasonalPreset);
                  if (!ap || !ap.icon) return null;
                  const PresetIcon = ap.icon;
                  return (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 max-w-md">
                      <PresetIcon className="w-4 h-4 text-primary shrink-0" />
                      <p className="text-xs text-primary/80 line-clamp-1">{ap.instructions}</p>
                    </div>
                  );
                })()}
              </div>

              <Collapsible defaultOpen={!!brandProfileId}>
                <CollapsibleTrigger className="flex items-center gap-2 group cursor-pointer">
                  <p className="section-label">Brand Profile</p>
                  <span className="text-[10px] text-muted-foreground">(optional)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2">
                  {brandProfilesLoading ? (
                    <div className="h-12 rounded-xl bg-muted animate-pulse" />
                  ) : (
                    <Select value={brandProfileId} onValueChange={setBrandProfileId}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select brand profile (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {brandProfiles.length === 0 ? (
                          <div className="px-3 py-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">No profiles yet</p>
                            <a href="/app/brand-profiles" className="text-xs text-primary hover:underline">Create one →</a>
                          </div>
                        ) : (
                          brandProfiles.map(bp => (
                            <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {brandProfileId && !brandProfilesLoading && (() => {
                    const bp = brandProfiles.find(p => p.id === brandProfileId);
                    if (!bp) return null;
                    return (
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/50 border border-border/50 max-w-md">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Settings2 className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{bp.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{bp.tone} · {bp.color_temperature}</p>
                        </div>
                      </div>
                    );
                  })()}
                </CollapsibleContent>
              </Collapsible>

              <div className="flex items-center gap-1.5 pt-2">
                <ArrowRight className="w-3 h-3 text-muted-foreground/40" />
                <p className="text-[11px] text-muted-foreground/60">Next: Select products</p>
              </div>
            </div>
          )}

          {/* ─── Step 1: Products ─── */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              {productsLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                    <div key={i} className="rounded-xl border-2 border-border p-1.5">
                      <div className="aspect-square rounded-lg bg-muted animate-pulse mb-1" />
                      <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border">
                  <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">No products yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Add products first, then come back to create your drop.</p>
                  <Button variant="outline" onClick={() => navigate('/app/products')}>Go to Products</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="pl-10 h-12 rounded-xl" />
                    </div>
                    <div className="flex border rounded-lg overflow-hidden flex-shrink-0">
                      <button onClick={() => setProductViewMode('grid')} className={cn('p-2.5 transition-colors', productViewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted')} title="Grid view">
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button onClick={() => setProductViewMode('list')} className={cn('p-2.5 transition-colors', productViewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted')} title="List view">
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="rounded-full px-3 py-1">{selectedProductIds.size} selected</Badge>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setSelectedProductIds(new Set(filteredProducts.map(p => p.id)))}>Select All</Button>
                    {selectedProductIds.size > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-muted-foreground" onClick={() => setSelectedProductIds(new Set())}>Clear</Button>
                    )}
                  </div>
                  {attempted && selectedProductIds.size === 0 && (
                    <p className="text-xs text-destructive">Select at least one product</p>
                  )}

                  {productViewMode === 'grid' && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {filteredProducts.map(product => {
                        const isSelected = selectedProductIds.has(product.id);
                        return (
                          <button
                            key={product.id}
                            onClick={() => {
                              const next = new Set(selectedProductIds);
                              isSelected ? next.delete(product.id) : next.add(product.id);
                              setSelectedProductIds(next);
                            }}
                            className={cn(
                              'relative rounded-xl border-2 p-1.5 transition-all text-left group',
                              isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40 hover:shadow-sm bg-card'
                            )}
                          >
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-1">
                              <img src={getOptimizedUrl(product.image_url, { quality: 60 })} alt={product.title} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                            </div>
                            <p className="text-[11px] font-medium truncate px-0.5">{product.title}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {productViewMode === 'list' && (
                    <div className="space-y-2">
                      {filteredProducts.map(product => {
                        const isSelected = selectedProductIds.has(product.id);
                        return (
                          <button
                            key={product.id}
                            onClick={() => {
                              const next = new Set(selectedProductIds);
                              isSelected ? next.delete(product.id) : next.add(product.id);
                              setSelectedProductIds(next);
                            }}
                            className={cn(
                              'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                              isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40 hover:shadow-sm bg-card'
                            )}
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img src={getOptimizedUrl(product.image_url, { quality: 60 })} alt={product.title} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                            </div>
                            <span className="text-sm font-medium flex-1 truncate">{product.title}</span>
                            <div className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                              isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                            )}>
                              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {filteredProducts.length === 0 && productSearch && (
                    <div className="text-center py-8 rounded-2xl bg-muted/30">
                      <p className="text-sm text-muted-foreground">No products match "{productSearch}"</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─── Step 2: Select & Configure Workflow ─── */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight">Choose a Workflow</h3>
                  <p className="text-xs text-muted-foreground">Select one visual style, then configure it below.</p>
                </div>
              </div>

              {attempted && !selectedWorkflowId && (
                <p className="text-xs text-destructive">Select a workflow</p>
              )}

              {/* Workflow cards — single select */}
              {workflowsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border">
                      <div className="w-14 h-14 rounded-xl bg-muted animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                        <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {workflows.map(wf => {
                    const isSelected = selectedWorkflowId === wf.id;
                    const needsModels = wf.uses_tryon || (wf.generation_config as any)?.ui_config?.show_model_picker;
                    const variations = (wf.generation_config as any)?.variation_strategy?.variations || [];

                    return (
                      <button
                        key={wf.id}
                        onClick={() => handleSelectWorkflow(wf.id)}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/40 hover:shadow-sm bg-card'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{wf.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{wf.description}</p>
                          <div className="flex gap-1.5 mt-1.5">
                            {needsModels && <Badge variant="secondary" className="text-[10px] rounded-full px-1.5 py-0">Model</Badge>}
                            {(() => {
                              const wfUsesVariationsOnly = !wf.uses_tryon && variations.length > 0;
                              const wfSceneCount = wfUsesVariationsOnly
                                ? variations.length
                                : (() => {
                                    const isOnModel = wf.uses_tryon;
                                    const filterFn = (p: any) => isOnModel ? ON_MODEL_CATEGORIES.includes(p.category) : !ON_MODEL_CATEGORIES.includes(p.category);
                                    return filterVisible(mockTryOnPoses).filter(filterFn).length + customScenePoses.filter(filterFn).length;
                                  })();
                              return wfSceneCount > 0 ? <Badge variant="secondary" className="text-[10px] rounded-full px-1.5 py-0">{wfSceneCount} scenes</Badge> : null;
                            })()}
                          </div>
                        </div>
                        <div className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                        )}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Inline Config Panel (shown when workflow selected) ── */}
              {selectedWorkflow && (() => {
                const wf = selectedWorkflow;
                const genConfig = wf.generation_config as any;
                const variations = genConfig?.variation_strategy?.variations || [];
                const uiConfig = genConfig?.ui_config;
                const needsModels = wf.uses_tryon || uiConfig?.show_model_picker;
                const wfCustomSettings = uiConfig?.custom_settings || [];
                const lockAspectRatio = uiConfig?.lock_aspect_ratio;
                const showPosePicker = uiConfig?.show_pose_picker;
                const showCampaignMode = !isPerspectives && (needsModels || variations.length > 0);
                const isMixMode = campaignMode === 'mix';

                return (
                  <div className="space-y-8 pt-4 border-t border-border/50 animate-fade-in">
                    {/* Campaign Mode Selector */}
                    {showCampaignMode && (
                      <div className="space-y-3">
                        <p className="section-label">Campaign Mode</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setCampaignMode('curated');
                              setIsRandomModelsFlag(false);
                              setIsRandomScenesFlag(false);
                            }}
                            className={cn(
                              'relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center',
                              campaignMode === 'curated'
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-primary/30 bg-card'
                            )}
                          >
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center',
                              campaignMode === 'curated' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                            )}>
                              <Settings2 className="w-5 h-5" />
                            </div>
                            <div>
                              <p className={cn('text-sm font-semibold', campaignMode === 'curated' && 'text-primary')}>Curated</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">Pick specific models & scenes</p>
                            </div>
                            {campaignMode === 'curated' && (
                              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setCampaignMode('mix');
                              setIsRandomModelsFlag(true);
                              setIsRandomScenesFlag(true);
                            }}
                            className={cn(
                              'relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center',
                              campaignMode === 'mix'
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-primary/30 bg-card'
                            )}
                          >
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center',
                              campaignMode === 'mix' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                            )}>
                              <Shuffle className="w-5 h-5" />
                            </div>
                            <div>
                              <p className={cn('text-sm font-semibold', campaignMode === 'mix' && 'text-primary')}>Mix</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">Auto-diverse models & scenes</p>
                            </div>
                            {campaignMode === 'mix' && (
                              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        </div>
                        {isMixMode && (
                          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
                            <Shuffle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">
                              The system will automatically select diverse models and scenes for each image, maximizing variety across your drop.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* ── Models — shown first (pick who wears it) ── */}
                    {needsModels && !isMixMode && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="section-label">Models</p>
                          <Badge variant="secondary" className="text-[10px] rounded-full">
                            {isRandomModelsFlag ? <><Shuffle className="w-3 h-3 mr-0.5 inline" />Random</> : `${modelSelections.length} selected`}
                          </Badge>
                        </div>


                        {(
                          <>
                            {modelSelections.length > 0 && (
                              <div className="flex justify-end">
                                <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setModelSelections([])}>
                                  Clear
                                </button>
                              </div>
                            )}
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                              {allModels.map(m => {
                                const isModelSelected = modelSelections.includes(m.id);
                                return (
                                  <button
                                    key={m.id}
                                    onClick={() => {
                                      setModelSelections(prev =>
                                        isModelSelected ? prev.filter(id => id !== m.id) : [...prev, m.id]
                                      );
                                    }}
                                    className={cn(
                                      'relative rounded-xl overflow-hidden border-2 transition-all',
                                      isModelSelected ? 'border-primary ring-1 ring-primary/20 shadow-sm' : 'border-border hover:border-primary/30'
                                    )}
                                  >
                                    <div className="aspect-[3/4] w-full bg-muted overflow-hidden">
                                      <ShimmerImage src={getOptimizedUrl(m.image_url, { quality: 60 })} alt={m.name} className="w-full h-full object-cover" aspectRatio="3/4" />
                                    </div>
                                    {isModelSelected && (
                                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                        <Check className="w-3 h-3 text-primary-foreground" />
                                      </div>
                                    )}
                                    <div className="px-1.5 py-1.5">
                                      <p className={cn(
                                        'text-[11px] truncate text-center font-medium',
                                        isModelSelected ? 'text-primary' : 'text-foreground'
                                      )}>{m.name}</p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            {modelSelections.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {modelSelections.length} model{modelSelections.length !== 1 ? 's' : ''} selected — each model generates with every selected scene
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* ── Scenes: Workflow Variations (non-try-on) ── */}
                    {useVariationsAsScenes && !isMixMode && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="section-label">{isFlatLay ? 'Surfaces' : isPerspectives ? 'Angles' : 'Scenes'}</p>
                          {selectedVariationIndices.size > 0 && (
                            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setSelectedVariationIndices(new Set())}>
                              Clear ({selectedVariationIndices.size})
                            </button>
                          )}
                        </div>

                        {/* Mirror Selfie Tips */}
                        {isMirrorSelfie && (
                          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
                            <Smartphone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p className="font-semibold text-foreground">Mirror Selfie Composition</p>
                              <ul className="space-y-0.5 list-disc list-inside">
                                <li>Model appears holding a smartphone, capturing their reflection</li>
                                <li>Each scene places your product in a different mirror setting</li>
                                <li>4:5 portrait recommended for Instagram</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        <div className={cn(
                          "grid gap-3",
                          (isMirrorSelfie || isSelfieUgc) ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                        )}>
                          {variations.map((v: any, i: number) => {
                            const isSelected = selectedVariationIndices.has(i);
                            const hasPreview = !!v.preview_url;
                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  setSelectedVariationIndices(prev => {
                                    const next = new Set(prev);
                                    if (next.has(i)) next.delete(i);
                                    else next.add(i);
                                    return next;
                                  });
                                }}
                                className={cn(
                                  'relative rounded-xl overflow-hidden border-2 transition-all text-left',
                                  isSelected ? 'border-primary ring-1 ring-primary/20 shadow-sm' : 'border-border hover:border-primary/30'
                                )}
                              >
                                <div className={cn("relative", (isMirrorSelfie || isSelfieUgc) ? "aspect-[9/16]" : "aspect-square")}>
                                  {hasPreview ? (
                                    <ShimmerImage
                                      src={getOptimizedUrl(v.preview_url, { quality: 60 })}
                                      alt={v.label}
                                      className="w-full h-full object-cover"
                                      aspectRatio={(isMirrorSelfie || isSelfieUgc) ? "9/16" : "1/1"}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                      <Package className="w-8 h-8 text-muted-foreground/40" />
                                    </div>
                                  )}
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 pt-6">
                                    <p className="text-[11px] font-semibold text-white leading-tight">{v.label}</p>
                                    {v.category && <span className="text-[9px] text-white/60 font-medium">{v.category}</span>}
                                  </div>
                                  {isSelected && (
                                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                      <Check className="w-3 h-3 text-primary-foreground" />
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {selectedVariationIndices.size > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {selectedVariationIndices.size} {isFlatLay ? 'surface' : isPerspectives ? 'angle' : 'scene'}{selectedVariationIndices.size !== 1 ? 's' : ''} selected
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── Scenes: Full Library (Try-On only) ── */}
                    {!useVariationsAsScenes && (needsModels || showPosePicker) && !isMixMode && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="section-label">Scenes</p>
                          {poseSelections.length > 0 && (
                            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setPoseSelections([])}>
                              Clear ({poseSelections.length})
                            </button>
                          )}
                        </div>
                        <div className="space-y-4">
                          {sceneCategories.map(cat => {
                            const catPoses = allScenePoses.filter(p => p.category === cat);
                            if (catPoses.length === 0) return null;
                            return (
                              <div key={cat}>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 mb-1.5 px-1">
                                  {poseCategoryLabels[cat as keyof typeof poseCategoryLabels] || cat}
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                  {catPoses.map(pose => {
                                    const isPoseSelected = poseSelections.includes(pose.poseId);
                                    return (
                                      <button
                                        key={pose.poseId}
                                        onClick={() => {
                                          setPoseSelections(prev =>
                                            isPoseSelected ? prev.filter(id => id !== pose.poseId) : [...prev, pose.poseId]
                                          );
                                        }}
                                        className={cn(
                                          'relative rounded-xl overflow-hidden border-2 transition-all',
                                          isPoseSelected ? 'border-primary ring-1 ring-primary/20 shadow-sm' : 'border-border hover:border-primary/30'
                                        )}
                                      >
                                        <div className="aspect-[4/5] w-full bg-muted overflow-hidden">
                                          <ShimmerImage src={getOptimizedUrl(pose.optimizedImageUrl || pose.previewUrl, { quality: 60 })} alt={pose.name} className="w-full h-full object-cover" aspectRatio="4/5" />
                                        </div>
                                        {isPoseSelected && (
                                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                            <Check className="w-3 h-3 text-primary-foreground" />
                                          </div>
                                        )}
                                        <div className="px-1.5 py-1.5">
                                          <p className="text-[11px] text-foreground truncate text-center font-medium">{pose.name}</p>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {poseSelections.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {poseSelections.length} scene{poseSelections.length !== 1 ? 's' : ''} selected — each scene generates with every selected model
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── Product Listing: Product Angles ── */}
                    {isProductListing && !isMixMode && (
                      <div className="space-y-3">
                        <p className="section-label">Product Angles</p>
                        <p className="text-xs text-muted-foreground">Generate multiple angles per product for a complete listing</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {([
                            { key: 'front' as const, label: 'Front Only', multiplier: '×1' },
                            { key: 'front-side' as const, label: 'Front + Side', multiplier: '×2' },
                            { key: 'front-back' as const, label: 'Front + Back', multiplier: '×2' },
                            { key: 'all' as const, label: 'All Angles', multiplier: '×3' },
                          ]).map(opt => (
                            <button
                              key={opt.key}
                              onClick={() => setProductAngle(opt.key)}
                              className={cn(
                                'px-3 py-3 rounded-xl border-2 text-left transition-all',
                                productAngle === opt.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card'
                              )}
                            >
                              <p className={cn('text-sm font-medium', productAngle === opt.key && 'text-primary')}>{opt.label}</p>
                              <Badge variant="secondary" className="text-[10px] rounded-full mt-1">{opt.multiplier}</Badge>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Custom Settings ── */}
                    {wfCustomSettings.length > 0 && (
                      <div className="space-y-4">
                        <p className="section-label">Settings</p>
                        {wfCustomSettings.map((setting: any) => (
                          <div key={setting.label} className="space-y-2">
                            <p className="text-sm font-medium text-foreground">{setting.label}</p>
                            {setting.type === 'select' && setting.options && (
                              <div className="flex flex-wrap gap-2">
                                {setting.options.map((optVal: string) => (
                                  <button
                                    key={optVal}
                                    onClick={() => setCustomSettings(prev => ({ ...prev, [setting.label]: optVal }))}
                                    className={cn(
                                      'px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                                      (customSettings[setting.label] || setting.options?.[0]) === optVal
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border hover:border-primary/30 text-muted-foreground bg-card'
                                    )}
                                  >
                                    {optVal}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── UGC Mood ── */}
                    {(isSelfieUgc || isMirrorSelfie) && (
                      <div className="space-y-3">
                        <p className="section-label">UGC Mood</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'excited', emoji: '🤩', label: 'Excited', desc: '"OMG I love this!" energy' },
                            { id: 'chill', emoji: '😌', label: 'Chill', desc: 'Everyday casual vibe' },
                            { id: 'confident', emoji: '😎', label: 'Confident', desc: '"I know what works" energy' },
                            { id: 'surprised', emoji: '😲', label: 'Surprised', desc: '"Wait, this actually works?!"' },
                            { id: 'focused', emoji: '🧐', label: 'Focused', desc: 'Tutorial / demo mode' },
                          ].map(mood => {
                            const isSelected = customSettings['Mood'] === mood.id;
                            return (
                              <button
                                key={mood.id}
                                onClick={() => setCustomSettings(prev => ({ ...prev, Mood: mood.id }))}
                                className={cn(
                                  'flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-left transition-all',
                                  isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card'
                                )}
                              >
                                <span className="text-lg">{mood.emoji}</span>
                                <div>
                                  <p className={cn('text-sm font-medium', isSelected && 'text-primary')}>{mood.label}</p>
                                  <p className="text-[10px] text-muted-foreground">{mood.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── Flat Lay: Composition & Aesthetics ── */}
                    {isFlatLay && (
                      <>
                        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/50">
                          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Flat lay works best with <strong>small / medium products</strong> — accessories, cosmetics, packaged food, stationery.</p>
                            <p>Oversized items (furniture, appliances) may not render naturally in a top-down arrangement.</p>
                          </div>
                        </div>

                        {/* Composition Style */}
                        <div className="space-y-3">
                          <p className="section-label">Composition Style</p>
                          <div className="grid grid-cols-2 gap-3">
                            {([
                              { key: 'clean' as const, label: 'Products Only', desc: 'Clean layout with just your products' },
                              { key: 'decorated' as const, label: 'Add Styling Props', desc: 'Include decorative elements around products' },
                            ]).map(opt => (
                              <button
                                key={opt.key}
                                onClick={() => {
                                  setFlatLayPropStyle(opt.key);
                                  if (opt.key === 'clean') { setSelectedAesthetics([]); setStylingNotes(''); }
                                }}
                                className={cn(
                                  'p-4 rounded-xl border-2 text-left transition-all',
                                  flatLayPropStyle === opt.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card'
                                )}
                              >
                                <p className={cn('text-sm font-semibold', flatLayPropStyle === opt.key && 'text-primary')}>{opt.label}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{opt.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Aesthetic quick-chips — only when decorated */}
                        {flatLayPropStyle === 'decorated' && (
                          <div className="space-y-3">
                            <p className="section-label">Styling & Aesthetics</p>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { id: 'minimal', label: 'Minimal', hint: 'Clean, few props, whitespace' },
                                { id: 'botanical', label: 'Botanical', hint: 'Greenery accents, dried flowers' },
                                { id: 'coffee-books', label: 'Coffee & Books', hint: 'Cup, open pages' },
                                { id: 'textured', label: 'Textured', hint: 'Linen, kraft paper, washi tape' },
                                { id: 'soft-glam', label: 'Soft Glam', hint: 'Silk ribbon, dried petals' },
                                { id: 'cozy', label: 'Cozy', hint: 'Knit blanket, candle, warm tones' },
                              ].map(aesthetic => {
                                const isAesthActive = selectedAesthetics.includes(aesthetic.id);
                                return (
                                  <button
                                    key={aesthetic.id}
                                    onClick={() => setSelectedAesthetics(prev =>
                                      isAesthActive ? prev.filter(x => x !== aesthetic.id) : [...prev, aesthetic.id]
                                    )}
                                    className={cn(
                                      'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                                      isAesthActive ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground hover:border-primary/40'
                                    )}
                                    title={aesthetic.hint}
                                  >
                                    {aesthetic.label}
                                  </button>
                                );
                              })}
                            </div>
                            <Textarea
                              placeholder="Styling notes: e.g. eucalyptus leaves, silk ribbon, warm tones..."
                              value={stylingNotes}
                              onChange={e => setStylingNotes(e.target.value)}
                              rows={2}
                              className="rounded-xl text-sm"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* ── Aspect Ratios ── */}
                    <div className="space-y-3">
                      <p className="section-label">Aspect Ratios</p>
                      {lockAspectRatio ? (
                        <Badge variant="outline" className="text-xs rounded-full">1:1 (fixed)</Badge>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {ASPECT_RATIOS.map(ar => {
                            const isFormatSelected = formats.includes(ar.id);
                            return (
                              <button
                                key={ar.id}
                                onClick={() => {
                                  if (isFormatSelected) {
                                    if (formats.length <= 1) return;
                                    setFormats(formats.filter(f => f !== ar.id));
                                  } else {
                                    setFormats([...formats, ar.id]);
                                  }
                                }}
                                className={cn(
                                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                                  isFormatSelected
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border hover:border-primary/30 text-muted-foreground bg-card'
                                )}
                              >
                                <div
                                  className={cn('rounded-[3px] border-2', isFormatSelected ? 'border-primary' : 'border-muted-foreground/40')}
                                  style={{ width: `${Math.round(ar.w / Math.max(ar.w, ar.h) * 16)}px`, height: `${Math.round(ar.h / Math.max(ar.w, ar.h) * 16)}px` }}
                                />
                                {ar.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {formats.length > 1 && (
                        <p className="text-xs text-muted-foreground">Each additional format multiplies the credit cost.</p>
                      )}
                    </div>

                    {/* ── Framing (multi-select) — only for workflows with models ── */}
                    {needsModels && !isMixMode && (
                      <FramingMultiSelector
                        selectedFramings={selectedFramings}
                        onSelectedFramingsChange={setSelectedFramings}
                      />
                    )}

                    {/* ── Images per Product (Mix mode only) ── */}
                    {isMixMode && (
                      <div className="space-y-3">
                        <p className="section-label">Images per Product</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {IMAGE_PRESETS.map(n => (
                            <Button
                              key={n}
                              variant={imageCount === n && !customImageCountStr ? 'default' : 'outline'}
                              onClick={() => {
                                setImageCount(n);
                                setCustomImageCountStr('');
                                markDirty();
                              }}
                              className="h-11 rounded-xl"
                            >
                              {n}
                            </Button>
                          ))}
                        </div>
                        <Input
                          type="number"
                          placeholder="Custom amount"
                          value={customImageCountStr}
                          onChange={e => {
                            setCustomImageCountStr(e.target.value);
                            const val = parseInt(e.target.value);
                            if (val > 0) {
                              setImageCount(val);
                              markDirty();
                            }
                          }}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    )}

                    {/* ── Freestyle prompts ── */}
                    <Collapsible open={includeFreestyle} onOpenChange={setIncludeFreestyle}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch checked={includeFreestyle} onCheckedChange={setIncludeFreestyle} />
                          <div>
                            <p className="text-sm font-medium">Freestyle Prompts</p>
                            <p className="text-xs text-muted-foreground">Add custom text prompts alongside the workflow</p>
                          </div>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronDown className={cn('w-4 h-4 transition-transform', includeFreestyle && 'rotate-180')} />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="pt-4 space-y-3">
                        {freestylePrompts.map((prompt, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              placeholder={`Prompt ${idx + 1}, e.g. "Model wearing product in a modern kitchen"`}
                              value={prompt}
                              onChange={e => {
                                const next = [...freestylePrompts];
                                next[idx] = e.target.value;
                                setFreestylePrompts(next);
                              }}
                              className="h-10 rounded-xl text-base sm:text-sm flex-1"
                            />
                            {freestylePrompts.length > 1 && (
                              <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-destructive" onClick={() => setFreestylePrompts(prev => prev.filter((_, i) => i !== idx))}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {freestylePrompts.length < 5 && (
                          <Button variant="outline" size="sm" className="text-xs rounded-full" onClick={() => setFreestylePrompts(prev => [...prev, ''])}>
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Prompt
                          </Button>
                        )}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* ── Credit Summary (Curated: matrix breakdown, Mix: simple) ── */}
                    {(() => {
                      const productCount = selectedProductIds.size;
                      const totalImages = productCount * computedImageCount;
                      const totalCredits = totalImages * 6;
                      const framingCount = selectedFramings.has('auto') ? 1 : selectedFramings.size;
                      return (
                        <Card className="p-4 bg-muted/30 border-dashed space-y-2">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm font-semibold">Credit Estimate</p>
                          </div>
                          {!isMixMode ? (
                            <p className="text-xs text-muted-foreground">
                              {(() => {
                                const effectiveScenes = useVariationsAsScenes
                                  ? Math.max(selectedVariationIndices.size, 1)
                                  : Math.max(poseSelections.length, 1);
                                const modelCount = needsModels ? Math.max(modelSelections.length, 1) : 1;
                                const formatCount = Math.max(formats.length, 1);
                                const angleMultiplier = isProductListing ? (productAngle === 'all' ? 3 : productAngle === 'front' ? 1 : 2) : 1;
                                const parts: string[] = [];
                                if (effectiveScenes > 1) parts.push(`${effectiveScenes} ${isFlatLay ? 'surface' : isPerspectives ? 'angle' : 'scene'}${effectiveScenes !== 1 ? 's' : ''}`);
                                if (needsModels) parts.push(`${modelCount} model${modelCount !== 1 ? 's' : ''}`);
                                if (formatCount > 1) parts.push(`${formatCount} format${formatCount !== 1 ? 's' : ''}`);
                                if (framingCount > 1) parts.push(`${framingCount} framing${framingCount !== 1 ? 's' : ''}`);
                                if (angleMultiplier > 1) parts.push(`${angleMultiplier} angles`);
                                const formula = parts.length > 0 ? parts.join(' × ') + ' = ' : '';
                                return <>{formula}<span className="font-semibold text-foreground">{computedImageCount} image{computedImageCount !== 1 ? 's' : ''}</span> per product</>;
                              })()}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {productCount} product{productCount !== 1 ? 's' : ''} × {computedImageCount} image{computedImageCount !== 1 ? 's' : ''} = <span className="font-medium text-foreground">{totalImages} images</span>
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {totalImages} × 6 credits = <span className="font-semibold text-foreground">{totalCredits} credits</span>
                          </p>
                        </Card>
                      );
                    })()}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─── Step 3: Launch (Delivery + Review merged) ─── */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              {/* Delivery */}
              <div className="space-y-3">
                <p className="section-label">Delivery</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryMode('now')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center',
                      deliveryMode === 'now' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 bg-card hover:shadow-sm'
                    )}
                  >
                    <RocketIcon className={cn('w-5 h-5', deliveryMode === 'now' ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-sm font-semibold">Generate Now</span>
                    <span className="text-xs text-muted-foreground">Run immediately</span>
                  </button>
                  <button
                    onClick={() => setDeliveryMode('scheduled')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center',
                      deliveryMode === 'scheduled' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 bg-card hover:shadow-sm'
                    )}
                  >
                    <CalendarIcon className={cn('w-5 h-5', deliveryMode === 'scheduled' ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-sm font-semibold">Schedule</span>
                    <span className="text-xs text-muted-foreground">Set a future date</span>
                  </button>
                </div>
              </div>

              {deliveryMode === 'scheduled' && (
                <div className="space-y-3">
                  <p className="section-label">Start Date</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 rounded-xl justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <p className="section-label pt-2">Repeat Frequency</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'none', label: 'Do Not Repeat' },
                      { id: 'weekly', label: 'Weekly' },
                      { id: 'biweekly', label: 'Every 2 Weeks' },
                      { id: 'monthly', label: 'Monthly' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFrequency(f.id)}
                        className={cn(
                          'px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                          frequency === f.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/30 text-muted-foreground bg-card'
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {profile?.credits_renewed_at && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-muted/40">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">Credits renew on {format(new Date(profile.credits_renewed_at), 'MMM d')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Special Instructions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="section-label">Special Instructions</p>
                  {seasonalPreset !== 'none' && (
                    <Badge variant="secondary" className="text-[10px] rounded-full">{activePreset?.label} preset applied</Badge>
                  )}
                </div>
                <Textarea
                  placeholder="Any specific mood, style, or seasonal directions for this drop..."
                  value={themeNotes}
                  onChange={e => setThemeNotes(e.target.value)}
                  rows={3}
                  className="rounded-xl text-base sm:text-sm"
                />
              </div>

              <Separator />

              {/* Review Summary */}
              {profile?.credits_balance != null && costEstimate.totalCredits > profile.credits_balance && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        You need {costEstimate.totalCredits - profile.credits_balance} more credits
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        This drop costs <strong>{costEstimate.totalCredits}</strong> credits — you have <strong>{profile.credits_balance}</strong>.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 ml-8">
                    <Button size="sm" className="rounded-full h-8 px-4 text-xs gap-1.5" onClick={() => setNoCreditsOpen(true)}>
                      <CreditCard className="w-3.5 h-3.5" /> Buy Credits
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full h-8 px-3 text-xs text-muted-foreground" asChild>
                      <a href="/app/settings">Upgrade Plan</a>
                    </Button>
                  </div>
                </div>
              )}

              <Card className="rounded-2xl border-2 border-primary/20 bg-primary/[0.03] shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  {deliveryMode === 'now' ? (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <RocketIcon className="w-5 h-5 text-primary" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      {deliveryMode === 'now' ? 'Generates immediately after creation' : `First drop: ${startDate ? format(startDate, 'MMM d, yyyy') : '—'}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {deliveryMode === 'now' ? 'One-time generation — credits deducted now' : `Then every ${frequency.replace('-', ' ')} — credits deducted per drop`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-semibold">{name}</span>
                    {activePreset && <Badge variant="secondary" className="text-[10px] rounded-full ml-auto">{activePreset.label}</Badge>}
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Products</p>
                      <p className="font-semibold">{selectedProductIds.size} selected</p>
                      {products.filter(p => selectedProductIds.has(p.id)).length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {products.filter(p => selectedProductIds.has(p.id)).slice(0, 6).map(p => (
                            <div key={p.id} className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                              <img src={getOptimizedUrl(p.image_url, { quality: 60 })} alt={p.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                            </div>
                          ))}
                          {selectedProductIds.size > 6 && (
                            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0 text-[10px] font-medium text-muted-foreground">
                              +{selectedProductIds.size - 6}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Workflow</p>
                      <p className="font-semibold">{selectedWorkflow?.name || '—'}</p>
                    </div>
                  </div>
                  {includeFreestyle && freestylePrompts.filter(p => p.trim()).length > 0 && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1.5">Freestyle Prompts</p>
                      <div className="space-y-1">
                        {freestylePrompts.filter(p => p.trim()).map((p, i) => (
                          <p key={i} className="text-xs text-muted-foreground">• {p}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {themeNotes && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Instructions</p>
                      <p className="text-sm">{themeNotes}</p>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold">Estimated Cost</p>
                      <p className="text-xs text-muted-foreground">per drop</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold tracking-tight">{costEstimate.totalCredits} credits</p>
                      {deliveryMode === 'scheduled' && (
                        <p className="text-xs text-muted-foreground">~{costEstimate.monthlyProjection}/mo</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Workflow summary */}
              {selectedWorkflow && (() => {
                const wf = selectedWorkflow;
                const needsModels = wf.uses_tryon || (wf.generation_config as any)?.ui_config?.show_model_picker;
                const settingEntries = Object.entries(customSettings);

                return (
                  <div className="p-3 rounded-xl bg-card border space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="font-medium flex-1">{wf.name}</span>
                      <div className="flex gap-1">
                        {formats.map(f => (
                          <Badge key={f} variant="outline" className="text-xs rounded-full">{f}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-6">
                      <Badge variant="secondary" className="text-[10px] rounded-full">
                        {computedImageCount} img × {selectedProductIds.size} prod
                      </Badge>
                      {poseSelections.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] rounded-full">
                          {campaignMode === 'mix' ? <><Shuffle className="w-3 h-3 mr-0.5 inline" />Auto scenes</> : <>{poseSelections.length} scene{poseSelections.length !== 1 ? 's' : ''}</>}
                        </Badge>
                      )}
                      {needsModels && (
                        <Badge variant="secondary" className="text-[10px] rounded-full">
                          {campaignMode === 'mix' ? <><Shuffle className="w-3 h-3 mr-0.5 inline" />Auto models</> : <>{modelSelections.length} model{modelSelections.length !== 1 ? 's' : ''}</>}
                        </Badge>
                      )}
                      {settingEntries.map(([k, v]) => (
                        <Badge key={k} variant="outline" className="text-[10px] rounded-full">{k}: {String(v)}</Badge>
                      ))}
                    </div>
                    {needsModels && !isRandomModelsFlag && modelSelections.length > 0 && (
                      <div className="flex gap-1 pl-6 flex-wrap">
                        {modelSelections.slice(0, 6).map(mId => {
                          const model = allModels.find(m => m.id === mId);
                          return model ? (
                            <div key={mId} className="w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0">
                              <img src={getOptimizedUrl(model.image_url, { quality: 60 })} alt={model.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                            </div>
                          ) : null;
                        })}
                        {modelSelections.length > 6 && (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-[8px] font-medium text-muted-foreground">
                            +{modelSelections.length - 6}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="pt-6 mt-4 pb-16 space-y-2 sm:border-t sm:pt-4 sm:mt-0 sm:pb-0">
        {validationHint && (
          <p className="text-[11px] text-destructive animate-fade-in text-center sm:hidden">{validationHint}</p>
        )}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={step === 0 ? () => { if (isDirty) setShowExitDialog(true); else onClose(); } : handleBack}
            className="rounded-full min-h-[44px] h-11 px-5 sm:px-6"
          >
            {step === 0 ? 'Cancel' : <><ArrowLeft className="w-4 h-4 mr-1.5" /> Back</>}
          </Button>

          {validationHint && (
            <p className="hidden sm:block text-[11px] text-destructive animate-fade-in">{validationHint}</p>
          )}

          {!isLastStep ? (
            <Button
              onClick={handleNext}
              className="rounded-full min-h-[44px] h-11 px-5 sm:px-6 gap-1.5"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || (deliveryMode === 'now' && insufficientCredits)}
              className="rounded-full min-h-[44px] h-11 px-5 sm:px-6 gap-1.5"
            >
              {saveMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {deliveryMode === 'now' && !editingScheduleId ? 'Launching Drop...' : editingScheduleId ? 'Saving...' : 'Creating...'}</>
                : (deliveryMode === 'now' && insufficientCredits)
                  ? <><Wallet className="w-4 h-4" /> Not Enough Credits</>
                  : editingScheduleId ? 'Save Changes' : deliveryMode === 'now' ? 'Generate Now' : 'Create Schedule'
              }
            </Button>
          )}
        </div>
      </div>
      {/* Unsaved changes guard */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>You have unsaved changes. Are you sure you want to leave?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={onClose} className="rounded-full">Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
