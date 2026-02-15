import { useState } from 'react';
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

import {
  ArrowLeft, ArrowRight, Check, CalendarIcon, Sun, Snowflake, Leaf, Flower2,
  Gift, ShoppingBag, Heart, GraduationCap, Sparkles, Search, Loader2,
  Zap, CreditCard, Clock, RocketIcon, Repeat, Plus, Trash2, ChevronDown, Package, Info,
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

export interface CreativeDropWizardInitialData {
  name: string;
  theme: string;
  themeNotes: string;
  brandProfileId: string;
  selectedProductIds: string[];
  selectedWorkflowIds: string[];
  selectedModelIds: string[];
  workflowFormats: Record<string, string>;
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

const THEMES = [
  { id: 'spring', label: 'Spring', icon: Flower2 },
  { id: 'summer', label: 'Summer', icon: Sun },
  { id: 'autumn', label: 'Autumn', icon: Leaf },
  { id: 'winter', label: 'Winter', icon: Snowflake },
  { id: 'holiday', label: 'Holiday', icon: Gift },
  { id: 'black_friday', label: 'Black Friday', icon: ShoppingBag },
  { id: 'valentines', label: "Valentine's", icon: Heart },
  { id: 'back_to_school', label: 'Back to School', icon: GraduationCap },
  { id: 'custom', label: 'Custom', icon: Sparkles },
];

const STEPS = ['Theme', 'Products', 'Workflows', 'Schedule', 'Review'];
const IMAGE_PRESETS = [10, 25, 50, 100];
const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', w: 1, h: 1 },
  { id: '4:5', label: '4:5', w: 4, h: 5 },
  { id: '9:16', label: '9:16', w: 9, h: 16 },
  { id: '16:9', label: '16:9', w: 16, h: 9 },
];

// Fashion-relevant poses for Virtual Try-On
const fashionPoses = mockTryOnPoses.filter(p => 
  ['studio', 'lifestyle', 'editorial', 'streetwear'].includes(p.category)
);

// All models (mock + custom merged later)
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

  // Step 1: Theme
  const [name, setName] = useState(initialData?.name || '');
  const [theme, setTheme] = useState(initialData?.theme || 'custom');
  const [themeNotes, setThemeNotes] = useState(initialData?.themeNotes || '');
  const [brandProfileId, setBrandProfileId] = useState(initialData?.brandProfileId || '');

  // Step 2: Products
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set(initialData?.selectedProductIds || [])
  );
  const [productSearch, setProductSearch] = useState('');

  // Step 3: Workflows + format
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<string>>(
    new Set(initialData?.selectedWorkflowIds || [])
  );
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(initialData?.selectedModelIds || []);
  const [workflowFormats, setWorkflowFormats] = useState<Record<string, string>>(initialData?.workflowFormats || {});

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

  // Step 3b: Freestyle prompts
  const [includeFreestyle, setIncludeFreestyle] = useState(initialData?.includeFreestyle || false);
  const [freestylePrompts, setFreestylePrompts] = useState<string[]>(
    initialData?.freestylePrompts?.length ? initialData.freestylePrompts : ['']
  );

  // Step 4: Delivery & Volume
  const [deliveryMode, setDeliveryMode] = useState<'now' | 'scheduled'>(initialData?.deliveryMode || 'now');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [frequency, setFrequency] = useState(initialData?.frequency || 'monthly');
  const [imagesPerDrop, setImagesPerDrop] = useState(initialData?.imagesPerDrop || 25);
  const [customImageCount, setCustomImageCount] = useState('');

  // Queries
  const { data: brandProfiles = [] } = useQuery({
    queryKey: ['brand-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brand_profiles').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['user-products-wizard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_products').select('id, title, image_url, product_type').order('title');
      if (error) throw error;
      return data as UserProduct[];
    },
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase.from('workflows').select('*').order('sort_order');
      if (error) throw error;
      return data as unknown as Workflow[];
    },
  });

  const { data: customModels = [] } = useQuery({
    queryKey: ['custom-models'],
    queryFn: async () => {
      const { data, error } = await supabase.from('custom_models').select('*').eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Merge mock models with custom models
  const allModels = [
    ...mockModelItems,
    ...(customModels || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      image_url: m.image_url,
    })),
  ];

  // Credit calculation — uses per-workflow model selections
  const workflowConfigs: WorkflowCostConfig[] = workflows
    .filter(w => selectedWorkflowIds.has(w.id))
    .map(w => ({
      workflowId: w.id,
      workflowName: w.name,
      hasModel: w.uses_tryon || (workflowModelSelections[w.id]?.length > 0),
      hasCustomScene: false,
    }));

  const effectiveFrequency = deliveryMode === 'now' ? 'one-time' : frequency;
  const costEstimate = calculateDropCredits(workflowConfigs, imagesPerDrop, effectiveFrequency, selectedProductIds.size);

  // Collapsible section state — tracks which section is open per workflow
  const [expandedSection, setExpandedSection] = useState<Record<string, string | null>>({});
  const toggleSection = (wfId: string, section: string) => {
    setExpandedSection(prev => ({
      ...prev,
      [wfId]: prev[wfId] === section ? null : section,
    }));
  };

  // Validation per step
  const canNext = (): boolean => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return selectedProductIds.size > 0;
      case 2: {
        if (selectedWorkflowIds.size === 0) return false;
        // Fix #6: Model-required workflows must have at least one model selected
        for (const wfId of selectedWorkflowIds) {
          const wf = workflows.find(w => w.id === wfId);
          const uiConfig = (wf?.generation_config as any)?.ui_config;
          if (wf?.uses_tryon || uiConfig?.show_model_picker) {
            if (!workflowModelSelections[wfId]?.length) return false;
          }
        }
        return true;
      }
      case 3: return imagesPerDrop > 0 && (deliveryMode === 'now' || !!startDate);
      case 4: return true;
      default: return false;
    }
  };

  const getValidationHint = (): string | null => {
    if (!attempted) return null;
    switch (step) {
      case 0: return name.trim().length === 0 ? 'Give your drop a name to continue' : null;
      case 1: return selectedProductIds.size === 0 ? 'Select at least one product' : null;
      case 2: {
        if (selectedWorkflowIds.size === 0) return 'Select at least one workflow';
        for (const wfId of selectedWorkflowIds) {
          const wf = workflows.find(w => w.id === wfId);
          const uiConfig = (wf?.generation_config as any)?.ui_config;
          if (wf?.uses_tryon || uiConfig?.show_model_picker) {
            if (!workflowModelSelections[wfId]?.length) {
              return `"${wf?.name}" requires at least one model`;
            }
          }
        }
        return null;
      }
      case 3:
        if (imagesPerDrop <= 0) return 'Choose how many images per drop';
        if (deliveryMode === 'scheduled' && !startDate) return 'Pick a start date';
        return null;
      default: return null;
    }
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

  // Save
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const effectiveStartDate = deliveryMode === 'now' ? new Date() : startDate!;
      let nextRun: Date | null = null;
      if (deliveryMode === 'scheduled') {
        nextRun = new Date(effectiveStartDate);
      }

      // Known custom_settings -> generate-workflow field mapping
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

        // Fix #1: Convert scene labels to numeric variation indices
        const selectedLabels = Array.from(workflowSceneSelections[id] || []);
        const selectedVariationIndices = selectedLabels
          .map(label => variations.findIndex(v => v.label === label))
          .filter(i => i >= 0);

        // Fix #2: Resolve model IDs to full objects for generation
        const resolvedModels = (workflowModelSelections[id] || []).map(mId => {
          const m = allModels.find(am => am.id === mId);
          return m ? { id: m.id, name: m.name, image_url: m.image_url } : null;
        }).filter(Boolean);

        // Fix #4: Map custom settings to generate-workflow request field names
        const rawSettings = workflowCustomSettings[id] || {};
        const mappedSettings: Record<string, string> = {};
        for (const [key, value] of Object.entries(rawSettings)) {
          const mappedKey = settingsFieldMap[key] || key;
          mappedSettings[mappedKey] = value;
        }

        sceneConfig[id] = {
          aspect_ratio: workflowFormats[id] || '1:1',
          selected_scenes: selectedLabels, // keep labels for display
          selected_variation_indices: selectedVariationIndices, // numeric indices for generation
          pose_ids: workflowPoseSelections[id] || [], // future: not yet consumed by edge function
          model_ids: workflowModelSelections[id] || [], // IDs for display
          models: resolvedModels, // full objects for generation
          custom_settings: rawSettings, // original for display
          mapped_settings: mappedSettings, // mapped keys for generation
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
        // Fix #5: Aggregate all per-workflow model IDs instead of old empty global array
        model_ids: Array.from(new Set(
          Array.from(selectedWorkflowIds).flatMap(id => workflowModelSelections[id] || [])
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
        // Trigger the drop immediately via edge function
        toast.success('Drop created — generating now!');
        try {
          const { data: { session } } = await supabase.auth.getSession();
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
        toast.success(editingScheduleId ? 'Schedule updated!' : 'Schedule created successfully!');
      }
      onClose();
    },
    onError: (error: Error) => toast.error(
      editingScheduleId
        ? `Failed to update schedule: ${error.message}`
        : `Failed to create schedule: ${error.message}`
    ),
  });

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedWorkflows = workflows.filter(w => selectedWorkflowIds.has(w.id));
  const themeConfig = THEMES.find(t => t.id === theme);

  const getWorkflowFormat = (id: string) => workflowFormats[id] || '1:1';

  const validationHint = getValidationHint();

  return (
    <div className="space-y-0">
      {/* Header — elegant step indicator */}
      <div className="pb-6">
        <h2 className="text-xl font-semibold tracking-tight mb-1">
          {editingScheduleId ? 'Edit Schedule' : initialData ? 'Duplicate Drop' : 'Create Your Drop'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">{editingScheduleId ? 'Update your schedule settings' : 'Design and schedule your creative content generation'}</p>
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={cn(
                  'flex items-center gap-2 text-xs font-medium transition-all',
                  i <= step ? 'text-foreground' : 'text-muted-foreground/50',
                  i < step && 'cursor-pointer hover:text-primary',
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all border-2',
                  i === step && 'bg-primary text-primary-foreground border-primary shadow-sm',
                  i < step && 'bg-primary/10 text-primary border-primary/30',
                  i > step && 'bg-muted text-muted-foreground/50 border-transparent',
                )}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-px mx-2', i < step ? 'bg-primary/30' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Content */}
      <div className="py-8 pb-24 sm:pb-8">
        <div className="min-h-[380px]">

          {/* ─── Step 1: Theme ─── */}
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

              <div className="space-y-3">
                <p className="section-label">Theme</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {THEMES.map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                         key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                          'flex items-center gap-2.5 px-4 py-3.5 rounded-2xl border-2 text-sm font-medium transition-all',
                          theme === t.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm text-foreground'
                            : 'border-border hover:border-primary/30 hover:shadow-sm text-foreground bg-card'
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="section-label">Brand Profile</p>
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
              </div>

              <div className="space-y-2">
                <p className="section-label">Special Instructions</p>
                <Textarea
                  placeholder="Any specific mood, style, or seasonal directions for this drop..."
                  value={themeNotes}
                  onChange={e => setThemeNotes(e.target.value)}
                  rows={3}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}

          {/* ─── Step 2: Products ─── */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              {products.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border">
                  <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">No products yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Add products first, then come back to create your drop.</p>
                  <Button variant="outline" onClick={() => navigate('/app/products')}>
                    Go to Products
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="rounded-full px-3 py-1">{selectedProductIds.size} selected</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => setSelectedProductIds(new Set(filteredProducts.map(p => p.id)))}
                    >
                      Select All
                    </Button>
                    {selectedProductIds.size > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2 text-muted-foreground"
                        onClick={() => setSelectedProductIds(new Set())}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {attempted && selectedProductIds.size === 0 && (
                    <p className="text-xs text-destructive">Select at least one product</p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:max-h-[320px] sm:overflow-y-auto pr-1">
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
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/40 hover:shadow-sm bg-card'
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                          <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-2">
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs font-medium truncate px-0.5">{product.title}</p>
                        </button>
                      );
                    })}
                  </div>
                  {filteredProducts.length === 0 && productSearch && (
                    <div className="text-center py-8 rounded-2xl bg-muted/30">
                      <p className="text-sm text-muted-foreground">No products match "{productSearch}"</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─── Step 3: Workflows + Format ─── */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm text-muted-foreground">Select visual styles, then configure scenes, models & settings for each.</p>
              {attempted && selectedWorkflowIds.size === 0 && (
                <p className="text-xs text-destructive">Select at least one workflow</p>
              )}
              <div className="space-y-3">
                {workflows.map(wf => {
                  const isSelected = selectedWorkflowIds.has(wf.id);
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

                  return (
                    <div key={wf.id} className="space-y-0">
                      <button
                        onClick={() => {
                          const next = new Set(selectedWorkflowIds);
                          if (isSelected) {
                            next.delete(wf.id);
                          } else {
                            next.add(wf.id);
                            // Fix #9: Auto-select ALL scenes so cost estimate matches behavior
                            // (empty selection = generate all in generate-workflow, which is confusing)
                            if (variations.length > 0 && !workflowSceneSelections[wf.id]) {
                              setWorkflowSceneSelections(prev => ({
                                ...prev,
                                [wf.id]: new Set(variations.map((v: { label: string }) => v.label)),
                              }));
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
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {needsModels && <Badge variant="secondary" className="text-xs rounded-full">Model</Badge>}
                          <div className={cn(
                            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                            isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                          )}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                          </div>
                        </div>
                      </button>

                      {/* ── Expanded per-workflow config — collapsible sections ── */}
                      {isSelected && (
                        <div className="bg-muted/30 rounded-xl p-4 mt-2 space-y-2 animate-fade-in">
                          {/* Aspect ratio — always visible, hide if locked */}
                          {lockAspectRatio ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Format:</span>
                              <Badge variant="outline" className="text-xs rounded-full">1:1 (fixed)</Badge>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground mr-1">Format:</span>
                              {ASPECT_RATIOS.map(ar => (
                                <button
                                  key={ar.id}
                                  onClick={() => setWorkflowFormats(prev => ({ ...prev, [wf.id]: ar.id }))}
                                  className={cn(
                                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all',
                                    getWorkflowFormat(wf.id) === ar.id
                                      ? 'border-primary bg-primary/10 text-primary'
                                      : 'border-border hover:border-primary/30 text-muted-foreground bg-card'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'rounded-[2px] border',
                                      getWorkflowFormat(wf.id) === ar.id ? 'border-primary' : 'border-muted-foreground/40',
                                    )}
                                    style={{ width: `${Math.round(ar.w / Math.max(ar.w, ar.h) * 12)}px`, height: `${Math.round(ar.h / Math.max(ar.w, ar.h) * 12)}px` }}
                                  />
                                  {ar.label}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Flat Lay clarification — always visible */}
                          {wf.name === 'Flat Lay Set' && (
                            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2.5">
                              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <p>Each layout includes curated styling props arranged around your product. The AI selects contextual props based on your product type.</p>
                            </div>
                          )}

                          {/* ── Collapsible: Scenes ── */}
                          {variations.length > 0 && !wf.uses_tryon && (
                            <div className="border-t border-border/50 pt-1">
                              <button
                                onClick={() => toggleSection(wf.id, 'scenes')}
                                className="w-full flex items-center justify-between py-2 text-xs hover:bg-muted/50 rounded-lg px-1 transition-colors"
                              >
                                <span className="font-medium text-foreground">Scenes</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{sceneSelections.size} of {variations.length}</Badge>
                                  <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', expandedSection[wf.id] === 'scenes' && 'rotate-180')} />
                                </div>
                              </button>
                              {expandedSection[wf.id] === 'scenes' && (
                                <div className="space-y-2 pb-2 animate-fade-in">
                                  <div className="flex justify-end">
                                    <button
                                      className="text-xs text-primary hover:underline"
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
                                  </div>
                                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1">
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
                                            'relative rounded-lg overflow-hidden border-2 transition-all',
                                            isSceneSelected
                                              ? 'border-primary ring-1 ring-primary/20'
                                              : 'border-border hover:border-primary/30'
                                          )}
                                        >
                                          <div className="aspect-square w-full bg-muted overflow-hidden">
                                            {v.preview_url ? (
                                              <ShimmerImage src={v.preview_url} alt={v.label} className="w-full h-full object-cover" aspectRatio="1/1" />
                                            ) : (
                                              <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
                                                <span className="text-[9px] text-muted-foreground/60 text-center px-1 leading-tight">{v.label}</span>
                                              </div>
                                            )}
                                          </div>
                                          {isSceneSelected && (
                                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                              <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                            </div>
                                          )}
                                          <div className="px-1 py-1">
                                            <p className="text-[10px] text-foreground truncate text-center">{v.label}</p>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Collapsible: Pose / Scene Library ── */}
                          {showPosePicker && (
                            <div className="border-t border-border/50 pt-1">
                              <button
                                onClick={() => toggleSection(wf.id, 'poses')}
                                className="w-full flex items-center justify-between py-2 text-xs hover:bg-muted/50 rounded-lg px-1 transition-colors"
                              >
                                <span className="font-medium text-foreground">Scene Library</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{wfPoses.length} selected</Badge>
                                  <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', expandedSection[wf.id] === 'poses' && 'rotate-180')} />
                                </div>
                              </button>
                              {expandedSection[wf.id] === 'poses' && (
                                <div className="space-y-2 pb-2 animate-fade-in">
                                  {wfPoses.length > 0 && (
                                    <div className="flex justify-end">
                                      <button
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                        onClick={() => setWorkflowPoseSelections(prev => ({ ...prev, [wf.id]: [] }))}
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-1">
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
                                                [wf.id]: isPoseSelected
                                                  ? current.filter(id => id !== pose.poseId)
                                                  : [...current, pose.poseId],
                                              };
                                            });
                                          }}
                                          className={cn(
                                            'relative rounded-lg overflow-hidden border-2 transition-all',
                                            isPoseSelected
                                              ? 'border-primary ring-1 ring-primary/20'
                                              : 'border-border hover:border-primary/30'
                                          )}
                                        >
                                          <div className="aspect-[4/5] w-full bg-muted overflow-hidden">
                                            <ShimmerImage src={pose.previewUrl} alt={pose.name} className="w-full h-full object-cover" aspectRatio="4/5" />
                                          </div>
                                          {isPoseSelected && (
                                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                              <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                            </div>
                                          )}
                                          <div className="absolute top-1 left-1">
                                            <Badge className="text-[7px] px-1 py-0 bg-foreground/70 text-background border-0 backdrop-blur-sm">
                                              {poseCategoryLabels[pose.category] || pose.category}
                                            </Badge>
                                          </div>
                                          <div className="px-1 py-1">
                                            <p className="text-[10px] text-foreground truncate text-center">{pose.name}</p>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Collapsible: Models ── */}
                          {needsModels && (
                            <div className="border-t border-border/50 pt-1">
                              <button
                                onClick={() => toggleSection(wf.id, 'models')}
                                className="w-full flex items-center justify-between py-2 text-xs hover:bg-muted/50 rounded-lg px-1 transition-colors"
                              >
                                <span className="font-medium text-foreground">Models</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{wfModels.length} selected</Badge>
                                  <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', expandedSection[wf.id] === 'models' && 'rotate-180')} />
                                </div>
                              </button>
                              {expandedSection[wf.id] === 'models' && (
                                <div className="space-y-2 pb-2 animate-fade-in">
                                  {wfModels.length > 0 && (
                                    <div className="flex justify-end">
                                      <button
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                        onClick={() => setWorkflowModelSelections(prev => ({ ...prev, [wf.id]: [] }))}
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[200px] overflow-y-auto pr-1">
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
                                                [wf.id]: isModelSelected
                                                  ? current.filter(id => id !== m.id)
                                                  : [...current, m.id],
                                              };
                                            });
                                          }}
                                          className="flex flex-col items-center gap-1"
                                        >
                                          <div className={cn(
                                            'w-10 h-10 rounded-full overflow-hidden border-2 transition-all',
                                            isModelSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
                                          )}>
                                            <ShimmerImage src={m.image_url} alt={m.name} className="w-full h-full object-cover" aspectRatio="1/1" />
                                          </div>
                                          <p className={cn(
                                            'text-[9px] truncate w-full text-center',
                                            isModelSelected ? 'text-primary font-semibold' : 'text-muted-foreground'
                                          )}>{m.name}</p>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Collapsible: Custom Settings ── */}
                          {customSettings.length > 0 && (
                            <div className="border-t border-border/50 pt-1">
                              <button
                                onClick={() => toggleSection(wf.id, 'settings')}
                                className="w-full flex items-center justify-between py-2 text-xs hover:bg-muted/50 rounded-lg px-1 transition-colors"
                              >
                                <span className="font-medium text-foreground">Settings</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {Object.keys(wfSettings).length}/{customSettings.length}
                                  </Badge>
                                  <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', expandedSection[wf.id] === 'settings' && 'rotate-180')} />
                                </div>
                              </button>
                              {expandedSection[wf.id] === 'settings' && (
                                <div className="space-y-3 pb-2 animate-fade-in">
                                  {customSettings.map(setting => (
                                    <div key={setting.label} className="space-y-2">
                                      <p className="text-xs font-medium text-foreground">{setting.label}</p>
                                      {setting.type === 'select' && setting.options && (
                                        <div className="flex flex-wrap gap-1.5">
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
                                                'px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
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
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sticky credit calculator */}
              {selectedWorkflowIds.size > 0 && (
                <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border pt-3 pb-1 -mx-1 px-1 z-10">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-medium">Estimated Cost</span>
                    </div>
                    <span className="font-semibold">{costEstimate.totalCredits} credits / drop</span>
                  </div>
                  {costEstimate.breakdown.length > 0 && (
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      {costEstimate.breakdown.map(b => (
                        <span key={b.workflowId}>{b.workflowName}: {b.subtotal}cr</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Freestyle Prompts Section */}
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
                        className="h-10 rounded-xl text-sm flex-1"
                      />
                      {freestylePrompts.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setFreestylePrompts(prev => prev.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {freestylePrompts.length < 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-full"
                      onClick={() => setFreestylePrompts(prev => [...prev, ''])}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Prompt
                    </Button>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* ─── Step 4: Delivery & Volume ─── */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">

              {/* Delivery mode */}
              <div className="space-y-3">
                <p className="section-label">Delivery</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryMode('now')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center',
                      deliveryMode === 'now'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/30 bg-card hover:shadow-sm'
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
                      deliveryMode === 'scheduled'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/30 bg-card hover:shadow-sm'
                    )}
                  >
                    <Clock className={cn('w-5 h-5', deliveryMode === 'scheduled' ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-sm font-semibold">Schedule</span>
                    <span className="text-xs text-muted-foreground">Pick a date & recur</span>
                  </button>
                </div>
              </div>

              {/* Schedule options — only when scheduled */}
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
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
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
                        <Button
                          key={f.id}
                          variant={frequency === f.id ? 'default' : 'outline'}
                          onClick={() => setFrequency(f.id)}
                          className="h-11 rounded-xl text-sm"
                        >
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

              <Separator />

              {/* Images per drop */}
              <div className="space-y-3">
                <p className="section-label">Images Per Workflow</p>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {IMAGE_PRESETS.map(n => (
                      <Button
                        key={n}
                        variant={imagesPerDrop === n && !customImageCount ? 'default' : 'outline'}
                        onClick={() => { setImagesPerDrop(n); setCustomImageCount(''); }}
                        className="h-11 rounded-xl"
                      >
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

              {/* Credit estimate */}
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
                              {b.workflowName}: {b.imageCount} × {b.costPerImage} cr
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

          {/* ─── Step 5: Review ─── */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">

              {/* Delivery card — prominent */}
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
                      {deliveryMode === 'now'
                        ? 'Generates immediately after creation'
                        : `First drop: ${startDate ? format(startDate, 'MMM d, yyyy') : '—'}`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {deliveryMode === 'now'
                        ? 'One-time generation — credits deducted now'
                        : `Then every ${frequency.replace('-', ' ')} — credits deducted per drop`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    {themeConfig && <themeConfig.icon className="w-4 h-4" />}
                    <span className="font-semibold">{name}</span>
                    <Badge variant="secondary" className="text-xs rounded-full">{themeConfig?.label}</Badge>
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
                              <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
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

              {/* Selected workflows with per-workflow details */}
              <div className="space-y-2">
                <p className="section-label">Workflows</p>
                {selectedWorkflows.map(wf => {
                  const sceneCount = (workflowSceneSelections[wf.id] || new Set()).size;
                  const variations = wf.generation_config?.variation_strategy?.variations || [];
                  const modelCount = (workflowModelSelections[wf.id] || []).length;
                  const poseCount = (workflowPoseSelections[wf.id] || []).length;
                  const needsModels = wf.uses_tryon || wf.generation_config?.ui_config?.show_model_picker;
                  const showPosePicker = wf.generation_config?.ui_config?.show_pose_picker;
                  const wfSettings = workflowCustomSettings[wf.id] || {};
                  const settingEntries = Object.entries(wfSettings);
                  const selectedSceneNames = Array.from(workflowSceneSelections[wf.id] || []);

                  return (
                    <div key={wf.id} className="p-3 rounded-xl bg-card border space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="font-medium flex-1">{wf.name}</span>
                        <Badge variant="outline" className="text-xs rounded-full">{getWorkflowFormat(wf.id)}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {costEstimate.breakdown.find(b => b.workflowId === wf.id)?.imageCount ?? 0} imgs
                        </span>
                      </div>
                      {/* Detail badges */}
                      <div className="flex flex-wrap gap-1.5 pl-6">
                        {variations.length > 0 && !wf.uses_tryon && (
                          <Badge variant="secondary" className="text-[10px] rounded-full">{sceneCount}/{variations.length} scenes</Badge>
                        )}
                        {showPosePicker && (
                          <Badge variant="secondary" className="text-[10px] rounded-full">{poseCount} pose{poseCount !== 1 ? 's' : ''}</Badge>
                        )}
                        {needsModels && (
                          <Badge variant="secondary" className="text-[10px] rounded-full">{modelCount} model{modelCount !== 1 ? 's' : ''}</Badge>
                        )}
                        {settingEntries.map(([k, v]) => (
                          <Badge key={k} variant="outline" className="text-[10px] rounded-full">{k}: {v}</Badge>
                        ))}
                      </div>
                      {/* Selected scene names */}
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
                      {/* Model names for workflows with models */}
                      {needsModels && modelCount > 0 && (
                        <div className="flex gap-1 pl-6 flex-wrap">
                          {(workflowModelSelections[wf.id] || []).slice(0, 6).map(mId => {
                            const model = allModels.find(m => m.id === mId);
                            return model ? (
                              <div key={mId} className="w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                <img src={model.image_url} alt={model.name} className="w-full h-full object-cover" />
                              </div>
                            ) : null;
                          })}
                          {modelCount > 6 && (
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

      {/* Footer — pill buttons + branding */}
      <div className="pt-4 border-t space-y-2 sticky bottom-0 bg-background pb-6 z-10 sm:static sm:pb-0">
        {validationHint && (
          <p className="text-[11px] text-destructive animate-fade-in text-center sm:hidden">{validationHint}</p>
        )}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={step === 0 ? onClose : () => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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

          {step < 4 ? (
            <Button
              onClick={handleNext}
              disabled={false}
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
