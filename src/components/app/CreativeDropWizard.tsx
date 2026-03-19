import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  ArrowLeft, ArrowRight, Check, CalendarIcon,
  Sparkles, Search, Loader2,
  Zap, CreditCard, Clock, RocketIcon, Repeat, Plus, Trash2, ChevronDown, Package, Info,
  LayoutGrid, List, Shuffle, Leaf, Sun, Snowflake, Heart, ShoppingBag, GraduationCap, TreePine,
  Settings2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { calculateDropCredits, type WorkflowCostConfig } from '@/lib/dropCreditCalculator';
import type { Workflow } from '@/types/workflow';
import { useNavigate } from 'react-router-dom';
import { mockModels, mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';

const WORKFLOW_FALLBACK_IMAGES: Record<string, string> = {
  'Product Listing Set': getLandingAssetUrl('workflows/workflow-product-listing.jpg'),
  'Selfie / UGC Set': getLandingAssetUrl('workflows/workflow-selfie-ugc.jpg'),
  'Flat Lay Set': getLandingAssetUrl('workflows/workflow-flat-lay.jpg'),
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
}

interface CreativeDropWizardProps {
  onClose: () => void;
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

const fashionPoses = mockTryOnPoses.filter(p =>
  ['studio', 'lifestyle', 'editorial', 'streetwear'].includes(p.category)
);

const mockModelItems = mockModels.map(m => ({
  id: m.modelId,
  name: m.name,
  image_url: m.previewUrl,
}));

interface UserProduct {
  id: string;
  title: string;
  image_url: string;
  product_type: string;
}

export function CreativeDropWizard({ onClose, initialData, editingScheduleId }: CreativeDropWizardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [attempted, setAttempted] = useState(false);

  // Step 1: Details
  const [name, setName] = useState(initialData?.name || '');
  const [theme, setTheme] = useState(initialData?.theme || 'custom');
  const [themeNotes, setThemeNotes] = useState(initialData?.themeNotes || '');
  const [brandProfileId, setBrandProfileId] = useState(initialData?.brandProfileId || '');
  const [seasonalPreset, setSeasonalPreset] = useState('none');

  // Step 2: Products
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(initialData?.selectedProductIds || [])
  );
  const [productSearch, setProductSearch] = useState('');
  const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');

  // Step 3: Workflow selection
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<string>>(
    new Set(initialData?.selectedWorkflowIds || [])
  );
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(initialData?.selectedModelIds || []);
  const [workflowFormats, setWorkflowFormats] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    if (initialData?.workflowFormats) {
      for (const [k, v] of Object.entries(initialData.workflowFormats)) {
        init[k] = Array.isArray(v) ? v : [v];
      }
    }
    return init;
  });

  // Per-workflow scene, model, pose, and custom settings
  const [workflowSceneSelections, setWorkflowSceneSelections] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    if (initialData?.workflowSceneSelections) {
      for (const [wfId, scenes] of Object.entries(initialData.workflowSceneSelections)) {
        init[wfId] = new Set(scenes);
      }
    }
    return init;
  });
  const [workflowModelSelections, setWorkflowModelSelections] = useState<Record<string, string[]>>(
    initialData?.workflowModelSelections || {}
  );
  const [workflowPoseSelections, setWorkflowPoseSelections] = useState<Record<string, string[]>>(
    initialData?.workflowPoseSelections || {}
  );
  const [workflowCustomSettings, setWorkflowCustomSettings] = useState<Record<string, Record<string, string>>>(
    initialData?.workflowCustomSettings || {}
  );

  const [randomModels, setRandomModels] = useState<Record<string, boolean>>({});
  const [randomScenes, setRandomScenes] = useState<Record<string, boolean>>({});

  // Freestyle
  const [includeFreestyle, setIncludeFreestyle] = useState(initialData?.includeFreestyle || false);
  const [freestylePrompts, setFreestylePrompts] = useState<string[]>(
    initialData?.freestylePrompts?.length ? initialData.freestylePrompts : ['']
  );

  // Schedule
  const [deliveryMode, setDeliveryMode] = useState<'now' | 'scheduled'>(initialData?.deliveryMode || 'now');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [frequency, setFrequency] = useState(initialData?.frequency || 'monthly');
  const [imagesPerDrop, setImagesPerDrop] = useState(initialData?.imagesPerDrop || 25);
  const [customImageCount, setCustomImageCount] = useState('');

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
    queryKey: ['workflows'],
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

  const allModels = [
    ...mockModelItems,
    ...(customModels || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      image_url: m.image_url,
    })),
  ];

  const getWorkflowFormats = (id: string): string[] => workflowFormats[id]?.length ? workflowFormats[id] : ['1:1'];

  // Selected workflows in order
  const selectedWorkflowsList = useMemo(
    () => workflows.filter(w => selectedWorkflowIds.has(w.id)),
    [workflows, selectedWorkflowIds]
  );

  // Dynamic steps: Details(0), Products(1), Select Workflows(2), [Config WF1, Config WF2, ...], Schedule, Review
  const configStepCount = selectedWorkflowsList.length;
  const totalSteps = 3 + configStepCount + 2; // Details, Products, Select, ...configs, Schedule, Review
  const scheduleStepIndex = 3 + configStepCount;
  const reviewStepIndex = 4 + configStepCount;

  // Which workflow is being configured (if any)
  const isConfigStep = step >= 3 && step < scheduleStepIndex;
  const configWorkflowIndex = isConfigStep ? step - 3 : -1;
  const configWorkflow = isConfigStep ? selectedWorkflowsList[configWorkflowIndex] : null;

  // Step labels for progress
  const getStepLabel = (s: number): string => {
    if (s === 0) return 'Details';
    if (s === 1) return 'Products';
    if (s === 2) return 'Workflows';
    if (s >= 3 && s < scheduleStepIndex) {
      const wf = selectedWorkflowsList[s - 3];
      return wf ? wf.name : 'Configure';
    }
    if (s === scheduleStepIndex) return 'Delivery';
    if (s === reviewStepIndex) return 'Review';
    return '';
  };

  const progressPercent = totalSteps > 1 ? Math.round((step / (totalSteps - 1)) * 100) : 0;

  // Credit calculation
  const workflowConfigs: WorkflowCostConfig[] = selectedWorkflowsList.map(w => ({
    workflowId: w.id,
    workflowName: w.name,
    hasModel: w.uses_tryon || (workflowModelSelections[w.id]?.length > 0),
    hasCustomScene: false,
    formatCount: getWorkflowFormats(w.id).length,
  }));

  const effectiveFrequency = deliveryMode === 'now' ? 'one-time' : frequency;
  const costEstimate = calculateDropCredits(workflowConfigs, imagesPerDrop, effectiveFrequency, selectedProductIds.size);

  const handleSeasonalPreset = (presetId: string) => {
    setSeasonalPreset(presetId);
    const preset = SEASONAL_PRESETS.find(p => p.id === presetId);
    if (preset && preset.instructions) {
      setThemeNotes(preset.instructions);
    }
  };

  // Validation
  const canNext = (): boolean => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return selectedProductIds.size > 0;
    if (step === 2) return selectedWorkflowIds.size > 0;
    if (isConfigStep && configWorkflow) {
      const wf = configWorkflow;
      const uiConfig = (wf.generation_config as any)?.ui_config;
      const variations = (wf.generation_config as any)?.variation_strategy?.variations || [];
      if (variations.length > 0) {
        if (!randomScenes[wf.id] && (!workflowSceneSelections[wf.id] || workflowSceneSelections[wf.id].size === 0)) return false;
      }
      if (wf.uses_tryon || uiConfig?.show_model_picker) {
        if (!randomModels[wf.id] && !workflowModelSelections[wf.id]?.length) return false;
      }
      return true;
    }
    if (step === scheduleStepIndex) return imagesPerDrop > 0 && (deliveryMode === 'now' || !!startDate);
    if (step === reviewStepIndex) return true;
    return false;
  };

  const getValidationHint = (): string | null => {
    if (!attempted) return null;
    if (step === 0 && !name.trim()) return 'Give your drop a name to continue';
    if (step === 1 && selectedProductIds.size === 0) return 'Select at least one product';
    if (step === 2 && selectedWorkflowIds.size === 0) return 'Select at least one workflow';
    if (isConfigStep && configWorkflow) {
      const wf = configWorkflow;
      const uiConfig = (wf.generation_config as any)?.ui_config;
      const variations = (wf.generation_config as any)?.variation_strategy?.variations || [];
      if (variations.length > 0) {
        if (!randomScenes[wf.id] && (!workflowSceneSelections[wf.id] || workflowSceneSelections[wf.id].size === 0)) {
          return `Select at least one scene or enable Random`;
        }
      }
      if (wf.uses_tryon || uiConfig?.show_model_picker) {
        if (!randomModels[wf.id] && !workflowModelSelections[wf.id]?.length) {
          return `Select at least one model or enable Random`;
        }
      }
    }
    if (step === scheduleStepIndex) {
      if (imagesPerDrop <= 0) return 'Choose how many images per drop';
      if (deliveryMode === 'scheduled' && !startDate) return 'Pick a start date';
    }
    return null;
  };

  const handleNext = () => {
    if (!canNext()) {
      setAttempted(true);
      return;
    }
    setAttempted(false);
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setAttempted(false);
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

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

      const sceneConfig: Record<string, any> = {};
      selectedWorkflowIds.forEach(id => {
        const wf = workflows.find(w => w.id === id);
        const genConfig = wf?.generation_config as any;
        const variations: { label: string }[] = genConfig?.variation_strategy?.variations || [];

        const selectedLabels = Array.from(workflowSceneSelections[id] || []);
        const selectedVariationIndices = selectedLabels
          .map(label => variations.findIndex(v => v.label === label))
          .filter(i => i >= 0);

        const resolvedModels = (workflowModelSelections[id] || []).map(mId => {
          const m = allModels.find(am => am.id === mId);
          return m ? { id: m.id, name: m.name, image_url: m.image_url } : null;
        }).filter(Boolean);

        const rawSettings = workflowCustomSettings[id] || {};
        const mappedSettings: Record<string, string> = {};
        for (const [key, value] of Object.entries(rawSettings)) {
          const mappedKey = settingsFieldMap[key] || key;
          mappedSettings[mappedKey] = value;
        }

        const formats = getWorkflowFormats(id);

        sceneConfig[id] = {
          aspect_ratios: formats,
          aspect_ratio: formats[0],
          selected_scenes: randomScenes[id] ? ['__random__'] : selectedLabels,
          selected_variation_indices: randomScenes[id] ? [] : selectedVariationIndices,
          pose_ids: workflowPoseSelections[id] || [],
          model_ids: randomModels[id] ? ['__random__'] : (workflowModelSelections[id] || []),
          models: randomModels[id] ? [{ id: '__random__', name: 'Random / Diverse' }] : resolvedModels,
          custom_settings: rawSettings,
          mapped_settings: mappedSettings,
          random_models: !!randomModels[id],
          random_scenes: !!randomScenes[id],
        };
      });

      const cleanPrompts = freestylePrompts.filter(p => p.trim().length > 0);

      const payload = {
        name,
        theme,
        theme_notes: themeNotes,
        frequency: deliveryMode === 'now' ? 'one-time' : frequency,
        products_scope: 'selected',
        selected_product_ids: Array.from(selectedProductIds),
        workflow_ids: Array.from(selectedWorkflowIds),
        model_ids: Array.from(new Set(
          Array.from(selectedWorkflowIds).flatMap(id =>
            randomModels[id] ? ['__random__'] : (workflowModelSelections[id] || [])
          )
        )),
        brand_profile_id: brandProfileId || null,
        images_per_drop: imagesPerDrop,
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
      queryClient.invalidateQueries({ queryKey: ['creative-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['creative-drops'] });

      if (isNow && !editingScheduleId) {
        toast.success('Drop created — generating now!');
        try {
          const res = await supabase.functions.invoke('trigger-creative-drop', {
            body: { schedule_id: scheduleId },
          });
          if (res.error) {
            console.error('Trigger error:', res.error);
            toast.error(`Generation trigger failed: ${res.error.message}`);
          }
        } catch (e) {
          console.error('Trigger error:', e);
          toast.error('Failed to trigger generation');
        }
      } else {
        toast.success(editingScheduleId ? 'Drop updated!' : 'Drop saved — it will run on the scheduled date');
      }
      onClose();
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
  const isLastStep = step === reviewStepIndex;

  return (
    <div className="space-y-0 touch-auto">
      {/* ── Progress Header ── */}
      <div className="pb-5">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-xl font-semibold tracking-tight">
            {editingScheduleId ? 'Edit Drop' : initialData ? 'Duplicate Drop' : 'Create Your Drop'}
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            {step + 1}/{totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <Progress value={progressPercent} className="h-1.5 mb-3" />

        {/* Current step label */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{getStepLabel(step)}</span>
          {isConfigStep && configStepCount > 1 && (
            <Badge variant="secondary" className="text-[10px] rounded-full px-2">
              {configWorkflowIndex + 1} of {configStepCount} workflows
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* ── Content ── */}
      <div className="pt-6 pb-4">
        <div className="min-h-[380px]">

          {/* ─── Step 0: Details ─── */}
          {step === 0 && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <p className="section-label">Schedule Name</p>
                <Input
                  placeholder="e.g. Summer 2026 Collection"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={cn('h-12 rounded-xl text-sm', attempted && !name.trim() && 'border-destructive')}
                />
                {attempted && !name.trim() && (
                  <p className="text-xs text-destructive">Give your drop a name to continue</p>
                )}
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
              </div>

              <div className="space-y-2">
                <p className="section-label">Brand Profile</p>
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
              </div>

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
            </div>
          )}

          {/* ─── Step 1: Products ─── */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              {productsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="rounded-2xl border-2 border-border p-2">
                      <div className="aspect-square rounded-xl bg-muted animate-pulse mb-2" />
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                              'relative rounded-2xl border-2 p-2 transition-all text-left group',
                              isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40 hover:shadow-sm bg-card'
                            )}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                            <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-2">
                              <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                            </div>
                            <p className="text-xs font-medium truncate px-0.5">{product.title}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {productViewMode === 'list' && (
                    <div className="space-y-1.5">
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
                              'w-full flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all text-left',
                              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 bg-card'
                            )}
                          >
                            <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all', isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30')}>
                              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.title}</p>
                              {product.product_type && <p className="text-xs text-muted-foreground truncate">{product.product_type}</p>}
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

          {/* ─── Step 2: Select Workflows (simple checklist) ─── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <p className="text-sm text-muted-foreground">Choose which visual styles to include. You'll configure each one next.</p>
              {attempted && selectedWorkflowIds.size === 0 && (
                <p className="text-xs text-destructive">Select at least one workflow</p>
              )}
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
                    const isSelected = selectedWorkflowIds.has(wf.id);
                    const needsModels = wf.uses_tryon || wf.generation_config?.ui_config?.show_model_picker;
                    const variations = wf.generation_config?.variation_strategy?.variations || [];

                    return (
                      <button
                        key={wf.id}
                        onClick={() => {
                          const next = new Set(selectedWorkflowIds);
                          if (isSelected) {
                            next.delete(wf.id);
                          } else {
                            next.add(wf.id);
                            if (variations.length > 0 && !workflowSceneSelections[wf.id]) {
                              setWorkflowSceneSelections(prev => ({ ...prev, [wf.id]: new Set<string>() }));
                            }
                          }
                          setSelectedWorkflowIds(next);
                        }}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/40 hover:shadow-sm bg-card'
                        )}
                      >
                        <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                          <ShimmerImage src={wf.preview_image_url || WORKFLOW_FALLBACK_IMAGES[wf.name] || ''} alt={wf.name} className="w-full h-full object-cover" aspectRatio="1/1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{wf.name}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{wf.description}</p>
                          <div className="flex gap-1.5 mt-1.5">
                            {needsModels && <Badge variant="secondary" className="text-[10px] rounded-full px-1.5 py-0">Model</Badge>}
                            {variations.length > 0 && <Badge variant="secondary" className="text-[10px] rounded-full px-1.5 py-0">{variations.length} scenes</Badge>}
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

              {/* Freestyle prompts */}
              <Separator />
              <Collapsible open={includeFreestyle} onOpenChange={setIncludeFreestyle}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch checked={includeFreestyle} onCheckedChange={setIncludeFreestyle} />
                    <div>
                      <p className="text-sm font-medium">Freestyle Prompts</p>
                      <p className="text-xs text-muted-foreground">Add custom text prompts alongside workflows</p>
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
            </div>
          )}

          {/* ─── Steps 3+: Per-Workflow Configuration (full page) ─── */}
          {isConfigStep && configWorkflow && (() => {
            const wf = configWorkflow;
            const genConfig = wf.generation_config;
            const variations = genConfig?.variation_strategy?.variations || [];
            const uiConfig = genConfig?.ui_config;
            const needsModels = wf.uses_tryon || uiConfig?.show_model_picker;
            const customSettings = uiConfig?.custom_settings || [];
            const lockAspectRatio = uiConfig?.lock_aspect_ratio;
            const showPosePicker = uiConfig?.show_pose_picker;
            const sceneSelections = workflowSceneSelections[wf.id] || new Set<string>();
            const wfModels = workflowModelSelections[wf.id] || [];
            const wfPoses = workflowPoseSelections[wf.id] || [];
            const wfSettings = workflowCustomSettings[wf.id] || {};
            const isRandomModels = !!randomModels[wf.id];
            const isRandomScenes = !!randomScenes[wf.id];
            const currentFormats = getWorkflowFormats(wf.id);

            return (
              <div className="space-y-8 animate-fade-in" key={wf.id}>
                {/* Workflow identity */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                    <ShimmerImage src={wf.preview_image_url || WORKFLOW_FALLBACK_IMAGES[wf.name] || ''} alt={wf.name} className="w-full h-full object-cover" aspectRatio="1/1" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">{wf.name}</p>
                    <p className="text-xs text-muted-foreground">{wf.description}</p>
                  </div>
                </div>

                {/* ── Formats ── */}
                <div className="space-y-3">
                  <p className="section-label">Aspect Ratios</p>
                  {lockAspectRatio ? (
                    <Badge variant="outline" className="text-xs rounded-full">1:1 (fixed)</Badge>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {ASPECT_RATIOS.map(ar => {
                        const isFormatSelected = currentFormats.includes(ar.id);
                        return (
                          <button
                            key={ar.id}
                            onClick={() => {
                              setWorkflowFormats(prev => {
                                const current = prev[wf.id]?.length ? [...prev[wf.id]] : ['1:1'];
                                if (isFormatSelected) {
                                  if (current.length <= 1) return prev;
                                  return { ...prev, [wf.id]: current.filter(f => f !== ar.id) };
                                } else {
                                  return { ...prev, [wf.id]: [...current, ar.id] };
                                }
                              });
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
                  {currentFormats.length > 1 && (
                    <p className="text-xs text-muted-foreground">Each additional format multiplies the credit cost.</p>
                  )}
                </div>

                {/* Flat Lay info */}
                {wf.name === 'Flat Lay Set' && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl px-4 py-3">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <p>Each layout includes curated styling props arranged around your product. The AI selects contextual props based on your product type.</p>
                  </div>
                )}

                {/* ── Scenes (full grid, no collapsible) ── */}
{variations.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="section-label">Scenes</p>
                      <div className="flex items-center gap-3">
                        {!isRandomScenes && (
                          <button
                            className="text-xs text-primary hover:underline font-medium"
                            onClick={() => {
                              const allSelected = sceneSelections.size === variations.length;
                              setWorkflowSceneSelections(prev => ({
                                ...prev,
                                [wf.id]: allSelected ? new Set<string>() : new Set(variations.map(v => v.label)),
                              }));
                            }}
                          >
                            {sceneSelections.size === variations.length ? 'Deselect All' : 'Select All'}
                          </button>
                        )}
                        <Badge variant="secondary" className="text-[10px] rounded-full">
                          {isRandomScenes ? <><Shuffle className="w-3 h-3 mr-0.5 inline" />Random</> : `${sceneSelections.size}/${variations.length}`}
                        </Badge>
                      </div>
                    </div>

                    {/* Random toggle */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                      <Switch
                        checked={isRandomScenes}
                        onCheckedChange={(checked) => setRandomScenes(prev => ({ ...prev, [wf.id]: checked }))}
                      />
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Shuffle className="w-3.5 h-3.5" /> Random / Diverse
                        </p>
                        <p className="text-xs text-muted-foreground">AI will randomly distribute across all {variations.length} scenes</p>
                      </div>
                    </div>

                    {!isRandomScenes && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {variations.map(v => {
                          const isSceneSelected = sceneSelections.has(v.label);
                          return (
                            <button
                              key={v.label}
                              onClick={() => {
                                setWorkflowSceneSelections(prev => {
                                  const current = new Set(prev[wf.id] || []);
                                  isSceneSelected ? current.delete(v.label) : current.add(v.label);
                                  return { ...prev, [wf.id]: current };
                                });
                              }}
                              className={cn(
                                'relative rounded-xl overflow-hidden border-2 transition-all',
                                isSceneSelected ? 'border-primary ring-1 ring-primary/20 shadow-sm' : 'border-border hover:border-primary/30'
                              )}
                            >
                              <div className="aspect-square w-full bg-muted overflow-hidden">
                                {v.preview_url ? (
                                  <ShimmerImage src={v.preview_url} alt={v.label} className="w-full h-full object-cover" aspectRatio="1/1" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
                                    <span className="text-[10px] text-muted-foreground/60 text-center px-1 leading-tight">{v.label}</span>
                                  </div>
                                )}
                              </div>
                              {isSceneSelected && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                </div>
                              )}
                              <div className="px-1.5 py-1.5">
                                <p className="text-[11px] text-foreground truncate text-center font-medium">{v.label}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Pose / Scene Library ── */}
                {showPosePicker && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="section-label">Scene Library</p>
                      {wfPoses.length > 0 && (
                        <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setWorkflowPoseSelections(prev => ({ ...prev, [wf.id]: [] }))}>
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {fashionPoses.map(pose => {
                        const isPoseSelected = wfPoses.includes(pose.poseId);
                        return (
                          <button
                            key={pose.poseId}
                            onClick={() => {
                              setWorkflowPoseSelections(prev => {
                                const current = prev[wf.id] || [];
                                return {
                                  ...prev,
                                  [wf.id]: isPoseSelected ? current.filter(id => id !== pose.poseId) : [...current, pose.poseId],
                                };
                              });
                            }}
                            className={cn(
                              'relative rounded-xl overflow-hidden border-2 transition-all',
                              isPoseSelected ? 'border-primary ring-1 ring-primary/20 shadow-sm' : 'border-border hover:border-primary/30'
                            )}
                          >
                            <div className="aspect-[4/5] w-full bg-muted overflow-hidden">
                              <ShimmerImage src={pose.previewUrl} alt={pose.name} className="w-full h-full object-cover" aspectRatio="4/5" />
                            </div>
                            {isPoseSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                            <div className="absolute top-1.5 left-1.5">
                              <Badge className="text-[8px] px-1 py-0 bg-foreground/70 text-background border-0 backdrop-blur-sm">
                                {poseCategoryLabels[pose.category] || pose.category}
                              </Badge>
                            </div>
                            <div className="px-1.5 py-1.5">
                              <p className="text-[11px] text-foreground truncate text-center font-medium">{pose.name}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Models ── */}
                {needsModels && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="section-label">Models</p>
                      <Badge variant="secondary" className="text-[10px] rounded-full">
                        {isRandomModels ? <><Shuffle className="w-3 h-3 mr-0.5 inline" />Random</> : `${wfModels.length} selected`}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                      <Switch
                        checked={isRandomModels}
                        onCheckedChange={(checked) => setRandomModels(prev => ({ ...prev, [wf.id]: checked }))}
                      />
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Shuffle className="w-3.5 h-3.5" /> Random / Diverse
                        </p>
                        <p className="text-xs text-muted-foreground">AI will randomly select from all available models</p>
                      </div>
                    </div>

                    {!isRandomModels && (
                      <>
                        {wfModels.length > 0 && (
                          <div className="flex justify-end">
                            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setWorkflowModelSelections(prev => ({ ...prev, [wf.id]: [] }))}>
                              Clear
                            </button>
                          </div>
                        )}
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                          {allModels.map(m => {
                            const isModelSelected = wfModels.includes(m.id);
                            return (
                              <button
                                key={m.id}
                                onClick={() => {
                                  setWorkflowModelSelections(prev => {
                                    const current = prev[wf.id] || [];
                                    return {
                                      ...prev,
                                      [wf.id]: isModelSelected ? current.filter(id => id !== m.id) : [...current, m.id],
                                    };
                                  });
                                }}
                                className="flex flex-col items-center gap-1.5"
                              >
                                <div className={cn(
                                  'w-12 h-12 rounded-full overflow-hidden border-2 transition-all',
                                  isModelSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
                                )}>
                                  <ShimmerImage src={m.image_url} alt={m.name} className="w-full h-full object-cover" aspectRatio="1/1" />
                                </div>
                                <p className={cn(
                                  'text-[10px] truncate w-full text-center',
                                  isModelSelected ? 'text-primary font-semibold' : 'text-muted-foreground'
                                )}>{m.name}</p>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── Custom Settings ── */}
                {customSettings.length > 0 && (
                  <div className="space-y-4">
                    <p className="section-label">Settings</p>
                    {customSettings.map(setting => (
                      <div key={setting.label} className="space-y-2">
                        <p className="text-sm font-medium text-foreground">{setting.label}</p>
                        {setting.type === 'select' && setting.options && (
                          <div className="flex flex-wrap gap-2">
                            {setting.options.map(opt => (
                              <button
                                key={opt}
                                onClick={() => {
                                  setWorkflowCustomSettings(prev => ({
                                    ...prev,
                                    [wf.id]: { ...(prev[wf.id] || {}), [setting.label]: opt },
                                  }));
                                }}
                                className={cn(
                                  'px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                                  (wfSettings[setting.label] || setting.options?.[0]) === opt
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border hover:border-primary/30 text-muted-foreground bg-card'
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── UGC Mood Picker (Selfie / UGC workflows) ── */}
                {(wf.name.toLowerCase().includes('selfie') || wf.name.toLowerCase().includes('ugc')) && (
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
                        const isSelected = wfSettings['Mood'] === mood.id;
                        return (
                          <button
                            key={mood.id}
                            onClick={() => {
                              setWorkflowCustomSettings(prev => ({
                                ...prev,
                                [wf.id]: { ...(prev[wf.id] || {}), Mood: mood.id },
                              }));
                            }}
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

                {/* ── Flat Lay Aesthetic Picker ── */}
                {wf.name.toLowerCase().includes('flat lay') && (
                  <div className="space-y-3">
                    <p className="section-label">Aesthetic Style</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'minimal', label: 'Minimal', hint: 'Clean, few props, whitespace' },
                        { id: 'botanical', label: 'Botanical', hint: 'Greenery accents, dried flowers' },
                        { id: 'coffee-books', label: 'Coffee & Books', hint: 'Cup, open pages' },
                        { id: 'textured', label: 'Textured', hint: 'Linen, kraft paper, washi tape' },
                        { id: 'soft-glam', label: 'Soft Glam', hint: 'Silk ribbon, dried petals' },
                        { id: 'cozy', label: 'Cozy', hint: 'Knit blanket, candle, warm tones' },
                      ].map(aesthetic => {
                        const isSelected = wfSettings['Aesthetic'] === aesthetic.id;
                        return (
                          <button
                            key={aesthetic.id}
                            onClick={() => {
                              setWorkflowCustomSettings(prev => ({
                                ...prev,
                                [wf.id]: { ...(prev[wf.id] || {}), Aesthetic: aesthetic.id },
                              }));
                            }}
                            className={cn(
                              'px-4 py-3 rounded-xl border-2 text-left transition-all',
                              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card'
                            )}
                          >
                            <p className={cn('text-sm font-medium', isSelected && 'text-primary')}>{aesthetic.label}</p>
                            <p className="text-[10px] text-muted-foreground">{aesthetic.hint}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ─── Schedule & Volume ─── */}
          {step === scheduleStepIndex && (
            <div className="space-y-8 animate-fade-in">
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
                    <Clock className={cn('w-5 h-5', deliveryMode === 'scheduled' ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-sm font-semibold">Schedule</span>
                    <span className="text-xs text-muted-foreground">Pick a date & recur</span>
                  </button>
                </div>
              </div>

              {deliveryMode === 'scheduled' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <p className="section-label">First Drop Date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full h-12 rounded-xl justify-start text-left font-normal',
                            !startDate && 'text-muted-foreground',
                            attempted && !startDate && 'border-destructive'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={(date) => date < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                    {attempted && deliveryMode === 'scheduled' && !startDate && (
                      <p className="text-xs text-destructive">Pick a start date to continue</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="section-label">Repeat</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'weekly', label: 'Weekly' },
                        { id: 'biweekly', label: 'Biweekly' },
                        { id: 'monthly', label: 'Monthly' },
                      ].map(f => (
                        <Button key={f.id} variant={frequency === f.id ? 'default' : 'outline'} onClick={() => setFrequency(f.id)} className="h-11 rounded-xl text-sm">
                          {f.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {startDate && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Repeat className="w-3.5 h-3.5" />
                      First drop: {format(startDate, 'MMM d, yyyy')}, then every {frequency.replace('-', ' ')}
                    </p>
                  )}
                </div>
              )}
              {/* Credit renewal info */}
              {deliveryMode === 'scheduled' && profile?.credits_renewed_at && profile.plan !== 'free' && (
                <div className="flex items-start gap-2 text-xs bg-muted/50 rounded-xl px-4 py-3">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
                  <p className="text-muted-foreground">
                    Your credits renew on <span className="font-medium text-foreground">{format(new Date(profile.credits_renewed_at), 'MMM d, yyyy')}</span>. 
                    Schedule your drop after this date to use fresh credits.
                    <span className="block mt-0.5">Current balance: <span className="font-medium text-foreground">{profile.credits_balance} credits</span></span>
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                <p className="section-label">Images Per Workflow</p>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {IMAGE_PRESETS.map(n => (
                      <Button key={n} variant={imagesPerDrop === n && !customImageCount ? 'default' : 'outline'} onClick={() => { setImagesPerDrop(n); setCustomImageCount(''); }} className="h-11 rounded-xl">
                        {n}
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    placeholder="Custom amount"
                    value={customImageCount}
                    onChange={e => {
                      setCustomImageCount(e.target.value);
                      const val = parseInt(e.target.value);
                      if (val > 0) setImagesPerDrop(val);
                    }}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <Card className="rounded-2xl border shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Credit Estimate</span>
                  </div>
                  {costEstimate.breakdown.length > 0 ? (
                    <>
                      <div className="space-y-1.5">
                        {costEstimate.breakdown.map(b => (
                          <div key={b.workflowId} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {b.workflowName}: {b.imageCount} × {b.costPerImage} cr{b.formatCount && b.formatCount > 1 ? ` × ${b.formatCount} formats` : ''}
                            </span>
                            <span className="font-medium">{b.subtotal} credits</span>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Per drop</span>
                        <span>{costEstimate.totalCredits} credits</span>
                      </div>
                      {deliveryMode === 'scheduled' && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Monthly projection</span>
                          <span>~{costEstimate.monthlyProjection} credits/mo</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Credits are deducted when {deliveryMode === 'now' ? 'the drop generates' : 'each drop runs'}.
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Select workflows to see cost estimate.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ─── Review ─── */}
          {step === reviewStepIndex && (
            <div className="space-y-6 animate-fade-in">
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
                              <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
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
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Images Per Workflow</p>
                      <p className="font-semibold">{imagesPerDrop} × {selectedWorkflowIds.size} workflows</p>
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

              {/* Workflow summaries */}
              <div className="space-y-2">
                <p className="section-label">Workflows</p>
                {selectedWorkflowsList.map(wf => {
                  const sceneCount = randomScenes[wf.id] ? 'Random' : (workflowSceneSelections[wf.id] || new Set()).size;
                  const variations = wf.generation_config?.variation_strategy?.variations || [];
                  const modelCount = randomModels[wf.id] ? 'Random' : (workflowModelSelections[wf.id] || []).length;
                  const poseCount = (workflowPoseSelections[wf.id] || []).length;
                  const needsModels = wf.uses_tryon || wf.generation_config?.ui_config?.show_model_picker;
                  const showPosePicker = wf.generation_config?.ui_config?.show_pose_picker;
                  const wfSettings = workflowCustomSettings[wf.id] || {};
                  const settingEntries = Object.entries(wfSettings);
                  const selectedSceneNames = randomScenes[wf.id] ? [] : Array.from(workflowSceneSelections[wf.id] || []);
                  const formats = getWorkflowFormats(wf.id);

                  return (
                    <div key={wf.id} className="p-3 rounded-xl bg-card border space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="font-medium flex-1">{wf.name}</span>
                        <div className="flex gap-1">
                          {formats.map(f => (
                            <Badge key={f} variant="outline" className="text-xs rounded-full">{f}</Badge>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {costEstimate.breakdown.find(b => b.workflowId === wf.id)?.imageCount ?? 0} imgs
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pl-6">
                        {variations.length > 0 && !wf.uses_tryon && (
                          <Badge variant="secondary" className="text-[10px] rounded-full">
                            {randomScenes[wf.id] ? <><Shuffle className="w-3 h-3 mr-0.5 inline" />Random scenes</> : <>{sceneCount}/{variations.length} scenes</>}
                          </Badge>
                        )}
                        {showPosePicker && (
                          <Badge variant="secondary" className="text-[10px] rounded-full">{poseCount} pose{poseCount !== 1 ? 's' : ''}</Badge>
                        )}
                        {needsModels && (
                          <Badge variant="secondary" className="text-[10px] rounded-full">
                            {randomModels[wf.id] ? <><Shuffle className="w-3 h-3 mr-0.5 inline" />Random models</> : <>{modelCount} model{typeof modelCount === 'number' && modelCount !== 1 ? 's' : ''}</>}
                          </Badge>
                        )}
                        {settingEntries.map(([k, v]) => (
                          <Badge key={k} variant="outline" className="text-[10px] rounded-full">{k}: {v}</Badge>
                        ))}
                      </div>
                      {selectedSceneNames.length > 0 && (
                        <div className="flex flex-wrap gap-1 pl-6">
                          {selectedSceneNames.slice(0, 8).map(name => (
                            <span key={name} className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">{name}</span>
                          ))}
                          {selectedSceneNames.length > 8 && (
                            <span className="text-[10px] text-muted-foreground">+{selectedSceneNames.length - 8} more</span>
                          )}
                        </div>
                      )}
                      {needsModels && !randomModels[wf.id] && typeof modelCount === 'number' && modelCount > 0 && (
                        <div className="flex gap-1 pl-6 flex-wrap">
                          {(workflowModelSelections[wf.id] || []).slice(0, 6).map(mId => {
                            const model = allModels.find(m => m.id === mId);
                            return model ? (
                              <div key={mId} className="w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                <img src={model.image_url} alt={model.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                              </div>
                            ) : null;
                          })}
                          {typeof modelCount === 'number' && modelCount > 6 && (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-[8px] font-medium text-muted-foreground">
                              +{modelCount - 6}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
            onClick={step === 0 ? onClose : handleBack}
            className="rounded-full min-h-[44px] h-11 px-5 sm:px-6"
          >
            {step === 0 ? 'Cancel' : <><ArrowLeft className="w-4 h-4 mr-1.5" /> Back</>}
          </Button>

          <div className="hidden sm:flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground/40 tracking-widest uppercase">
              Powered by VOVV.AI
            </span>
            {validationHint && (
              <p className="text-[11px] text-destructive animate-fade-in">{validationHint}</p>
            )}
          </div>

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
              disabled={saveMutation.isPending}
              className="rounded-full min-h-[44px] h-11 px-5 sm:px-6 gap-1.5"
            >
              {saveMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {editingScheduleId ? 'Saving...' : 'Creating...'}</>
                : editingScheduleId ? 'Save Changes' : deliveryMode === 'now' ? 'Generate Now' : 'Create Schedule'
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
